module.exports = (factory) ->

  ConfigService = require './configservice'
  ConnectionService = require './connectionservice'
  ServerService = require './serverservice'
  SessionService = require './sessionservice'

  configService = new ConfigService factory
  connectionService = new ConnectionService factory
  serverService = new ServerService factory
  sessionService = new SessionService factory, configService

  {
    serverService
    sessionService
    configService
    connectionService
  }
