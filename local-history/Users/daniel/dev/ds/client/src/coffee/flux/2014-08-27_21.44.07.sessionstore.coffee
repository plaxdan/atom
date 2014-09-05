Fluxxor = require 'fluxxor'
{ FluxApi } = require 'constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions
      FluxApi.AUTHENTICATED, @authenticated

  authenticated: (payload) ->
    @state.username = payload.userName
    @state.domain = payload.domain

module.exports = SessionStore
