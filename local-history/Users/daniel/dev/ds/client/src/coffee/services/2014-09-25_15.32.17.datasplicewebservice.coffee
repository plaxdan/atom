{EventEmitter} = require 'events'

http = require 'httpinvoke'

# All functions on this service return an XMLHttpRequest object
# See: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
class DataSpliceWebService

  constructor: (@_serverAddress = '') ->
    @_client = http

  # GET /ds/info
  getServer: ->
    # @_client "#{@_serverAddress}/ds/info", 'GET'
    console.log 'jquery'
    $.ajax url: "#{@_serverAddress}/ds/info"

  # GET /ds/push
  getStatus: ->

  # GET /ds/session (may return 400 BAD_REQUEST if no session key is provided)
  resumeSession: ->

  # POST /ds/session
  createSession: (username, password, domain) ->

  # GET /ds/session/logout
  destroySession: ->

  # GET /ds/session/disconnect
  disconnectSession: ->

  # GET /ds/session/digest
  getConfigurationDigests: ->

  # GET /ds/views
  getConfiguration: ->

  # POST /ds/session/sync
  sync: (payload) ->

  # POST /ds/session/cancel
  cancelSync: ->

  # GET /ds/plugin/manifest.json
  getPlugins: ->

  # POST /ds/plugin/performaction
  performPluginAction: (json) ->

module.exports = DataSpliceWebService
