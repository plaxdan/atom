Fluxxor = require 'fluxxor'
FluxMixin = Fluxxor.FluxMixin React
{StoreWatchMixin} = Fluxxor
{FluxMessages, FluxStores} = require '../constants'

ExpressionEvaluator = require '../expressions/expressionevaluator'

Splash = require './splash'
ModalManager = require './feedback/modalmanager'
Header = require './header'
Login = require './login'
StartCenter = require './startcenter'
ViewDisplayState = require './data/viewdisplaystate'

ApplicationSettingsView = require '../views/settings/applicationsettings'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  mixins: [
    FluxMixin
<<<<<<< HEAD
    StoreWatchMixin FluxStores.Server, FluxStores.Session, FluxStores.Settings
=======
    StoreWatchMixin Stores.Route, Stores.Settings
>>>>>>> origin/dev
  ]

  propTypes:
    route: React.PropTypes.array.isRequired
    flux: React.PropTypes.object.isRequired
    legacyFactory: React.PropTypes.object.isRequired
    authDomains: React.PropTypes.array
    defaultAuthDomain: React.PropTypes.string
    instanceName: React.PropTypes.string
    loginBanner: React.PropTypes.string
    notification: React.PropTypes.object
    aboutHandler: React.PropTypes.func.isRequired
    displayNotificationDetailsHandler: React.PropTypes.func.isRequired

  getStateFromFlux: ->
<<<<<<< HEAD
    settings = (@getFlux().store FluxStores.Settings).getState()
    stateFromFlux =
      server: (@getFlux().store FluxStores.Server).getState()
      session: (@getFlux().store FluxStores.Session).getState()
      baseTextSize: settings.user?.textSize
=======
    settings = (@getFlux().store Stores.Settings).getState()
    route = (@getFlux().store Stores.Route).getState()

    _.assign baseTextSize: settings.user?.textSize, route

  getDefaultProps: ->
    serverLoaded: false
    sessionLoaded: false
>>>>>>> origin/dev

  componentDidUpdate: ->
    document.title = @_getDocumentTitle()

  render: ->
    route = @state.route or []

    textSize =  @state.baseTextSize or 'normal'
    div id: 'ui', className: "page-container base-size-#{textSize}",
      ModalManager
<<<<<<< HEAD
        factory: @props.factory
        pubSub: @props.factory.pubSub
      switch @state.server.status
        when FluxMessages.SERVER_LOADING
          # TODO: Do we want to show a splash screen here?
          div {}
        when FluxMessages.SERVER_LOADED
          switch @state.session.status
            when FluxMessages.SESSION_RESUMING
              if @state.session.sessionName?
                @_renderComponent route
              else
                # TODO: Do we want to show a splash screen here?
                div {}
            when FluxMessages.SESSION_CREATING
              # TODO: pass a prop to Login so it can show a spinner?
              @_renderLogin()
            when FluxMessages.SESSION_CREATED, FluxMessages.SESSION_RESUMED
              @_renderComponent route
            when FluxMessages.SESSION_DESTROYED, FluxMessages.SESSION_ERROR
              @_renderLogin()
            else
              # TODO: BORK
              throw new Error "Unrecognized session status: #{@state.session.status}"
        when FluxMessages.SERVER_ERROR
          # TODO: Give the user some feedback here
          console.error 'Fail whale'
=======
        pubSub: @props.legacyFactory.pubSub

      if @props.serverLoaded
        if @props.sessionError
          @_renderLogin()
        else if @props.sessionLoaded
          @_renderComponent route
>>>>>>> origin/dev
        else
          throw new Error "Unrecognized server status: #{@state.server.status}"

  _renderLogin: ->
    Login
      factory: @props.factory
      authDomains: @state.server.authDomains
      buildVersion: @props.buildVersion
      defaultAuthDomain: @state.server.defaultAuthDomain
      instanceName: @state.server.instanceName
      loginBanner: @state.server.loginBanner
      aboutHandler: @props.aboutHandler
      notification: @props.notification
      displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler

  _renderComponent: (route) ->
    { legacyFactory } = @props

    if route[0] is 'view'
      { displayStateController } = @state.routeProps
      canSearch = true
      searchVisible = displayStateController.rootState().get 'searchVisible'

    [
      Header
        key: 'header'
        factory: legacyFactory
        notification: @props.notification
        displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler
        searchVisible: searchVisible if canSearch
        toggleSearch: @_toggleSearch if canSearch
        displayViewAction: @_displayViewAction
      switch route[0]
        when 'settings'
          LegacyContent
            key: route.join '/'
            factory: legacyFactory
            contentView: legacyFactory.create ApplicationSettingsView,
              path: route.slice 1
        when 'view'
          ViewDisplayState
            key: displayStateController.cid
            factory: legacyFactory
            controller: displayStateController
            searchVisible: searchVisible
            toggleSearch: @_toggleSearch
        when 'home'
          StartCenter
            key: 'startCenter'
            factory: factory
            performAction: @props.performAction
        else
          StartCenter
            key: 'startCenter'
            factory: legacyFactory
            displayViewAction: @_displayViewAction
    ]

  _getDocumentTitle: ->
    { displayStateController } = @state.routeProps
    state = displayStateController?.activeState()
    if state
      "#{state.title()} - DataSplice Client"
    else
      'DataSplice Client'

  _toggleSearch: (explicit) ->
    { displayStateController } = @state.routeProps
    rootState = displayStateController?.rootState()
    if rootState
      newVisible = if _.isBoolean explicit
        explicit
      else
        not rootState.get 'searchVisible'
      rootState.set searchVisible: newVisible
      @forceUpdate()

  _displayViewAction: (action, controller) ->
    @getFlux().actions.navigate.view action, controller

LegacyContent = React.createClass
  displayName: 'LegacyContent'

  propTypes:
    contentView: React.PropTypes.object.isRequired

  componentDidMount: ->
    @props.contentView.render().$el.appendTo @getDOMNode()

  componentWillUnmount: ->
    @props.contentView.gc()

  render: ->
    div undefined

module.exports = UI
