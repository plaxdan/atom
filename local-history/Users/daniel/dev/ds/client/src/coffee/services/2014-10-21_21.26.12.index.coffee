module.exports = (factory) ->

  ConfigService = require './configservice'
  ConnectionService = require './connectionservice'
  ServerService = require './serverservice'
  SessionService = require './sessionservice'
  HardwareService = require './hardwareservice'
  SettingsService = require './settingsservice'
  DataSpliceWebService = require './datasplicewebservice'

  # Wire up the services
  configService = new ConfigService factory
  connectionService = new ConnectionService factory
  hardwareService = new HardwareService factory
<<<<<<< HEAD
  serverService = new ServerService factory
=======
  settingsService = new SettingsService factory
>>>>>>> dev
  webService = new DataSpliceWebService
  sessionService = new SessionService configService, webService, factory

  {
    configService
    connectionService
    hardwareService
<<<<<<< HEAD
    serverService
    sessionService
=======
    settingsService
>>>>>>> dev
    webService
  }
