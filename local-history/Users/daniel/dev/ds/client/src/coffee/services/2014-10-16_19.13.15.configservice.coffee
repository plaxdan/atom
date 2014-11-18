class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    # TODO: handle rejection of this promise...
    config = session.get 'views'
    weHaveNoConfig = config.length is 0
    if weHaveNoConfig
      loadLocal = false # TODO <-- HOW TO SET THIS?
      load = if loadLocal then @_loadLocal else @_loadRemote
      load config
    else
      Promise.resolve config

  _loadLocal: (config) ->
    new Promise (resolve, reject) =>
      Promise.resolve config.storage.getKeys /^ds\/views\/get/
      .then (keys) ->
        createConfigForKey = (key, done) ->
          [m, id] = key.match /ds\/views\/get\/(.*)/
          newConfig = config.create { id }
          Promise.resolve newConfig.loadLocal()
          .then -> done()
        doneAllKeys = -> resolve config
        async.each keys, createConfigForKey, doneAllKeys

  _loadRemote: (config) ->
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
                    view.fetch
                      bypassCache: true
                      success: ->
                        # response for individual views does not contain the
                        # checksum
                        view.set { remoteChecksum }
                        view.storeLocal()
                        done()
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
