Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxMessages.AUTHENTICATED, @_authenticated
    @bindActions FluxMessages.SERVER_LOADED, @_serverLoaded

  getState: ->
    @state

  _authenticated: (payload) ->
    @_setState payload
    if DEBUG
      console.debug "#{FluxMessages.AUTHENTICATED}", payload

  _serverLoaded: (payload) ->
    @_setState payload
    if DEBUG
      console.debug "#{FluxMessages.SERVER_LOADED}", payload

  _setState: (newState) ->
    _.extend @state, newState
    @emit 'change'

module.exports = SessionStore
