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
<<<<<<< HEAD
  sessionService = new SessionService configService, factory
=======
>>>>>>> logout through flux (sort of)
  webService = new DataSpliceWebService
  sessionService = new SessionService configService, webService, factory

  {
    configService
    connectionService
    hardwareService
    serverService
    sessionService
    webService
  }
