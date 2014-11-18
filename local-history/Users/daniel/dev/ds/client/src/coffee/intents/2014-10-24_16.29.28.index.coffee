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
  hardwareIntents = HardwareIntents hardwareService

  sessionIntents = SessionIntents configService,
                          sessionService,
                          settingsService,
                          legacyFactory

  systemIntents = SystemIntents serverService,
                        sessionService,
                        settingsService

  {
    hardware: hardwareIntents
    session: sessionIntents
    system: systemIntents
  }

module.exports = Intents
