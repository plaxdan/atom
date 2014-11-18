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

<<<<<<< HEAD
    'CONFIG_LOADING'
    'CONFIG_LOADED'
    'CONFIG_ERROR'
=======
    'CONNECTION_UNKNOWN'
    'CONNECTION_CONNECTING'
    'CONNECTION_CONNECTED'
    'CONNECTION_DISCONNECTED'
    'CONNECTION_DROPPED'
>>>>>>> load config from within sessionservice

    'SCANNER_CONFIG_UPDATING'
    'SCANNER_CONFIG_ERROR'
    'SCANNER_CONFIG_UPDATED'
  }
  ConnectionStates: {
    'UNKNOWN'
    'AVAILABLE'
    'CONNECTING'
    'CONNECTED'
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
