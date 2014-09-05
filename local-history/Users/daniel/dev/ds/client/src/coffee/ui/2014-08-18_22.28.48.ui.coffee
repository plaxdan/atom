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
      \tinstanceName: #{@props.instanceName},\n\
      \tauthDomains: #{@props.authDomains},\n\
      \tdefaultAuthDomain: #{@props.defaultAuthDomain},\n\
      \tbuildVersion: #{@props.buildVersion},\n\
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
              authDomains: @props.authDomains
              buildVersion: @props.buildVersion
              defaultAuthDomain: @props.defaultAuthDomain
              instanceName: @props.instanceName
              loginBanner: @props.loginBanner
              loginHandler: @props.loginHandler
              aboutHandler: @props.aboutHandler
          ]
      else
        # TODO: what to display when not @serverLoaded?
        'Server not loaded'

module.exports = UI
