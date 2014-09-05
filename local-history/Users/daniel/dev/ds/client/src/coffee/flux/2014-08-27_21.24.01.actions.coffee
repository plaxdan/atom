{ FluxAPI } = require 'constants'

class Actions

  constructor: (@factory) ->

  # TODO: this is a lame way of gathering the actions together
  #   We'll get rid of this sort of boiler plate before the
  #   introduce-flux branch is ready for merge.
  actions: ->
    {@loginAction}

  loginAction: (userName, password, domain) ->
    # stand back
    @dispatch FluxApi.HOLD_MY_BEER

    session = new Session {userName, password, domain}
    # TODO: replace @factory with something else
    #   (perhaps a lightweight DI container)
    @factory.

module.exports = Actions
