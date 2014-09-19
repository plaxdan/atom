{FluxActions} = require './constants'

module.exports =  (factory) ->

  system:
    initialize: ->
      # stand back
      @dispatch FluxActions.HOLD_MY_BEER

      Promise.resolve factory.appController.startSession()
        .then (serverAndSessionAttributes) =>
          @dispatch FluxActions.INITIALIZED, serverAndSessionAttributes
        .catch (err) =>
          # TODO: This is still handled with pubSub in the controller

  session:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxActions.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn userName, password, domain
          # Login is good
          .then (sessionAttributes) =>
            @dispatch FluxActions.AUTHENTICATED, sessionAttributes

          # TODO: handle fail
          .catch (err) =>
            @dispatch FluxActions.FAIL
