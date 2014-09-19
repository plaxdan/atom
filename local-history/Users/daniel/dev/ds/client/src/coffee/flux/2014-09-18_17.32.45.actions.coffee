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
      @dispatch FluxMessages.SERVER_INITIALIZING

      ServerService.loadServer()
      .then (server) ->
        handleLegacy server
        console.log 'LOADED SERVER', server
        @dispatch FluxMessages.SERVER_LOADED, server.attributes

        # TODO: try to resume the session
      .catch (error) ->
        @dispatch FluxMessages.SERVER_ERROR, error
        console.log error

      Promise.resolve factory.appController.startSession()
        .then (sessionAttributes) =>
          @dispatch FluxMessages.INITIALIZED, sessionAttributes
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
