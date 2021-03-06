# Display State Controller
#
# Manager object for dealing with ViewDisplayState objects. A primary goal of
# this controller is to consolidate the various events fired by the state
# object and it's properties into a more consistent set that is easier to
# consume from a view. The following events are fired by the controller, both
# on the individual display state associated with the event and at the
# controller depending on what the listener is interested in
#   fetch:begin - the data controller has started fetching data for the current
#     query
#   fetch:end - the current fetch has succeeded
#   fetch:error - the current fetch has failed
#     have changed
#   change:selection - the selected index in the current dataset has changed
#   change:actions - the active custom actions have changed
#   change:records - the set of records in the dataset has changed
#   modified:record - a record within the dataset was modified
#   modified:selected - the selected record in the dataset was modified
#   validate:success - the current state was successfully validated
#   validate:fail - the current state failed validation
Backbone = require 'backbone'
EventHandler = require '../event/eventhandler'
EventRegistry = require '../event/eventregistry'
ExpressionEvaluator = require '../expressions/expressionevaluator'

class DisplayStateController
  # mixin event functionality
  _.extend @::, Backbone.Events

  events:
    'recordCreated pubSub': '_onRecordCreated'
    'recordModified pubSub': '_onRecordModified'
    'recordRemoved pubSub': '_onRecordRemoved'

  # these get bound to each state in our stack
  stateEvents:
    'change:selectedIndex': '_onSelectionChange'
    'change:query': '_onChangeQuery'
    'fetchQuery query': '_onFetchQuery'
    'fetchError query': '_onFetchError'
    'reset query.dataSet': '_onResetData'

  constructor: (stack, @factory, options) ->
    @cid = _.uniqueId 'controller'

    # stack of display state objects within the controller
    if _.isArray stack
      @stack = stack
    else
      @stack = [ stack ]

    # for event binding above
    @pubSub = @factory.pubSub

    if options?.explicitAttributes
      @_explicitAttributes = options.explicitAttributes

    @_bindEvents()
    @forceUpdate()

    if DEBUG
      @.on 'all', (eventName) ->
        eventArgs = Array::slice.call arguments, 1
        log = "DisplayStateController.trigger '#{eventName}'"
        console.log log, eventArgs

  # shortcuts to accessing state objects for the root model
  rootState: -> @stack[0]
  rootView: -> @rootState().get 'view'
  rootQuery: -> @rootState().get 'query'
  rootDataSet: -> @rootState().get 'query.dataSet'

  # shortcuts to accessing state objects for the active model
  activeState: -> @stack[@stack.length - 1]
  activeView: -> @activeState().get 'view'
  activeQuery: -> @activeState().get 'query'
  activeDataSet: -> @activeState().get 'query.dataSet'

  # force an update from the current context - this will reevaluate the
  # current conditions, actions, etc
  forceUpdate: (options) ->
    state = options?.state or @activeState()
    @_onSelectionChange state

  # inhibit generating events during the processing of a task
  inhibitEvents: (task) ->
    @_inhibitEvents = true
    done = =>
      @_inhibitEvents = false
      @_triggerStateEvent @activeState(), 'change:records'
    task.then done, done

  # find state(s) from the current stack that match a particular set of
  # parameters. options can include cid, query, dataSet, record, or view
  # properties
  findState: (options) ->
    (@findStates options)[0]

  findStates: (options) ->
    list = []
    for state in @stack
      if options.cid? and options.cid is state.cid
        list.push state

      query = state.get 'query'
      if options.query? and options.query is query
        list.push state
      else if options.dataSet? and options.dataSet is query.dataSet
        list.push state
      else if options.record?.view is (state.get 'view') and
        (query.dataSet.indexOf options.record) >= 0
          list.push state
      else if options.view is state.get 'view'
          list.push state

    list

  # gets the list of fields that are currently visible in the display. results
  # are provided through a Deferred interface to allow the list to be built as
  # needed
  getVisibleFields: (options) ->
    state = options?.state or @activeState()
    mode = options?.displayMode or 'grid'

    # set the field list to the deferred initially so multiple requests will
    # resolve together
    cm = @factory.configurationManager
    context = @eventContext { state }

    cm.getFieldsWithPermission (state.get 'view'),
      'FieldVisible', { context }

  # creates an event context representing the current display state
  eventContext: (options) ->
    contextOptions = if options?.record
      record: options.record
    else
      state = options?.state or @activeState()
      { state }

    context = @factory.eventFactory.context contextOptions

    # try to inject the parent view name as an attribute
    parent = @parentState state
    context.getExplicitAttributes()['DS_PARENT_VIEW'] = if parent
      (parent.get 'view').viewName()
    else
      ''

    if @_explicitAttributes
      context.setAttributes @_explicitAttributes, explicitOnly: true

    context

  # creates a binding object for a field value to the selected record in the
  # associated display state. this pattern is used by input controls, forms,
  # etc to move data in and out of the record
  createRecordBinding: (fieldName, options) ->
    state = options?.state or @activeState()
    view = state.get 'view'

    binding =
      key: fieldName
      get: ->
        # don't display anything unless the record cache is built
        record = state.selectedRecord()
        if record?.displayCache
          (record.get 'values')[view.fieldIndex fieldName]

        else
          ''

      set: (value, options) =>
        # bing - need to get validation/cleaning back
        record = state.selectedRecord()
        if record
          context = @eventContext { state }
          if options?.attributes
            context.setAttributes options.attributes, explicitOnly: true
          record.setValue fieldName, value, { context }

      attrs: =>
        record = state.selectedRecord()
        if ( _.isFunction record?.displayCache?.editable )
          enabled: not record.isDelete() and
            'Guid' isnt (view.getField fieldName)?.dataType and
            record.displayCache.editable fieldName
          cssClass: if record.isModified fieldName then 'modified'

        else
          enabled: false

      context: => @eventContext { state }

  # returns the parent display state in the current controller stack
  parentState: (state) ->
    for test in @stack
      if test is state
        return prev
      else
        prev = test
    null

  replaceActiveState: (state) ->
    @stack.pop()
    @stack.push state
    @_bindEvents()

  pushChildState: (childState, options) ->
    @stack.push childState
    @_bindEvents()

    @trigger 'stack:push', childState unless options?.silent
    childState

  popChildState: (options) ->
    # can't pop the root state
    if @stack.length <= 1
      throw new Error 'Root state cannot be reset'
    oldChild = @stack.pop()
    @_bindEvents()

    @trigger 'stack:pop', oldChild unless options?.silent
    oldChild

  activateState: (key) ->
    ($.when @validate()).done =>
      while true
        activeState = @activeState()
        break if key is activeState or key is activeState.cid

        @popChildState()

  # validates the current state, displaying errors and messages as needed
  # returns a Deferred
  validate: (options) ->
    @_commitCurrentEdit()

    if @_modalController
      @_modalController.validate()
    else
      state = options?.state or @activeState()
      record = options?.record or state.selectedRecord()
      context = options?.context or @eventContext { state, record }
      if record
        mh = @factory.modificationHandler
        $.when mh.verifyRecord record, { context }
          .done =>
            @_triggerStateEvent state, 'validate:success', { record }
          .fail =>
            @_triggerStateEvent state, 'validate:fail', { record }

  # updates the current dataset results
  fetchQuery: (options) ->
    $.when(@validate()).done =>
      state = options?.state or @activeState()
      (state.get 'query').fetch _.extend { context: @eventContext() }, options

  editSelected: (options) ->
    options or= {}

    # provide result information to caller through a promise if possible
    {promise} = options

    state = options.state or @activeState()

    selected = state.get 'selectedField'
    field = (state.get 'view').getField selected
    unless field?
      promise?.reject()
    else
      # create a behavior and binding objects that we can edit the selected
      # field
      behavior = @factory.inputFactory.createFieldBehavior field,
        record: state.selectedRecord()
      binding = @createRecordBinding selected, { state }

      actions = behavior.getEnabledActions binding
      # actions = _.result behavior, 'actions'
      if actions.length
        actions[0].callback binding, @factory, { promise }
      else
        # no actions to edit the field, return success since it is currently
        # active in the display
        promise?.resolve()

  # edits a record interactively
  interactiveEdit: (options) ->
    editPromise = new $.Deferred

    state = options?.state or @activeState()
    record = state.selectedRecord()

    # hide the wait if we're inside an action or event
    @factory.pubSub.trigger 'inhibitWait', true
    restore = => @factory.pubSub.trigger 'inhibitWait', false
    editPromise.then restore, restore

    $.when(@factory.configurationManager.updateRecordDisplayCache record)
      .done =>
        # set the promise as the expanded property - resolving or rejecting
        # it will collapse the record
        state.set expanded: editPromise

        @_triggerStateEvent state, 'change:displayMode'

    editPromise

  # performs a command within the current view, which can either be a
  # navigation action or custom event
  performCommand: (key, options) ->
    state = options?.state or @activeState()

    @factory.pubSub.trigger 'showWait'

    # see if this is a navigation action in the view
    action = (state.get 'view').getNavigationAction key
    p = if action
      @performAction action, options

    # otherwise assume this is a custom event and fire it
    else
      @customEvent key, options

    hideWait = => @factory.pubSub.trigger 'hideWait'
    p.then hideWait, hideWait

  customEvent: (event, options) ->
    @_commitCurrentEdit()

    context = if options?.context
      options.context
    else
      state = options?.state or @activeState()
      @eventContext { state }

    # there is no default handler for custom events
    identifier = EventRegistry.formatIdentifier EventRegistry.Custom, event
    $.when(@factory.eventFactory.execute identifier, context)
      # update everything after the action has been processed
      .done => @_updateFromContext options

  gc: ->
    @_unbindEvents()

  # bing - would be nice to consolidate this as a mixin with the same
  # functionality in BaseViews, etc
  _bindEvents: ->
    @_unbindEvents() if @_eventBindings

    @_eventBindings = []
    for key, value of @events
      [m, selector, target] = key.match /([^ ]*) ([^ ]*)/

      target = _.result @, target
      callback = _.bind @[value], @
      target.on selector, callback

      # store the mapping so we can gc
      @_eventBindings.push { target, selector, callback }

    for key, value of @stateEvents
      [m, selector, m2, prop] = key.match /([^ ]*)( ([^ ]*))?/

      callback = _.bind @[value], @
      for state in @stack
        target = if prop then (state.get prop) else state
        target.on selector, callback

        # store the mapping so we can gc
        @_eventBindings.push { target, selector, callback }

  _unbindEvents: ->
    if @_eventBindings
      for binding in @_eventBindings
        binding.target.off binding.selector, binding.callback

    delete @_eventBindings

  _commitCurrentEdit: ->
    @pubSub.trigger 'commitCurrentEdit'
    Slick.GlobalEditorLock.commitCurrentEdit()

  _onChangeQuery: (state) ->
    # rebind events when the underlying query and dataset change
    @_bindEvents()

    # trigger a data reset event if the data is already resolve, otherwise
    # reset should get fired at some point
    ds = state.get 'query.dataSet'
    @_onResetData ds if ds.totalRecordCount?

  _onFetchQuery: (query) ->
    state = @findState { query }
    @_triggerStateEvent state, 'fetch:begin'

  _onFetchError: (query, error) ->
    # trigger error and end
    state = @findState { query }
    @_triggerStateEvent state, 'fetch:error', error
    @_triggerStateEvent state, 'fetch:end'

  _onResetData: (dataSet) ->
    state = @findState { dataSet }
    @_triggerStateEvent state, 'fetch:end'

    # select the first record in the dataset if needed
    total = (state.get 'query.dataSet').totalRecordCount
    selected = state.get 'selectedIndex'
    change = if total is 0
      state.set 'selectedIndex', null, silent: true
    else if not selected or selected >= total
      # pass silent and so we only trigger the selection change event once
      state.set 'selectedIndex', 0, silent: true

    (@_updateFromContext { state }).done =>
      @_triggerStateEvent state, 'change:records'

  _onRecordCreated: (record) ->
    # it's possible the record is contained in multiple states within our stack
    states = @findStates { record }
    for state in states
      @_triggerStateEvent state, 'change:records'

  _onRecordModified: (record) ->
    # it's possible the record is contained in multiple states within our stack
    states = @findStates { record }
    for state in states
      # this allows the dataset to be informed of record changes. storage
      # adapters aren't guaranteed to produce the same record each time, so
      # it's possible the dataset has an different object cached
      (state.get 'query.dataSet').update record

      (@_updateFromContext { state }).done =>
        @_triggerStateEvent state, 'modified:record', record
        if record is state.selectedRecord()
          @_triggerStateEvent state, 'modified:selected', record

  _onRecordRemoved: (record) ->
    # it's possible the record is contained in multiple states within our stack
    states = @findStates { record }
    for state in states
      ds = state.get 'query.dataSet'
      ds.remove record, updateCount: true

      # keep the selected index within the dataset bounds
      selected = state.get 'selectedIndex'
      count = ds.models.length
      if selected >= count
        state.set 'selectedIndex', if count > 0 then count - 1 else null

      @_triggerStateEvent state, 'change:records'

  _onSelectionChange: (state) ->
    previous = state.previous 'selectedIndex'
    if previous? and previous isnt state.get 'selectedIndex'
      # override the record to validate
      record = (state.get 'query.dataSet').get previous
      @validate { record }

    (@_updateFromContext { state }).done =>
      @_triggerStateEvent state, 'change:selection'

  _updateFromContext: (options) ->
    context = @eventContext options

    # create a promise that can be used to determine when the state is updated
    promise = new $.Deferred
    @updated = promise
    $.when(
      (@_updateDescription context),
      (@_updateCustomActions context),
      (@_updateChildViews context)
    ).always =>
      promise.resolve()
      @updated = true

      @_triggerStateEvent context.state, 'context:updated'

  _updateDescription: (context) ->
    cm = @factory.configurationManager

    state = context.state
    state.selectedDescription = ''
    selected = state.selectedRecord()
    if selected
      $.when(cm.getRecordDescription selected, { context })
        .done (description) ->
          state.selectedDescription = description

  _updateCustomActions: (context) ->
    map =
      direct: []
      common: []
      footer: []
      custom: []

    state = context.state
    options =
      view: state.get 'view'
      record: state.selectedRecord()
      context: context
    cm = @factory.configurationManager
    $.when(
      (cm.getNavigationActions 'HomeScreenActions', options),
      (cm.getNavigationActions 'NavigationMenuActions', options)
    ).done (homeActions, menuActions) =>
      for ref in homeActions
        map.direct.push ref

      add = (array, item) ->
        if item.category
          category = _.find array, (test) -> test.name is item.category
          if category
            # add to the category list
            array = category.list
          else
            array.push
              name: item.category
              list: [ item ]

            return

        # only add to the array if the action is not already in the list
        array.push item unless _.some array, (test) -> test.name is item.name

      for ref in menuActions
        # split actions into different collections based on the properties
        if ref.displayType is 'Common'
          add map.common, ref
        else if ref.displayType is 'Footer'
          add map.footer, ref
        else if ref.action?.query?.target is options.view.id
          add map.direct, ref
        else
          add map.custom, ref

      # only trigger the event if something actually changed
      changed = false
      for key, list of map
        unless _.isEqual list, state[key + 'Actions']
          state[key + 'Actions'] = list
          changed = true

      @_triggerStateEvent state, 'change:actions' if changed

  _updateChildViews: (context) ->
    state = context.state
    record = state.selectedRecord()
    $.when(@factory.configurationManager.getChildViews { record, context })
      .done (children) =>
        relationships = _.filter children, (test) ->
          test.displayType isnt 'Inline'
        inline = _.filter children, (test) ->
          test.displayType is 'Inline'
        unless _.isEqual relationships, state.childRelationships
          state.childRelationships = relationships
          changed = true
        unless _.isEqual inline, state.inlineChildren
          state.inlineChildren = inline
          changed = true
        @_triggerStateEvent state, 'change:children' if changed

  _triggerStateEvent: (state, event, args) ->
    return if @_inhibitEvents
    # first trigger the event on the individual state
    state.trigger event, args

    # next trigger the event for the controller, and inject the state as the
    # first parameter
    @trigger event, state, args

module.exports = DisplayStateController
