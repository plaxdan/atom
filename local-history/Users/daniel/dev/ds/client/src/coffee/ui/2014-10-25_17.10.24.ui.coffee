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
ReactCSSTransitionGroup = React.addons.CSSTransitionGroup

UI = React.createClass
  displayName: 'UI'

  mixins: [
    FluxMixin
    StoreWatchMixin FluxStores.Server, FluxStores.Session, FluxStores.Settings
  ]

  getStateFromFlux: ->
    settings = (@getFlux().store FluxStores.Settings).getState()
    stateFromFlux =
      server: (@getFlux().store FluxStores.Server).getState()
      session: (@getFlux().store FluxStores.Session).getState()
      baseTextSize: settings.user?.textSize

  componentDidUpdate: ->
    document.title = @_getDocumentTitle()

  render: ->
    route = @props.route
    unless _.isArray route
      route = [ route ]

    textSize =  @state.baseTextSize or 'normal'
    div id: 'ui', className: "page-container base-size-#{textSize}",
      ModalManager
        factory: @props.factory
        pubSub: @props.factory.pubSub
      switch @state.server.status
        when FluxMessages.SERVER_LOADING
          # TODO: When this phase is very fast, the transition from splash to
          # login screen is jarring.
          Splash {}
        when FluxMessages.SERVER_LOADED
          switch @state.session.status
            when FluxMessages.SESSION_RESUMING
              # Only display splash if there's no existing session
              # otherwise display component.
              if @state.session.sessionName?
                @_renderComponent route
              else
                Splash {}
            when FluxMessages.SESSION_CREATING
              # TODO: pass a prop to Login so it can show a spinner?
              @_renderLogin()
            when FluxMessages.SESSION_CREATED, FluxMessages.SESSION_RESUMED
              @_renderComponent route
            when FluxMessages.SESSION_DESTROYED, FluxMessages.SESSION_ERROR
              @_renderLogin()
            else
              # TODO: BORK
        when FluxMessages.SERVER_ERROR
          # Fail whale
          console.debug 'TODO: unable to load server info'
        else
          throw new Error "Unrecognized server status: #{@state.server.status}"

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
