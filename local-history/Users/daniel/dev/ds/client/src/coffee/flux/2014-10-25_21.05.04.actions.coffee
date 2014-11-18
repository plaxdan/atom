<<<<<<< HEAD
{FluxMessages} = require '../constants'

module.exports = (services, factory) ->

  {
    hardwareService
    settingsService
  } = services

  actions =
    init:
      initialize: ->
        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

        Promise.resolve factory.appController.startSession()
          .then (serverAndSessionAttributes) =>
            actions.env.setApplicationTextSize()
            @dispatch FluxMessages.INITIALIZED, serverAndSessionAttributes
          .catch (err) =>
            # TODO: This is still handled with pubSub in the controller

    auth:
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

    env:
      # update the text size for the application. if the size parameter is
      # specified that value will be used, otherwise this will fall back to
      # the default value based on persisted settings or configuration.
      # passing persist: true in the options will save the setting so it is
      # applied when the app is reloaded
      setApplicationTextSize: (size, options) ->
        settingsService.calculateTextSize size, options
          .then =>
            @dispatch FluxMessages.SETTINGS_CHANGED,
              settingsService.getSettings()

    hardware:
      updateScannerConfig: ->
        @dispatch FluxMessages.SCANNER_CONFIG_UPDATING
        hardwareService.updateScannerConfig()
          .then (config) =>
            @dispatch FluxMessages.SCANNER_CONFIG_UPDATED, config
          , =>
            @dispatch FluxMessages.SCANNER_CONFIG_ERROR

      showScannerSettings: ->
        hardwareService.showScannerSettings()

      triggerScan: (options) ->
        hardwareService.triggerScan options

  actions
=======
{FluxMessages, ConnectionStates} = require '../constants'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'
ConfigService = require '../services/configservice'
ConnectionService = require '../services/connectionservice'

module.exports = (factory) ->

  # These could be wired elsewhere and provided by an IOC container-like object
  serverService = new ServerService factory
  sessionService = new SessionService factory
  configService = new ConfigService factory
  connectionService = new ConnectionService factory

  # Start listening for changes now. This gives us an opportunity
  # to know the connection state prior to login and allows us to
  # prompt the user to connect prior to a login attempt.
  connectionService.on 'change', (connectionState) =>
    console.log FluxMessages.CONNECTION_CHANGED, connectionState
    # @dispatch FluxMessages.CONNECTION_CHANGED, connectionState

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

  hardware:
    updateScannerConfig: ->
      send = (msg, payload) =>
        console.info msg, payload if DEBUG
        @dispatch msg, payload
      send FluxMessages.SCANNER_CONFIG_UPDATING
      factory.hardwareService.updateScannerConfig()
        .then (config) =>
          send FluxMessages.SCANNER_CONFIG_UPDATED, config
        , =>
          send FluxMessages.SCANNER_CONFIG_ERROR

    showScannerSettings: ->
      factory.hardwareService.showScannerSettings()

    triggerScan: (options) ->
      factory.hardwareService.triggerScan options
>>>>>>> flux actions: system.initialize and session.login
