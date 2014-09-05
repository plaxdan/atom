Fluxxor = require 'fluxxor'
{ FluxApi } = require 'constants'
SessionStore = require 'sessionstore'

class Dispatcher extends Fluxxor.Flux

  constructor: ->
    stores =
      SessionStore: new SessionStore
      
