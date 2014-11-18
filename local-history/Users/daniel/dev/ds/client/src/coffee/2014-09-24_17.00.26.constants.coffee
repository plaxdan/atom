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
    # a network connection exists, 
    # but we've not established a
    # session with a DataSplice server
    'AVAILABLE'
    'CONNECTING'
    'CONNECTED'
    'DISCONNECTED'
    # TODO: are these two the same?
    'UNAVAILABLE'
    'DROPPED'
  }
  Stores: {
    'Server'
    'Session'
    'Connection'
    'TopLevelActions'
  }
