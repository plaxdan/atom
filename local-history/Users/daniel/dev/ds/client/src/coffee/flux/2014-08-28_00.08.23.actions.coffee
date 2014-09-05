Session = require '../models/session'
{FluxActions} = require './constants'

module.exports =  (factory) ->

  auth:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxActions.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn new Session {userName, password, domain}
          .then (authenticatedSession) =>
            # do not pass the backbone model down, only the values
            payload = authenticatedSession.attributes

            @dispatch FluxActions.AUTHENTICATED, payload
          .catch (err) =>
            @dispatch FluxActions.FAIL
