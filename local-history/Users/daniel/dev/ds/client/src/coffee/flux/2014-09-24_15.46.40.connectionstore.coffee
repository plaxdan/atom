Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

ConnectionStore = Fluxxor.createStore

  getInitialState: ->
    status: 'unknown'

  initialize: ->
    @state = @getInitialState()
