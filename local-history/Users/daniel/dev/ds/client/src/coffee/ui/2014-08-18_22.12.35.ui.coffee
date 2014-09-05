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

  render: ->
    console.debug "Rendering UI: {\n\
      \tserverLoaded: #{@props.serverLoaded},\n\
      \tsessionLoaded: #{@props.sessionLoaded}\n\
      \tinstanceName: #{@props.login.instanceName},\n\
      \tauthDomains: #{@props.login.authDomains},\n\
      \tdefaultAuthDomain: #{@props.login.defaultAuthDomain},\n\
      \tbuildVersion: #{@props.login.buildVersion},\n\
      }"

    modalManager =  ModalManager
      factory: @props.factory
      pubSub: @props.factory.pubSub

    div id: 'ui', className: 'page-container',
      if @props.serverLoaded
        if @props.sessionLoaded
          [
            modalManager
            Header factory: @props.factory
            Content factory: @props.factory, contentView: @props.contentView
          ]
        else
          [
            # TODO: while the app is attempting to load the session from local
            #   storage, we do not want the login screen to render.
            modalManager
            Login
              factory: @props.factory
              authDomains: @props.login.authDomains
              buildVersion: @props.login.buildVersion
              defaultAuthDomain: @props.login.defaultAuthDomain
              instanceName: @props.login.instanceName
              loginBanner: @props.login.loginBanner
              loginHandler: @props.login.loginHandler
              aboutHandler: @props.login.aboutHandler
          ]
      else
        # TODO: what to display when not @serverLoaded?
        'Server not loaded'

module.exports = UI