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
          async.each plugins, @_loadPlugin, resolve
          @_loadPlugin plugin for plugin in plugins
          resolve()
        .catch (error) ->
          # TODO: display plugin status somewhere?
          console.error error
          resolve()

  # See: https://github.com/webpack/webpack/issues/118#issuecomment-40690489
  _loadPlugin: (manifest, done) ->
    console.log "Services.pluginService: Loading plugin #{manifest.name}" if TRACE
    @_registry[manifest.name] = { manifest }

    @_handleJSONPCallback manifest

    # load the plugin entry point
    main = UrlHelper.prefix "/plugins/#{manifest.name}/#{manifest.main}"
    basket.require url: main, live: true, execute: true

  _handleJSONPCallback: (manifest) ->
    # Since the plugins are wrapped as JSONP immediate functions we add them to
    # the window object for immediate execution
    sharedPluginName = (manifest.name).replace /-/g, '_'
    window[sharedPluginName] = (exports) =>
      @_registry[manifest.name] = _.extend manifest,
        plugin: exports @legacyFactory.dsApp
      delete window[sharedPluginName]
      console.info "Services.pluginService: Loaded plugin \
        #{manifest.name}@#{manifest.version} - \
        #{manifest.description or '[no description]'}"

  findDisplayModePlugin: (mode) ->
    item = _.find @_registry, (test) ->
      (test.plugin?.displayModes?.indexOf mode) >= 0
    item?.plugin

module.exports = PluginService
