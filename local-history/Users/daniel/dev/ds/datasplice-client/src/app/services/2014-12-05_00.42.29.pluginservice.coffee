# Plugin Registry
#
# Loads available plug-ins and provides features for exposing plug-ins in the
# application
UrlHelper = require '../utils/urlhelper'

class PluginService

  constructor: (@webService, @legacyFactory) ->
    # register this controller in the factory
    @legacyFactory.register 'pluginService', @
    @_registry = {}

  loadPlugins: ->
    new Promise (resolve, reject) =>
      @_registry = {}
      @webService.getPlugins()
        .then (plugins) =>
          @_loadPlugin plugin for plugin in plugins
          resolve()
        .catch (error) ->
          # TODO: display plugin status somewhere?
          console.error error
          resolve()

  # See: https://github.com/webpack/webpack/issues/118#issuecomment-40690489
  _loadPlugin: (manifest) ->
    console.log "Services.pluginService: Loading plugin #{manifest.name}" if TRACE
    @_registry[manifest.name] = { manifest }

    # load the plugin entry point
    main = UrlHelper.prefix "/plugins/#{manifest.name}/#{manifest.main}"
    pluginName = (manifest.name).replace /-/g, '_'
    _handleJSONPCallback pluginName

    basket.require url: main, live: true, execute: true

  _handleJSONPCallback: (sharedPluginName) ->
    # Since the plugins are wrapped as JSONP immediate functions we add them to
    #
    window[exportName] = (exports) =>
      @_registry[manifest.name] = _.extend manifest,
        plugin: exports @legacyFactory.dsApp
      delete window[exportName]
      head.removeChild script
      console.info "Services.pluginService: Loaded plugin \
        #{manifest.name}@#{manifest.version} - \
        #{manifest.description or '[no description]'}"


  findDisplayModePlugin: (mode) ->
    item = _.find @_registry, (test) ->
      (test.plugin?.displayModes?.indexOf mode) >= 0
    item?.plugin

module.exports = PluginService
