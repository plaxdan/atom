ModalManager = require './feedback/modalmanager'
Header = require './header'
Content = require './content'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getInitialState: ->
    showHeader: false

  componentWillMount: ->
    @props.factory.pubSub.on 'sessionError', _.bind @_onSessionError, @
    @props.factory.pubSub.on 'sessionLoaded', _.bind @_onSessionLoaded, @

  render: ->
    div id: 'ui', className: 'page-container',
      ModalManager factory: @props.factory, pubSub: @props.factory.pubSub
      Header factory: @props.factory if @state.showHeader
      Content factory: @props.factory

      # TODO: render login screen if logged, in - above if not

  _onSessionLoaded: ->
    console.debug 'UI: onSessionLoaded'
    @setState showHeader: true

  # This event is raised when a user logs out.
  #
  # Note: the logOut event is only raised when the user *intends* to log out
  #   the "Are you sure?" prompt is displayed on logOut. When the user actually
  #   succeeds in logging out then the sessionError event is raised.
  _onSessionError: ->
    console.debug 'UI: sessionError'
    @setState showHeader: false

module.exports = UI
