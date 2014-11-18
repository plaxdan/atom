module.exports =
  FluxMessages: {
    'SERVER_LOADING'
    'SERVER_LOADED'
    'SERVER_ERROR'

    'SESSION_RESUMING'
    'SESSION_RESUMED'
    'SESSION_CREATING'
    'SESSION_CREATED'
    'SESSION_DESTROYED'
    'SESSION_ERROR'

    'CONNECTION_UNKNOWN'
    'CONNECTION_CONNECTING'
    'CONNECTION_CONNECTED'
    'CONNECTION_DISCONNECTED'
    'CONNECTION_DROPPED'

    'SCANNER_CONFIG_UPDATING'
    'SCANNER_CONFIG_ERROR'
    'SCANNER_CONFIG_UPDATED'
  }
  ConnectionStates: {
    # An attempt has not yet been made
    # to communicate with the DataSplice server
    # or the user is intentionally working offline.
    'UNKNOWN'
    # The DataSplice server is available
    # for the user to establish a connection.
    # The user has not yet connected, or their
    # session was revoked by a server
    # administrator.
    'AVAILABLE'
    # In the process of establishing a
    # connection with a DataSplice server.
    'CONNECTING'
    # A connection to the DataSplice
    # server is currently being maintained.
    # (the user is working online).
    'CONNECTED'
    # The DataSplice server is unavailable
    # either due to the lack of network
    # connectivity, or because the DataSplice
    # server is not running.
    'UNAVAILABLE'
  }
  OfflineBehaviors: {
    'ALWAYS'
    'NEVER'
  }
  Stores: {
    'Server'
    'Session'
    'Connection'
    'TopLevelActions'
    'ScannerIntegration'
  }
