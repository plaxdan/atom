EventRegistry = require '../event/eventregistry'
ExpressionEvaluator = require '../expressions/expressionevaluator'

UserError = require '../models/usererror'
Session = require '../models/session'

class SessionService

  # TODO: stop passing factory around
  constructor: (@_factory,, @appCacheService) ->

  create: (username, password, domain) ->
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

  destroy: ->
    new Promise (resolve, reject) =>
      eventFactory = @_factory.eventFactory
      eventFactory.execute EventRegistry.LogOut, eventFactory.context(), (context) =>
        # TODO move to ModificiationService
        modHandler = @_factory.modificationHandler
        Promise.resolve modHandler.commitChanges()
        .then =>
          @_factory.pubSub.trigger 'loggedOut'
          # TODO: move this to an HTTP service or something to shield the
          # use of jQuery's ajax from the rest of the codebase
          Promise.resolve $.ajax timeout: 5000, url: UrlHelper.prefix 'ds/session/logout'
          .then ->
            # The session was cleanly destroyed

            # TODO: move this to AppCacheService
            ac = window.applicationCache
            ac.update() if ac and ac.status isnt ac.UNCACHED
          .catch ->
            # TODO: record the dangling session for future destruction
            reject
        .catch ->
          # TODO: previously we'd do an options?.promise?.reject()
          # review this.

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

  _sessionError: (session) ->
    @_clearSession session
    @_factory.pubSub.trigger 'sessionError'

  # This is a DataSplice event
  _notifyDataSplice: (session) ->
    new Promise (resolve, reject) =>
      @_factory.register 'session', session
      @_factory.pubSub.trigger 'sessionLoaded', session

      # Trigger the logged in event
      # TODO: move this into an EventService
      {eventFactory} = @_factory
      eventContext = eventFactory.context()
      eventFactory.execute EventRegistry.LoggedIn, eventContext
      resolve session

  # TODO: move this into a LocalizationService
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
