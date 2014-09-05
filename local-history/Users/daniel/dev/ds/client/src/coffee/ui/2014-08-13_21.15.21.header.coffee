MessageCenterView = require '../views/session/messagecenter'
SessionMenuView = require '../views/session/sessionmenu'

{div} = React.DOM

Header = React.createClass
  displayName: 'Header'

  getInitialState: ->
    messageCenterView: undefined
    sessionMenuView: undefined

  componentDidMount: (prevProps, prevState) ->
    @_createViews()

  componentWillUnmount: ->
    @_detachViews()

  render: ->
    div id: 'header',
      @state.messageCenterView
      @state.sessionMenuCenterView

  _createViews: ->
    @messageCenterView = @props.factory.create MessageCenterView
    @sessionMenuView = @props.factory.create SessionMenuView, messageCenter: @messageCenterView

    @messageCenterView.render()
    @sessionMenuView.render()

    @setState messageCenterView: @messageCenterView.$el, @sessionMenuView.$el

  _detachViews: ->
    @state.messageCenterView?.gc()
    @state.sessionMenuView?.gc()
    @setState
      messageCenterView: undefined
      sessionMenuView: undefined

module.exports = Header
