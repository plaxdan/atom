Fluxxor = require 'fluxxor'

class DataSpliceFlux extends Fluxxor.Flux

  dispatch: (action) ->
    super action
    if DEBUG
      console.debug 'Flux - Dispatching:', action
