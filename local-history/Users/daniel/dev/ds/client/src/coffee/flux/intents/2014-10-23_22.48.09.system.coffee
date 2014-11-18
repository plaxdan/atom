
module.exports = (@serverService, @sessionService) ->

  initialize: ->
    console.info 'FluxActions.system.initialize()' if TRACE
    send @dispatch, FluxMessages.SERVER_LOADING
    serverService.loadServer()
      .then (server) =>
        send @dispatch, FluxMessages.SERVER_LOADED, server.attributes
        send @dispatch, FluxMessages.SESSION_RESUMING
        sessionService.resume()
          .then (session) =>
            buildSessionPayload session
              .then (sessionPayload) =>
                # TODO: what about session.isCached(). In the past we'd trigger
                # a warning notification with the message 'Session timeout'
                send @dispatch, FluxMessages.SESSION_RESUMED, sessionPayload
          .catch (error) =>
            send @dispatch, FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        send @dispatch, FluxMessages.SERVER_ERROR, error
