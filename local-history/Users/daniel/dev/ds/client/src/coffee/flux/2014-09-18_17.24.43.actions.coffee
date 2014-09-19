ServerService = require '../services/serverservice'
{FluxMessages} = require './constants'

module.exports =  (factory) ->

  system:
    initialize: ->
      # handles the legacy stuff
      handleLegacy = (server) ->
        factory.register 'server', server
        factory.pubSub.trigger 'serverLoaded'

      # stand back
      @dispatch FluxMessages.SERVER.INITIALIZING

      ServerService.loadServer()
      .then (server) ->
        handleLegacy server
        @dispatch FluxMessages.SERVER.LOADED, server.attributes
        console.log server
      .catch (error) ->
        @dispatch FluxMessages.SERVER.ERROR, error
        console.log error

      Promise.resolve factory.appController.startSession()
        .then (serverAndSessionAttributes) =>
          @dispatch FluxMessages.INITIALIZED, serverAndSessionAttributes
        .catch (err) =>
          # TODO: This is still handled with pubSub in the controller

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
