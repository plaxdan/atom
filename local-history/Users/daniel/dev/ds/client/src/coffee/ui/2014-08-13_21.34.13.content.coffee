{div} = React.DOM

Content = React.createClass
  displayName: 'Content'

  getInitialState: ->
    viewContent: undefined

  componentWillMount: ->
    @props.factory.pubSub.on 'currentView', _.bind @_currentView, @
    @props.factory.pubSub.on 'replaceView', _.bind @_replaceView, @

  render: ->
    div id: 'viewContainer', dangerouslySetInnerHTML: __html: @state.viewContent

  _currentView: (callback) ->
    callback @view

  _replaceView: (newView) ->
    return unless newView
    @view?.gc()

    newView.render()
    @view = newView
    @setState viewContent: @view.$el




module.exports = Content
