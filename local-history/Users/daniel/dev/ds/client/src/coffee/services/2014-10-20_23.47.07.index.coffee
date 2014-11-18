module.exports = (factory) ->

<<<<<<< HEAD
=======
  ConfigService = require './configservice'
  ConnectionService = require './connectionservice'
  ServerService = require './serverservice'
  SessionService = require './sessionservice'
>>>>>>> exports services as one layer
  HardwareService = require './hardwareservice'
  DataSpliceWebService = require './datasplicewebservice'

  # Wire up the services
<<<<<<< HEAD
  hardwareService = new HardwareService factory
  webService = new DataSpliceWebService

  {
    hardwareService
=======
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
>>>>>>> exports services as one layer
    webService
  }
