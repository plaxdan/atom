Session = require '../models/session'

SessionService =

  login: (username, password) ->
  logout: ->
  lock: ->

  resume: ->
    new Promise (resolve, reject) ->
      session = new Session
      _ensureSessionCookie session
      session.fetch
        bypassCache: true
        success: ->
          resolve session

        error: (model, error) ->
          # try to load a persisted session if we're offline
          if (error.status isnt 400) and session.loadLocal()
            # pass flag that we need to load a local copy of the views
            _.extend options, local: true
            resolve session
          else
            reject error

  _ensureSessionCookie (session): ->
    # some environments don't persist cookies (running as a shortcut from iOS
    # home screen), but local storage does work. restore the token cookie
    # if needed so we don't lose the current session
    if not document.cookie and (!session.isEmpty() or session.loadLocal())
      document.cookie = "DS_SESSION_NAME=#{session.get 'sessionName'}"
