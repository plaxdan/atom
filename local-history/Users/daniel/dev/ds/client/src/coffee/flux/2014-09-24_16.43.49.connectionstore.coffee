Fluxxor = require 'fluxxor'
{FluxMessages, ConnectionStates} = require '../constants'

ConnectionStore = Fluxxor.createStore

  _getInitialState: ->
    connectionState: ConnectionStates.UNKNOWN

  initialize: ->
    @_state = @_getInitialState()

  getState: -> @_state
