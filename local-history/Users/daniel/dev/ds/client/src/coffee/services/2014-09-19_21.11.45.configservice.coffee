class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    # Has the config already been loaded?
    config = session.get 'views'

    # TODO: force load local?
    if config.length is 0
      
