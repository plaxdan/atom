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
        async.each keys, (url, done) ->
          [m, id] = url.match /ds\/views\/get\/(.*)/
          fetchedConfig = config.create { id }
          # need to call async done with no args
          Promise.resolve fetchedConfig.loadLocal()
          .then done
        , resolve

  _fetchKeys: (config) ->
    Promise.resolve config.storage.getKeys /^ds\/views\/get/
