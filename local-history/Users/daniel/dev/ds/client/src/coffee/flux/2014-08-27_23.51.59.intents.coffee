Session = require '../models/session'
{FluxAPI} = require './constants'

module.exports =  (factory) ->

    loginAction: (userName, password, domain) ->
        # stand back
        @dispatch FluxAPI.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn new Session {userName, password, domain}
          .then (authenticatedSession) =>
            # do not pass the backbone model down, only the values
            payload = authenticatedSession.attributes

            @dispatch FluxAPI.AUTHENTICATED, payload
          .catch (err) =>
            @dispatch FluxAPI.FAIL
