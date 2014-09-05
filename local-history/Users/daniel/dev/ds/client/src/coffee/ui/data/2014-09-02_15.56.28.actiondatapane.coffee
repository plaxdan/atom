ExpressionEvaluator = require '../../expressions/expressionevaluator'
RecordForm = require './recordform'
BackboneWrapper = require '../widgets/backbonewrapper'
DataSearchView = require '../../views/data/datasearchview'
DataFormView = require '../../views/data/dataformview'
DataGridView = require '../../views/data/datagridview'

{ div } = React.DOM

ActionDataPane = React.createClass
  displayName: 'ActionDataPane'

  propTypes:
    controller: React.PropTypes.object.isRequired

  getInitialState: ->
    actionPlugin: null
    actionProps: null

  componentWillMount: ->
    @_receiveProps @props

  componentWillReceiveProps: (nextProps) ->
    @_receiveProps nextProps

  shouldComponentUpdate: (nextProps, nextState) ->
    # Don't render if we have action props but they've not been set on @state
    #   yet. The reason they've not been set yet is because they're
    #   being still processed by the ExpressionEvaluator.
    activeState = nextProps.controller.activeState()
    if activeState
      actionProps = (activeState.get 'action')?.properties?.Attributes
      # wait until the actionprops have been evaluated and set on the state
      return false if actionProps and not nextState.actionProps
    else
      true

  _receiveProps: (props) ->
    # see if the display mode is serviced by a plugin
    plugins = props.factory.pluginRegistry
    plugin = plugins.findDisplayModePlugin props.displayMode
    @setState actionPlugin: plugin

    state = props.controller.activeState()
    actionProps =  (state.get 'action')?.properties?.Attributes
    if actionProps
      actionProps = _.clone actionProps
      context = props.controller.eventContext()
      (Promise.resolve ExpressionEvaluator.evaluateAttributes actionProps,
        { context }
      ).done =>
        for key, value of actionProps
          # try to parse JSON-looking values
          try
            actionProps[key] = JSON.parse value

        @setState { actionProps } if @isMounted()

  render: ->
    activeState = @props.controller.activeState()
    # pass both the evaluated action props, and the initial raw values
    # in cases where the display panes need to perform custom processing
    paneProps = _.extend
      ref: 'pane'
      rawActionProps:  (activeState.get 'action')?.properties?.Attributes
    , @state.actionProps

    if @state.actionPlugin
      plugin = @state.actionPlugin
      @transferPropsTo plugin.createDisplayComponent @props.displayMode,
        paneProps

    else if @props.displayMode in [ 'record', 'form ']
      @transferPropsTo RecordForm paneProps

    # handle modes still serviced by Backbone views
    else
      viewClass = if @props.displayMode
        switch @props.displayMode
          when 'filter', 'search'
            DataSearchView
          when 'form', 'record'
            DataFormView
          when 'grid', 'auto'
            DataGridView
      else
        @props.viewClass

      if viewClass
        BackboneWrapper
          ref: 'pane'
          factory: @props.factory
          controller: @props.controller
          viewClass: viewClass
          readOnly: @props.readOnly
          autoHeight: @props.autoHeight
          maxHeight: @props.maxHeight
          expandSelected: @props.expandSelected
          onDefaultCommand: @props.onDefaultCommand
      else
        div {},
          div className: 'alert alert-danger',
            "Invalid display mode: #{@props.displayMode}"

  resize: (options) ->
    return unless @isMounted()

    # many data displays need explicit resizing (grid, map, etc)
    pane = @refs.pane
    height = if options.fill
      options.maxHeight
    else if _.isFunction pane?.desiredHeight
      pane.desiredHeight()

    return unless height?

    height = Math.min height, options.maxHeight
    if _.isFunction pane?.setHeight
      pane.setHeight height, options
    else
      ($ @getDOMNode()).height height

module.exports = ActionDataPane
