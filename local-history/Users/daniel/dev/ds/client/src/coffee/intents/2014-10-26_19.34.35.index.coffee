HardwareIntents = require './hardwareintents'
NavigateIntents = require './navigateintents'
SessionIntents = require './sessionintents'
SystemIntents = require './systemintents'

Intents = (services, legacyFactory) ->

  {
    configService
    hardwareService
    serverService
    sessionService
    settingsService
  } = services

  # Wire up the intents
  hardware: HardwareIntents hardwareService

  navigate: NavigateIntents legacyFactory

  session: SessionIntents configService,
                          sessionService,
                          settingsService,
                          webService,
                          legacyFactory

  system: SystemIntents serverService,
                        settingsService


module.exports = Intents
