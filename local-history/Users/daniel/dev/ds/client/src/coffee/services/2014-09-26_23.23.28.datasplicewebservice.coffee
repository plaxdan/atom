httpinvoke = require 'httpinvoke'

# The API on this service returns promises. Promises resolve when a call to
# the DataSplice web service yields a 200 OK. Promises reject for all other
# status codes and javascript and network errors.
#
# Promise resolution
# ---------------------
#
#   Promises resolve with an object:
#     payload: object from server (JSON or otherwise)
#     response:
#       body: unparsed string response from server
#       headers: array of request headers
#       status: numeric HTTP status code
#
#   Promises reject with an Error:
#     Error: actual javascript error object
#       response: if the error includes a response from the server (like 404)
#
#   Note: Actual JS errors and CORS errors will not have a response property.
#
# Options
# -------
#
#   Options for each function may include:
#
#   - timeout: num milliseconds
#   - headers: array of request headers
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

  _defaultServerAddress: ->
    (localStorage.getItem 'ServiceAddressBase') or ''

  _request: (endPoint, method, options = {}) ->
    _.assign options, @_defaultClientOptions()
    url = "#{@_serverAddress}#{endPoint}"
    success = (response) -> response.body
    fail = (response) -> response
    # httpinvoke's promise has no 'catch' method so we wrap it.
    Promise.resolve @_client url, method, options
      .then success, fail

  _get: (endPoint, options) ->
    console.debug "[DataSpliceWebService] GET #{endPoint}"
    _.assign options, @_defaultClientOptions()
    @_request url, 'GET', options

  _post: (endPoint, payload, options) ->
    payload = if _.isString payload then payload else JSON.stringify payload
    console.debug "[DataSpliceWebService] POST #{endPoint}"
    _.assign options, input: payload
    @_request url, 'POST', options

  _initialized: ->
    logMsg = "Initialized DataSpliceWebService with: \
      \n\tHTTP client:\t[jQuery]
      \n\tServer address:\t[#{@_serverAddress}]"
    console.info logMsg

  # Construct a new httpinvoke with a hook to fail on non-200 statuses
  # See: https://github.com/jakutis/httpinvoke#hooktype-hook
  _configureHTTPClient: ->
    onFinished = (error, body, statusCode, headers) ->
      # Just let actual errors pass through unmodified
      unless error
        # Go ahead and package up a payload
        if statusCode is 200
          body = do ->
            payload = if /json$|javascript$/.test headers['content-type']
              try
                JSON.parse body
              catch
                console.warn "Unable to parse response body: #{body}"
                body
            else
              body

            return {
              payload
              response: {
                body
                headers
                status: statusCode
              }
            }
        # Create an error unless status is 200 (to ensure the promise rejects)
        else
          error = new Error "Error with status code: [#{statusCode}]"
          # Expose the response info on the error
          error.response = {
            body
            headers
            status: statusCode
          }

      # return the same args but with body or error potentially replaced
      [error, body, statusCode, headers]

    httpinvoke.hook 'finished', onFinished

  constructor: (@_serverAddress) ->
    if @_serverAddress
      message = "You have specified a server address. Please ensure your \
        DataSplice server is configured for CORS requests"
      console.warn message
    @_client = @_configureHTTPClient()
    @_endPoints = @_defaultEndPoints()
    @_serverAddress or= @_defaultServerAddress()
    @_initialized()

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
    @_get "#{@_endPoints.logout}"

  # GET /ds/session/disconnect
  disconnectSession: ->
    @_get "#{@_endPoints.disconnect}"

  # GET /ds/session/#{mode}
  setSessionMode: (mode) ->
    # TODO: validate mode
    @_get "#{@_endPoints.session}/#{mode}"

  # GET /ds/session/digest
  getConfigurationDigests: ->
    @_get @_endPoints.digest

  # GET /ds/views
  getConfiguration: ->

  # POST /ds/session/sync
  sync: (payload) ->
    @_post @_endPoints.sync, payload

  # POST /ds/session/cancel
  cancelSync: ->
    @_post @_endPoints.cancel

  getPlugins: ->
    @_get @_endPoints.pluginmanifest

  # POST /ds/plugin/performaction
  performPluginAction: (json) ->

module.exports = DataSpliceWebService
