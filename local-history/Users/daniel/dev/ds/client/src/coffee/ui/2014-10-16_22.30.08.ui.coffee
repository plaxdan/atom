Fluxxor = require 'fluxxor'
FluxMixin = Fluxxor.FluxMixin React
{StoreWatchMixin} = Fluxxor
{Stores} = require '../constants'

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
    StoreWatchMixin Stores.Server, Stores.Session
  ]

  getDefaultProps: ->
    serverLoaded: false
    sessionLoaded: false
    component: null

  componentDidUpdate: ->
    document.title = @_getDocumentTitle()

  render: ->
    route = @props.route
    unless _.isArray route
      route = [ route ]

    div id: 'ui', className: 'page-container',
      ModalManager
        factory: @props.factory
        pubSub: @props.factory.pubSub

      # TODO: create a splash screen for display while the
      # app is initializing (prior to serverLoaded)
      if @state.server.serverLoaded
        if @state.session.sessionError
          @_renderLogin()
        else if @state.session.sessionLoaded
          @_renderComponent route
        else
          # loading....
          console.info 'UI splash screen should go here....'
      else if @state.server.serverError
        # Fail whale
        console.debug 'FAIL WHALE'

  getStateFromFlux: ->
    server: (@getFlux().store Stores.Server).getState()
    session: (@getFlux().store Stores.Session).getState()

  _renderLogin: ->
    Login
      factory: @props.factory
      authDomains: @state.server.authDomains
      buildVersion: @state.server.buildVersion
      defaultAuthDomain: @state.server.defaultAuthDomain
      instanceName: @state.server.instanceName
      loginBanner: @state.server.loginBanner
      aboutHandler: @props.aboutHandler
      notification: @props.notification
      displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler

  _renderComponent: (route) ->
    { factory } = @props

    if route[0] is 'view'
      canSearch = true
      searchVisible = @props.displayStateController.rootState().get 'searchVisible'

    [
      Header
        key: 'header'
        factory: factory
        notification: @props.notification
        displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler
        searchVisible: searchVisible if canSearch
        toggleSearch: @_toggleSearch if canSearch
      switch route[0]
        when 'settings'
          LegacyContent
            key: route.join '/'
            factory: factory
            contentView: factory.create ApplicationSettingsView,
              path: route.slice 1
        when 'view'
          ViewDisplayState
            key: @props.displayStateController.cid
            factory: factory
            controller: @props.displayStateController
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
            factory: factory
            performAction: @props.performAction
    ]

  _getDocumentTitle: ->
    state = @props.displayStateController?.activeState()
    if state
      "#{state.title()} - DataSplice Client"
    else
      'DataSplice Client'

  _toggleSearch: (explicit) ->
    rootState = @props.displayStateController?.rootState()
    if rootState
      newVisible = if _.isBoolean explicit
        explicit
      else
        not rootState.get 'searchVisible'
      rootState.set searchVisible: newVisible
      @forceUpdate()

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