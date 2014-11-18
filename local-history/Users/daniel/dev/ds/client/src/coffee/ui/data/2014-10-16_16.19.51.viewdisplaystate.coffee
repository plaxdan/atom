ActionDataPane = require './actiondatapane'
DisplayStateInfo = require './displaystateinfo'
RelationshipsPane = require './relationshipspane'
SearchPane = require './searchpane'

Drawer = require '../widgets/drawer'
BootstrapDropdown = require '../widgets/bootstrapdropdown'
BootstrapIcon = require '../widgets/bootstrapicon'

{ div, ul, li } = React.DOM
{ classSet } = React.addons
a = require '../widgets/anchor'

ViewDisplayState = React.createClass
  displayName: 'ViewDisplayState'

  propTypes:
    factory: React.PropTypes.object.isRequired
    controller: React.PropTypes.object.isRequired
    searchVisible: React.PropTypes.bool
    toggleSearch: React.PropTypes.func.isRequired

  getInitialState: ->
    relationshipsExpanded: true

  componentWillMount: ->
    @_boundUpdate = _.debounce (_.bind @forceUpdate, @, null), 100

    @props.controller.bindDisplayInterface @
    @props.controller.on 'all', @_boundUpdate

  componentDidMount: ->
    activeState = @props.controller.activeState()
    if (activeState.get 'action').displayMode in [ 'filter', 'search' ]
      @props.toggleSearch true
    else if not (activeState.get 'query').isFetching and
        (activeState.get 'query.dataSet').totalRecordCount is undefined
      @props.controller.fetchQuery showWait: true

  componentWillUnmount: ->
    @props.controller.off 'all', @_boundUpdate

  render: ->
    { factory, controller } = @props
    rootState = controller.rootState()
    activeState = controller.activeState()
    rootState = controller.rootState()

    expanded = activeState.get 'expanded'
    expandedPromise = expanded?.resolve?
    if expanded
      displayMode = 'record'
    else
      displayMode = activeState.displayMode()
      displayMode = 'grid' if displayMode in [ 'filter', 'search' ]

    selected = activeState.selectedRecord()
    canCreate = activeState.canInsert and not expanded
    if selected and expanded and not expandedPromise
      canReset = selected.modification?
      canDelete = activeState.canDelete and not selected.isInsert() and
        not selected.isDelete()

    # collapse side pane for empty dataset
    relationshipsExpanded = if activeState isnt rootState or
        (selected and (not expandedPromise or rootState.childRelationships?.length))
      @state.relationshipsExpanded
    else
      false

    hideSearch = _.bind @props.toggleSearch, @, false

    bound = {}
    for key in [
      'activateState'
      'performAction'
      'performCommand'
      'createRecord'
      'resetRecord'
      'deleteRecord'
    ]
      bound[key] = _.compose hideSearch, _.bind controller[key], controller

    iface = controller.displayInterface

    SearchContainer
      factory: factory
      controller: controller
      searchVisible: @props.searchVisible
      directActions: rootState.directActions
      toggleSearch: @props.toggleSearch
      fetchQuery: @_fetchRootQuery
      performAction: @_performRootAction
    ,
      RelationshipsContainer
        factory: factory
        controller: controller
        relationshipsExpanded: relationshipsExpanded
        toggleRelationships: @_toggleRelationships
        toggleExpanded: @_toggleExpanded
        performAction: bound.performAction
      ,
        DataColumn
          factory: factory
          controller: controller
          relationshipsExpanded: relationshipsExpanded
          displayMode: displayMode
          toggleSearch: @props.toggleSearch
          toggleRelationships: @_toggleRelationships
          toggleExpanded: @_toggleExpanded
          activateState: bound.activateState
          collapseSelected: _.bind iface.collapseSelected, iface
          performCommand: bound.performCommand
          createRecord: bound.createRecord if canCreate
          resetRecord: bound.resetRecord if canReset
          deleteRecord: bound.deleteRecord if canDelete

  _toggleRelationships: (explicit) ->
    activeState = @props.controller.activeState()
    newExpanded = if _.isBoolean explicit
      explicit
    else
      not @state.relationshipsExpanded
    @setState relationshipsExpanded: newExpanded
    @forceUpdate()

    @props.toggleSearch false if newExpanded

  _toggleExpanded: (explicit, options) ->
    activeState = @props.controller.activeState()
    current = activeState.get 'expanded'
    newVisible = if _.isBoolean explicit then explicit else not current

    if current?.resolve? and not newVisible
      @props.controller.displayInterface.collapseSelected options.accept
    else
      activeState.set expanded: newVisible
      @forceUpdate()

  _fetchRootQuery: ->
    { controller } = @props
    controller.activateState controller.rootState()
    controller.fetchQuery showWait: true
    @props.toggleSearch false

  _performRootAction: (action) ->
    { controller } = @props
    controller.activateState controller.rootState()
    (Promise.resolve controller.performAction action)
      .done =>
        unless controller.activeState().displayMode() in [ 'filter', 'search' ]
          @props.toggleSearch false

SectionColumn = React.createClass
  displayName: 'SectionColumn'

  propTypes:
    className: React.PropTypes.string.isRequired
    title: React.PropTypes.oneOfType [
      React.PropTypes.string
      React.PropTypes.component
    ]
    rightActions: React.PropTypes.array
    leftActions: React.PropTypes.array
    scrollable: React.PropTypes.bool

  getDefaultProps: ->
    scrollable: true

  render: ->
    div className: @props.className,
      div className: 'section-header',
        if @props.rightActions?.length
          ul className: 'nav nav-pills pull-right',
            for item, index in _.compact @props.rightActions
              @renderMenuItem item

        if @props.leftActions?.length
          ul className: 'nav nav-pills pull-left',
            for item, index in _.compact @props.leftActions
              @renderMenuItem item

        @props.title if @props.title

      div
        className: classSet
          'section-body': true
          scrollable: @props.scrollable
      , @props.children

  renderMenuItem: (item) ->
    key = item.title or item.label

    if item.menuItems
      BootstrapDropdown
        key: key
        containerClass: item.className
        triggerTag: a
        menuItems: item.menuItems
        onClick: item.onClick
      ,
        BootstrapIcon item
    else
      li key: key, className: item.className,
        a onClick: item.onClick,
          BootstrapIcon item

SearchContainer = React.createClass
  displayName: 'SearchContainer'

  propTypes:
    factory: React.PropTypes.object.isRequired
    controller: React.PropTypes.object.isRequired
    searchVisible: React.PropTypes.bool
    directActions: React.PropTypes.array
    toggleSearch: React.PropTypes.func.isRequired
    performAction: React.PropTypes.func.isRequired
    fetchQuery: React.PropTypes.func.isRequired

  getDefaultProps: ->
    floatPivot: 0

  render: ->
    Drawer
      className: 'view-display-state search-drawer slide'
      open: @props.searchVisible
      floatPivot: @props.floatPivot
      drawerContent: @renderSearchColumn()
      closeDrawer: @_closeSearch
    ,
      @props.children

  renderSearchColumn: ->
    SectionColumn
      className: 'search-column section-column'
      leftActions: [
        { icon: 'icon-reply', label: 'Search', onClick: @props.fetchQuery }
      ]
      rightActions: [
        # pull-right is to get the menu aligned on the right
        {
          icon: 'icon-search'
          className: 'pull-right'
          title: 'Toggle Search'
          onClick: @_closeSearch
        }
        {
          icon: 'icon-chevron-down'
          className: 'pull-right'
          title: 'DefaultActions'
          menuItems: _.pluck @props.directActions, 'name'
          onClick: @props.performAction
        }
      ]
    ,
      SearchPane
        factory: @props.factory
        controller: @props.controller
        fetchQuery: @props.fetchQuery

  _closeSearch: ->
    @props.toggleSearch false

RelationshipsContainer = React.createClass
  displayName: 'RelationshipsContainer'

  propTypes:
    factory: React.PropTypes.object.isRequired
    relationshipsExpanded: React.PropTypes.bool
    toggleRelationships: React.PropTypes.func.isRequired
    toggleExpanded: React.PropTypes.func.isRequired
    performAction: React.PropTypes.func.isRequired

  getDefaultProps: ->
    floatPivot: 481

  render: ->
    Drawer
      className: 'relationships-drawer slide'
      open: @props.relationshipsExpanded
      floatPivot: @props.floatPivot
      drawerContent: @renderRelationshipsColumn()
      closeDrawer: @_closeRelationships
    ,
      @props.children

  renderRelationshipsColumn: ->
    SectionColumn
      className: 'relationships-column section-column'
      rightActions: [
        {
          icon: 'icon-link'
          className: 'toggle'
          title: 'Toggle Relationships'
          onClick: @props.toggleRelationships
        }
      ]
    ,
      RelationshipsPane
        controller: @props.controller
        expanded: @props.relationshipsExpanded
        performAction: @props.performAction
        toggleExpanded: @props.toggleExpanded

  _closeRelationships: ->
    @props.toggleRelationships false

DataColumn = React.createClass
  displayName: 'DataColumn'

  propTypes:
    relationshipsExpanded: React.PropTypes.bool
    factory: React.PropTypes.object.isRequired
    controller: React.PropTypes.object.isRequired
    displayMode: React.PropTypes.string.isRequired
    toggleSearch: React.PropTypes.func.isRequired
    toggleRelationships: React.PropTypes.func.isRequired
    toggleExpanded: React.PropTypes.func.isRequired
    activateState: React.PropTypes.func.isRequired
    collapseSelected: React.PropTypes.func.isRequired
    performCommand: React.PropTypes.func.isRequired
    createRecord: React.PropTypes.func
    resetRecord: React.PropTypes.func
    deleteRecord: React.PropTypes.func

  componentWillMount: ->
    $(window).on 'resize', @resize

  componentDidMount: ->
    @resize()

  componentDidUpdate: ->
    # the pane sizes use CSS transitions to animate the drawers sliding in
    # and out. we need to wait for that to complete before actually resizing
    _.delay ( => @resize() ), 250

  render: ->
    activeState = @props.controller.activeState()
    expanded = activeState.get 'expanded'
    expandedPromise = (activeState.get 'expanded')?.resolve?

    isFetching = (activeState.get 'query').isFetching

    showRelationships = not @props.relationshipsExpanded and
      ( activeState.childRelationships?.length or @props.controller.stack.length > 1 )

    if expanded
      acceptCollapse = _.bind @props.collapseSelected, @, true
      cancelCollapse = _.bind @props.collapseSelected, @, false

    SectionColumn
      className: 'data-column section-column'
      title:
        DisplayStateInfo
          controller: @props.controller
          activateState: @props.activateState
          toggleExpanded: @props.toggleExpanded
          performCommand: @props.performCommand
          refreshQuery: @_refreshQuery
          fetchQuery: @props.performCommand
          createRecord: @props.createRecord
          resetRecord: @props.resetRecord
          deleteRecord: @props.deleteRecord
      leftActions: [
        {
          icon: 'icon-ok'
          title: 'Done'
          className: 'accept'
          onClick: acceptCollapse
        } if expanded
      ]
      rightActions: [
        {
          icon: 'icon-remove'
          title: 'Cancel'
          className: 'cancel'
          onClick: cancelCollapse
        } if expandedPromise
        {
          icon: 'icon-link'
          title: 'Toggle Relationships'
          onClick: @props.toggleRelationships
        } if showRelationships
      ]
    ,
      ActionDataPane
        ref: 'pane'
        factory: @props.factory
        controller: @props.controller
        displayMode: @props.displayMode
        expandSelected: _.bind @props.toggleExpanded, @, true
        collapseSelected: _.bind @props.toggleExpanded, @, false

  resize: ->
    # certain data panes (grid, etc) need to be informed of size changes
    pane = @refs?.pane
    return unless @isMounted() and pane

    # get current window height - need to scale it in cases the body
    # is zoomed
    maxHeight = ($ window).height()
    # maxHeight /= BaseView.pageZoom()
    maxHeight -= ($ pane.getDOMNode()).position().top
    maxHeight -= ($ '.navbar-fixed-top').height()

    pane.resize { maxHeight, fill: true }

  _refreshQuery: ->
    @props.controller.fetchQuery bypassCache: true, showWait: true
    @props.toggleSearch false

module.exports = ViewDisplayState
