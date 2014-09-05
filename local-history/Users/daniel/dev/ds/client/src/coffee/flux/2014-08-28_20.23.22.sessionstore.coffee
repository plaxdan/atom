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
    if DEBUG
      console.debug "FluxMessages.#{action}", payload
    @_setState payload

  _setState: (newState) ->
    _.extend @state, newState
    @emit 'change'

module.exports = SessionStore