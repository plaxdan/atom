Fluxxor = require 'fluxxor'
{FluxMessages} = require '../constants'

ServerStore = Fluxxor.createStore

  initialize: ->
    @state = status: FluxMessages.SERVER_UNKNOWN
    @bindActions FluxMessages.SERVER_LOADING, @_serverLoading,
      FluxMessages.SERVER_LOADED, @_serverLoaded,
      FluxMessages.SERVER_ERROR, @_serverError

  getState: -> @state

  _serverLoading: (payload, fluxMessage) ->
    @_setState status: fluxMessage

  _serverLoaded: (payload, fluxMessage) ->
    @_setState _.assign payload,
      status: fluxMessage

  _serverError: (payload, fluxMessage) ->
    @state =
      serverError: payload
      status: fluxMessage
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = ServerStore
