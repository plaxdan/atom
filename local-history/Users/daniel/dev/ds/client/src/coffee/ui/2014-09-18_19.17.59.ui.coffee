Fluxxor = require 'fluxxor'
FluxMixin = Fluxxor.FluxMixin React

ExpressionEvaluator = require '../expressions/expressionevaluator'

ModalManager = require './feedback/modalmanager'
Header = require './header'
Login = require './login'
StartCenter = require './startcenter'

ApplicationSettingsView = require '../views/settings/applicationsettings'
CompositeDataView = require '../views/data/compositedataview'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  mixins: [FluxMixin]

  getDefaultProps: ->
    serverLoaded: false
    sessionLoaded: false
    component: null

  _renderLogin: ->
    Login
      factory: @props.factory
      authDomains: @props.authDomains
      buildVersion: @props.buildVersion
      defaultAuthDomain: @props.defaultAuthDomain
      instanceName: @props.instanceName
      loginBanner: @props.loginBanner
      aboutHandler: @props.aboutHandler
      notification: @props.notification
      displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler

  _renderComponent: (route) ->
    { factory } = @props
    [
      Header
        key: 'header'
        factory: factory
        notification: @props.notification
        displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler
      switch route[0]
        when 'settings'
          LegacyContent
            key: route.join '/'
            factory: factory
            contentView: factory.create ApplicationSettingsView,
              path: route.slice 1
        when 'view'
          LegacyContent
            key: @props.displayStateController.cid
            factory: factory
            contentView: factory.create CompositeDataView,
              controller: @props.displayStateController
        else
          StartCenter
            key: 'startCenter'
            factory: factory
            performAction: @props.performAction
    ]

  render: ->
    route = @props.route
    unless _.isArray route
      route = [ route ]

    div id: 'ui', className: 'page-container',
      ModalManager
        factory: @props.factory
        pubSub: @props.factory.pubSub

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