ExpressionEvaluator = require '../expressions/expressionevaluator'

ModalManager = require './feedback/modalmanager'
Header = require './header'
Content = require './content'
Login = require './login'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getDefaultProps: ->
    serverLoaded: false
    sessionLoaded: false
    component: undefined

  _renderLogin: ->
    Login
      factory: @props.factory
      authDomains: @props.authDomains
      buildVersion: @props.buildVersion
      defaultAuthDomain: @props.defaultAuthDomain
      instanceName: @props.instanceName
      loginBanner: @props.loginBanner
      loginHandler: @props.loginHandler
      aboutHandler: @props.aboutHandler
      notification: @props.notification
      displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler

  _renderComponent: ->
    [
      Header
        factory: @props.factory
      @props.component
      # Content
      #   factory: @props.factory
      #   contentView: @props.contentView
    ]

  render: ->
    div id: 'ui', className: 'page-container',
      ModalManager
        factory: @props.factory
        pubSub: @props.factory.pubSub

      if @props.serverLoaded
        if @props.sessionError
          @_renderLogin()
        else if @props.sessionLoaded
          @_renderComponent()
        else
          # loading....
          console.debug 'Loading....'
      else if @props.serverError
        # Fail whale
        console.debug 'FAIL WHALE'

module.exports = UI
