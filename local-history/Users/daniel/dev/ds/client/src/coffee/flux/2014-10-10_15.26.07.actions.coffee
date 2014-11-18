{FluxMessages} = require './constants'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'
ConfigService = require '../services/configservice'

module.exports = (factory) ->

  serverService = new ServerService factory
  sessionService = new SessionService factory
  configService = new ConfigService factory

  system:
    initialize: ->
      send = (msg, payload) =>
        console.info msg, JSON.stringify payload if DEBUG
        @dispatch msg, payload

      send FluxMessages.SERVER_LOADING
      serverService.loadServer()
      .then (server) =>
        send FluxMessages.SERVER_LOADED, server.attributes
        send FluxMessages.SESSION_LOADING
        sessionService.resume()
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          send FluxMessages.SESSION_RESUMED, session.attributes
          send FluxMessages.CONFIG_LOADING
          configService.loadConfig session
          .then (config) =>
            send FluxMessages.CONFIG_LOADED, config
          .catch (error) =>
            send FluxMessages.CONFIG_ERROR, config
        .catch (error) =>
          send FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        send FluxMessages.SERVER_ERROR, error

  session:
    login: (userName, password, domain) ->
<<<<<<< HEAD
      # stand back
      @dispatch FluxMessages.HOLD_MY_BEER

      Promise.resolve factory.appController.logIn userName, password, domain
        # Login is good
        .then (sessionAttributes) =>
          @dispatch FluxMessages.AUTHENTICATED, sessionAttributes

        # TODO: handle fail
        .catch (err) =>
          @dispatch FluxMessages.FAIL

  hardware:
    updateScannerConfig: ->
      @dispatch FluxMessages.SCANNER_CONFIG_UPDATING
      factory.hardwareService.updateScannerConfig()
        .then (config) =>
          @dispatch FluxMessages.SCANNER_CONFIG_UPDATED, config
        , =>
          @dispatch FluxMessages.SCANNER_CONFIG_ERROR

    showScannerSettings: ->
      factory.hardwareService.showScannerSettings()

    triggerScan: (options) ->
      factory.hardwareService.triggerScan options
=======
      send = (msg, payload) =>
        console.info msg, payload if DEBUG
        @dispatch msg, payload

      send FluxMessages.SESSION_LOADING
      sessionService.login userName, password, domain
      .then (session) =>
        # TODO: what about session.isCached(). In the past we'd trigger
        # a warning notification with the message 'Session timeout'
        send FluxMessages.SESSION_CREATED, session.attributes
        send FluxMessages.CONFIG_LOADING
        configService.loadConfig session
        .then (config) =>
          send FluxMessages.CONFIG_LOADED, config
        .catch (error) =>
          send FluxMessages.CONFIG_ERROR, config
      .catch (error) =>
        send FluxMessages.SESSION_ERROR, error
>>>>>>> WIP
