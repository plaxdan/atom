Fluxxor = require 'fluxxor'
{ FluxApi } = require 'constants'
SessionStore = Fluxxor.createStore

  initialize: ->
    @bindActions
      FluxApi.SESSION_LOADED, @sessionLoaded

  sessionLoaded: (payload) ->
    # TODO: set state from the payload
