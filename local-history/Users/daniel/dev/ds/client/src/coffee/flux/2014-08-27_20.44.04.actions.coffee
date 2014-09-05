{ FluxAPI } = require 'constants'

module.exports =
  tryLogin: (userName, password, domain) ->
    @dispatch FluxApi
    session = new Session {userName, password, domain}
    @viewFactory.pubSub.trigger 'logIn', session
