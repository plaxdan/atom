{EventEmitter} = require 'events'
{ConnectionStates} = require '../constants'

class ConnectionService extends EventEmitter

  constructor: (@_factory) ->
    @emit ConnectionStates.UNKNOWN

module.exports = ConnectionService
