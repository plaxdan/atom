httpinvoke = require 'httpinvoke'

# The API on this service returns promises. Promises resolve when a call to
# the DataSplice web service yields a 200 OK. Promises reject for all other
# status codes and javascript and network errors.
#
# Promise resolution
# ------------------
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
#       payload:
#         type: error type
#         message: error message
#       response: if the error includes a response from the server (like 404)
#         body: unparsed string response from server
#         headers: array of request headers
#         status: numeric HTTP status code
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

  _defaultServerAddress: ->
    (localStorage.getItem 'ServiceAddressBase') or ''

  # POST /ds/session/cancel
  _cancelSync: ->
    @_post @_endPoints.cancel

  _request: (endPoint, method, options = {}) ->
    url = "#{@_serverAddress}#{endPoint}"
    success = (response) -> response.body
    fail = (error) -> error

    # httpinvoke's promise has no 'catch' method so we wrap it.
    abort = @_client url, method, options
    promise = Promise.resolve @_client url, method, options
      .then success, fail

    # Add abort to the outbound promise
    promise.abort = abort
    promise

  _get: (endPoint, options = {}) ->
    console.debug "[DataSpliceWebService] GET #{endPoint}" if DEBUG
    @_request endPoint, 'GET', options

  _post: (endPoint, payload, options = {}) ->
    payload = JSON.stringify payload unless _.isString payload
    if DEBUG
      console.debug "[DataSpliceWebService] POST #{endPoint} with payload: \
        #{payload}"
    _.assign options,
      input: payload
      headers:
        'Content-Type': 'text/javascript'
    @_request endPoint, 'POST', options

  _initialized: ->
    logMsg = "[DataSpliceWebService] initialized with: \
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
        if statusCode is 20
          payload = if /json|javascript/.test headers['content-type']
            try
              JSON.parse body
            catch
              console.warn "[DataSpliceWebService] Unable to parse response \
                body: #{body}"
              body
          else
            body

          result =
            payload: payload
            response:
              body: body
              headers: headers
              status: statusCode
        # Create an error unless status is 200 (to ensure the promise rejects)
        else
          # Expose the payload and response info on the error
          error = new Error "Error with status code: [#{statusCode}]"
          error.payload =
            # Example for a 404:
            #   message: "Resource not found"
            #   type: "HttpServer.HttpException"
            try
              JSON.parse body
            catch
              body
          error.response =
            body: body
            headers: headers
            status: statusCode

      # return the original args but with body or error potentially replaced
      [error, result or body, statusCode, headers]

    httpinvoke.hook 'finished', onFinished

  constructor: (@_serverAddress) ->
    if DEBUG and @_serverAddress
      message = "You have specified a server address. Please ensure your \
        DataSplice server is configured for CORS requests."
      console.warn message
    @_client = @_configureHTTPClient()
    @_endPoints = @_defaultEndPoints()
    @_serverAddress or= @_defaultServerAddress()
    @_initialized()

  getServer: (options = {}) ->
    @_get @_endPoints.server, options

  # GET /ds/push
  getPush: (options = {}) ->
    @_get @_endPoints.push, options

  # GET /ds/session (may return 400 BAD_REQUEST if no session key is provided)
  # TODO: currently handled by backbone models.
  resumeSession: ->
    throw new Error "Not implemented: DataSpliceWebService\resumeSession()"

  # POST /ds/session
  # TODO: currently handled by backbone models.
  createSession: (username, password, domain) ->
    throw new Error "Not implemented: DataSpliceWebService\#createSession()"

  # GET /ds/session/logout
  destroySession: ->
    @_get "#{@_endPoints.logout}"

  # GET /ds/session/disconnect
  disconnectSession: ->
    @_get "#{@_endPoints.disconnect}"

  # GET /ds/session/online
  setOnlineSessionMode: ->
    @_get "#{@_endPoints.session}/online"

  # GET /ds/session/offline
  setOfflineSessionMode: ->
    @_get "#{@_endPoints.session}/offline"

  # GET /ds/session/digest
  getRemoteDigests: ->
    @_get @_endPoints.digest

  # GET /ds/views
  # TODO: currently handled by backbone models.
  getConfiguration: ->
    throw new Error "Not implemented: DataSpliceWebService\#getConfiguration()"

  # sync returns a cancellable promise. The cancel function sends a POST
  # request to /ds/session/cancel if called.
  #
  # POST /ds/session/sync
  sync: (payload, options = {}) ->
    cancellable = @_post @_endPoints.sync, payload
    # decorate the promise with a cancel function
    cancellable.cancel = =>
      cancellable.abort()
      @_cancelSync()

    cancellable

  getPlugins: ->
    @_get @_endPoints.pluginmanifest

  # POST /ds/plugin/performaction
  performPluginAction: (payload) ->
    @_post @_endPoints.pluginaction, payload

module.exports = DataSpliceWebService
