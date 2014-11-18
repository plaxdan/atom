{EventEmitter} = require 'events'
{ConnectionStates} = require '../constants'

class ConnectionService extends EventEmitter

  constructor: (@_factory) ->
    @_connectionState = ConnectionStates.UNKNOWN

module.exports = ConnectionService
