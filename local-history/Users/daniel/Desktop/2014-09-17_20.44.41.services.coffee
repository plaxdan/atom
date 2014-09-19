ACTIONS:

  INIT:
    'INITIALIZE'

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
      'authDomains'
      'acceptLanguage'
      'defaultAuthDomain'
      'description'
      'instanceName'
      'loginBanner'
      'serverVersion'

    SessionStore:

    ConnectionStore:
