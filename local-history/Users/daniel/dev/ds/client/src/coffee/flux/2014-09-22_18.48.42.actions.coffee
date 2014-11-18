{FluxMessages} = require './constants'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'
ConfigService = require '../services/configservice'

module.exports =  (factory) ->

  serverService = new ServerService factory
  sessionService = new SessionService factory
  configService = new ConfigService factory

  system:
    initialize: ->
      @dispatch FluxMessages.SERVER_LOADING
      serverService.loadServer()
      .then (server) =>
        @dispatch FluxMessages.SERVER_LOADED, server.attributes
        @dispatch FluxMessages.SESSION_LOADING
        sessionService.resume()
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          @dispatch FluxMessages.SESSION_LOADED, session.attributes
          configService.loadConfig session
          .then (config) => 
            @dispatch FluxMessages.CONFIG_LOADED,
          .catch (error) -> console.log 'Error resolving views'

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
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          @dispatch FluxMessages.SESSION_LOADED, session.attributes
        .catch (error) =>
          @dispatch FluxMessages.SESSION_ERROR, error
