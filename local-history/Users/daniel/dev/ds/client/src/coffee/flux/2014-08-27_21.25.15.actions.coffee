{ FluxAPI } = require 'constants'

class Actions

  constructor: (@factory) ->

  actions:

    loginAction: (userName, password, domain) ->
      # stand back
      @dispatch FluxApi.HOLD_MY_BEER

      session = new Session {userName, password, domain}
      # TODO: replace @factory with something else
      #   (perhaps a lightweight DI container)
      Promise.resolve @factory.logIn session
        .then
        ['catch']


module.exports = Actions
