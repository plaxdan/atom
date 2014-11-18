module.exports =

  # download application manifest and resolve the files that need to be loaded
  fetchAppFiles: (options) ->
    new Promise (resolve, reject) ->
      manifest = options?.manifest or './app-manifest.json'
      basket.require url: manifest, live: true, execute: false
        .then ->
          basket.get manifest
        .then (req) ->
          resolve JSON.parse req.data
        .catch reject

  # load the application dynamically
  loadApp: (options) ->
    new Promise (resolve, reject) =>
      @fetchAppFiles options
        .then (files) ->
          async.eachSeries files,
            (file, done) ->
              console.info "Loading application file: #{file}"
              options?.progress? "Loading #{file}"

              # delay option allows us to actually see things happening
              _.delay ->
                basket.require url: file, live: true
                  .then ( -> done() ), done
              , options?.delay or 0
          , (error) ->
            if error
              reject error
            else
              resolve()
