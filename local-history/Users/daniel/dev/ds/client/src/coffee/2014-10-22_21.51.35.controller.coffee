# DataSplice Controller
#
# This class is responsible for setting up the main environment that supports
# the DataSplice web client. It is shared between the main web application
# router, along with the unit test framework so the latter performs as much
# like a 'real' client as possible.
#
# The controller should be created with a global pubSub and factory that will
# be shared across the main objects in the environment. initializeFactory()
# resets everything to a consistent state, and startSession() fires up the
# requests to load server and session
Session = require './models/session'
UserError = require './models/usererror'

ExpressionEvaluator = require './expressions/expressionevaluator'
EventRegistry = require './event/eventregistry'

class DataSpliceController

  constructor: (@pubSub, @fluxActions, @webService, @factory) ->

    @initializeFactory()

    @pubSub.on 'restartSession', (options) => @restartSession options

  initializeFactory: ->
    # Initialize settings object for application to use.
    @settings = new PersistentApplicationState

    # Announce over pubSub whenever the offline state is changed
    @factory.register 'settings', @settings

    @dataController = new DataController @factory
    @modificationHandler = new ModificationHandler @factory
    @eventFactory = new EventFactory @fluxActions, @webService, @factory
    @configurationManager = new ConfigurationManager @factory
    @binaryResources = new BinaryResourceHandler @factory
    @pluginRegistry = new PluginRegistry @factory, @webService
    @inputFactory = new InputControlFactory @factory

  restartSession: (options) ->
    @fluxActions.system.initialize()

module.exports = DataSpliceController
