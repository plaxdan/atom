Backbone = require 'backbone'
Fluxxor = require 'fluxxor'
FluxChildMixin = Fluxxor.FluxChildMixin React
{ StoreWatchMixin } = Fluxxor

ActionDataPane = require './data/actiondatapane'
AccordionGroup = require './widgets/accordiongroup'
BootstrapIcon = require './widgets/bootstrapicon'
DisplayStateController = require '../data/displaystatecontroller'

{ div, strong } = React.DOM
{ classSet } = React.addons
a = require './widgets/anchor'

StartCenter = React.createClass
  displayName: 'StartCenter'

  propTypes:
    factory: React.PropTypes.object.isRequired
    banner: React.PropTypes.string
    performAction: React.PropTypes.func.isRequired

  mixins: [
    FluxChildMixin
    StoreWatchMixin 'TopLevelActions'
  ]

  getStateFromFlux: ->
    (@getFlux().store 'TopLevelActions').getState()

  render: ->
    childProps =
      factory: @props.factory
      performAction: @props.performAction

    div className: 'start-center container',

      if @props.banner
        div className: 'row',
          div className: 'span12',
            div className: 'banner well', @props.banner

      if @state.categories?.length
        div className: 'row',
          div className: 'span12',
            div className: 'accordion',
              for category in @state.categories
                StartCenterCategory _.extend
                  key: category
                  name: category
                  actions: @state.categoryActions[category]
                , childProps

StartCenterCategory = React.createClass
  displayName: 'StartCenterCategory'

  propTypes:
    name: React.PropTypes.string.isRequired
    actions: React.PropTypes.array.isRequired
    performAction: React.PropTypes.func.isRequired

  render: ->
    # group actions into sections by weight - display actions with the same
    # weight in a group so they stack horizontally and take up less space
    keys = []
    actions = {}
    for ref in @props.actions
      if ref.displayType is 'Expanded'
        keys.push ref.name
        actions[ref.name] = [ ref ]
      else
        unless actions[ref.weight]
          actions[ref.weight] = []
          keys.push ref.weight
        actions[ref.weight].push ref

    renderButton = (ref) =>
      CategoryActionButton
        factory: @props.factory
        key: ref.name
        actionRef: ref
        performAction: _.bind @props.performAction, @, ref.action

    AccordionGroup
      groupId: @props.name?.replace /[^A-Za-z]/g, ''
      heading: strong {}, @props.name
    ,
      for key in keys
        list = actions[key]
        if list.length is 1
          renderButton list[0]
        else
          div key: key, className: 'button-group',
            renderButton ref for ref in list

CategoryActionButton = React.createClass
  displayName: 'CategoryActionButton'

  getInitialState: ->
    expanded: true

  _toggleExpanded: (ev) ->
    @setState expanded: not @state.expanded
    ev.preventDefault()
    false

  render: ->
    ref = @props.actionRef
    if ref.displayType is 'Expanded'
      expanded = @state.expanded
      icon = if expanded then 'icon-chevron-up' else 'icon-chevron-down'

    div
      className: classSet
        'home-action': true
        button: ref.displayType isnt 'Expanded'
        open: expanded
    ,
      div className: 'btn-wrapper',
        div className: 'btn-group',
          a
            className: 'perform-action btn'
            onClick: _.bind @props.performAction, @, null
          ,
            div className: 'btn-label', ref.name
              if ref.displayType is 'Expanded'
                a className: 'toggle-expand btn', onClick: @_toggleExpanded,
                  BootstrapIcon { icon }

      if ref.displayType is 'Expanded'
        ExpandableActionContainer
          factory: @props.factory
          action: ref.action

ExpandableActionContainer = React.createClass
  displayName: 'ExpandableActionContainer'

  # needed by the display state interface
  getProps: -> @props

  componentWillMount: ->
    # create a controller for the current action
    { action } = @props
    state = @props.factory.dataController.createDisplayState
      action: action
      query: action.query

    controller = new DisplayStateController state, @props.factory
    controller.bindDisplayInterface @, startCenter: true

    # not ideal, but some actions don't work on the home screen so just
    # wire them up to nothing
    noop = ->
    for method in [ 'toggleSearch', 'toggleRelationships' ]
      controller.displayInterface[method] = noop

    @setState { controller, action, displayMode: action.displayMode }

    if action.displayMode not in [ 'filter', 'search' ]
      controller.fetchQuery()

  componentWillUnmount: ->
    @state.controller?.gc()

  render: ->
    div className: 'expand-container',
      if @state.controller
        ActionDataPane
          ref: 'data'
          factory: @props.factory
          controller: @state.controller
          displayMode: @state.displayMode
          readOnly: true
          autoHeight: true
          maxHeight: 300
          expandSelected: @_displaySelected
          onDefaultCommand: @_displaySelected

  # navigate to the main view display by default (enter key/double-click)
  _displaySelected: ->
    action = @state.action

    # prevent controller from being gc'd
    controller = @state.controller
    @setState controller: null

    if action.displayMode in [ 'filter', 'search' ]
      controller.fetchQuery()

    @props.factory.pubSub.trigger 'displayNavigationAction', action, controller

module.exports = StartCenter
