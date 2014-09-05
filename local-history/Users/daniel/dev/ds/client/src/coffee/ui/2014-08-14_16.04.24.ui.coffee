ModalManager = require './feedback/modalmanager'
Header = require './header'
Content = require './content'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getInitialState: ->
    showHeader: false

  componentWillMount: ->
    @props.factory.pubSub.on 'sessionError', _.bind @_onLogOut, @
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

  _onLogOut: ->
    console.debug 'UI: sessionError'
    @setState showHeader: false

module.exports = UI
