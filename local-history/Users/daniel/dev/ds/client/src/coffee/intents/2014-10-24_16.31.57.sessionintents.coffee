{FluxMessages} = require '../constants'

SessionIntents = (configService, sessionService, settingsService, legacyFactory) ->

  # Loads config if the session doesn't already have any.
  # loader is either configService.loadLocal or loadRemote
  _loadConfig = (session, loader) ->
    config = session.get 'views'
    weHaveConfig = config.length > 0
    return true if weHaveConfig
    loader config

  login: (userName, password, domain) ->
    console.log 'intents.session.login' if TRACE
    @dispatch FluxMessages.SESSION_CREATING
    sessionService.login userName, password, domain
      .then (session) =>
        Promise.resolve _loadConfig session, configService.loadRemote
          .then =>
            sessionService.getOfflineBehavior session
              .then (offlineBehavior) ->
                _.assign {offlineBehavior}, session.attributes
              .then (sessionPayload) =>
                # TODO: what about session.isCached(). In the past we'd trigger
                # a warning notification with the message 'Session timeout'
                @dispatch FluxMessages.SESSION_CREATED, sessionPayload
      .catch (error) =>
        @dispatch FluxMessages.SESSION_ERROR, error

  logout: (options) ->
    console.log 'intents.session.logout' if TRACE
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
          @dispatch FluxMessages.SESSION_DESTROYED

  lock: -> # TODO
    console.log 'intents.session.lock' if TRACE
    settingsService.setUserSetting 'sessionLocked', true


  resume:  -> # TODO

module.exports = SessionIntents
