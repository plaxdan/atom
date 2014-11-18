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
  settingsService = new SettingsService legacyFactory
  webService = new DataSpliceWebService
  sessionService = new SessionService configService, webService, legacyFactory

  {
    configService
    connectionService
    hardwareService
    serverService
    sessionService
    settingsService
    webService
  }

module.exports = Services
