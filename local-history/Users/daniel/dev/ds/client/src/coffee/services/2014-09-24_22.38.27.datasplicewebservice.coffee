{EventEmitter} = require 'events'

rest = require 'rest'
jsonp = require 'rest/interceptor/jsonp'
pathPrefix = require 'rest/interceptor/pathPrefix'
errorCode = require 'rest/interceptor/errorCode'
mime = require 'rest/interceptor/mime'

class DataSpliceWebService

  constructor: (@serverAddress) ->
    @_client = rest
      .wrap pathPrefix prefix: @serverAddress
      # .wrap jsonp
      # rest.wrap mime
      # .wrap errorCode code: 500

  # GET /ds/info
  getServer: ->
    new Promise (resolve, reject) =>
      @_client 'ds/info'
      .then (response) -> resolve response
      .catch -> reject response

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