module.exports =
  FluxMessages: {
    'SERVER_UNKNOWN'
    'SERVER_LOADING'
    'SERVER_LOADED'
    'SERVER_ERROR'

    'SESSION_UNKNOWN'
    'SESSION_RESUMING'
    'SESSION_RESUMED'
    'SESSION_CREATING'
    'SESSION_CREATED'
    'SESSION_DESTROYED'
    'SESSION_ERROR'

    'SCANNER_CONFIG_UPDATING'
    'SCANNER_CONFIG_ERROR'
    'SCANNER_CONFIG_UPDATED'
    'SETTINGS_CHANGED'
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
  FluxStores: {
    'Connection'
    'ScannerIntegration'
    'Server'
    'Session'
    'Settings'
    'TopLevelActions'
  }
