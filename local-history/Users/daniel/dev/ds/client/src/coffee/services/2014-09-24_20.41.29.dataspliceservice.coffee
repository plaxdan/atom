rest = require 'rest'

class DataSpliceService

  constructor: (@serverAddress) ->

  # GET /ds/info
  server: ->

  # GET /ds/push
  status: ->

  # GET /ds/session (may return 400 BAD_REQUEST if no session key is provided)
  sessionResume: ->

  # POST /ds/session
  sessionCreate: (username, password, domain) ->

  # GET /ds/session/logout
  sessionDestroy: ->

  # GET /ds/session/disconnect
  sessionDisconnect: ->

  # GET /ds/session/digest
  configurationDigests: ->

  # GET /ds/views
  configuration: ->

  # POST /ds/session/sync
  sync: ->

  # POST /ds/session/cancel
  cancelSync: ->

  # GET /ds/plugin/manifest.json
  getPlugins: ->

  # POST /ds/plugin/performaction
  performPluginAction: (json) ->
