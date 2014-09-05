{FluxAPI} = require './constants'

class Actions

  constructor: (@factory) ->

  actions: ->
    factory = @factory

    loginAction: (userName, password, domain) ->
        # stand back
        @dispatch FluxAPI.HOLD_MY_BEER

        Promise.resolve factory.logIn new Session {userName, password, domain}
          .then =>
            # do not pass the backbone model down, only the values
            @dispatch FluxAPI.AUTHENTICATED, {userName, domain}
          .catch (err) =>
            @dispatch FluxAPI.FAIL


module.exports = Actions
