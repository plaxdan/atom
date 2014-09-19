{FluxMessages} = require './constants'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'

module.exports =  (factory) ->

  serverService = new ServerService factory
  sessionService = new SessionService factory

  system:
    initialize: ->

      # stand back
      @dispatch FluxMessages.SERVER_LOADING

      serverService.loadServer()
      .then (server) =>
        @dispatch FluxMessages.SERVER_LOADED, server.attributes

        # stand back
        @dispatch FluxMessages.SESSION_LOADING
        sessionService.resume()
        .then (session) =>
          @dispatch FluxMessages.SESSION_LOADED, session.attributes

          # TODO: load configuration (views)


        .catch (error) =>
          @dispatch FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        @dispatch FluxMessages.SERVER_ERROR, error

  session:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.SESSION_LOADING

        sessionService.login userName, password, domain
        .then (session) =>
          @dispatch FluxMessages.SESSION_LOADED, session.attributes
        .catch (err) =>
          @dispatch FluxMessages.SESSION_ERROR, err
