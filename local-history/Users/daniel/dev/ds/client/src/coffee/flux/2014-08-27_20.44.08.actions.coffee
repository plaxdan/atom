{ FluxAPI } = require 'constants'

module.exports =
  tryLogin: (userName, password, domain) ->
    @dispatch FluxApi.HOLD_MY_BEER
    session = new Session {userName, password, domain}
    @viewFactory.pubSub.trigger 'logIn', session
