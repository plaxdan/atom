Server = require '../models/server'

ServerService =

  loadServer: ->
    server = new Server
    new Promise (resolve, reject) ->
      if server.get 'instanceName'
        resolve server
      else
        server.fetch
          bypassCache: true
          timeout: 10000
          success: =>
            server.storeLocal()
            # TODO: do this in the action
            # @pubSub.trigger 'serverLoaded'
            resolve server

          error: (model, error) =>
            # try to load persisted information if possible - if the browser is
            # offline the status code is zero, so we should try to load local
            # state
            if server.loadLocal()
              # TODO: do this in the action
              # @pubSub.trigger 'serverLoaded'
              resolve server
            else
              reject error

module.exports = ServerService
