Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

ServerStore = Fluxxor.createStore

  initialize: ->
    @state = serverLoading: false
    # yes, these functions could perhaps be consolidated in the future
    # leaving everything explicit in this initial fluxification
    @bindActions FluxMessages.SERVER_LOADING, @_serverLoading
    @bindActions FluxMessages.SERVER_LOADED, @_serverLoaded
    @bindActions FluxMessages.SERVER_ERROR, @_serverError

  _serverLoading: (payload, fluxMessage) ->
    @_setState serverLoading: true

  _serverLoaded: (payload, fluxMessage) ->
    @_setState _.assign payload, serverLoading: false

  _serverError: (payload, fluxMessage) ->
    @state =
      serverError: payload
      serverLoading: false
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = ServerStore
