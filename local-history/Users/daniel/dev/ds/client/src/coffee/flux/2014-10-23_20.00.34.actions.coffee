{FluxMessages, ConnectionStates} = require '../constants'

module.exports = (services, legacyFactory) ->

  {
    configService
    connectionService
    hardwareService
    serverService
    sessionService
    settingsService
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

    # update the text size for the application. if the size parameter is
    # specified that value will be used, otherwise this will fall back to
    # the default value based on persisted settings or configuration.
    # passing persist: true in the options will save the setting so it is
    # applied when the app is reloaded
    setApplicationTextSize: (size, options) ->
      settingsService.calculateTextSize size, options
        .then =>
          send @dispatch, FluxMessages.SETTINGS_CHANGED,
            settingsService.getSettings()

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
      # TODO: do this with flux messages instead of the pubsub
      prompt = unless options?.force
        # prompt the user unless a force option is specified
        promise = new $.Deferred
        legacyFactory.pubSub.trigger 'displayModal',
          title: 'Confirm Log Out'
          body: 'Are you sure you want to log out?'
          buttons: [
            { label: 'Yes', class: 'btn-primary', role: 'accept' }
            { label: 'No', role: 'cancel' }
          ]
          promise: promise

        promise
      else
        true

      $.when(prompt).done =>
        sessionService.logout options
          .then =>
            send @dispatch, FluxMessages.SESSION_DESTROYED

    lock: -> # TODO

    resume: -> # TODO

  hardware:
    updateScannerConfig: ->
      send @dispatch, FluxMessages.SCANNER_CONFIG_UPDATING
      hardwareService.updateScannerConfig()
        .then (config) =>
          send @dispatch, FluxMessages.SCANNER_CONFIG_UPDATED, config
        , =>
          send @dispatch, FluxMessages.SCANNER_CONFIG_ERROR

    showScannerSettings: ->
      hardwareService.showScannerSettings()

    triggerScan: (options) ->
      hardwareService.triggerScan options
