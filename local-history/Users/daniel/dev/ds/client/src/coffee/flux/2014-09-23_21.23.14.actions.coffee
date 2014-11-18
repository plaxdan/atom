{FluxMessages} = require './constants'
ServerService = require '../services/serverservice'
SessionService = require '../services/sessionservice'
ConfigService = require '../services/configservice'
ModificationService = require '../services/modificationservice'
AppCacheService = require '../services/appcacheservice'
JQueryHTTPService = require '../services/jqueryhttpservice'

module.exports =  (factory) ->

  # TODO: wiring up the dependencies. Can a JS IOC container be of value
  # ...possibly for AOP-like capabilities?
  configService = new ConfigService factory
  serverService = new ServerService factory
  modificationService = new ModificationService factory
  sessionService = new SessionService factory, modificationService, AppCacheService

  system:
    initialize: ->
      send = (msg, payload) =>
        console.info msg, JSON.stringify payload if DEBUG
        @dispatch msg, payload

      send FluxMessages.SERVER_LOADING
      serverService.loadServer()
      .then (server) =>
        send FluxMessages.SERVER_LOADED, server.attributes
        send FluxMessages.SESSION_LOADING
        sessionService.resume()
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          send FluxMessages.SESSION_RESUMED, session.attributes
          send FluxMessages.CONFIG_LOADING
          configService.loadConfig session
          .then (config) =>
            send FluxMessages.CONFIG_LOADED, config
          .catch (error) =>
            send FluxMessages.CONFIG_ERROR, config
        .catch (error) =>
          send FluxMessages.SESSION_ERROR, error
      .catch (error) =>
        send FluxMessages.SERVER_ERROR, error

  session:

    destroy: ->
      sessionService.destroy()
      .then =>
        @dispatch FluxMessages.SESSION_DESTROYED

    create: (userName, password, domain) ->
        send = (msg, payload) =>
          console.info msg, payload if DEBUG
          @dispatch msg, payload

        send FluxMessages.SESSION_LOADING
        sessionService.create userName, password, domain
        .then (session) =>
          # TODO: what about session.isCached(). In the past we'd trigger
          # a warning notification with the message 'Session timeout'
          send FluxMessages.SESSION_CREATED, session.attributes
          send FluxMessages.CONFIG_LOADING
          configService.loadConfig session
          .then (config) =>
            send FluxMessages.CONFIG_LOADED, config
          .catch (error) =>
            send FluxMessages.CONFIG_ERROR, config
        .catch (error) =>
          send FluxMessages.SESSION_ERROR, error
