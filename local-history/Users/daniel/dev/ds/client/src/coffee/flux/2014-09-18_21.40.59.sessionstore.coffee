Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = sessionLoading: false
    # yes, these functions could perhaps be consolidated in the future
    # leaving everything explicit in this initial fluxification
    @bindActions FluxMessages.SESSION_LOADING, @_sessionLoading
    @bindActions FluxMessages.SESSION_LOADED, @_sessionLoaded
    @bindActions FluxMessages.SESSION_ERROR, @_sessionError

  getState: ->
    @state

  _sessionLoading: (payload, action) ->
    @_setState sessionLoading: true

  _sessionLoaded: (payload, action) ->
    @_setState _.assign payload, sessionLoading: false

  _sessionError: (payload, action) ->
    @state =
      sessionError: payload
      sessionLoading: false
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = SessionStore
