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
  configService = new ConfigService legacyFactory
  connectionService = new ConnectionService legacyFactory
  hardwareService = new HardwareService legacyFactory
  serverService = new ServerService legacyFactory
  settingsService = new SettingsService legacyFactory
  webService = new DataSpliceWebService
  sessionService = new SessionService configService, webService, legacyFactory
=======
>>>>>>> dev

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
