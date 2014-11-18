module.exports = (constants, services) ->

  {
    configService
    connectionService
    hardwareService
    serverService
    sessionService
    settingsService
    webService
  } = services

  system = (require './system') serverService, sessionService

  {
    system
  }
