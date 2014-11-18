<<<<<<< HEAD
{FluxMessages} = require '../constants'
=======
{FluxMessages, ConnectionStates} = require '../constants'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'
ConfigService = require '../services/configservice'
ConnectionService = require '../services/connectionservice'
>>>>>>> flux actions: system.initialize and session.login

module.exports = (services, factory) ->

  {
    hardwareService
  } = services

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

  send = (dispatch, msg, payload) =>
    if DEBUG
      payloadStr = if payload? then JSON.stringify payload else '[NO PAYLOAD]'
      console.info msg, payloadStr
    dispatch msg, payload

  system:
    initialize: ->

      send @dispatch, FluxMessages.SERVER_LOADING
      serverService.loadServer()
        .then (server) =>
          send @dispatch, FluxMessages.SERVER_LOADED, server.attributes
          send @dispatch, FluxMessages.SESSION_LOADING
          sessionService.resume()
            .then (session) =>
              # TODO: what about session.isCached(). In the past we'd trigger
              # a warning notification with the message 'Session timeout'
              send @dispatch, FluxMessages.SESSION_RESUMED, session.attributes
              send @dispatch, FluxMessages.CONFIG_LOADING
              configService.loadConfig session
                .then (config) =>
                  send @dispatch, FluxMessages.CONFIG_LOADED, config
                .catch (error) =>
                  send @dispatch, FluxMessages.CONFIG_ERROR, config
            .catch (error) =>
              send @dispatch, FluxMessages.SESSION_ERROR, error
        .catch (error) =>
          send @dispatch, FluxMessages.SERVER_ERROR, error

  session:
    login: (userName, password, domain) ->
      send @dispatch, FluxMessages.SESSION_LOADING
      sessionService.login userName, password, domain
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          send @dispatch, FluxMessages.SESSION_CREATED, session.attributes
          send @dispatch, FluxMessages.CONFIG_LOADING
          configService.loadConfig session
            .then (config) =>
              send @dispatch, FluxMessages.CONFIG_LOADED, config
            .catch (error) =>
              send @dispatch, FluxMessages.CONFIG_ERROR, config
        .catch (error) =>
          send @dispatch, FluxMessages.SESSION_ERROR, error

  hardware:
    updateScannerConfig: ->
<<<<<<< HEAD
<<<<<<< HEAD
      @dispatch FluxMessages.SCANNER_CONFIG_UPDATING
      hardwareService.updateScannerConfig()
=======
      send = (msg, payload) =>
        console.info msg, payload if DEBUG
        @dispatch msg, payload
      send FluxMessages.SCANNER_CONFIG_UPDATING
=======
      send @dispatch, FluxMessages.SCANNER_CONFIG_UPDATING
>>>>>>> single send function to log dispatches
      factory.hardwareService.updateScannerConfig()
>>>>>>> flux actions: system.initialize and session.login
        .then (config) =>
          send @dispatch, FluxMessages.SCANNER_CONFIG_UPDATED, config
        , =>
          send @dispatch, FluxMessages.SCANNER_CONFIG_ERROR

    showScannerSettings: ->
      hardwareService.showScannerSettings()

    triggerScan: (options) ->
      hardwareService.triggerScan options
