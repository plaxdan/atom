Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

ServerStore = Fluxxor.createStore

  initialize: ->
    @state =
      serverLoading: false
      serverLoaded: false
    @bindActions FluxMessages.SERVER_LOADING, @_serverLoading
    @bindActions FluxMessages.SERVER_LOADED, @_serverLoaded
    @bindActions FluxMessages.SERVER_ERROR, @_serverError

  _serverLoading: (payload, fluxMessage) ->
    @_setState payload

  _serverLoaded: (payload, fluxMessage) ->
    @_setState payload

  _serverError: (payload, fluxMessage) ->
    error = payload

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = ServerStore
