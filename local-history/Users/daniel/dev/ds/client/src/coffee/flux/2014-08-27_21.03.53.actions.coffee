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

    # TODO: use DataSpliceController to login
    session = new Session {userName, password, domain}
    @viewFactory.pubSub.trigger 'logIn', session

module.exports = Actions
