# Plugin Registry
#
# Loads available plug-ins and provides features for exposing plug-ins in the
# application
UrlHelper = require '../utils/urlhelper'

class PluginRegistry

  constructor: (@factory, @dataSpliceWebService) ->
    # register this controller in the factory
    @factory.register 'pluginRegistry', @

    @factory.pubSub.on 'serverLoaded', => @loadPlugins()

  loadPlugins: ->
    @_registry = {}

    @dataSpliceWebService.getPlugins()
      .then (manifest) =>
        manifest = JSON.parse manifest if _.isString manifest
        @loadPlugin plugin for plugin in manifest
      .catch: (error) ->
        console.error error
    # $.ajax (UrlHelper.prefix 'ds/plugin/manifest.json'),
    #   success: (manifest) =>
    #     manifest = JSON.parse manifest if _.isString manifest
    #     @loadPlugin plugin for plugin in manifest
    #
    #   error: (resp) ->
    #     console.error resp

  # See: https://github.com/webpack/webpack/issues/118#issuecomment-40690489
  loadPlugin: (manifest) ->
    console.info "Loading plugin: #{manifest.name}"
    @_registry[manifest.name] = { manifest }

    # load the script entry point
    exportName = (manifest.name).replace /-/g, '_'
    entry = UrlHelper.prefix "/plugins/#{manifest.name}/#{manifest.main}"
    window[exportName] = (exports) =>
      @_registry[manifest.name] = _.extend manifest,
        plugin: exports @factory.dsApp
      delete window[exportName]
      head.removeChild script
      console.info "Loaded plugin #{manifest.name}@#{manifest.version} - #{manifest.description}"

    head = document.querySelector 'head'
    script = document.createElement 'script'
    script.type = 'text/javascript'
    script.charset = 'utf-8'
    script.src = entry
    head.appendChild script

  findDisplayModePlugin: (mode) ->
    item = _.find @_registry, (test) ->
      (test.plugin?.displayModes?.indexOf mode) >= 0
    item?.plugin

module.exports = PluginRegistry
