{EventEmitter} = require 'events'
{ConnectionStates} = require '../constants'

class ConnectionService extends EventEmitter

  constructor: (@_factory) ->
    @_connectionState = ConnectionStates.UNKNOWN

  _changeState: (newState) ->
    unless @_connectionState is newState
      @_connectionState = newState
      @emit 'change', @_connectionState

      # TODO: get rid of this....
      @_factory.pubSub.trigger 'connectionStateChanged'

module.exports = ConnectionService
