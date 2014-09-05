{div} = React.DOM

###
Manages a current view, switching the content out for each new view
passed in through the replaceView backbone event.
###
Content = React.createClass
  displayName: 'Content'

  componentDidMount: ->
    @props.factory.pubSub.on 'currentView', _.bind @_onCurrentView, @

  componentWillUnmount: ->
    @props.factory.pubSub.off 'currentView'
    @props.contentView?.gc()

  componentWillReceiveProps: (nextProps) ->
    nextView = nextProps.contentView
    @props.contentView?.gc()
    nextView?.render().$el.appendTo @getDOMNode()

  render: ->
    # this helps hide the address bar on mobile operating systems, which
    # saves some screen real-estate
    window.scrollTo 0, 1
    div undefined

  _onCurrentView: (callback) ->
    callback @props.contentView

module.exports = Content
