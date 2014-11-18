Fluxxor = require 'fluxxor'
{FluxMessages} = require '../constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = status: FluxMessages.SESSION_LOADING
    @bindActions FluxMessages.SESSION_CREATING, @_sessionLoading,
      FluxMessages.SESSION_RESUMING, @_sessionLoading,
      FluxMessages.SESSION_RESUMED, @_sessionLoaded,
      FluxMessages.SESSION_CREATED, @_sessionLoaded,
      FluxMessages.SESSION_DESTROYED, @_sessionDestroyed,
      FluxMessages.SESSION_ERROR, @_sessionError

  getState: ->
    @state

  _sessionLoading: (payload, fluxMessage) ->
    @_setState status: fluxMessage

  _sessionLoaded: (payload, fluxMessage) ->
    usernamePattern = ///
      [^\:\:] # Starting with and excluding ::
      *$      # return all that follows
    ///

    # Pull the pertinent information out of the session
    # and load it into the store
    state =
      status: fluxMessage
      sessionName: payload.sessionName
      sessionToken: payload.sessionToken
      mode: payload.mode
      offlineBehavior: payload.offlineBehavior
      userIdentifier: payload.userIdentifier
      userName: (payload.userIdentifier.match usernamePattern)[0]
      roles: payload.roles
    @_setState state

  _sessionDestroyed: (payload, fluxMessage) ->
    @state =
      status: fluxMessage
    @emit 'change'

  _sessionError: (payload, fluxMessage) ->
    @state =
      status: fluxMessage
      sessionError: payload
    @emit 'change'

  _setState: (newState) ->
    extendedState = _.assign @state, newState
    @emit 'change'

module.exports = SessionStore
