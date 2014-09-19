class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    config = session.get 'views'
    weHaveNoConfig = config.length is 0
    @_fetchConfig session if weHaveNoConfig

  _fetchConfig: (session) ->
    # TODO: force load local?
