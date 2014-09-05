Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxMessages.AUTHENTICATED, @_messageReceived
    @bindActions FluxMessages.SERVER_LOADED, @_messageReceived

  getState: ->
    @state

  _messageReceived: (payload, action) ->
    console.debug "FluxMessages.#{action}", payload if DEBUG
    @_setState payload

  _setState: (newState) ->
    console.log 'SessionStore previousState', @state
    console.log 'SessionStore newState', newState
    extendedState = _.extend @state, newState
    console.log 'SessionStore extendedState', extendedState
    if DEBUG
    console.log 'SessionStore finalState', @state
    @emit 'change'

module.exports = SessionStore
