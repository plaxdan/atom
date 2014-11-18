{EventEmitter} = require 'events'
{ConnectionStates} = require '../flux/constants'

class ConnectionService extends EventEmitter

  constructor: (@_factory) ->
