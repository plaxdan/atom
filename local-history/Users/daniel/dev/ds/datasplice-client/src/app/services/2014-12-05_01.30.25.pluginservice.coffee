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
      @webService.getPlugins()
        .then (plugins) =>
          loadedAllPlugins = -> resolve()
          async.each plugins, @_loadPlugin, loadedAllPlugins
          # @_loadPlugin plugin for plugin in plugins
          # resolve()
        .catch (error) ->
          # TODO: display plugin status somewhere?
          console.error error
          resolve()

  # See: https://github.com/webpack/webpack/issues/118#issuecomment-40690489
  _loadPlugin: (plugin, done) ->
    console.log "Services.pluginService: Loading plugin #{plugin.name}" if TRACE
    @_registry[plugin.name] = { plugin }

    @_handleJSONPCallback plugin

    # load the plugin entry point
    main = UrlHelper.prefix "/plugins/#{plugin.name}/#{plugin.main}"
    basket.require url: main, live: true, execute: true
      .then done

  _handleJSONPCallback: (plugin) ->
    # Since the plugins are wrapped as JSONP immediate functions we add them to
    # the window object for immediate execution
    sharedPluginName = (plugin.name).replace /-/g, '_'
    window[sharedPluginName] = (exports) =>
      @_registry[plugin.name] = _.extend plugin,
        plugin: exports @legacyFactory.dsApp
      delete window[sharedPluginName]
      console.info "Services.pluginService: Loaded plugin \
        #{plugin.name}@#{plugin.version} - \
        #{plugin.description or '[no description]'}"

  findDisplayModePlugin: (mode) ->
    item = _.find @_registry, (test) ->
      (test.plugin?.displayModes?.indexOf mode) >= 0
    item?.plugin

module.exports = PluginService
