{ FluxMessages, FluxStores } = require '../constants'
EventRegistry = require '../event/eventregistry'
ConfirmPasswordPrompt = require '../ui/confirmpasswordprompt'

SessionIntents = (configService, modificationService, sessionService, settingsService, legacyFactory) ->

  # Loads config if the session doesn't already have any.
  # loader is either configService.loadLocal or loadRemote
  _loadConfig = (session, loader) ->
    config = session.get 'views'
    weHaveConfig = config.length > 0
    return true if weHaveConfig
    loader config

  # This is a DataSplice event
  _notifyDataSplice = (session, options) ->
    new Promise (resolve, reject) =>
      legacyFactory.register 'session', session
      legacyFactory.pubSub.trigger 'sessionLoaded', options

      # Trigger the logged in event
      # TODO: move this into an event service
      {eventFactory} = legacyFactory
      eventContext = eventFactory.context()
      eventFactory.execute EventRegistry.LoggedIn, eventContext
        .then ->
          resolve session

  login: (userName, password, domain) ->
    console.log 'Intents.session.login' if DEBUG
    @dispatch FluxMessages.SESSION_CREATING
    session = null
    sessionPayload = null
    login = sessionService.login userName, password, domain
      .then (success) ->
        session = success
        settingsService.setUserSetting 'sessionLocked', false
        Promise.resolve _loadConfig session, configService.loadRemote
      .then ->
        { dataController } = legacyFactory
        dataController.initializeViewStorage session.get 'views'
      .then ->
        sessionService.getOfflineBehavior session
      .then (offlineBehavior) =>
        sessionPayload = _.assign {offlineBehavior}, session.attributes
        _notifyDataSplice session,
          authenticated: true,
          local: session.loadedLocal
      .then =>
        @dispatch FluxMessages.SESSION_CREATED, sessionPayload
      .catch (error) =>
        @flux.intents.interaction.error error
        @dispatch FluxMessages.SESSION_ERROR, error
    @flux.intents.interaction.waitFor login

  logout: (options) ->
    console.log 'Intents.session.logout' if DEBUG

    initialPrompt = options.force or @flux.intents.interaction.yesNoPrompt
      title: 'Confirm Log Out'
      message: 'This will release the current session. \
                Are you sure you want to continue?'

    Promise.resolve initialPrompt
      .then =>
        if modificationService.modificationsExist()
          @flux.intents.session.ensureConnected()
            # modificationService will simply resolve if no modifications exist
            .then ->
              modificationService.commitModifications()
            # If we can't connect or commitModifications rejected then we have
            # an issue.
            .catch =>
              secondaryPrompt = options.force or @flux.intents.interaction.yesNoPrompt
                title: 'Confirm Log Out'
                message: 'The current session has uncommitted modifications, \
                  which will be deleted permanently! Are you sure you want to \
                  continue?'

              Promise.resolve secondaryPrompt
                .then ->
                  modificationService.resetModifications()
      .then ->
        sessionService.logout options
      .then =>
        legacyFactory.connectionManager.disconnect silent: true
        legacyFactory.dataController.gc()
        settingsService.setUserSetting 'sessionLocked', false
        @dispatch FluxMessages.SESSION_DESTROYED

  lock: ->
    console.log 'Intents.session.lock' if DEBUG
    settingsService.setUserSetting 'sessionLocked', true

    # session from the legacyFactory is the session backbone model.
    # It has the verifyPassword function that we'll need below.
    { pubSub, session } = legacyFactory
    { instanceName } = (@flux.store FluxStores.Server).getState()
    { userName } = (@flux.store FluxStores.Session).getState()

    pubSub.trigger 'displayModal', ConfirmPasswordPrompt
      instanceName: instanceName
      userName: userName
      confirmPassword: (password) =>
        promise = new $.Deferred
        # validate the password provided by the user
        unless session.verifyPassword password
          promise.reject 'Incorrect password, please try again'
        else
          @flux.intents.session.unlock { password }
            .done promise.resolve
            .catch promise.reject
        promise.promise()
      logOut: @flux.intents.session.logout

  unlock: (options) ->
    console.log 'Intents.session.unlock' if DEBUG
    settingsService.setUserSetting 'sessionLocked', false

    mode = (@flux.store FluxStores.Session).getState().mode
    if mode is 'offline'
      true
    else
      # reconnect to the server before unlocking online sessions
      @flux.intents.session.ensureConnected options
        .catch ->
          # relock the session on failure
          settingsService.setUserSetting 'sessionLocked', true

  resume:  ->
    console.log 'Intents.session.resume' if DEBUG
    @dispatch FluxMessages.SESSION_RESUMING
    session = null
    sessionPayload = null
    resume = sessionService.resume()
      .then (success) ->
        session = success
        loader = if session.loadedLocal
          configService.loadLocal
        else
          configService.loadRemote
        Promise.resolve _loadConfig session, loader
      .then ->
        { dataController } = legacyFactory
        dataController.initializeViewStorage session.get 'views'
      .then ->
        sessionService.getOfflineBehavior session
      .then (offlineBehavior) =>
        sessionPayload = _.assign {offlineBehavior}, session.attributes
        _notifyDataSplice session, local: session.loadedLocal
      .then =>
        @dispatch FluxMessages.SESSION_RESUMED, sessionPayload
      .catch (error) =>
        @dispatch FluxMessages.SESSION_ERROR, error
    @flux.intents.interaction.waitFor resume

  ensureConnected: (options) ->
    console.log 'Intents.session.ensureConnected' if DEBUG
    new Promise (resolve, reject) =>
      { connectionManager } = legacyFactory
      if connectionManager.isConnected()
        resolve()
      else
        connectionManager.ensureConnected options
          .then ->
            # reload the views to ensure we're update to date
            { session } = legacyFactory
            configService.loadRemote session.get 'views'
          .then ->
            { dataController, session } = legacyFactory
            dataController.initializeViewStorage session.get 'views'
          .then resolve, reject

  dataSync: ->
    console.log 'Intents.session.dataSync' if DEBUG
    # probably triggered from the app menu - close it first
    @flux.intents.interaction.toggleMenu menuOpen: false

    legacyFactory.connectionManager.dataSync()

module.exports = SessionIntents
