Fluxxor = require 'fluxxor'

class DataSpliceFlux extends Fluxxor.Flux

  constructor: (stores, actions) ->
    super

  dispatch: (action) ->
    super action
    if DEBUG
      console.debug 'Flux - Dispatching:', action
