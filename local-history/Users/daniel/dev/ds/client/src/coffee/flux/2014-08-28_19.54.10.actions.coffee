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
        .catch (fail) =>
          # Currently fail is handled within the appController
          # In the future app controller will be replaced by a service
          # and fail will be handled here
          @dispatch FluxMessages.FAIL

  auth:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn new Session {userName, password, domain}
          .then (sessionAttributes) =>
            @dispatch FluxMessages.AUTHENTICATED, sessionAttributes
          .catch (err) =>
            # Currently fail is handled within the appController
            # In the future app controller will be replaced by a service
            # and fail will be handled here
            @dispatch FluxMessages.FAIL
