Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = sessionLoading: false
    @bindActions FluxMessages.SESSION_LOADING, @_sessionLoading
    @bindActions FluxMessages.SESSION_LOADED, @_sessionLoaded
    @bindActions FluxMessages.SESSION_ERROR, @_sessionError

  getState: ->
    @state

  _sessionLoaded: (payload, action) ->
    @_setState payload

  _sessionLoading: (payload, action) ->
    @_setState payload

  _sessionError: (payload, action) ->
    @state =
      sessionError: payload
      sessionLoading: false
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = SessionStore
