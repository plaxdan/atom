HardwareIntents = require './hardwareintents'
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

  session: SessionIntents configService,
                          sessionService,
                          settingsService,
                          legacyFactory

  system: SystemIntents serverService,
                        sessionService,
                        settingsService

module.exports = Intents
