{FluxMessages} = require '../constants'

NavigateIntents = (configService, sessionService, settingsService, legacyFactory) ->

  home: ->
    Promise.resolve legacyFactory.dsApp.validate()
      .then => @dispatch FluxMessages.NAVIGATE_HOME

  settings: (section) ->
    Promise.resolve legacyFactory.dsApp.validate()
      .then => @dispatch FluxMessages.NAVIGATE_SETTINGS, { section }

  # I don't like how this passes an existing controller object around, but
  # it's the easiest way to handle the current behavior. once the display
  # states are more stateful this will be easier to clean up
  view: (action, controller) ->
    Promise.resolve legacyFactory.dsApp.validate()
      .then => @dispatch FluxMessages.NAVIGATE_VIEW, { action, controller }

module.exports = NavigateIntents
