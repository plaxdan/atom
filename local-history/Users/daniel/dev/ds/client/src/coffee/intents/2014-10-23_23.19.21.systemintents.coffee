{FluxMessages} = require '../../constants'

module.exports = (serverService, sessionService, settingsService) ->

  initialize: ->
    console.log 'intents.system.initialize' if TRACE
    @dispatch FluxMessages.SERVER_LOADING
    serverService.loadServer()
      .then (server) =>
        @dispatch FluxMessages.SERVER_LOADED, server.attributes
        @dispatch FluxMessages.SESSION_RESUMING
        sessionService.resume()
          .then (session) =>
            sessionService.getOfflineBehavior session
              .then (offlineBehavior) ->
                _.assign {offlineBehavior}, session.attributes
              .then (sessionPayload) =>
                # TODO: what about session.isCached(). In the past we'd trigger
                # a warning notification with the message 'Session timeout'
                @dispatch FluxMessages.SESSION_RESUMED, sessionPayload
          .catch (error) =>
            @dispatch FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        @dispatch FluxMessages.SERVER_ERROR, error


    # update the text size for the application. if the size parameter is
    # specified that value will be used, otherwise this will fall back to
    # the default value based on persisted settings or configuration.
    # passing persist: true in the options will save the setting so it is
    # applied when the app is reloaded
    setApplicationTextSize: (size, options) ->
      console.log 'intents.system.setApplicationTextSize' if TRACE
      settingsService.calculateTextSize size, options
        .then =>
          @dispatch FluxMessages.SETTINGS_CHANGED,
            settingsService.getSettings()
