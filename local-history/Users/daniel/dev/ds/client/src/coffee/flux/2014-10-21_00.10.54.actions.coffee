<<<<<<< HEAD
{FluxMessages, ConnectionStates} = require '../constants'

module.exports = (services, factory) ->
=======
{FluxMessages} = require '../constants'

module.exports = (services, factory) ->

  {
    configService
    connectionService
    hardwareService
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
    console.info "FluxMessages.#{msg}", payload or '[no payload]' if DEBUG
    dispatch msg, payload

  # Packages a session object into a viewmodel. This is asynchronous as it
  # involves expression evaluation.
  buildSessionPayload = (session) ->
    sessionService.getOfflineBehavior session
      .then (offlineBehavior) ->
        _.assign {offlineBehavior}, session.attributes

  system:
    initialize: ->
      console.info 'FluxActions.system.initialize()' if DEBUG
      send @dispatch, FluxMessages.SERVER_LOADING
      serverService.loadServer()
        .then (server) =>
          send @dispatch, FluxMessages.SERVER_LOADED, server.attributes
          send @dispatch, FluxMessages.SESSION_RESUMING
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
      console.info 'FluxActions.session.login()' if DEBUG
      send @dispatch, FluxMessages.SESSION_CREATING
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
      console.info 'FluxActions.session.logout()' if DEBUG
      sessionService.logout options
        .then =>
          send @dispatch, FluxMessages.SESSION_DESTROYED

  hardware:
    updateScannerConfig: ->
<<<<<<< HEAD
      send @dispatch, FluxMessages.SCANNER_CONFIG_UPDATING
=======
      @dispatch FluxMessages.SCANNER_CONFIG_UPDATING
>>>>>>> dev
      hardwareService.updateScannerConfig()
        .then (config) =>
          send @dispatch, FluxMessages.SCANNER_CONFIG_UPDATED, config
        , =>
          send @dispatch, FluxMessages.SCANNER_CONFIG_ERROR

    showScannerSettings: ->
      hardwareService.showScannerSettings()

    triggerScan: (options) ->
      hardwareService.triggerScan options
