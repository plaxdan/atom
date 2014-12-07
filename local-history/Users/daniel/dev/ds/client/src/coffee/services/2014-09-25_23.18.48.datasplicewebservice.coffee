httpinvoke = require 'httpinvoke'

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
    finished: @_done

  _defaultServerAddress: ->
    (localStorage.getItem 'ServiceAddressBase') or ''

  _get: (endPoint, options) ->
    new Promise (resolve, reject) =>
      url = "#{@_serverAddress}#{endPoint}"
      _.assign options, @_defaultClientOptions()
      @_abort = @_client url, 'GET', options
      .then ((response) -> resolve response.body),
        ((response) -> reject response)

  _post: (endPoint, payload, options) ->
    url = "#{@_serverAddress}#{endPoint}"
    _.assign options, @_defaultClientOptions()
    @_abort = @_client url, 'POST', options
    .then (response) -> resolve response, (response) -> reject response

  _initialized: ->
    logMsg = "Initialized DataSpliceWebService with: \
      \n\tHTTP client:\t[jQuery]
      \n\tServer address:\t[#{@_serverAddress}]"
    console.info logMsg

  _done: ->
    console.debug 'Finished request' if DEBUG
    delete @_abort

  # Construct a new httpinvoke with a hook to fail on non-200 statuses
  # See: https://github.com/jakutis/httpinvoke#hooktype-hook
  #
  # Also normalizes the structure of the object returned from the promise:
  #
  # Resolved promises return:
  #   payload: [JSON Object]
  #   request:
  #     body: raw body of response from server
  #     headers: array of request headers
  #     status: numeric HTTP status code
  #
  # Rejected promises return:
  #   error: a javascript Error object
  #   request:
  #     body: raw body of response from server
  #     headers: array of request headers
  #     status: numeric HTTP status code
  _configureHTTPClient: ->
    httpinvoke.hook 'finished', (error, body, statusCode, headers) ->
      if statusCode is 200
        # TODO: is this how we want to handle this?
        payload = try
          JSON.parse body
        catch
          body
        body =
          payload: payload
          response: {
            body
            headers
            status: statusCode
          }
      else
        message = try
          (JSON.parse body).message
        catch
          ''
        error =
          payload: new Error "Error #{statusCode}: '#{message}'"
          response: {
            body
            headers
            status: statusCode
          }
      [error, body, statusCode, headers]

  constructor: (@_serverAddress) ->
    @_client = @_configureHTTPClient()
    @_endPoints = @_defaultEndPoints()
    @_serverAddress or= @_defaultServerAddress()
    @_initialized()

  abort: ->
    if @_abort?
      console.log '[DataSpliceWebService] aborting request'
      @_abort()
      true
    else
      console.warn '[DataSpliceWebService] Tried to abort when no request was \
        in progress.'
      false

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