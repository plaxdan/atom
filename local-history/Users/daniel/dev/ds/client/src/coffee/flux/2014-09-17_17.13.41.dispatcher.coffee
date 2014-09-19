Fluxxor = require 'fluxxor'

class Dispatcher extends Fluxxor.Flux

  dispatch: (action) ->
    super action
    if DEBUG
      console.debug 'Flux - Dispatching:', action
