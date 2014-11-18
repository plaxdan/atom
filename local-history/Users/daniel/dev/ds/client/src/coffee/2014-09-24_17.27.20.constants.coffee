module.exports =
  FluxMessages: {
    'SERVER_LOADING'
    'SERVER_LOADED'
    'SERVER_ERROR'

    'SESSION_LOADING'
    'SESSION_RESUMED'
    'SESSION_CREATED'
    'SESSION_DESTROYED'
    'SESSION_ERROR'

    'CONFIG_LOADING'
    'CONFIG_LOADED'
    'CONFIG_ERROR'

    'CONNECTION_CHANGED'
  }
  # The following state transitions can occur:
  #
  # UNKNOWN -> AVAILABLE
  # UNKNOWN -> UNAVAILABLE
  #
  # AVAILABLE -> CONNECTING
  # AVAILABLE -> UNAVAILABLE
  #
  # CONNECTING -> CONNECTED
  # CONNECTING -> UNKNOWN
  #
  # CONNECTED -> DISCONNECTED
  # CONNECTED -> AVAILABLE
  # CONNECTED -> UNAVAILABLE
  #
  # UNAVAILABLE -> AVAILABLE
  ConnectionStates: {
    # An attempt has not yet been made
    # to communicate with the DataSplice server.
    'UNKNOWN'
    # The DataSplice server is available
    # for the user to establish a connection.
    # The user has not yet connected, or
    # intentionally woking offline.
    # GET /ds/info -> success
    'AVAILABLE'
    # In the process of establishing a
    # connection with a DataSplice server.
    # GET /ds/push
    'CONNECTING'
    # A connection to the DataSplice
    # server is currently being maintained.
    # (the user is working online).
    # GET /ds/push -> success
    'CONNECTED'
    # The DataSplice server is unavailable
    # either due to the lack of network
    # connectivity, or perhaps because the
    # DataSplice server is not running.
    # GET /ds/info -> fail
    'UNAVAILABLE'
  }
  Stores: {
    'Server'
    'Session'
    'Connection'
    'TopLevelActions'
  }
