Fluxxor = require 'fluxxor'
{FluxActions} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxActions.AUTHENTICATED, @_messageReceived
    @bindActions FluxActions.INITIALIZED, @_messageReceived

  getState: ->
    @state

  _messageReceived: (payload, action) ->
    @_setState payload

  _setState: (newState) ->
    extendedState = _.extend @state, newState
    @emit 'change'

module.exports = SessionStore
