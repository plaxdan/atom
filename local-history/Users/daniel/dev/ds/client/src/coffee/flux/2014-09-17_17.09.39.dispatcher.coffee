Fluxxor = require 'fluxxor'

class Dispatcher extends Fluxxor.Flux

  dispatch: (action) ->
    if DEBUG
      console.debug 'Flux - Dispatching:', action
    super
