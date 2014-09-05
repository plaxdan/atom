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
    console.info "Rendering UI"
    app = [
      Header factory: @props.factory
      Content factory: @props.factory, contentView: @props.contentView
    ]

    div id: 'ui', className: 'page-container',
      ModalManager factory: @props.factory, pubSub: @props.factory.pubSub
      # TODO: what to display when not @serverLoaded?
      if @props.serverLoaded and @props.sessionLoaded
        app
      else if @props.serverLoaded and not @props.sessionLoaded
        Login factory: @props.factory

  # Note: the logOut event is only raised when the user *intends* to log out
  #   the "Are you sure?" prompt is displayed on logOut. When the user actually
  #   succeeds in logging out then the sessionError event is raised.
  _onSessionError: ->
    console.debug 'UI: onSessionError'
    @setState sessionLoaded: false

module.exports = UI
