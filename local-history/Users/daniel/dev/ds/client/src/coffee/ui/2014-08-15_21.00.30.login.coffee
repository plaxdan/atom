SessionSelectionView = require '../views/session/sessionselection'

{div} = React.DOM

Login = React.createClass
  displayName: 'Login'

  componentDidMount: (prevProps, prevState) ->
    console.debug 'Login: componentDidMount'
    @_createView @getDOMNode()

  componentWillUnmount: ->
    console.debug 'Login: componentWillUnmount'
    console.debug 'Login: Garbage collecting SessionSelectionView' if @sessionSelectionView
    @sessionSelectionView?.gc()

  render: ->
    div id: 'login'

  _createView: (node) ->
    @sessionSelectionView = @props.factory.create SessionSelectionView

    @sessionSelectionView.render().$el.appendTo node

module.exports = Login
