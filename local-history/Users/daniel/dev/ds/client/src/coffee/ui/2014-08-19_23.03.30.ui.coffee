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
    contentView: undefined

  _renderLogin: ->
    [
      Login {
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
      }
    ]

  _renderContent: ->
    [
      Header
        factory: @props.factory
      Content
        factory: @props.factory
        contentView: @props.contentView
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
          @_renderContent()
        else
          # loading....
      else if serverError
        # Fail whale

module.exports = UI
