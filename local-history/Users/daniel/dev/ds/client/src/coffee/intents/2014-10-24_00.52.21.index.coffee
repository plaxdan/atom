HardwareIntents = require './hardwareintents'
SessionIntents = require './sessionintents'
SystemIntents = require './systemintents'

{
  configService
  connectionService
  hardwareService
  serverService
  sessionService
  settingsService
  webService
} = services

Intents = (services, legacyFactory) ->

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
