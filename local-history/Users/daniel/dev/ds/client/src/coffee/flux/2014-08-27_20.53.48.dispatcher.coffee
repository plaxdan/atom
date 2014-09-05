Fluxxor = require 'fluxxor'
{ FluxAPI } = require 'constants'
SessionStore = require 'sessionstore'

class Dispatcher extends Fluxxor.Flux

  constructor: (actions, stores) ->
    # stores =
    #   SessionStore: new SessionStore
    #
    #

    super stores, actions
