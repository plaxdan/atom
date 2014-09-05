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
    @props.factory.pubSub.on 'currentView', _.bind @_onCurrentView, @
    @props.factory.pubSub.on 'replaceView', _.bind @_onReplaceView, @

  componentWillUnmount: ->
    @state.view?.gc()

  render: ->
    div id: 'viewContainer'

  _onCurrentView: (callback) ->
    callback @state.view

  _onReplaceView: (newView) ->
    return unless newView
    newView.render()
    @state.view?.gc()
    @setState view: newView

    @getDOMNode().innerHTML.replace newView.$el


module.exports = Content
