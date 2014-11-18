{EventEmitter} = require 'events'

class ConnectionService extends EventEmitter

  constructor: (@_factory) ->
