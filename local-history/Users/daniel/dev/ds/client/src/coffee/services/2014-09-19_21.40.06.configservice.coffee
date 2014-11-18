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
        createConfigForKey = (key, done) ->
          [m, id] = key.match /ds\/views\/get\/(.*)/
          newConfig = config.create { id }
          Promise.resolve newConfig.loadLocal()
          .then done

        async.each keys, createConfigForKey, done

  _fetchKeys: (config) ->
    Promise.resolve config.storage.getKeys /^ds\/views\/get/
