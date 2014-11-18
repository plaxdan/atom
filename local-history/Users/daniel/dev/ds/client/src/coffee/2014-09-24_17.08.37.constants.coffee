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
    # A network connection exists,
    # but we've not yet established a
    # session with a DataSplice server
    'AVAILABLE'
    # In the process of establishing a
    # session with a DataSplice server
    'CONNECTING'
    # A session with a DataSplice
    # server is currently being maintained
    'ONLINE'
    # The DataSplice server is available
    # but the user is orking offline
    'OFFLINE'
    # The DataSplice server is unavailable
    'UNAVAILABLE'
  }
  Stores: {
    'Server'
    'Session'
    'Connection'
    'TopLevelActions'
  }
