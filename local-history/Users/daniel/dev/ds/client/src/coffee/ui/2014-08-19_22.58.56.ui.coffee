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
      # TODO: while the app is attempting to load the session from local
      #   storage, we do not want the login screen to render.
      modalManager
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
      modalManager
      Header
        factory: @props.factory
      Content
        factory: @props.factory
        contentView: @props.contentView
    ]

  render: ->

    modalManager =  ModalManager {factory, pubSub: factory.pubSub}

    div id: 'ui', className: 'page-container',
      if serverLoaded
        if sessionError
          @_renderLogin()
        else if sessionLoaded
          @_renderContent()
        else
          # loading....
      else
        # TODO: what to display when not @serverLoaded?
        'Server not loaded'

module.exports = UI
