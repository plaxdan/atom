Fluxxor = require 'fluxxor'
{FluxMessages, ConnectionStates} = require '../constants'

ConnectionStore = Fluxxor.createStore

  initialize: ->
    @_state = ConnectionStates.UNKNOWN

  getState: ->
    @_state
