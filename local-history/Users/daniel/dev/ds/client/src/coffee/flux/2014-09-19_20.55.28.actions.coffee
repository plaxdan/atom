{FluxMessages} = require './constants'
ServerService = require '../services/serverservice'
SessionService = (require '../services/sessionservice')

module.exports =  (factory) ->

  sessionService = new SessionService factory

  system:
    initialize: ->

      # stand back
      @dispatch FluxMessages.SERVER_LOADING

      ServerService.loadServer()
      .then (server) =>
        # TODO: remove this
        factory.register 'server', server
        @dispatch FluxMessages.SERVER_LOADED, server.attributes

        # stand back
        @dispatch FluxMessages.SESSION_LOADING
        sessionService.resume()
        .then (session) =>
          @dispatch FluxMessages.SESSION_LOADED, session.attributes

          # TODO: load configuration (views)


        .catch (error) =>
          factory.pubSub.trigger 'sessionError', error
          @dispatch FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        @dispatch FluxMessages.SERVER_ERROR, error

  session:
    login: (userName, password, domain) ->
        # stand back
        @dispatch FluxMessages.SESSION_LOADING

        sessionService.login userName, password, domain
        .then (session) =>
          # TODO: we won't need these next two lines soon
          factory.pubSub.trigger 'sessionLoaded', session
          @dispatch FluxMessages.SESSION_LOADED, session.attributes
        .catch (err) =>
          factory.pubSub.trigger 'sessionError', err
          @dispatch FluxMessages.SESSION_ERROR, err
