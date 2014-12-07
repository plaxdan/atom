# Plugin Registry
#
# Loads available plug-ins and provides features for exposing plug-ins in the
# application
UrlHelper = require '../utils/urlhelper'

class PluginService

  constructor: (@webService, @legacyFactory) ->
    # register this controller in the factory
    @legacyFactory.register 'pluginService', @

  loadPlugins: ->
    # newPromise = new Promise (resolve, reject) =>
    #   manifestUrl = 'ds/plugin/manifest.json'
    #   loadOpts =
    #     url: manifestUrl
    #     live: true
    #     execute: false
    #
    #   basket.require loadOpts
    #     .then ->
    #       basket.get manifestUrl
    #     .then (req) ->
    #       resolve JSON.parse req.data
    #     .catch reject
    #
    # Promise.resolve newPromise
    #   .then (pluginManifest) =>
    #     console.warn "plugin manifest", pluginManifest
    #     @_loadPlugin plugin for plugin in pluginManifest


    # new Promise (resolve, reject) =>
    #   @_registry = {}
    #   @webService.getPlugins()
    #     .then (result) =>
    #       manifest = result.payload
    #       @_loadPlugin plugin for plugin in manifest
    #       resolve()
    #     .catch (error) ->
    #       # TODO: display plugin status somewhere?
    #       console.error error
    #       resolve()

  # See: https://github.com/webpack/webpack/issues/118#issuecomment-40690489
  _loadPlugin: (manifest) ->
    console.info "Loading plugin: #{manifest.name}"
    @_registry[manifest.name] = { manifest }

    # load the script entry point
    exportName = (manifest.name).replace /-/g, '_'
    entry = UrlHelper.prefix "/plugins/#{manifest.name}/#{manifest.main}"
    window[exportName] = (exports) =>
      @_registry[manifest.name] = _.extend manifest,
        plugin: exports @legacyFactory.dsApp
      delete window[exportName]
      head.removeChild script
      console.info "Loaded plugin: #{manifest.name}@#{manifest.version} - #{manifest.description or '[no description]'}"

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

module.exports = PluginService
