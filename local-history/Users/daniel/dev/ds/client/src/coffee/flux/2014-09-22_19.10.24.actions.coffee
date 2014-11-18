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
      console.debug FluxMessages.SERVER_LOADING
      @dispatch FluxMessages.SERVER_LOADING
      serverService.loadServer()
      .then (server) =>
        console.debug FluxMessages.SERVER_LOADED
        @dispatch FluxMessages.SERVER_LOADED, server.attributes
        console.debug FluxMessages.SESSION_LOADING
        @dispatch FluxMessages.SESSION_LOADING
        sessionService.resume()
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          console.debug FluxMessages.SESSION_LOADED
          @dispatch FluxMessages.SESSION_LOADED, session.attributes
          console.debug FluxMessages.CONFIG_LOADING
          @dispatch FluxMessages.CONFIG_LOADING
          configService.loadConfig session
          .then (config) =>
            console.debug FluxMessages.CONFIG_LOADED
            @dispatch FluxMessages.CONFIG_LOADED, config
          .catch (error) =>
            console.debug FluxMessages.CONFIG_ERROR
            @dispatch FluxMessages.CONFIG_ERROR, config
        .catch (error) =>
          console.debug FluxMessages.SESSION_ERROR
          @dispatch FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        console.debug FluxMessages.SERVER_ERROR
        @dispatch FluxMessages.SERVER_ERROR, error

  session:
    login: (userName, password, domain) ->
        # stand back
        console.debug FluxMessages.SESSION_LOADING
        @dispatch FluxMessages.SESSION_LOADING

        sessionService.login userName, password, domain
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          console.debug FluxMessages.SESSION_LOADED
          @dispatch FluxMessages.SESSION_LOADED, session.attributes
        .catch (error) =>
          console.debug FluxMessages.SESSION_ERROR
          @dispatch FluxMessages.SESSION_ERROR, error
