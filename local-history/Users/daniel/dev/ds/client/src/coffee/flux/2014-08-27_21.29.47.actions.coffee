{ FluxAPI } = require 'constants'

class Actions

  constructor: (@factory) ->

  actions:

    loginAction: (userName, password, domain) ->
      # stand back
      @dispatch FluxApi.HOLD_MY_BEER

      # TODO: replace @factory with something else
      #   (perhaps a lightweight DI container)
      Promise.resolve @factory.logIn new Session {userName, password, domain}
        .then =>
          # do not pass the backbone model down, only the props
          @dispatch FluxAPI.AUTHENTICATED, {userName, password, domain}
        .catch (err) =>
          @dispatch FluxAPI.FAIL


module.exports = Actions