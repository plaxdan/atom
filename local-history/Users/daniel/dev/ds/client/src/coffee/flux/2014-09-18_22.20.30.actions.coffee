ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'
{FluxMessages} = require './constants'

module.exports =  (factory) ->

  system:
    initialize: ->

      # stand back
      @dispatch FluxMessages.SERVER_LOADING

      ServerService.loadServer()
      .then (server) =>
        # TODO: remove this
        factory.register 'server', server
        @dispatch FluxMessages.SERVER_LOADED, server.attributes
        @dispatch FluxMessages.SESSION_LOADING
        SessionService.resume()
        .then (session) =>
          # TODO: remove this
          factory.register 'server', server
          factory.pubSub.trigger 'sessionLoaded', session
          @dispatch FluxMessages.SESSION_LOADED, server.attributes
        .catch (error) =>
          factory.pubSub.trigger 'sessionError', error
          @dispatch FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        console.log error
        @dispatch FluxMessages.SERVER_ERROR, error

      # Promise.resolve factory.appController.startSession()
      #   .then (sessionAttributes) =>
      #     @dispatch FluxMessages.INITIALIZED, sessionAttributes
      #   .catch (err) =>
      #     # TODO: This is still handled with pubSub in the controller

  session:
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
