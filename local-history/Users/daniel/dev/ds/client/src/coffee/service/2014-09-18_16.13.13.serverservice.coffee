Server = require '../models/server'

ServerService = ->

  loadServer = ->
    server = new Server
    new Promise (resolve, reject) ->
      if server.get 'instanceName'
        resolve server.attributes
      else
        loadServer = new $.Deferred
        server.fetch
          bypassCache: true
          timeout: 10000
          success: =>
            server.storeLocal()
            @pubSub.trigger 'serverLoaded'
            resolve server.attributes

          error: (model, error) =>
            # try to load persisted information if possible - if the browser is
            # offline the status code is zero, so we should try to load local
            # state
            if server.loadLocal()
              @pubSub.trigger 'serverLoaded'
              resolve server.attributes
            else
              reject error

module.exports = ServerService
