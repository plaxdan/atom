Fluxxor = require 'fluxxor'
{ FluxApi } = require 'constants'
SessionStore = Fluxxor.createStore

  initialize: ->
    @bindActions
      FluxApi.SESSION_LOADED, @sessionLoaded

  sessionLoaded: (payload) ->
    # TODO: get state from the payload
