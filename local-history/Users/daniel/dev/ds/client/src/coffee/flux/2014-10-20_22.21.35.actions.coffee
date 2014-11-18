{FluxMessages} = require './constants'

module.exports = (factory) ->

  init:
    initialize: ->
      # stand back
      @dispatch FluxMessages.HOLD_MY_BEER

      Promise.resolve factory.appController.startSession()
        .then (serverAndSessionAttributes) =>
          @dispatch FluxMessages.INITIALIZED, serverAndSessionAttributes
        .catch (err) =>
          # TODO: This is still handled with pubSub in the controller

  auth:
    login: (userName, password, domain) ->
      # stand back
      @dispatch FluxMessages.HOLD_MY_BEER

      Promise.resolve factory.appController.logIn userName, password, domain
        # Login is good
        .then (sessionAttributes) =>
          @dispatch FluxMessages.AUTHENTICATED, sessionAttributes

        # TODO: handle fail
        .catch (err) =>
          @dispatch FluxMessages.FAIL

  hardware:
    updateScannerConfig: ->
      @dispatch FluxMessages.SCANNER_CONFIG_UPDATING
      factory.hardwareService.updateScannerConfig()
        .then (config) =>
          @dispatch FluxMessages.SCANNER_CONFIG_UPDATED, config
        , =>
          @dispatch FluxMessages.SCANNER_CONFIG_ERROR

    showScannerSettings: ->
      factory.hardwareService.showScannerSettings()

    triggerScan: (options) ->
      factory.hardwareService.triggerScan options
