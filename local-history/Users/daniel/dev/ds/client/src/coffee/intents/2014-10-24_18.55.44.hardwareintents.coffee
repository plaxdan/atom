{FluxMessages} = require '../constants'

HardwareIntents = (hardwareService) ->

  updateScannerConfig: ->
    @dispatch FluxMessages.SCANNER_CONFIG_UPDATING
    hardwareService.updateScannerConfig()
      .then (config) =>
        @dispatch FluxMessages.SCANNER_CONFIG_UPDATED, config
      , =>
        @dispatch FluxMessages.SCANNER_CONFIG_ERROR

  showScannerSettings: ->
    hardwareService.showScannerSettings()

  triggerScan: (options) ->
    hardwareService.triggerScan options

module.exports = HardwareIntents
