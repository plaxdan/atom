Session = require '../models/session'
{FluxMessages} = require './constants'

module.exports =  (factory) ->

  init:
    initialize: ->
      # stand back
      @dispatch FluxMessages.HOLD_MY_BEER

      Promise.resolve factory.appController.startSession()
        # Server is good
        .then (serverAttributes) =>
          @dispatch FluxMessages.SERVER_LOADED, serverAttributes
          factory.appController.checkSession()

        # Local session is good
        .then (sessionAttributes) =>
          @dispatch FluxMessages.AUTHENTICATED, sessionAttributes

        # TODO: handle fail
        .catch (fail) =>
          @dispatch FluxMessages.FAIL

  auth:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn new Session {userName, password, domain}
          # Login is good
          .then (sessionAttributes) =>
            @dispatch FluxMessages.AUTHENTICATED, sessionAttributes

          # TODO: handle fail
          .catch (err) =>
            @dispatch FluxMessages.FAIL
