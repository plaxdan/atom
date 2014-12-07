Backbone = require 'backbone'
Fluxxor = require 'fluxxor'
FluxMixin = Fluxxor.FluxMixin React
{ StoreWatchMixin } = Fluxxor

ActionDataPane = require './data/actiondatapane'
AccordionGroup = require './widgets/accordiongroup'
BootstrapIcon = require './widgets/bootstrapicon'
DisplayStateController = require '../data/displaystatecontroller'

{ div, strong } = React.DOM
a = require './widgets/anchor'

StartCenter = React.createClass
  displayName: 'StartCenter'

  propTypes:
    factory: React.PropTypes.object.isRequired
    banner: React.PropTypes.string
    displayViewAction: React.PropTypes.func.isRequired

  mixins: [
    FluxMixin
    StoreWatchMixin 'TopLevelActions'
  ]

  getStateFromFlux: ->
    (@getFlux().store 'TopLevelActions').getState()

  render: ->
    childProps =
      factory: @props.factory
      displayViewAction: @props.displayViewAction

    div className: 'start-center container',

      if @props.banner
        div className: 'row',
          div className: 'span8 offset2',
            div className: 'banner well', @props.banner

      if @state.categories?.length
        div className: 'row',
          div className: 'span8 offset2',
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
    displayViewAction: React.PropTypes.func.isRequired

  render: ->
    AccordionGroup
      groupId: @props.name?.replace /[^A-Za-z]/g, ''
      heading: strong {}, @props.name
    ,
      for ref in @props.actions
        CategoryActionButton
          factory: @props.factory
          key: ref.name
          actionRef: ref
          displayViewAction: @props.displayViewAction

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

    div { className: 'home-action' + if expanded then ' open' else '' },
      div className: 'btn-wrapper',
        div className: 'btn-group',
          a
            className: 'perform-action btn'
            onClick: _.bind @props.displayViewAction, @, ref.action, null
          ,
            div className: 'btn-label', ref.name
              if ref.displayType is 'Expanded'
                a className: 'toggle-expand btn', onClick: @_toggleExpanded,
                  BootstrapIcon { icon }

      if ref.displayType is 'Expanded'
        ExpandableActionContainer
          factory: @props.factory
          action: ref.action
          displayViewAction: @props.displayViewAction

ExpandableActionContainer = React.createClass
  displayName: 'ExpandableActionContainer'

  propTypes:
    factory: React.PropTypes.object.isRequired
    action: React.PropTypes.object.isRequired
    displayViewAction: React.PropTypes.func.isRequired

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

    window.addEventListener 'resize', @_resize

  componentWillUnmount: ->
    @state.controller?.gc()
    window.removeEventListener 'resize', @_resize

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

    @props.displayViewAction action, controller

  _resize: ->
    @refs.data?.resize()

module.exports = StartCenter
