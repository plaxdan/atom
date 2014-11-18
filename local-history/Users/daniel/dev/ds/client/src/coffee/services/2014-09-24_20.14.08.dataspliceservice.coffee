

class DataSpliceService

  constructor: (@serverAddress) ->

  # GET /ds/info
  getServer: ->

  # GET /ds/session
  getSession: ->

  createSession: ->

  destroySession: ->

  # GET /ds/session/disconnect
  disconnectSession: ->

  # GET /ds/session/digest
  getConfigurationDigests: ->

  # GET /ds/views
  getConfiguration: ->

  # POST /ds/session/sync
  sync: ->

  # POST /ds/session/cancel
  cancelSync: ->

  # GET /ds/plugin/manifest.json
  getPlugins: ->

  # POST /ds/plugin/performaction
  pluginAction: (json) ->
