Session = require '../models/session'

class SessionService

  constructor: (@factory) ->

  logIn: (userName, password, domain) ->
    new Promise (resolve, reject) ->
      # showWait is handled in the UI layer now
      # @factory.pubSub.trigger 'showWait'

      trySession = new Session username, password, domain
      trySession.save null,
        success: ->
          @factory
