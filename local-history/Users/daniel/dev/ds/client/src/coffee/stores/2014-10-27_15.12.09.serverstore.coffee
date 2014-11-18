Fluxxor = require 'fluxxor'
{FluxMessages} = require '../constants'

ServerStore = Fluxxor.createStore

  initialize: ->
    @state = status: FluxMessages.SERVER_LOADING
    @bindActions FluxMessages.SERVER_LOADING, @_serverLoading,
      FluxMessages.SERVER_LOADED, @_serverLoaded,
      FluxMessages.SERVER_ERROR, @_serverError

  getState: -> @state

  _serverLoading: (payload, fluxMessage) ->
    @_setState status: fluxMessage

  _serverLoaded: (payload, fluxMessage) ->
    nextState = _.assign {}, payload
    nextState.status = fluxMessage
    @_setState nextState

  _serverError: (payload, fluxMessage) ->
    @state =
      serverError: payload
      status: fluxMessage
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = ServerStore
