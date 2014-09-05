
class SessionService

  logIn: (userName, password, domain) ->
    new Promise (resolve, reject) ->
      # showWait is handled in the UI layer now
      # @pubSub.trigger 'showWait'
