Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxMessages.AUTHENTICATED, @_messageReceived
    @bindActions FluxMessages.INITIALIZED, @_messageReceived

  getState: ->
    @state

  _messageReceived: (payload, action) ->
    console.debug "FluxMessages.#{action}", payload if DEBUG
    @_setState payload

  _setState: (newState) ->
    extendedState = _.extend @state, newState
    @emit 'change'

module.exports = SessionStore