Session = require '../models/session'
{FluxMessages} = require './constants'

module.exports =  (factory) ->

  init:
    initialize: ->
      # stand back
      @dispatch FluxMessages.HOLD_MY_BEER

      Promise.resolve factory.appController.startSession()
        .then (serverAttributes) =>
          @dispatch FluxMessages.SERVER_LOADED, serverAttributes
          factory.appController.checkSession()
        .then (sessionAttributes) =>
          @dispatch FluxMessages.AUTHENTICATED, sessionAttributes
        .catch (fail) =>
          # TODO: handle fail
          @dispatch FluxMessages.FAIL

  auth:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn new Session {userName, password, domain}
          .then (sessionAttributes) =>
            @dispatch FluxMessages.AUTHENTICATED, sessionAttributes
          .catch (err) =>
          # TODO: handle fail
            @dispatch FluxMessages.FAIL
