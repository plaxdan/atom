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
  # UNKNOWN -> AVAILABLE      # /ds/info -> success (start monitoring /ds/info)
  # UNKNOWN -> UNAVAILABLE    # /ds/info -> fail
  #
  # AVAILABLE -> CONNECTING   # /ds/push -> inprogress
  # AVAILABLE -> UNAVAILABLE  # /ds/info -> fail
  #
  # CONNECTING -> CONNECTED   # /ds/push -> success
  # CONNECTING -> AVAILABLE   # /ds/push -> fail AND /ds/info -> success
  # CONNECTING -> UNAVAILABLE # /ds/push -> fail AND /ds/info -> fail
  #
  # CONNECTED -> AVAILABLE    # stop monitoring /ds/push AND /ds/info -> success
  # CONNECTED -> UNAVAILABLE  # /ds/push -> fail AND /ds/info -> fail
  #
  # UNAVAILABLE -> AVAILABLE
  ConnectionStates: {
    # An attempt has not yet been made
    # to communicate with the DataSplice server
    # or the user is intentionally working offline.
    'UNKNOWN'
    # The DataSplice server is available
    # for the user to establish a connection.
    # The user has not yet connected, or is
    # intentionally woking offline, or their
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
  Stores: {
    'Server'
    'Session'
    'Connection'
    'TopLevelActions'
  }
