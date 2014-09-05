Fluxxor = require 'fluxxor'
{ FluxApi } = require 'constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxApi.AUTHENTICATED, @_authenticated

  getState: ->
    @state

  _authenticated: (payload) ->
    @state.username = payload.userName
    @state.domain = payload.domain
    _emitChange()

  _emitChange: ->
    @emit 'change'

module.exports = SessionStore
