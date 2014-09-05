MessageCenterView = require '../views/session/messagecenter'
SessionMenuView = require '../views/session/sessionmenu'

{div} = React.DOM

Header = React.createClass
  displayName: 'Header'

  componentDidMount: (prevProps, prevState) ->
    @_createViews @getDOMNode()

  componentWillUnmount: ->
    @messageCenterView?.gc()
    @sessionMenuView?.gc()
    
  render: ->
    div id: 'header'

  _createViews: (node) ->
    @messageCenterView = @props.factory.create MessageCenterView
    @sessionMenuView = @props.factory.create SessionMenuView, {messageCenter: @messageCenterView}

    @messageCenterView.render().$el.appendTo node
    @sessionMenuView.render().$el.appendTo node

module.exports = Header
