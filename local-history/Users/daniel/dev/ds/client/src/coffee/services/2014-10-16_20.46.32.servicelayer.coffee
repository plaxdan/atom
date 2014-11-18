module.exports = (factory) ->

  ConfigService = require '../services/configservice'
  ConnectionService = require '../services/connectionservice'
  ServerService = require '../services/serverservice'
  SessionService = require '../services/sessionservice'

  configService = new ConfigService factory
  connectionService = new ConnectionService factory
  serverService = new ServerService factory
  sessionService = new SessionService factory, configService
