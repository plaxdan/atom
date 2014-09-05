Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxMessages.AUTHENTICATED, @_authenticated

  getState: ->
    @state

  _authenticated: (payload) ->
    _setState payload

  _setState: (newState) ->
    _.extend @state, newState
    @emit 'change'

module.exports = SessionStore
