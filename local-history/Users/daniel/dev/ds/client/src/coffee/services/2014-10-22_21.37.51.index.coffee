module.exports = (legacyFactory) ->

  ConfigService = require './configservice'
  ConnectionService = require './connectionservice'
  ServerService = require './serverservice'
  SessionService = require './sessionservice'
  HardwareService = require './hardwareservice'
  SettingsService = require './settingsservice'
  DataSpliceWebService = require './datasplicewebservice'

  # Wire up the services
<<<<<<< HEAD
  configService = new ConfigService factory
  connectionService = new ConnectionService factory
  hardwareService = new HardwareService factory
  serverService = new ServerService factory
=======
  hardwareService = new HardwareService legacyFactory
  settingsService = new SettingsService legacyFactory
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
