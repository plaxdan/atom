class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    config = session.get 'views'
    weHaveNoConfig = config.length is 0
    @_fetchAllConfig config if weHaveNoConfig

  _fetchAllConfig: (config) ->
    # TODO: force load local?
    new Promise (resolve, reject) =>
      @_fetchKeys config
      .then (keys) ->
        async.each keys, _fetchConfig, resolve

  _fetchConfig: (url, done) ->


  _fetchKeys: (config) ->
    Promise.resolve config.storage.getKeys /^ds\/views\/get/
