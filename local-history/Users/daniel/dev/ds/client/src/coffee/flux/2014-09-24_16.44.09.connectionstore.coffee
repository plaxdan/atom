Fluxxor = require 'fluxxor'
{FluxMessages, ConnectionStates} = require '../constants'

ConnectionStore = Fluxxor.createStore

  _getInitialState: ->
    ConnectionStates.UNKNOWN

  initialize: ->
    @_state = @_getInitialState()

  getState: -> @_state
