Session = require '../models/session'

SessionService =

  login: (username, password) ->
  logout: ->
  lock: ->

  resume: ->
    session = new Session
    _ensureSessionCookie session
    new Promise (resolve, reject) ->
      

  _ensureSessionCookie (session): ->
    # some environments don't persist cookies (running as a shortcut from iOS
    # home screen), but local storage does work. restore the token cookie
    # if needed so we don't lose the current session
    if not document.cookie and (!session.isEmpty() or session.loadLocal())
      document.cookie = "DS_SESSION_NAME=#{session.get 'sessionName'}"
