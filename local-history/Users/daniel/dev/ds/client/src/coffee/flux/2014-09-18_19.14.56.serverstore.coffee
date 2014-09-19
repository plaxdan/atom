Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

ServerStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxMessages.SERVER_INITIALIZED, @_messageReceived

  _messageReceived: (payload, action) ->
    @_setState payload

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = ServerStore
