module.exports = (factory) ->

  ConfigService = require './configservice'
  ConnectionService = require './connectionservice'
  DataSpliceWebService = require './datasplicewebservice'
  HardwareService = require './hardwareservice'
  ServerService = require './serverservice'
  SessionService = require './sessionservice'

  # Wire up the services
  configService = new ConfigService factory
  connectionService = new ConnectionService factory
  hardwareService = new HardwareService factory
  serverService = new ServerService factory
  sessionService = new SessionService factory, configService
  webService = new DataSpliceWebService

  {
    configService
    connectionService
    hardwareService
    serverService
    sessionService
    webService
  }
