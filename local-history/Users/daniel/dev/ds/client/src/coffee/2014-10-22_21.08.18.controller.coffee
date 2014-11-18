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
Server = require './models/server'
Session = require './models/session'
PersistentApplicationState = require './models/persistentapplicationstate'
UserError = require './models/usererror'
DataController = require './data/datacontroller'
ModificationHandler = require './data/modificationhandler'
BinaryResourceHandler = require './data/binaryresourcehandler'
EventFactory = require './event/eventfactory'
EventRegistry = require './event/eventregistry'
ConfigurationManager = require './expressions/configurationmanager'
ExpressionEvaluator = require './expressions/expressionevaluator'
PluginRegistry = require './plugins/pluginregistry'
InputControlFactory = require './views/common/inputcontrolfactory'
UrlHelper = require './utils/urlhelper'

class DataSpliceController

  constructor: (@pubSub, @fluxActions, @webService, @factory) ->

    @initializeFactory()

    @pubSub.on 'restartSession', (options) => @restartSession options
    @pubSub.on 'logOut', (options) => @logOut options

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

  # releases the current session with the server and any associated local
  # caches/data
  logOut: (options) ->
    prompt = unless options?.force
      # prompt the user unless a force option is specified
      promise = new $.Deferred
      @pubSub.trigger 'displayModal',
        title: 'Confirm Log Out'
        body: 'Are you sure you want to log out?'
        buttons: [
          { label: 'Yes', class: 'btn-primary', role: 'accept' }
          { label: 'No', role: 'cancel' }
        ]
        promise: promise

      promise
    else
      true

    $.when(prompt).done =>
      @fluxActions.session.logout options

module.exports = DataSpliceController
