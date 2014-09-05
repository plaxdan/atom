Fluxxor = require 'fluxxor'
{ FluxApi } = require 'constants'
SessionStore = Fluxxor.createStore

  initialize: ->
    @bindActions
