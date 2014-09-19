class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    config = session.get 'views'
    weHaveNoConfig = config.length is 0
    @_fetchAllConfig config if weHaveNoConfig

  _fetchAllConfig: (config) ->
    # TODO: force load local?
    @_fetchKeys config
    .then (keys) ->
      async.each

  _fetchKeys: (config) ->
    Promise.resolve config.storage.getKeys /^ds\/views\/get/
