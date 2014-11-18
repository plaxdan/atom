Fluxxor = require 'fluxxor'
FluxMixin = Fluxxor.FluxMixin React
{ StoreWatchMixin } = Fluxxor
{ Stores } = require '../constants'

ExpressionEvaluator = require '../expressions/expressionevaluator'

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
    StoreWatchMixin Stores.Route, Stores.Settings
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
    settings = (@getFlux().store Stores.Settings).getState()
    route = (@getFlux().store Stores.Route).getState()

    _.assign baseTextSize: settings.user?.textSize, route

  getDefaultProps: ->
    serverLoaded: false
    sessionLoaded: false

  componentDidUpdate: ->
    document.title = @_getDocumentTitle()

  render: ->
    route = @state.route or []

    textSize =  @state.baseTextSize or 'normal'
    div id: 'ui', className: "page-container base-size-#{textSize}",
      ModalManager
        pubSub: @props.legacyFactory.pubSub

      if @props.serverLoaded
        if @props.sessionError
          @_renderLogin()
        else if @props.sessionLoaded
          @_renderComponent route
        else
          # loading....
          console.debug 'Loading....'
      else if @props.serverError
        # Fail whale
        console.debug 'FAIL WHALE'

  _renderLogin: ->
    Login
      authDomains: @props.authDomains
      buildVersion: @props.buildVersion
      defaultAuthDomain: @props.defaultAuthDomain
      instanceName: @props.instanceName
      loginBanner: @props.loginBanner
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
