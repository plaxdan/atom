{FluxMessages} = require './constants'

module.exports =  (factory) ->

  init:

    ###
    Initializing consists of:

    - loading server information
    - checking to see if an existing session can be loaded
    - triggering a pubSub event if it cannot
    - loading views
    - storing session to local storage

    What we want is for either

    A)
      - startSession to return a promise that either resolves and contains both
        session and server info
      - or rejects with an error due to
        - server load failed
          - BAD
        - session load failed
          - Need to go to login screen

    B)
      - startSession returns a promise containing ONLY server information
      - we then have to manually coordinate other functions on controller
        dispatching more and more data each time we do
    ###
    initialize: ->
      # stand back
      @dispatch FluxMessages.HOLD_MY_BEER

      # TODO: replace app controller with service layer
      Promise.resolve factory.appController.startSession()
        # Server is good
        .then (response) =>
          @dispatch FluxMessages.SERVER_LOADED, response

          # TODO: load session from here
        .then (whatsThis) =>
          console.log 'Whats this: ', whatsThis

  auth:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.HOLD_MY_BEER

        Promise.resolve factory.appController.logIn userName, password, domain
          # Login is good
          .then (sessionAttributes) =>
            @dispatch FluxMessages.AUTHENTICATED, sessionAttributes

          # TODO: handle fail
          .catch (err) =>
            @dispatch FluxMessages.FAIL
