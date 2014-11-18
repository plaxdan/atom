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
  session = (require './sessionintents') configService,
                                         sessionService,
                                         settingsService,
                                         legacyFactory

  system = (require './systemintents') serverService,
                                       sessionService,
                                       settingsService

  {
    session
    system
  }
