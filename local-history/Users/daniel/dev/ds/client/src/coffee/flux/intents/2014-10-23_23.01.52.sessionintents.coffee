{FluxMessages} = require '../../constants'

module.exports = (configService, sessionService, settingsService) ->

  login: (userName, password, domain) ->
    console.info 'FluxActions.session.login()' if TRACE
    @dispatch FluxMessages.SESSION_CREATING
    sessionService.login userName, password, domain
      .then (session) =>
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
    console.info 'FluxActions.session.logout()' if TRACE
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
    console.info 'FluxActions.session.lock()' if TRACE
    settingsService.setUserSetting 'sessionLocked', true


  resume:  -> # TODO
