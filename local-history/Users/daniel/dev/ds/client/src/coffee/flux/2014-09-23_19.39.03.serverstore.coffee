Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

ServerStore = Fluxxor.createStore

  initialize: ->
    @state =
      serverLoading: false
      serverLoaded: false
    @bindActions FluxMessages.SERVER_LOADING, @_serverLoading,
      FluxMessages.SERVER_LOADED, @_serverLoaded,
      FluxMessages.SERVER_ERROR, @_serverError

  getState: -> @state

  _serverLoading: (payload, fluxMessage) ->
    @_setState serverLoading: true

  _serverLoaded: (payload, fluxMessage) ->
    @_setState _.assign payload,
      serverLoading: false
      serverLoaded: true

  _serverError: (payload, fluxMessage) ->
    @state =
      serverError: payload
      serverLoading: false
      serverLoaded: false
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = ServerStore
