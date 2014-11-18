Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

ScannerIntegrationStore = Fluxxor.createStore

  initialize: ->
    @state =
      uniwedgePort: 2000
      uniwedgeStatus: 'unknown'
      driverName: null
      manualTrigger: false

    @bindActions FluxMessages.SCANNER_CONFIG_UPDATING, =>
      @_setState
        uniwedgeStatus: 'updating'
        driverName: null
        manualTrigger: false
    @bindActions FluxMessages.SCANNER_CONFIG_ERROR, =>
      @_setState uniwedgeStatus: 'error'
    @bindActions FluxMessages.SCANNER_CONFIG_UPDATED, @_handleConfig

  getState: ->
    @state

  _handleConfig: (config) ->
    @_setState
      uniwedgeStatus: 'success'
      driverName: config.activeDriver
      manualTrigger: config.canTrigger

  _setState: (newState) ->
    _.extend @state, newState
    @emit 'change'

module.exports = ScannerIntegrationStore
