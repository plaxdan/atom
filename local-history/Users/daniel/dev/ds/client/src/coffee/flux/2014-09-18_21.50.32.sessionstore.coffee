Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state =
      sessionLoading: false
      sessionLoaded: false
    @bindActions FluxMessages.SESSION_LOADING, @_sessionLoading
    @bindActions FluxMessages.SESSION_LOADED, @_sessionLoaded
    @bindActions FluxMessages.SESSION_ERROR, @_sessionError

  getState: ->
    @state

  _sessionLoading: (payload, action) ->
    @_setState sessionLoading: true

  _sessionLoaded: (payload, action) ->
    # Pull the pertinent information out of the session
    # and load it into the store
    state =
      sessionLoading: false
      sessionLoaded: true
      sessionName: payload.sessionName
      sessionToken: payload.sessionToken
      mode: payload.mode
      userIdentifier: payload.userIdentifier
      roles: payload.roles
    @_setState state

  _sessionError: (payload, action) ->
    @state =
      sessionError: payload
      sessionLoading: false
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = SessionStore
