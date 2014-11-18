module.exports = (factory) ->

  # TODO: iterate over these automatically

  ConfigService = require './configservice'
  ConnectionService = require './connectionservice'
  ServerService = require './serverservice'
  SessionService = require './sessionservice'
  HardwareService = require './hardwareservice'
  DataSpliceWebService = require './datasplicewebservice'

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
