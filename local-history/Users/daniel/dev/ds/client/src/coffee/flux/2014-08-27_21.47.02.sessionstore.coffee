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
    _emiteChange()

  getState: ->
    @state

  _emitChange: ->
    @emit 'change'

module.exports = SessionStore
