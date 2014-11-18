{FluxMessages} = require './constants'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'
ConfigService = require '../services/configservice'

module.exports =  (factory) ->

  88mph = (msg, payload) ->
    console.debug msg, payload if DEBUG
    @dispatch msg, payload

  serverService = new ServerService factory
  sessionService = new SessionService factory
  configService = new ConfigService factory

  system:
    initialize: ->
      88mph FluxMessages.SERVER_LOADING
      serverService.loadServer()
      .then (server) ->
        88mph FluxMessages.SERVER_LOADED, server.attributes
        88mph FluxMessages.SESSION_LOADING
        sessionService.resume()
        .then (session) ->
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          88mph FluxMessages.SESSION_LOADED, session.attributes
          88mph FluxMessages.CONFIG_LOADING
          configService.loadConfig session
          .then (config) ->
            88mph FluxMessages.CONFIG_LOADED, config
          .catch (error) ->
            88mph FluxMessages.CONFIG_ERROR, config
        .catch (error) ->
          88mph FluxMessages.SESSION_ERROR, error
      .catch (error) ->
        88mph FluxMessages.SERVER_ERROR, error

  session:
    login: (userName, password, domain) ->
        # stand back
        88mph FluxMessages.SESSION_LOADING

        sessionService.login userName, password, domain
        .then (session) ->
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          88mph FluxMessages.SESSION_LOADED, session.attributes
        .catch (error) ->
          88mph FluxMessages.SESSION_ERROR, error
