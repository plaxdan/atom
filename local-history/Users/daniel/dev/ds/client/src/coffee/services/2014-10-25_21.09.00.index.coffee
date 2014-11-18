<<<<<<< HEAD
ConfigService = require './configservice'
ConnectionService = require './connectionservice'
ServerService = require './serverservice'
SessionService = require './sessionservice'
HardwareService = require './hardwareservice'
SettingsService = require './settingsservice'
DataSpliceWebService = require './datasplicewebservice'

Services = (legacyFactory) ->

  # Wire up the services
  configService = new ConfigService legacyFactory
  connectionService = new ConnectionService legacyFactory
  hardwareService = new HardwareService legacyFactory
  serverService = new ServerService legacyFactory
=======
module.exports = (legacyFactory) ->

  HardwareService = require './hardwareservice'
  SettingsService = require './settingsservice'
  DataSpliceWebService = require './datasplicewebservice'

  # Wire up the services
  hardwareService = new HardwareService legacyFactory
>>>>>>> dev
  settingsService = new SettingsService legacyFactory
  webService = new DataSpliceWebService
  sessionService = new SessionService webService, legacyFactory

  {
    configService
    connectionService
    hardwareService
<<<<<<< HEAD
    serverService
    sessionService
=======
>>>>>>> dev
    settingsService
    webService
  }

module.exports = Services
