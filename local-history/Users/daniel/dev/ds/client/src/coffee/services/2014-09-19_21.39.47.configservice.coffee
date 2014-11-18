class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    config = session.get 'views'
    weHaveNoConfig = config.length is 0
    @_fetchConfig config if weHaveNoConfig

  _fetchConfig: (config) ->
    new Promise (resolve, reject) =>
      # TODO: force load local?
      @_fetchKeys config
      .then (keys) ->
        createConfig = (key, done) ->
          [m, id] = key.match /ds\/views\/get\/(.*)/
          fetchedConfig = config.create { id }
          # need to call async done with no args
          Promise.resolve fetchedConfig.loadLocal()
          .then done
        
        async.each keys, createConfig, done

  _fetchKeys: (config) ->
    Promise.resolve config.storage.getKeys /^ds\/views\/get/
