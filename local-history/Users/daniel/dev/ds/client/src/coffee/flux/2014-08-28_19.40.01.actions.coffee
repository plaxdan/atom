Session = require '../models/session'
{FluxMessages} = require './constants'

module.exports =  (factory) ->

  init:
    initialize: ->
      fromStartSession = factory.appController.startSession()
      console.log 'hello'

  auth:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn new Session {userName, password, domain}
          .then (authenticatedSession) =>
            # do not pass the backbone model down, only the values
            payload = authenticatedSession.attributes

            @dispatch FluxMessages.AUTHENTICATED, payload
          .catch (err) =>
            @dispatch FluxMessages.FAIL
