SessionSelectionView = require '../views/session/sessionselection'

{div} = React.DOM

Login = React.createClass
  displayName: 'Login'

  componentDidMount: (prevProps, prevState) ->
    @_createView @getDOMNode()

  componentWillUnmount: ->
    @sessionSelectionView?.gc()

  render: ->
    div id: 'login'

  _createView: (node) ->
    @sessionSelectionView = @props.factory.create SessionSelectionView
    @sessionSelectionView.render().$el.appendTo node

module.exports = Login
