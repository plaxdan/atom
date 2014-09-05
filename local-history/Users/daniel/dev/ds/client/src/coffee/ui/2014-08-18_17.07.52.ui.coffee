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
    console.debug "Rendering UI: \
      {serverLoaded: #{@props.serverLoaded}, \
      sessionLoaded: #{@props.sessionLoaded}}"

    div id: 'ui', className: 'page-container',
      if @props.serverLoaded
        ModalManager factory: @props.factory, pubSub: @props.factory.pubSub
        if @props.sessionLoaded
          [
            Header factory: @props.factory
            Content factory: @props.factory, contentView: @props.contentView
          ]
        else
          Login factory: @props.factory
      else
        # TODO: what to display when not @serverLoaded?
        'Server not loaded'

  # Note: the logOut event is only raised when the user *intends* to log out
  #   the "Are you sure?" prompt is displayed on logOut. When the user actually
  #   succeeds in logging out then the sessionError event is raised.
  _onSessionError: ->
    console.debug 'UI: onSessionError'
    @setState sessionLoaded: false

module.exports = UI
