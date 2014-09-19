class ConfigService

  constructor: (@_factory) ->

  loadConfig: (session) ->
    config = session.get 'views'
    weHaveNoConfig = config.length is 0
    @_fetchConfig config if weHaveNoConfig

  _fetchConfig: (config) ->
    # TODO: force load local?
    new Promise (resolve, reject) =>
      @_fetchKeys config
      .then (keys) ->
        async.each keys, (url, done) ->
          [m, id] = url.match /ds\/views\/get\/(.*)/
          view = vc.create { id }
          # need to call async done with no args
          Promise.resolve view.loadLocal()
          .then done
        , resolve

  _fetchKeys: (config) ->
    Promise.resolve config.storage.getKeys /^ds\/views\/get/
