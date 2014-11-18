Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state =
      sessionLoading: false
      sessionLoaded: false
    @bindActions FluxMessages.SESSION_LOADING, @_sessionLoading,
      FluxMessages.SESSION_RESUMED, @_sessionLoaded,
      FluxMessages.SESSION_CREATED, @_sessionLoaded,
      FluxMessages.SESSION_ERROR, @_sessionError

  getState: ->
    @state

  _sessionLoading: (payload, fluxMessage) ->
    @_setState sessionLoading: true

  _sessionLoaded: (payload, fluxMessage) ->
    usernamePattern = ///
      [^\:\:] # Starting with and excluding ::
      *$      # return all that follows
    ///

    # Pull the pertinent information out of the session
    # and load it into the store
    state =
      # TODO: move loading/loaded/error into a single sessionStatus
      sessionLoading: false
      sessionError: false
      sessionLoaded: true
      sessionName: payload.sessionName
      sessionToken: payload.sessionToken
      mode: payload.mode
      userIdentifier: payload.userIdentifier
      userName: (payload.userIdentifier.match usernamePattern)[0]
      roles: payload.roles
    @_setState state

  _sessionError: (payload, fluxMessage) ->
    @state =
      sessionError: payload
      sessionLoading: false
      sessionLoaded: false
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = SessionStore
