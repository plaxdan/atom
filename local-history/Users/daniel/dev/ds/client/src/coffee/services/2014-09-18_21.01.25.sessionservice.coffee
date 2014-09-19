Session = require '../models/session'

SessionService =

  login: (username, password) ->
  logout: ->
  lock: ->

  resume: ->
    session = new Session
    
