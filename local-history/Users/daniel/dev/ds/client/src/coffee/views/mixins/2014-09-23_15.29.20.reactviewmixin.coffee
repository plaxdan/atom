###
# React View Base
#
# Provides a Backbone view that hosts React components internally
# Views using this class should provide the following spec:
# * reactComponent: React class to mount within the view
# * getDefaultProps: Initial properties passed to the component
# * gc: needs to call forceUnmount (the mixin can't implement this because it
#   probably needs a super call, which is not available outside the class)
###
ReactViewMixin =

  # derived classes must specify a React class to render
  reactComponent: null

  # derived classes should implement the set of initial properties passed to
  # the React component
  getDefaultProps: -> {}

  # return the current component properties
  getProps: ->
    if @_react
      @_react.props
    else
      @_delayedProps or= _.result @, 'getDefaultProps'
      @_delayedProps

  # updates the properties on the associated component, if this is called
  # before the component is mounted the props are combined with getDefaultProps
  # in render
  setProps: (nextProps) ->
    if @_react?.isMounted()
      @_react.setProps nextProps
    else
      @_delayedProps or= {}
      _.extend @_delayedProps, nextProps

  render: ->
    props = _.extend (_.result @, 'getDefaultProps'), @_delayedProps
    for key, value of props
      props[key] = _.bind value, @ if _.isFunction value
    delete @_delayedProps
    @_react = @reactComponent props
    React.renderComponent @_react, @$el[0]
    @

  forceUpdate: ->
    unless @_debouncedUpdate
      @_debouncedUpdate = _.debounce ( =>
        @_react?.forceUpdate() if @_react?.isMounted()
      ), 100
    @_debouncedUpdate()

  forceUnmount: ->
    React.unmountComponentAtNode @$el[0] if @isMounted()

module.exports = ReactViewMixin
