Server = require '../models/server'

class ServerService

  constructor: (@_factory) ->

  loadServer: ->
    console.log 'Services.server.loadServer' if TRACE
    server = new Server
    @_factory.register 'server', server
    new Promise (resolve, reject) ->
      if server.get 'instanceName'
        resolve server
      else
        server.fetch
          bypassCache: true
          timeout: 10000
          success: =>
            # TODO: try/catch or if/else?
            try
              server.storeLocal()
              resolve server
            catch err
              reject err

          error: (model, error) =>
            # try to load persisted information if possible - if the browser is
            # offline the status code is zero, so we should try to load local
            # state
            if server.loadLocal()
              resolve server
            else
              reject new Error 'Server unreachable, and unable to load server \
                from local storage'

module.exports = ServerService
