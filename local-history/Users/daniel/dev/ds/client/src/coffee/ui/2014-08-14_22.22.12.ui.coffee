ModalManager = require './feedback/modalmanager'
Login = require './login'
Header = require './header'
Content = require './content'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getInitialState: ->
    hasSession: true

  componentWillMount: ->
    @props.factory.pubSub.on 'sessionError', _.bind @_onSessionError, @
    @props.factory.pubSub.on 'serverLoaded', _.bind @_onServerLoaded, @

  render: ->
    div id: 'ui', className: 'page-container',
      ModalManager factory: @props.factory, pubSub: @props.factory.pubSub

      if @state.hasSession
        Header factory: @props.factory
        Content factory: @props.factory
      else
        Login factory: @props.factory

  _onServerLoaded: ->
    @setState hasSession: true

  # Note: the logOut event is only raised when the user *intends* to log out
  #   the "Are you sure?" prompt is displayed on logOut. When the user actually
  #   succeeds in logging out then the sessionError event is raised.
  _onSessionError: ->
    @setState hasSession: false

module.exports = UI
