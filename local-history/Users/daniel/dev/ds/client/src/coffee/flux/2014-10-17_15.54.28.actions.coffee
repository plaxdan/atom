{FluxMessages, ConnectionStates} = require '../constants'

module.exports = (services, factory) ->

  {
    configService
    connectionService
    serverService
    sessionService
  } = services

  # Start listening for changes now. This gives us an opportunity
  # to know the connection state prior to login and allows us to
  # prompt the user to connect prior to a login attempt.
  connectionService.on 'change', (connectionState) =>
    console.log FluxMessages.CONNECTION_CHANGED, connectionState
    # @dispatch FluxMessages.CONNECTION_CHANGED, connectionState

  send = (dispatch, msg, payload) =>
    if DEBUG console.info "FluxMessages.#{msg}", payload or '[no payload]'
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
        .catch (error) =>
          send @dispatch, FluxMessages.SESSION_ERROR, error

    logout: (options) ->
      sessionService.logout options
        .then =>
          send @dispatch, FluxMessages.SESSION_DESTROYED

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
