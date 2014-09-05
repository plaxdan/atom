{div} = React.DOM

###
Manages a current view, switching the content out for each new view
passed in through the replaceView backbone event.
###
Content = React.createClass
  displayName: 'Content'

  getInitialState: ->
    contentView: undefined

  componentWillMount: ->
    @setState contentView: @props.contentView

  componentDidMount: ->
    @props.factory.pubSub.on 'currentView', _.bind @_onCurrentView, @

  componentWillUnmount: ->
    @props.factory.pubSub.off 'currentView'
    @state.contentView?.gc()

  componentWillReceiveProps: (nextProps) ->
    nextView = nextProps.contentView
    @state.contentView?.gc()
    nextView.render().$el.appendTo @getDOMNode()
    @setState contentView: nextView

  render: ->
    # this helps hide the address bar on mobile operating systems, which
    # saves some screen real-estate
    window.scrollTo 0, 1
    div id: 'viewContainer'

  _onCurrentView: (callback) ->
    callback @state.contentView

module.exports = Content
