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
      loginBanner: ""
      serverVersion: "5.1.25"

    SessionStore:

    # Could contain styles for both:
    #   - View
    #   - Session
    ValidationStylesStore:

    ConnectionStore:
