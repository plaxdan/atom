MessageCenterView = require '../views/session/messagecenter'
SessionMenuView = require '../views/session/sessionmenu'

{div} = React.DOM

Header = React.createClass
  displayName: 'Header'

  componentDidMount: (prevProps, prevState) ->
    console.debug 'Header: componentDidUnmount'
    @_createViews @getDOMNode()

  componentWillUnmount: ->
    console.debug 'Header: componentWillUnmount'
    console.debug 'Header: garbage collecting messageCenterView'
    console.debug 'Header: garbage collecting sessionMenuView'
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
