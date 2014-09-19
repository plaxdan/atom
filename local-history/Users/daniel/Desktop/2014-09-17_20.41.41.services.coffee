ACTIONS:
  INIT:
    'INITIALIZE'


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
