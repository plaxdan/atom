{EventEmitter} = require 'events'

http = require 'httpinvoke'

# All functions on this service return an XMLHttpRequest object
#   See: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
#
# Options for each function may include of:
#
# - timeout: num milliseconds
#
# All details of the XMLHTTPRequest client in use (jQuery, httpinvoke etc) are
# encapsulated within this service.
class DataSpliceWebService

  constructor: (@_serverAddress = '') ->
    @_client = $.ajax
    console.info 'Initialized DataSpliceWebService with: [jQuery]'

  # GET /ds/info
  getServer: (options = {}) ->
    new Promise (resolve, reject) =>
      clientOptions = _.assign options,
        url: "#{@_serverAddress}/ds/info"
        success: (response) -> resolve response
        error: (err) -> reject err
      @_client clientOptions

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
