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

  # Wire up the intents
  system = (require './systemintents') serverService,
                                       sessionService,
                                       settingsService

  session = (require './sessionintents') configService,
                                         sessionService,
                                         settingsServics

  {
    session
    system
  }
