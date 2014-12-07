EventRegistry = require '../event/eventregistry'
ExpressionEvaluator = require '../expressions/expressionevaluator'

UserError = require '../models/usererror'
Session = require '../models/session'

class SessionService

  # TODO: stop passing factory around
  constructor: (@_factory) ->

  login: (username, password, domain) ->
    console.debug 'SessionService#login'
    new Promise (resolve, reject) =>
      session = new Session {userName: username, password, domain}
      session.save null,
        success: (model, response, options) =>
          @_notifyDataSplice session
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

  logout: -> # TODO

  lock: -> # TODO

  resume: ->
    console.debug 'SessionService#resume'
    new Promise (resolve, reject) =>
      session = new Session
      @_ensureSessionCookie session
      session.fetch
        bypassCache: true
        success: (model, response, options) =>
          session.storeLocal()
          @_notifyDataSplice session
            .then ->
              resolve session
        error: (model, error) =>
          # try to load a persisted session if we're offline
          if (error.status isnt 400) and session.loadLocal()
            # Load config if necessary
            config = session.get 'views'
            weHaveNoConfig = config.length is 0
            if weHaveNoConfig
              # Load the local config
              configService.loadLocal config
                .then =>
                  @_notifyDataSplice session
                    .then ->
                      resolve session
            else
              @_notifyDataSplice session
                .then ->
                  resolve session

            # TODO: use a different mechanism to tell the views
            # to load locally. Perhaps the session resolves with
            # REMOTE, or LOCAL
            #
            # pass flag that we need to load a local copy of the views
            # _.extend options, local: true
            @_notifyDataSplice session
              .then ->
                resolve session
          else
            @_sessionError session
            reject error

  # Always returns a promise.
  getOfflineBehavior: (session) ->
    new Promise (resolve, reject) =>
      if session.get 'sessionName'
        context = @_factory.eventFactory.context()
        offlineBehavior =
          ExpressionEvaluator.evaluateAttribute 'DS_OFFLINE_BEHAVIOR', null, { context }
        resolve offlineBehavior
      else
        resolve null

  _sessionError: (session) ->
    @_clearSession session
    @_factory.pubSub.trigger 'sessionError'

  # This is a DataSplice event
  _notifyDataSplice: (session) ->
    new Promise (resolve, reject) =>
      @_factory.register 'session', session
      @_factory.pubSub.trigger 'sessionLoaded', session

      # Trigger the logged in event
      {eventFactory} = @_factory
      eventContext = eventFactory.context()
      eventFactory.execute EventRegistry.LoggedIn, eventContext
      resolve session

  # TODO: move this into a localizationservice
  _initializeLocalization: ->
    eventContext = @_factory.eventFactory.context()
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