class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    config = session.get 'views'
    weHaveNoConfig = config.length is 0
    @_fetchConfig config if weHaveNoConfig

  _fetchConfig: (config) ->
    # TODO: force load local?
