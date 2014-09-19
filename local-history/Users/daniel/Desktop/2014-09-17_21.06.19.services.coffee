ACTIONS:

  SYSTEM:
    'INITIALIZE'

  NETWORK:
    'CONNECT'
    'DISCONNECT'

  SESSION:
    'LOGIN'
    'LOGOUT'
    'LOCK'

SERVICES:

  ServerService:
    loadServer: (url) ->

  SessionService:
    login: (username, password) ->
    logout: ->
    lock: ->
    resume: ->

  ViewService:
    loadViews: (views, onSuccess, onError, onDone) ->

  ConnectionService:
    connect: ->
    disconnect: ->
    ping: ->

  ModificationService:
    fetchModifications: ->

STORES:

    ServerStore:
      authDomains: ["DataSplice", "MAXIMO", "WinDomain"]
      acceptLanguage: "en-us"
      defaultAuthDomain: "MAXIMO"
      description: "DataSplice Server 5.1"
      instanceName: "GIS_DEMO"
      loginBanner: ''
      serverVersion: "5.1.25"

    SessionStore:
      sessionName: "{A5D02D67-9B51-4041-80F0-47B98632FB5C}"
      sessionToken: 'd2lsc29uOndpbHNvbg=='
      mode: "online"
      userIdentifier: "MAXIMO::wilson"
      roles: [
        "DataSplice::MAXIMO Condition Monitoring"
        "DataSplice::MAXIMO Inspections"
        "DataSplice::MAXIMO Inventory Usage"
        "DataSplice::MAXIMO Inventory"
        "DataSplice::MAXIMO Issues and Returns"
        "DataSplice::MAXIMO Linked Documents"
        "DataSplice::MAXIMO Offline IDs"
        "DataSplice::MAXIMO Purchasing and Receiving"
        "DataSplice::MAXIMO Service Requests"
        "DataSplice::MAXIMO Work Orders"
        "DataSplice::MAXIMO"
        "DataSplice::TEP"
        "MAXIMO::EVERYONE_GROUP"
        "MAXIMO::ITEMMGR_GROUP"
        "MAXIMO::MAXADMIN_GROUP"
        "MAXIMO::STDSVCMGR_GROUP"
        "MAXIMO::TOOLMGR_GROUP"
      ]

    ConnectionStore:
      state: ['unknown', 'connecting', 'connected', 'disconnected', 'dropped']

    # Could contain styles for both:
    #   - View
    #   - Session
    ValidationStylesStore:
