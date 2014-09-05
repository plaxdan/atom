Header = require './header'
Content = require './content'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getInitialState: ->
    showHeader: false

  componentWillMount: ->
    @props.factory.pubSub.on 'sessionLoaded', _.bind @_onSessionLoaded, @

  render: ->
    div id: 'ui', className: 'page-container',
      Header factory: @props.factory if @state.showHeader
      div id: 'viewContainer'
      # Content factory: @props.factory

  _onSessionLoaded: ->
    @setState showHeader: true

module.exports = UI
