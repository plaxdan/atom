class ConfigService

  constructor: (@_factory) ->

  loadLocal: (config) ->
    console.log 'Services.config.loadLocal' if TRACE
    new Promise (resolve, reject) =>
      Promise.resolve config.storage.initialized
        .then ->
          Promise.resolve config.storage.getKeys /^ds\/views\/get/
            .then (keys) ->
              createConfigForKey = (key, done) ->
                [m, id] = key.match /ds\/views\/get\/(.*)/
                newConfig = config.create { id }
                Promise.resolve newConfig.loadLocal()
                  .then -> done()
              doneAllKeys = -> resolve config
              async.each keys, createConfigForKey, doneAllKeys

  loadRemote: (config) ->
    console.log 'Services.config.loadRemote' if TRACE
    new Promise (resolve, reject) ->
      config.fetch
        success: =>
          async.each config.models,
            (view, done) ->
              # use the locally cached view if available and the checksum
              # matches
              remoteChecksum = view.get 'checksum'
              Promise.resolve view.loadLocal()
                .then (loaded) ->
                  localChecksum = view.get 'checksum'
                  if loaded and remoteChecksum is localChecksum
                    done()
                  else
                    # response for individual views does not contain the
                    # checksum, so set that after fetch and explicitly store
                    view.fetch
                      bypassCache: true
                      # inhibitStore: true
                      success: ->
                        view.set checksum: remoteChecksum
                        Promise.resolve view.storeLocal()
                          .then -> done()
                      error: (model) =>
                        console.error "Error resolving view #{model.id}"
                        done()
            # async complete
            , ->
              resolve()
        error: ->
          console.error 'Error fetching views'
          # TODO: shouldn't this reject instead of resolving?
          resolve()

module.exports = ConfigService
