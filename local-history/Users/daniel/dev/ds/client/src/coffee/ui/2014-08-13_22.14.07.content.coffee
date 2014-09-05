{div} = React.DOM

###
Manages a current view, switching the content out for each new view
passed in through the replaceView backbone event.
###
Content = React.createClass
  displayName: 'Content'

  getInitialState: ->
    view: undefined
    viewContent: undefined

  componentWillMount: ->
    @props.factory.pubSub.on 'currentView', _.bind @_currentView, @
    @props.factory.pubSub.on 'replaceView', _.bind @_replaceView, @

  componentWillUnmount: ->
    @state.view?.gc()

  render: ->
    div id: 'viewContainer',
      @state.view?.$el

  _currentView: (callback) ->
    callback @state.view

  _replaceView: (newView) ->
    return unless newView
    newView.render()
    @state.view?.gc()
    @setState view: newView


module.exports = Content
