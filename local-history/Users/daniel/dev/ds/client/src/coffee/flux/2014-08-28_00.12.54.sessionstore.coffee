Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxMessages.AUTHENTICATED, @_authenticated

  getState: ->
    @state

  _authenticated: (payload) ->
    _.extend @state, payload
    _emitChange()

  _emitChange: ->
    @emit 'change'

module.exports = SessionStore
