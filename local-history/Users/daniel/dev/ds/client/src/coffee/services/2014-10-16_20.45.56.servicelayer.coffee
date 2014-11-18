module.exports = (factory) ->
  
  ServerService = require '../services/serverservice'
  SessionService = require '../services/sessionservice'
  ConfigService = require '../services/configservice'
  ConnectionService = require '../services/connectionservice'

  serverService = new ServerService
  sessionService = new SessionService
  configService = new ConfigService
  connectionService = new ConnectionService
