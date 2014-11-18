{FluxMessages} = require './constants'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'
ConfigService = require '../services/configservice'

module.exports =  (factory) ->

  spam = (msg, payload) ->
    console.debug msg, payload if DEBUG
    @dispatch msg, payload

  serverService = new ServerService factory
  sessionService = new SessionService factory
  configService = new ConfigService factory

  system:
    initialize: ->
      spam FluxMessages.SERVER_LOADING
      serverService.loadServer()
      .then (server) =>
        spam FluxMessages.SERVER_LOADED, server.attributes
        spam FluxMessages.SESSION_LOADING
        sessionService.resume()
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          spam FluxMessages.SESSION_LOADED, session.attributes
          spam FluxMessages.CONFIG_LOADING
          configService.loadConfig session
          .then (config) =>
            spam FluxMessages.CONFIG_LOADED, config
          .catch (error) =>
            spam FluxMessages.CONFIG_ERROR, config
        .catch (error) =>
          spam FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        spam FluxMessages.SERVER_ERROR, error

  session:
    login: (userName, password, domain) ->
        # stand back
        spam FluxMessages.SESSION_LOADING

        sessionService.login userName, password, domain
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          spam FluxMessages.SESSION_LOADED, session.attributes
        .catch (error) =>
          spam FluxMessages.SESSION_ERROR, error
