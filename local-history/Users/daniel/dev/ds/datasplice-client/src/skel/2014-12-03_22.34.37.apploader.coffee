module.exports =

  # load the application dynamically
  loadApp: (options) ->
    new Promise (resolve, reject) =>
      @fetchAppManifest options
        .then (manifest) =>
          @resolveServerInfo manifest, options
        .catch reject
        .then (results) ->
          async.eachLimit results.fileList, 2,
            (file, done) ->
              console.info "Loading application file: #{file}"
              options?.progress? "Loading #{file}"

              # delay option allows us to actually see things happening
              _.delay ->
                if options?.baseAddress
                  file = options.baseAddress + file

                execute = /\.(js|css)$/.test file
                console.debug "Execute [#{execute}]: #{file}"
                loadOpts =
                  url: file
                  live: true
                  execute: execute
                  skipCache: not execute
                basket.require loadOpts
                  .then ( -> done() ), done
              , options?.delay or 0
          , (error) ->
            if error
              reject error
            else
              results.complete?()
              resolve()

  # download application manifest and resolve the files that need to be loaded
  fetchAppManifest: (options) ->
    new Promise (resolve, reject) ->
      manifest = options?.manifest or 'app-manifest.json'
      if options?.baseAddress
        manifest = options.baseAddress + manifest
      basket.require url: manifest, live: true, execute: false
        .then ->
          basket.get manifest
        .then (req) ->
          resolve JSON.parse req.data
        .catch reject

  # load basic server information and patch manifest as needed
  resolveServerInfo: (manifest, options) ->
    new Promise (resolve, reject) =>
      url = "#{options.baseAddress or ''}ds/info"
      basket.require url: url, live: true, execute: false
        .then ->
          basket.get url
        .then (req) =>
          info = JSON.parse req.data
          version = info.serverVersion.split '.'
          if version[1] is '0'
            (@loadDs5Shim manifest, info).then resolve, reject
          else
            resolve fileList: manifest
        .catch reject

  # load shim files to support DataSplice 5.0 applications
  loadDs5Shim: (manifest, serverInfo) ->
    new Promise (resolve, reject) =>
      console.info 'Shimming environment for DataSplice 5.0'
      basket.require url: './ds5_shim.js', skipCache: true
        .then =>
          # inject additional dependencies
          manifest.unshift 'css/vendor.min.css'
          manifest.unshift 'js/vendor.min.js'

          window.isWrappedDsApp = true
          resolve
            fileList: manifest
            complete: =>
              # remove skeleton UI when app is loaded since DS5.0 uses a
              # different mount point
              React.unmountComponentAtNode document.querySelector '#dsApp'

              # also inject buildVersion and buildTimestamp elements because
              # the about dialog expects them to exit
              @createHiddenDiv 'buildVersion', serverInfo.serverVersion
              @createHiddenDiv 'buildTimestamp', (new Date).toISOString()
        , reject

  createHiddenDiv: (id, content) ->
    div = document.createElement 'div'
    div.id = id
    div.className = 'hidden'
    div.innerText = content
    document.body.appendChild div
