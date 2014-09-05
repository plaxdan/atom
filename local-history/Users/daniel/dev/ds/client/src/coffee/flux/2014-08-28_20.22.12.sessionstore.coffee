Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxMessages.AUTHENTICATED, @_messageRecieved
    @bindActions FluxMessages.SERVER_LOADED, @_messageRecieved

  getState: ->
    @state

  _messageReceived: (payload, action) ->
    if DEBUG
      console.debug "FluxMessages.#{action}", payload
    @_setState payload

  _setState: (newState) ->
    _.extend @state, newState
    @emit 'change'

module.exports = SessionStore
