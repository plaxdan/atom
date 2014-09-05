{div} = React.DOM

Content = React.createClass
  displayName: 'Content'

  getInitialState: ->
    view: null

  componentWillMount: ->
    @props.factory.pubSub.on 'currentView', _.bind @_currentView, @
    @props.factory.pubSub.on 'replaceView', _.bind @_replaceView, @

  componentDidMount: ->
    @state.view?.render().$el.appendTo getDOMNode()

  render: ->
    div id: 'viewContainer',
      @state.view?.$el

  _currentView: (callback) ->
    callback @state.view

  _replaceView: (newView) ->
    return unless newView
    @state.view?.gc()
    newView.render()
    @setState view: newView



module.exports = Content