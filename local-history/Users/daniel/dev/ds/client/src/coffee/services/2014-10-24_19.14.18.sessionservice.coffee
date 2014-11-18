EventRegistry = require '../event/eventregistry'
ExpressionEvaluator = require '../expressions/expressionevaluator'

UserError = require '../models/usererror'
Session = require '../models/session'

class SessionService

  constructor: (@_configService, @_webService, @_legacyFactory) ->

  login: (username, password, domain) ->
    console.log 'Services.session.login' if TRACE
    new Promise (resolve, reject) =>
      session = new Session {userName: username, password, domain}
      session.save null,
        success: (model, response, options) =>
          @_notifyDataSplice session
            .then ->
              resolve session
        error: (model, response, options) =>
          @_sessionError session
          message =
            response.responseJSON or
            response.responseText or
            if response.statusText is 'error'
              'Authentication failed! Cannot contact the server'
            else
              'Authentication failed! No message from the server'
          reject new UserError message

  # This originally lived in DataSpliceController
  # https://github.com/DataSplice/datasplice-client/blob/9be6a4bf41810abd992446b5d473f863acdf00a1/src/coffee/controller.coffee#L261-L293
  logout: (options) ->
    console.log 'Services.session.logout' if TRACE
    ef = @_legacyFactory.eventFactory
    ef.execute EventRegistry.LogOut, ef.context(), (context) =>
      Promise.resolve @_legacyFactory.modificationHandler.commitChanges()
        .then =>
          afterDestroySession = => @_clearSession @_legacyFactory.session
          @_legacyFactory.pubSub.trigger 'loggedOut'
          @_ensureSessionCookie()
          @_webService.destroySession()
            .catch =>
              afterDestroySession()
              options?.promise?.reject()
            .then =>
              afterDestroySession()

  lock: -> # TODO
    console.log 'Services.session.lock' if TRACE

  resume: ->
    console.log 'Services.session.resume' if TRACE
    new Promise (resolve, reject) =>
      session = new Session
      @_ensureSessionCookie session
      session.fetch
        bypassCache: true
        success: (model, response, options) =>
          session.storeLocal()
          # Load config if necessary
          Promise.resolve @_loadConfig session, @_configService.loadRemote
            .then =>
              @_notifyDataSplice session
                .then ->
                  resolve session
        error: (model, error) =>
          # try to load a persisted session if we're offline
          if (error.status isnt 400) and session.loadLocal()
            # Load config if necessary
            Promise.resolve @_loadConfig session, @_configService.loadLocal
              .then =>
                @_notifyDataSplice session
                  .then ->
                    resolve session
          else
            @_sessionError session
            reject error

  # Always returns a promise. Promise resolves with an uppercase offline
  # behavior.
  getOfflineBehavior: (session) ->
    new Promise (resolve, reject) =>
      if session.get 'sessionName'
        context = @_legacyFactory.eventFactory.context()
        # TODO: move the DS attributes to ~/constants.coffee
        Promise.resolve ExpressionEvaluator.evaluateAttribute 'DS_OFFLINE_BEHAVIOR', null, { context }
          .then (offlineBehavior) ->
            resolve offlineBehavior?.toUpperCase()
      else
        resolve null

  # Loads config if the session doesn't already have any.
  # loader is either configService.loadLocal or loadRemote
  _loadConfig: (session, loader) ->
    config = session.get 'views'
    weHaveConfig = config.length > 0
    return true if weHaveConfig
    loader config

  _sessionError: (session) ->
    @_clearSession session
    @_legacyFactory.pubSub.trigger 'sessionError'

  # This is a DataSplice event
  _notifyDataSplice: (session) ->
    new Promise (resolve, reject) =>
      @_legacyFactory.register 'session', session
      @_legacyFactory.pubSub.trigger 'sessionLoaded', session

      # Trigger the logged in event
      {eventFactory} = @_legacyFactory
      eventContext = eventFactory.context()
      eventFactory.execute EventRegistry.LoggedIn, eventContext
      resolve session

  # TODO: move this into a localizationservice
  _initializeLocalization: ->
    eventContext = @_legacyFactory.eventFactory.context()
    # bing:localization - this needs a lot more thought. for now, we can at
    # least load non-US time formats based on the browser accept language
    Promise.resolve ExpressionEvaluator.evaluateAttribute 'DS_LOCALE', 'en', { context }
    .then (locale) ->
      console.info "Setting locale: #{locale}"
      if locale and locale not in [ 'en', 'en-us' ]
        moment.lang 'en-gb'
      else
        moment.lang 'en'

  # clear local information about the current session
  _clearSession: (session) ->
    document.cookie = 'DS_SESSION_NAME=invalid'
    # TODO: Create a SettingsService and delete cache through it.
    # for obj in [ @settings, @session ]
    #   obj.deleteCache()
    session.deleteCache()

  # some environments don't persist cookies (running as a shortcut from iOS
  # home screen), but local storage does work. restore the token cookie
  # if needed so we don't lose the current session
  _ensureSessionCookie: (session) ->
    if not document.cookie and (!session.isEmpty() or session.loadLocal())
      document.cookie = "DS_SESSION_NAME=#{session.get 'sessionName'}"

module.exports = SessionService
