EventRegistry = require '../event/eventregistry'
ExpressionEvaluator = require '../expressions/expressionevaluator'

UserError = require '../models/usererror'
Session = require '../models/session'

class SessionService

  # TODO: stop passing factory around
  constructor: (@_factory) ->

  login: (username, password, domain) =>
    new Promise (resolve, reject) =>
      session = new Session {userName: username, password, domain}
      session.save null,
        success: =>
          @_sessionLoaded session
          resolve session
        error: (model, response) ->
          message =
            response.responseJSON or
            response.responseText or
            if response.statusText is 'error'
              'Authentication failed! Cannot contact the server'
            else
              'Authentication failed! No message from the server'
          reject new UserError message

  logout: => # TODO
  lock: => # TODO

  resume: =>
    new Promise (resolve, reject) =>
      session = new Session
      @_factory.register 'session', session
      @_ensureSessionCookie session
      session.fetch
        bypassCache: true
        success: =>
          @_sessionLoaded session
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
            @_sessionLoaded session
            resolve session
          else
            @_clearSession session
            reject error

  _sessionLoaded: (session) =>
    # Trigger the logged in event
    # TODO: unit tests need to ensure that this happened!
    {eventFactory} = @_factory
    eventContext = eventFactory.context()
    eventFactory.execute EventRegistry.LoggedIn, eventContext
    # TODO: unit tests need to ensure that this happened!
    session.storeLocal()

  _initializeLocalization: =>
    # TODO: move this into a localizationservice
    eventContext = @_factory.eventFactory.context()
    # bing:localization - this needs a lot more thought. for now, we can at
    # least load non-US time formats based on the browser accept language
    (Promise.resolve ExpressionEvaluator.evaluateAttribute 'DS_LOCALE', 'en', { context })
      .then (locale) =>
        console.info "Setting locale: #{locale}"
        if locale and locale not in [ 'en', 'en-us' ]
          moment.lang 'en-gb'
        else
          moment.lang 'en'

  # clear local information about the current session
  _clearSession: (session) =>
    document.cookie = 'DS_SESSION_NAME=invalid'
    # TODO: Create a SettingsService and delete cache through it.
    # for obj in [ @settings, @session ]
    #   obj.deleteCache()
    session.deleteCache()

  # some environments don't persist cookies (running as a shortcut from iOS
  # home screen), but local storage does work. restore the token cookie
  # if needed so we don't lose the current session
  _ensureSessionCookie: (session) =>
    if not document.cookie and (!session.isEmpty() or session.loadLocal())
      document.cookie = "DS_SESSION_NAME=#{session.get 'sessionName'}"

module.exports = SessionService
