{ FluxApi } = require 'constants'

module.exports =
  tryLogin: (userName, password, domain) ->
    @dispatch
    session = new Session {userName, password, domain}
    @viewFactory.pubSub.trigger 'logIn', session
