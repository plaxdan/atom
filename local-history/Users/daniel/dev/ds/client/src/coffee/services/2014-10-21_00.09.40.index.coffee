module.exports = (factory) ->

<<<<<<< HEAD
  ConfigService = require './configservice'
  ConnectionService = require './connectionservice'
  ServerService = require './serverservice'
  SessionService = require './sessionservice'
=======
>>>>>>> dev
  HardwareService = require './hardwareservice'
  DataSpliceWebService = require './datasplicewebservice'

  # Wire up the services
<<<<<<< HEAD
  configService = new ConfigService factory
  connectionService = new ConnectionService factory
  hardwareService = new HardwareService factory
  serverService = new ServerService factory
  webService = new DataSpliceWebService
  sessionService = new SessionService configService, webService, factory

  {
    configService
    connectionService
    hardwareService
    serverService
    sessionService
=======
  hardwareService = new HardwareService factory
  webService = new DataSpliceWebService

  {
    hardwareService
>>>>>>> dev
    webService
  }
