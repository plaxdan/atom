Session = require '../models/session'
{FluxMessages} = require './constants'

module.exports =  (factory, services) ->

  auth:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

        {SessionService} = services

        Promise.resolve SessionService.logIn userName, password, domain
          .then (authenticatedSession) =>
            # Backbone should be a private implementation detail of the core.
            #   The service layer therefore returns the model attributes (not
            #   the model itself)
            #
            #   TODO: note that the model is still available through
            #   factory.session
            payload = authenticatedSession

            @dispatch FluxMessages.AUTHENTICATED, payload
          .catch (err) =>
            @dispatch FluxMessages.FAIL

        # Promise.resolve factory.appController.logIn new Session {userName, password, domain}
        #   .then (authenticatedSession) =>
        #     # do not pass the backbone model down, only the values
        #     payload = authenticatedSession.attributes
        #
        #     @dispatch FluxMessages.AUTHENTICATED, payload
        #   .catch (err) =>
        #     @dispatch FluxMessages.FAIL
