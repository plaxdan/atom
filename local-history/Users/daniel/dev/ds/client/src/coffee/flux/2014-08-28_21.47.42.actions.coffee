{FluxMessages} = require './constants'

module.exports =  (factory) ->

  init:
    initialize: ->
      # stand back
      @dispatch FluxMessages.HOLD_MY_BEER

      # TODO: replace app controller with service layer
      Promise.resolve factory.appController.startSession()
        # Server is good
        .then (response) =>
          @dispatch FluxMessages.SERVER_LOADED, response

          # TODO: load session from here
        .then (whatsThis) =>
          console.log 'Whats this: ', whatsThis

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