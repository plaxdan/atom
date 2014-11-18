# DataSplice Application

# This class is responsible for bootstrapping the application views and
# DataSpliceController, as well as acting a view router with window history
# and pushstate.
#
# The run method of this class intializes the application controller, which
# sets up the global pubSub and factory that are shared across the system.

Backbone = require 'backbone'
LegacyFactory = require './legacyfactory'
ExpressionEvaluator = require './expressions/expressionevaluator'
BaseModel = require './models/basemodel'
FilterItem = require './models/filteritem'
UrlHelper = require './utils/urlhelper'

ModalDialog = require './ui/feedback/modaldialog'
BootstrapIcon = require './ui/widgets/bootstrapicon'
UI = require './ui/ui'

AppAboutView = require './views/settings/appaboutview'

Fluxxor = require 'fluxxor'
{FluxMessages, FluxStores} = require './constants'

Services = require './services'
Intents = require './intents'
Stores = require './stores'

class DataSpliceApplication

  # TODO: replace this with route state
  routes:
    'ui/home': 'doHome'
    'ui/settings/': 'doSettings'
    'ui/settings/*action': 'doSettings'
    'ui/view/*action': 'doDisplayView'



  constructor: ->

    # set up shared collections to expose API to plug-ins, etc
    @shared = { $, React, _, moment, async }
    @utils = { UrlHelper, ExpressionEvaluator, FilterItem }
    @ui = { ModalDialog, BootstrapIcon }

    @legacyFactory = new LegacyFactory
    services = Services @legacyFactory
    intents = Intents services, @legacyFactory
    stores = Stores @legacyFactory
    @flux = new Fluxxor.Flux stores, intents
    # intents is a better name
    @flux.intents = @flux.actions

    if TRACE
      @flux.on 'dispatch', (type, payload) ->
        console.log "FluxMessages.#{FluxMessages[type]}", payload

    @legacyFactory.register 'flux', @flux
    @legacyFactory.initialize @flux.intents, services

    # TODO - need better mechanism for passing services around (be more
    # explicit) instead of passing the factory
    {
      hardwareService
      sessionService
      settingsService
      webService
    } = services
    # TODO: whoever's using these services should probably be using flux actions
    # instead.
    @legacyFactory.register 'hardwareService', hardwareService
    @legacyFactory.register 'settingsService', settingsService
    @legacyFactory.register 'dsApp', @

    { pubSub } = @legacyFactory
    pubSub.on 'displayNotification', _.bind @displayNotification, @
    pubSub.on 'sessionLoaded', _.bind @sessionLoaded, @
    pubSub.on 'serverLoaded', _.bind @serverLoaded, @
    pubSub.on 'serverError', _.bind @serverError, @
    pubSub.on 'sessionError', _.bind @sessionError, @
    pubSub.on 'currentEventContext', _.bind @getCurrentEventContext, @

    # by design changes to the application cache are not available until
    # the page is refreshed after the cache has been updated. detect that
    # and automatically refresh the page if that is the case.
    # (http://appcachefacts.info/)
    ac = window.applicationCache
    if ac
      ac.addEventListener 'updateready', -> location.reload()

    # not a big fan of this, but there is still some old code that needs a
    # global reference to the app, for instance running scripts from the
    # login banner
    window.dsApp = @

    console.info "Created DataSpliceApplication"

  getMeta: (name) ->
    (document.querySelector "meta[name=#{name}]")?.content

  getLocale: ->
    (@legacyFactory.session.get 'attributes')?['DS_LOCALE'] or
      (@legacyFactory.server.get 'acceptLanguage') or
      'en'

  displayNotification: (notification) =>
    # allow POJOS or models to be specified
    unless notification instanceof Backbone.Model
      notification = new BaseModel notification
    @reactUI.setProps { notification }

    # automatically hide info notifications after a few seconds
    _.delay =>
      if @reactUI.props.notification?.cid is notification.cid
        @reactUI.setProps notification: null
    , 3000

  getCurrentEventContext: (callback) ->
    controller = @reactUI?.props.displayStateController
    callback if controller?
      controller.eventContext()
    else
      @legacyFactory.eventFactory.context()

  doDisplayView: (path, query) ->
    [ m, viewId, params ] = (decodeURIComponent path).match /([^?]*)\??(.*)?/
    vc = @legacyFactory.session.get 'views'
    view = vc.get viewId
    unless view
      @legacyFactory.pubSub.trigger 'displayNotification',
        message: "Invalid view: #{viewId}"
        severity: 'error'

    args = if query or params
      UrlHelper.parseParameters query or params
    else
      {}
    navAction = (view.getNavigationAction args.action) or
      (view.get 'navigationActions')?.HomeScreenActions?[0]?.action
    if navAction
      @displayNavigationAction navAction
    else
      @legacyFactory.pubSub.trigger 'displayNotification',
        message: "Cannot directly display view: #{viewId}"
        severity: 'error'

  displayNavigationAction: (action, controller) ->
    $.when(@validate()).done =>
      # update the browser location
      path = "/ui/view/#{ action.query.target }?action=#{ action.name }"
      Backbone.history.navigate path, trigger: false

      unless controller
        state = @legacyFactory.dataController.createDisplayState
          name: action.name
          viewIdentifier: action.query.target
          action: action
        controller = new DisplayStateController state, @legacyFactory

      @reactUI.setProps
        route: [ 'view' ]
        displayStateController: controller

  # validates the current display state prior to navigating somewhere else
  # in the app
  validate: ->
    { routeProps } = @reactUI.state
    routeProps?.displayStateController?.validate()

  aboutHandler: ->
    @legacyFactory.pubSub.trigger 'displayModal', ModalDialog
      title: 'About DataSplice'
      legacyView: @legacyFactory.create AppAboutView

  displayNotificationDetailsHandler: (details) ->
    # TODO: though the pubSub event refers only to errors this functionality
    #   could in the future apply to viewing further details of notifications
    #   of any severity level.
    @legacyFactory.pubSub.trigger 'displayError', details if details

  # Run method bootstraps the application.
  # Here we should initialize any base views (like menus, etc)
  # Then kick off the pushstate handler to route the view
  run: ->
    React.initializeTouchEvents true

    ui = UI
      route: [ 'loading' ]
      flux: @flux
      buildVersion: (@getMeta 'buildVersion') or ''
      legacyFactory: @legacyFactory
      authDomains: @legacyFactory.server.get 'authDomains'
      defaultAuthDomain: @legacyFactory.server.get 'defaultAuthDomain'
      instanceName: @legacyFactory.server.get 'instanceName'
      loginBanner: @legacyFactory.server.get 'loginBanner'
      aboutHandler: _.bind @aboutHandler, @
      displayNotificationDetailsHandler:
        _.bind @displayNotificationDetailsHandler, @

    mountPoint = document.querySelector '#dsApp'
    unless mountPoint
      # this supports old wrapped environments (CEF, Cordova) that don't have
      # the same markup for us to attach to. just create the div we expect and
      # go from there
      mountPoint = document.createElement 'div'
      mountPoint.id = 'dsApp'
      document.body.appendChild mountPoint
    @reactUI = React.renderComponent ui, mountPoint

    @flux.intents.system.initialize()

  serverLoaded: ->
    @buildVersion = (@getMeta 'buildVersion') or ''
    @buildTimestamp = (@getMeta 'buildTimestamp') or ''
    @reactUI.setProps
      serverLoaded: true
      serverError: false
      authDomains: @legacyFactory.server.get 'authDomains'
      defaultAuthDomain: @legacyFactory.server.get 'defaultAuthDomain'
      instanceName: @legacyFactory.server.get 'instanceName'
      loginBanner: @legacyFactory.server.get 'loginBanner'
      buildVersion: @buildVersion
      buildTimestamp: @buildTimestamp

  serverError: ->
    @reactUI.setProps serverLoaded: false, serverError: true
>>>>>>> origin/dev

module.exports = DataSpliceApplication
