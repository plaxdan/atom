
module.exports = (@serverService, @sessionService) ->

  initialize: ->
    console.info 'FluxActions.system.initialize()' if TRACE
    @dispatch FluxMessages.SERVER_LOADING
    serverService.loadServer()
      .then (server) =>
        @dispatch FluxMessages.SERVER_LOADED, server.attributes
        @dispatch FluxMessages.SESSION_RESUMING
        sessionService.resume()
          .then (session) =>
            buildSessionPayload session
              .then (sessionPayload) =>
                # TODO: what about session.isCached(). In the past we'd trigger
                # a warning notification with the message 'Session timeout'
                @dispatch FluxMessages.SESSION_RESUMED, sessionPayload
          .catch (error) =>
            @dispatch FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        @dispatch FluxMessages.SERVER_ERROR, error
