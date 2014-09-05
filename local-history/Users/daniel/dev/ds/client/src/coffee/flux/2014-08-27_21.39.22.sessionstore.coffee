Fluxxor = require 'fluxxor'
{ FluxApi } = require 'constants'
SessionStore = Fluxxor.createStore

  name: 'SessionStore'

  initialize: ->
    @state = {}
    @bindActions
      FluxApi.AUTHENTICATED, @authenticated

  authenticated: (payload) ->
    @state.username = payload.userName
    @state.domain = payload.domain
