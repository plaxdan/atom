module.exports = (services) ->

  {
    configService
    connectionService
    hardwareService
    serverService
    sessionService
    settingsService
    webService
  } = services

  system = (require './systemintents') serverService, sessionService

  {
    system
  }
