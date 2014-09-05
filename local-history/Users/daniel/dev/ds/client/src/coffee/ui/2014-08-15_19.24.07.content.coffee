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

  componentDidMount: ->
    console.info 'Content: componentDidMount'
    @props.factory.pubSub.on 'currentView', _.bind @_onCurrentView, @
    # @props.factory.pubSub.on 'replaceView', _.bind @_onReplaceView, @

  componentWillUnmount: ->
    console.error 'Content: componentWillUnmount'
    console.info "Content: garbageCollecting #{@props.contentView}" if @props.contentView
    @state.contenView?.gc()

  render: ->
    window.scrollTo 0, 1
    div id: 'viewContainer'
      @props.contentView

  _onCurrentView: (callback) ->
    callback @props.contentView

  _onReplaceView: (newView) ->
    return unless newView

    # remove current view from DOM
    console.info "Content: garbageCollecting #{@state.view}" if @state.view
    @state.view?.gc()

    # add new view to DOM
    newView.render().$el.appendTo @getDOMNode()

    # and set in state
    @setState view: newView

    # this helps hide the address bar on mobile operating systems, which
    # saves some screen real-estate

module.exports = Content
