{div} = React.DOM

Content = React.createClass
  displayName: 'Content'

  componentWillMount: ->
    @props.factory.pubSub.on 'currentView', _.bind @_currentView, @
    @props.factory.pubSub.on 'replaceView', _.bind @_replaceView, @

  render: ->
    div id: 'viewContainer', dangerouslySetInnerHTML: __html: '<input/>''

  _currentView: (callback) ->
    callback @view

  _replaceView: (newView) ->
    return unless newView
    @view?.gc()

    newView.render()




module.exports = Content
