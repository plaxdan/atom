module.exports = (services) ->

  system = (require './system') services.serverService, services.sessionService
  
  {
    system
  }
