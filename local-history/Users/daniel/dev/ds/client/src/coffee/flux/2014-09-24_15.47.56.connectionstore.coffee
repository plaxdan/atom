Fluxxor = require 'fluxxor'
{FluxMessages, ConnectionStates} = require './constants'

ConnectionStore = Fluxxor.createStore

  getInitialState: ->
    connectionState: ConnectionStates.UNKNOWN

  initialize: ->
    @_state = @getInitialState()

  getState: -> @_state
