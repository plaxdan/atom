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

  shouldComponentUpdate: (nextProps, nextState) ->
    not not nextProps.contentView?

  render: ->

    {
      aboutHandler
      authDomains
      buildVersion
      contentView
      defaultAuthDomain
      displayNotificationDetailsHandler
      factory
      instanceName
      loginBanner
      loginHandler
      notification
      serverLoaded
      sessionLoaded
    } = @props

    console.debug "Rendering UI: {\n\
      \tfactory: #{factory},\n\
      \tauthDomains: #{authDomains},\n\
      \tbuildVersion: #{buildVersion},\n\
      \tdefaultAuthDomain: #{defaultAuthDomain},\n\
      \tinstanceName: #{instanceName},\n\
      \tloginBanner: #{loginBanner},\n\
      \tnotification: #{JSON.stringify notification},\n\
      }"

    modalManager =  ModalManager {factory, pubSub: factory.pubSub}

    div id: 'ui', className: 'page-container',
      if serverLoaded
        if sessionLoaded
          [
            modalManager
            Header {factory}
            Content {factory, contentView}
          ]
        else
          [
            # TODO: while the app is attempting to load the session from local
            #   storage, we do not want the login screen to render.
            modalManager
            Login {
              factory
              authDomains
              buildVersion
              defaultAuthDomain
              instanceName
              loginBanner
              loginHandler
              aboutHandler
              notification
              displayNotificationDetailsHandler
            }
          ]
      else
        # TODO: what to display when not @serverLoaded?
        'Server not loaded'

module.exports = UI
