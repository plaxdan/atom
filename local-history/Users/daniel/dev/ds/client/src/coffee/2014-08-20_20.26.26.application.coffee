# DataSplice Application

# This class is responsible for bootstrapping the application views and
# DataSpliceController, as well as acting a view router with window history
# and pushstate.
#
# The run method of this class intializes the application controller, which
# sets up the global pubSub and factory that are shared across the system.

Backbone = require 'backbone'
DataSpliceController = require './controller'
ConnectionManager = require './connectionmanager'
ExpressionEvaluator = require './expressions/expressionevaluator'
UrlHelper = require './utils/urlhelper'

ModalManager = require './ui/feedback/modalmanager'
ModalDialog = require './ui/feedback/modaldialog'
BootstrapIcon = require './ui/widgets/bootstrapicon'
UI = require './ui/ui'
Content = require './ui/content'

ApplicationSettingsView = require './views/settings/applicationsettings'
AppAboutView = require './views/settings/appaboutview'
HomeView = require './views/home'
CompositeDataView = require './views/data/compositedataview'

Session = require './models/session'

class ViewFactory
  constructor: (@pubSub) ->
    @factory = @

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

class DataSpliceApplication extends Backbone.Router

  _routed: false

  routes:
    'ui/home': 'doHome'
    'ui/settings/': 'doSettings'
    'ui/settings/*action': 'doSettings'
    'ui/view/*action': 'doDisplayView'

  constructor: ->

    # set up shared collections to expose API to plug-ins, etc
    @shared = { $, React, _, moment, async }
    @utils = { UrlHelper, ExpressionEvaluator }
    @ui = { ModalDialog, BootstrapIcon }

    @pubSub = _.extend {}, Backbone.Events
    @viewFactory = new ViewFactory @pubSub
    @viewFactory.register 'dsApp', @

    @appController = new DataSpliceController @pubSub, @viewFactory
    @connectionManager = new ConnectionManager @viewFactory

    # by design changes to the application cache are not available until
    # the page is refreshed after the cache has been updated. detect that
    # and automatically refresh the page if that is the case
    # (http://appcachefacts.info/)
    ac = window.applicationCache
    if ac
      ac.addEventListener 'updateready', -> location.reload()

    # not a big fan of this, but there is still some old code that needs a
    # global reference to the app, for instance running scripts from the
    # login banner
    window.dsApp = @

    console.info "Created DataSpliceApplication"
    super

  initialize: (options) ->
    super options
    @pubSub.on 'replaceView', _.bind @doReplaceView, @
    @pubSub.on 'displayNotification', @displayNotification
    @pubSub.on 'sessionLoaded', @sessionLoaded
    @pubSub.on 'serverLoaded', @serverLoaded
    @pubSub.on 'serverError', @serverError
    @pubSub.on 'sessionError', @sessionError
    @pubSub.on 'navigate', @routeNavigation
    @pubSub.on 'displayHome', => @navigate 'ui/home', trigger: true
    @pubSub.on 'displayNavigationAction', (action) => @displayNavigationAction action
    @pubSub.on 'showWait', @showWait
    @pubSub.on 'hideWait', @hideWait

    @initializeTextSizeSettings()
    console.info "Initialized DataSpliceApplication"

  getMeta: (name) ->
    (document.querySelector "meta[name=#{name}]")?.content

  showWait: ->
    console.info 'Application: showWait'

  hideWait: ->
    console.info 'Application: hideWait'

  getLocale: ->
    (@appController.session.get 'attributes')?['DS_LOCALE'] or
      (@appController.server.get 'acceptLanguage') or
      'en'

  routeNavigation: (clicked) ->
    href = unless _.isString(clicked) then $(clicked.target).attr('href') else clicked
    Backbone.history.navigate href,
      trigger: true # Trigger true here makes sure to fire the history event

  doReplaceView: (nextView) ->
    console.info 'Application: replaceView'
    @_currentFragment = Backbone.history.fragment
    @_routed = true
    @reactUI.setProps
      component: Content =
        contentView: nextView

  doHome: ->
    $.when(@validate()).done =>
      @reactUI.setProps component: Content contentView: @viewFactory.create HomeView

  doSettings: (action) ->
    $.when(@validate()).done =>
      try
        path = if action then (decodeURIComponent action).split '/' else []
        @reactUI.setProps
          component: Content
            contentView: @viewFactory.create ApplicationSettingsView,
          { path }
      catch error
        @pubSub.trigger 'displayNotification',
          message: error.message
          severity: 'error'
        throw error

  doDisplayView: (path, query) ->
    $.when(@validate()).done =>

      [ m, viewId, params ] = (decodeURIComponent path).match /([^?]*)\??(.*)?/
      vc = @appController.session.get 'views'
      view = vc.get viewId
      unless view
        @pubSub.trigger 'displayNotification',
          message: "Invalid view: #{viewId}"
          severity: 'error'

      args = if query or params
        UrlHelper.parseParameters query or params
      else
        {}
      navAction = (view.getNavigationAction args.action) or
        (view.get 'navigationActions')?.HomeScreenActions?[0]?.action
      unless navAction
        @pubSub.trigger 'displayNotification',
          message: "Cannot directly display view: #{viewId}"
          severity: 'error'

      state = @appController.dataController.createDisplayState
        name: navAction.name
        action: navAction
        view: view

      @reactUI.setProps contentView: @viewFactory.create CompositeDataView,
        { state }

  displayNotification: (notification) =>
    @reactUI.setProps {notification}

  displayNavigationAction: (action) ->
    $.when(@validate()).done =>
      switch action.type
        when 'DisplayQuery'
          # update the browser location
          @navigate UrlHelper.formatUriFragment 'ui/view/' + action.query.target,
            action: action.name

          state = @appController.dataController.createDisplayState
            name: action.name
            viewIdentifier: action.query.target
            action: action
          view = @viewFactory.create CompositeDataView, { state }
          @pubSub.trigger 'replaceView', view

  # validates the current display state prior to navigating somewhere else
  # in the app
  validate: ->
    controller = @reactUI?.props.contentView?.controller
    controller?.validate()

  aboutHandler: =>
    @pubSub.trigger 'displayModal', ModalDialog
      title: 'About DataSplice'
      legacyView: @viewFactory.create AppAboutView

  # This function is passed down to the Login component
  loginHandler: (userName, password, domain) =>
    session = new Session {userName, password, domain}
    @viewFactory.pubSub.trigger 'logIn', session

  displayNotificationDetailsHandler: (details) ->
    # TODO: though the pubSub event refers only to errors this functionality
    #   could in the future apply to viewing further details of notifications
    #   of any severity level.
    @viewFactory.pubSub.trigger 'displayError', details if details

  # Run method bootstraps the application.
  # Here we should initialize any base views (like menus, etc)
  # Then kick off the pushstate handler to route the view
  run: ->
    React.initializeTouchEvents true

    ui = UI
      factory: @viewFactory
      authDomains: @viewFactory.server.get 'authDomains'
      defaultAuthDomain: @viewFactory.server.get 'defaultAuthDomain'
      instanceName: @viewFactory.server.get 'instanceName'
      loginBanner: @viewFactory.server.get 'loginBanner'
      loginHandler: _.bind @loginHandler, @
      aboutHandler: _.bind @aboutHandler, @
      displayNotificationDetailsHandler:
        _.bind @displayNotificationDetailsHandler, @

    mountPoint = document.querySelector '#dsApp'
    @reactUI = React.renderComponent ui, mountPoint

    @appController.startSession()

  sessionLoaded: =>
    console.info 'Application: sessionLoaded'
    @reactUI.setProps
      sessionLoaded: true
      sessionError: false
      notification: undefined

    # this is pretty hacky, but it gets around the fact that the connection
    # manager also uses sessionLoaded to update the connection status. this
    # gets called first, so if we start routing now the views are loaded
    # without knowing if we're connected or not
    _.defer =>
      Backbone.history.start(pushState: false) unless Backbone.History.started

      # navigate to the home screen if we didn't hit a valid route or we're on
      # the session screen. only route /ui requests, leave everything else alone
      fragment = Backbone.history.getFragment()
      if not fragment or fragment.match /^\/?ui\//
        if not @_routed or fragment is 'ui/session'
          # see if we just need a trailing slash
          if @routes[ fragment + '/' ]
            path = fragment + '/'
          else
            path = 'ui/home'
          @navigate path, trigger: true

  sessionError: =>
    console.info 'Application: sessionError'
    @reactUI.setProps sessionLoaded: false, sessionError: true
    @loadError()

  serverLoaded: =>
    console.info 'Application: serverLoaded'
    @buildVersion = @getMeta 'buildVersion'
    @buildTimestamp = @getMeta 'buildTimestamp'
    @reactUI.setProps
      serverLoaded: true
      serverError: false
      authDomains: @viewFactory.server.get 'authDomains'
      defaultAuthDomain: @viewFactory.server.get 'defaultAuthDomain'
      instanceName: @viewFactory.server.get 'instanceName'
      loginBanner: @viewFactory.server.get 'loginBanner'
      buildVersion: @buildVersion
      buildTimestamp: @buildTimestamp

  serverError: =>
    console.info 'Application: serverError'
    @reactUI.setProps serverLoaded: false, serverError: true
    @loadError()

  loadError: =>
    unless Backbone.History.started
      # silently start the history, as to not trigger a module load of
      # whatever view started out the page load to have the session error out

      if -1 == window.location.href.indexOf 'ui/session'
        Backbone.history.start pushState: false, silent: true
      else
        Backbone.history.start pushState: false

    @navigate 'ui/session', trigger: true

  initializeTextSizeSettings: ->

    body = (document.getElementsByTagName 'body')[0]
    bodyClasses = body.className
    for size in [ 'small', 'normal', 'large', 'xlarge' ]
      bodyClasses = bodyClasses.replace "base-size-#{size}", ''

    size = @viewFactory.settings.get 'textSize'
    bodyClasses = "#{bodyClasses} base-size-#{size}" if size
    body.className = bodyClasses

    unless @viewFactory.settings.get 'textSize'
      context = @viewFactory.eventFactory.context()
      $.when(ExpressionEvaluator.evaluateAttribute 'DS_TEXT_SIZE', null, { context })
        .done (size) =>
          @viewFactory.settings.set 'textSize', size

module.exports = DataSpliceApplication