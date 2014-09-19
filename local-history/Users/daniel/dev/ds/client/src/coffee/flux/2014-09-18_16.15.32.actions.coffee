{FluxMessages} = require './constants'

module.exports =  (factory) ->

  system:
    initialize: ->
      # stand back
      @dispatch FluxMessages.HOLD_MY_BEER

      Promise.resolve factory.appController.startSession()
        .then (serverAndSessionAttributes) =>
          @dispatch FluxMessages.INITIALIZED, serverAndSessionAttributes
        .catch (err) =>
          # TODO: This is still handled with pubSub in the controller

  auth:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn userName, password, domain
          # Login is good
          .then (sessionAttributes) =>
            @dispatch FluxMessages.AUTHENTICATED, sessionAttributes

          # TODO: handle fail
          .catch (err) =>
            @dispatch FluxMessages.FAIL