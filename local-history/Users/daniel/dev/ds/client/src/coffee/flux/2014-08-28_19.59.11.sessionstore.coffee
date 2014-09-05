Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxMessages.AUTHENTICATED, @_setState
    # @bindActions FluxMessages.SERVER_LOADED, @_setState

  getState: ->
    @state

  _setState: (newState) ->
    _.extend @state, newState
    @emit 'change'

module.exports = SessionStore
