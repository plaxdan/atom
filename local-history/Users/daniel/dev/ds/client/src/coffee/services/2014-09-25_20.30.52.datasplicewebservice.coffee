# All functions on this service return promises that resolve with the body of
# the response and reject with the XMLHTTPRequest
#
# Options for each function may include:
#
# - timeout: num milliseconds
#
class DataSpliceWebService

  _defaultEndPoints: ->
    push:           '/ds/push'
    session:        '/ds/session'
    logout:         '/ds/session/logout'
    disconnect:     '/ds/session/disconnect'
    digest:         '/ds/session/digest'
    views:          '/ds/views'
    sync:           '/ds/session/sync'
    cancel:         '/ds/session/cancel'
    pluginmanifest: '/ds/plugin/manifest.json'
    pluginaction:   '/ds/plugin/performaction'
    server:         '/ds/info'

  _defaultClientOptions: ->
    dataType: 'json'

  _defaultServerAddress: ->
    (localStorage.getItem 'ServiceAddressBase') or ''

  # NOTE: when jQuery is used as the HTTP client then the response object
  # returned is a jqXHR
  # See: http://api.jquery.com/jQuery.ajax/#jqXHR
  #
  # This is a superset of the standard XHR
  # See: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  #
  # This ensures that only the standard XHR functions are available on the
  # response object.
  _standardizeXHR: (jqXHR) ->
    _.pick jqXHR, [
      'readyState'
      'status'
      'statusText'
      'responseXML'
      'setRequestHeader'
      'getAllResponseHeaders'
      'getResponseHeader'
      'statusCode'
      'abort'
    ]

  _get: (endPoint, options) ->
    _.assign options, @_defaultClientOptions()
    new Promise (resolve, reject) =>
      _.assign options,
        url: "#{@_serverAddress}#{endPoint}"
        # complete: (response, textStatus) ->
        #   resolveOrReject = if response.status is 200 then resolve else reject
        #   resolveOrReject response

      $.ajax options
      .done (payload, textStatus, jqXHR) ->
        resolution = {
          payload
          xhr: @_standardizeXHR jqXHR
        }
        resolve
      .fail reject

  _post: (endPoint, payload, options) ->
    _.assign options, @_defaultClientOptions()
    new Promise (resolve, reject) =>
      _.assign options,
        url: "#{@_serverAddress}#{endPoint}"
        type: 'POST'
        # TODO: should contentType only be set if a payload exists?
        contentType: 'text/javascript'
        # complete: (response, textStatus) ->
        #   resolveOrReject = if response.status is 200 then resolve else reject
        #   resolveOrReject response

      # Was a payload provided?
      _.assign options, data: payload if payload?

      $.ajax options
      .done resolve
      .fail reject

  _initialized: ->
    logMsg = "Initialized DataSpliceWebService with: \
      \n\tHTTP client:\t[jQuery]
      \n\tServer address:\t[#{@_serverAddress}]"
    console.info logMsg

  constructor: (@_serverAddress) ->
    @_endPoints = @_defaultEndPoints()
    @_serverAddress or= @_defaultServerAddress()
    @_initialized()

  # TODO: abort last request made if still in progress
  abort: ->
    console.warn 'NOT IMPLEMENTED: DataSpliceWebService#abort()'

  getServer: (options = {}) ->
    @_get @_endPoints.server, options

  # GET /ds/push
  getStatus: (options = {}) ->
    @_get @_endPoints.push, options

  # GET /ds/session (may return 400 BAD_REQUEST if no session key is provided)
  resumeSession: ->

  # POST /ds/session
  createSession: (username, password, domain) ->

  # GET /ds/session/logout
  destroySession: ->

  # GET /ds/session/disconnect
  disconnectSession: ->

  # GET /ds/session/#{mode}
  setSessionMode: (mode, options = {}) ->
    # TODO: validate mode
    @_get "#{@_endPoints.session}/#{mode}", options

  # GET /ds/session/digest
  getConfigurationDigests: ->

  # GET /ds/views
  getConfiguration: ->

  # POST /ds/session/sync
  sync: (payload, options = {}) ->
    @_post @_endPoints.sync, payload, options

  # POST /ds/session/cancel
  cancelSync: (options = {}) ->
    @_post @_endPoints.cancel, null, options

  getPlugins: (options = {}) ->
    @_get @_endPoints.pluginmanifest, options

  # POST /ds/plugin/performaction
  performPluginAction: (json) ->

module.exports = DataSpliceWebService