{div} = React.DOM

Content = React.createClass
  displayName: 'Content'

  getInitialState: ->
    view: undefined
    viewContent: undefined

  componentWillMount: ->
    @props.factory.pubSub.on 'currentView', _.bind @_currentView, @
    @props.factory.pubSub.on 'replaceView', _.bind @_replaceView, @

  render: ->
    div id: 'viewContainer', dangerouslySetInnerHTML: __html: @state.viewContent

  _currentView: (callback) ->
    callback @state.view

  _replaceView: (newView) ->
    return unless newView
    @state.view?.gc()
    @newView.render()
    
    @setState view: newView, viewContent: @newView.$el.html()




module.exports = Content
