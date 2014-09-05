{FluxMessages} = require './constants'

module.exports =  (factory, services) ->

  init:
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
        # grab the service(s) we need
        {SessionService} = services

        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

<<<<<<< HEAD
        Promise.resolve factory.appController.logIn userName, password, domain
          # Login is good
          .then (sessionAttributes) =>
            @dispatch FluxMessages.AUTHENTICATED, sessionAttributes

          # TODO: handle fail
=======
        # Backbone is a private implementation detail of the core.
        #   The service layer therefore returns authenticatedSession as the
        #   model attributes (not the model itself)
        #   TODO: note that the model is still available through factory.session
        Promise.resolve SessionService.logIn userName, password, domain
          .then (authenticatedSession) =>
            @dispatch FluxMessages.AUTHENTICATED, authenticatedSession
>>>>>>> WIP initial service code
          .catch (err) =>
            @dispatch FluxMessages.FAIL, err

        # Promise.resolve factory.appController.logIn new Session {userName, password, domain}
        #   .then (authenticatedSession) =>
        #     # do not pass the backbone model down, only the values
        #     payload = authenticatedSession.attributes
        #
        #     @dispatch FluxMessages.AUTHENTICATED, payload
        #   .catch (err) =>
        #     @dispatch FluxMessages.FAIL