module.exports = (services, legacyFactory) ->

  {
    configService
    connectionService
    hardwareService
    serverService
    sessionService
    settingsService
    webService
  } = services

  # Wire up the intents
  hardware = (require './hardwareintents') hardwareService

  session = (require './sessionintents') configService,
                                         sessionService,
                                         settingsService,
                                         legacyFactory

  system = (require './systemintents') serverService,
                                       sessionService,
                                       settingsService

  {
    hardware
    session
    system
  }
