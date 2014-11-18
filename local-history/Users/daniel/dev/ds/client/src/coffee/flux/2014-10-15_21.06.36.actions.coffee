{FluxMessages, ConnectionStates} = require '../constants'
ConfigService = require '../services/configservice'
ConnectionService = require '../services/connectionservice'
DataService = require '../services/dataservice'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'

module.exports = (factory) ->

  # These could be wired elsewhere and provided by an IOC container-like object
  configService = new ConfigService factory
  connectionService = new ConnectionService factory
  dataService = new DataService factory
  serverService = new ServerService factory
  sessionService = new SessionService factory

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

  # Packages a session object into a viewmodel. This is asynchronous as it
  # involves expression evaluation.
  buildSessionPayload = (session) ->
    sessionService.getOfflineBehavior session
      .then (offlineBehavior) ->
        _.assign {offlineBehavior}, session.attributes

  system:
    initialize: ->
      send @dispatch, FluxMessages.SERVER_LOADING
      serverService.loadServer()
        .then (server) =>
          send @dispatch, FluxMessages.SERVER_LOADED, server.attributes
          send @dispatch, FluxMessages.SESSION_LOADING
          sessionService.resume()
            .then (session) =>
              buildSessionPayload session
                .then (sessionPayload) =>
                  # TODO: what about session.isCached(). In the past we'd trigger
                  # a warning notification with the message 'Session timeout'
                  send @dispatch, FluxMessages.SESSION_RESUMED, sessionPayload
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
          buildSessionPayload session
            .then (sessionPayload) =>
              # TODO: what about session.isCached(). In the past we'd trigger
              # a warning notification with the message 'Session timeout'
              send @dispatch, FluxMessages.SESSION_CREATED, sessionPayload
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
      send @dispatch, FluxMessages.SCANNER_CONFIG_UPDATING
      factory.hardwareService.updateScannerConfig()
        .then (config) =>
          send @dispatch, FluxMessages.SCANNER_CONFIG_UPDATED, config
        , =>
          send @dispatch, FluxMessages.SCANNER_CONFIG_ERROR

    showScannerSettings: ->
      factory.hardwareService.showScannerSettings()

    triggerScan: (options) ->
      factory.hardwareService.triggerScan options
