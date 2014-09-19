class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    # Has the config already been loaded?
    views = session.get 'views'

    # TODO: force load local?
