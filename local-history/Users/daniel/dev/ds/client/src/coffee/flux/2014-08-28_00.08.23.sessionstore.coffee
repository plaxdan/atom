Fluxxor = require 'fluxxor'
{FluxActions} = require './constants'

SessionStore = Fluxxor.createStore

  initialize: ->
    @state = {}
    @bindActions FluxActions.AUTHENTICATED, @_authenticated

  getState: ->
    @state

  _authenticated: (payload) ->
    _.extend @state, payload
    _emitChange()

  _emitChange: ->
    @emit 'change'

module.exports = SessionStore
