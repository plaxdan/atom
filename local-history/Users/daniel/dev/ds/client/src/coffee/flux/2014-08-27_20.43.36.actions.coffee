module.exports =
  tryLogin: (userName, password, domain) ->
    session = new Session {userName, password, domain}
    @viewFactory.pubSub.trigger 'logIn', session