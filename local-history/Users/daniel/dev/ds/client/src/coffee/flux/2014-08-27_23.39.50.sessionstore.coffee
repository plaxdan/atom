Fluxxor = require 'fluxxor'
{FluxAPI} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxAPI.AUTHENTICATED, @_authenticated

  getState: ->
    @state

  _authenticated: (payload) ->
    @state.userName = payload.userName
    @state.domain = payload.domain
    _emitChange()

  _emitChange: ->
    @emit 'change'

module.exports = SessionStore
