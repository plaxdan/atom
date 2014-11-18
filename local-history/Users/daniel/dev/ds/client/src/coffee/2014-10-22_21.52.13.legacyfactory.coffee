# vestigial factory that is needed for pre-flux services, views, etc
Backbone = require 'backbone'

Server = require './models/server'
Session = require './models/session'

DataSpliceController = require './controller'
ConnectionManager = require './connectionmanager'
DataController = require './data/datacontroller'
ModificationHandler = require './data/modificationhandler'
EventFactory = require './event/eventfactory'
ConfigurationManager = require './expressions/configurationmanager'
BinaryResourceHandler = require './data/binaryresourcehandler'
PluginRegistry = require './plugins/pluginregistry'
InputControlFactory = require './views/common/inputcontrolfactory'

class LegacyFactory
  constructor: (@services) ->
    @pubSub = _.extend {}, Backbone.Events
    if DEBUG
      @pubSub.on 'all', (eventName) ->
        console.debug 'pubSub', arguments
    @factory = @

    @server = new Server
    @session = new Session

    # create and register services
    { webService } = @services
    @appController = new DataSpliceController @, webService
    @connectionManager = new ConnectionManager @, webService
    @dataController = new DataController @
    @modificationHandler = new ModificationHandler @
    @eventFactory = new EventFactory @, webService
    @configurationManager = new ConfigurationManager @
    @binaryResources = new BinaryResourceHandler @
    @pluginRegistry = new PluginRegistry @, webService
    @inputFactory = new InputControlFactory @

  # Register a new property with the factory.
  # any key entered will be bound to any new class generated
  # by the factory forthwith
  register: (key, value) ->
    @[key] = value

  # Instanciates a new instance of the ViewClass that is passed
  # in.
  # Accepts an additional options parameter so you can pass any
  # additional init args that the view needs.
  create: (ViewClass, options) ->
    options or= {}
    passedOptions = _.extend options, @

    klass = ViewClass
    klass.prototype.pubSub = @pubSub
    new klass(passedOptions)

  # Instantiates a new instance of a collection object, passing along the
  # models and registry
  createCollection: (CollectionClass, models, options) ->
    options or= {}
    passedOptions = _.extend options, @

    klass = CollectionClass
    klass.prototype.pubSub = @pubSub
    new klass(models, passedOptions)

module.exports = LegacyFactory
