{FluxMessages} = require '../constants'

SystemIntents = (pluginService, serverService, settingsService) ->

  initialize: ->
    console.log 'Intents.system.initialize' if TRACE
    @dispatch FluxMessages.SERVER_LOADING
    server = null
    serverService.loadServer()
      .then (server) =>
        server = server
        pluginService.loadPlugins()
      .then =>
        @dispatch FluxMessages.SERVER_LOADED, server.attributes
        @flux.intents.session.resume()
      .catch (error) =>
        @dispatch FluxMessages.SERVER_ERROR, error


    # update the text size for the application. if the size parameter is
    # specified that value will be used, otherwise this will fall back to
    # the default value based on persisted settings or configuration.
    # passing persist: true in the options will save the setting so it is
    # applied when the app is reloaded
    setApplicationTextSize: (size, options) ->
      console.log 'Intents.system.setApplicationTextSize' if TRACE
      settingsService.calculateTextSize size, options
        .then =>
          @dispatch FluxMessages.SETTINGS_CHANGED,
            settingsService.getSettings()

module.exports = SystemIntents
