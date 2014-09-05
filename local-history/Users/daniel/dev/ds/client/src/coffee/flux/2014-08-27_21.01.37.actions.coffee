{ FluxAPI } = require 'constants'

class Actions

  constructor: (@factory) ->

  actions: ->
    {@tryLoginAction}

  tryLoginAction: (userName, password, domain) ->
    # stand back
    @dispatch FluxApi.HOLD_MY_BEER

    # TODO: use DataSpliceController to login
    session = new Session {userName, password, domain}
    @viewFactory.pubSub.trigger 'logIn', session

module.exports = Actions
