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
  ConnectionStates: {
    'UNKNOWN'
    # The DataSplice server is available
    # for the user to establish a connection.
    'AVAILABLE'
    # In the process of establishing a
    # connection with a DataSplice server.
    'CONNECTING'
    # A connection to the DataSplice
    # server is currently being maintained.
    'CONNECTED'
    # The DataSplice server is available
    # but the user has inentionally disconnected
    # (they're working offline).
    'DISCONNECTED'
    # The DataSplice server is unavailable
    # either due to the lack of network
    # connectivity, or perhaps because the
    # DataSplice server is not running.
    'UNAVAILABLE'
  }
  Stores: {
    'Server'
    'Session'
    'Connection'
    'TopLevelActions'
  }
