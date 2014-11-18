class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    new Promise (resolve, reject) =>
      # TODO: handle rejection of this promise...
      viewCollection = session.get 'views'
      weHaveNoConfig = viewCollection.length is 0
      if weHaveNoConfig
        loadLocal = true # TODO <-- HOW TO SET THIS?
        load = if loadLocal then @_loadLocal else @_loadRemote
        load viewCollection
        .then resolve viewCollection
      else
        resolve viewCollection

  _loadLocal: (viewCollection) ->
    new Promise (resolve, reject) =>
      Promise.resolve viewCollection.storage.getKeys /^ds\/views\/get/
      .then (keys) ->
        createConfigForKey = (key, done) ->
          [m, id] = key.match /ds\/views\/get\/(.*)/
          newConfig = viewCollection.create { id }
          Promise.resolve newConfig.loadLocal()
          .then -> done()

        async.each keys, createConfigForKey, resolve

  _loadRemote: (viewCollection) ->
    new Promise (resolve, reject) ->
      viewCollection.fetch
        success: =>
          async.each viewCollection.models,
            (view, done) ->
              # use the locally cached view if available and the checksum
              # matches
              checksum = view.get 'checksum'
              Promise.resolve view.loadLocal()
              .then (loaded) ->
                if loaded and checksum is view.get 'checksum'
                  done()
                else
                  view.fetch
                    bypassCache: true
                    success: ->
                      # response for individual views does not contain the
                      # checksum
                      view.set { checksum }
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
