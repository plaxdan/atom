
{FluxMessages} = require '../../constants'

module.exports = (serverService, sessionService) ->

  initialize: ->
    console.info 'intents.system.initialize()' if TRACE
    @dispatch FluxMessages.SERVER_LOADING
    serverService.loadServer()
      .then (server) =>
        @dispatch FluxMessages.SERVER_LOADED, server.attributes
        @dispatch FluxMessages.SESSION_RESUMING
        sessionService.resume()
          .then (session) =>
            sessionService.getOfflineBehavior session
              .then (offlineBehavior) ->
                _.assign {offlineBehavior}, session.attributes
              .then (sessionPayload) =>
                # TODO: what about session.isCached(). In the past we'd trigger
                # a warning notification with the message 'Session timeout'
                @dispatch FluxMessages.SESSION_RESUMED, sessionPayload
          .catch (error) =>
            @dispatch FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        @dispatch FluxMessages.SERVER_ERROR, error