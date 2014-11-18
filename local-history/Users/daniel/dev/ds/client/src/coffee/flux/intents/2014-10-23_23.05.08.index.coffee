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
  session = (require './sessionintents') configService,
                                         sessionService,
                                         settingsServics

  system = (require './systemintents') serverService,
                                       sessionService,
                                       settingsService

  {
    session
    system
  }
