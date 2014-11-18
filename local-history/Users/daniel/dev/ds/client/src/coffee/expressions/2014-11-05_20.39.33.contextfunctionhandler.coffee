# Context Function Handler
#
# exposes functions to the expression environment that require access to the
# basic DataSplice environment

# functions that interact with the user interface require a displayInterface
# property in the context with the following signature:
#
#  # returns the current data display mode
#  displayMode: ->
#
#  # returns whether the active display is within a modal prompt
#  isModal: ->
#
#  # provides access to the ViewDisplayState stack in the display
#  activeState: ->
#  parentState: ->
#
#  # executes a view action or custom event in the current state
#  performCommand: (key, options) ->
#  performAction: (command, options) ->
#
#  # toggles or sets the visibility of the search pane
#  toggleSearch: (explicit) ->
#
#  # toggles or sets the visibility of the relationships pane
#  toggleRelationships: (explicit) ->
#
#  # collapses the specified pane (or the active one if pane is null)
#  collapsePane: (name) ->
#
#  # sets the active display mode
#  setDisplayMode: (mode) ->
#
#  # refreshes the current data set
#  fetchQuery: (options) ->
#
#  # selects a record in the current data set. key can be a record id or
#  # index. 'options.relative = true' can be provided for numeric keys
#  selectRecord: (key, options) ->
#
#  # highlights/edits a particular field in the selected record
#  selectField: (field) ->
#  editField: (field) ->
#
#  # displays the active record in a modal display
#  # returns a promise that resolves when the edit is complete
#  modalEditRecord: ->
#
#  # creates a new record and edits it interactively
#  # options should specify state and values properties
#  createRecord: (options) ->
ExpressionFunctionHandler = require './expressionfunctionhandler'
ExpressionEvaluator = require './expressionevaluator'
Session = require '../models/session'
FilterItem = require '../models/filteritem'
EventRegistry = require '../event/eventregistry'
ModalDialog = require '../ui/feedback/modaldialog'
DataTypeHelper = require '../utils/datatypehelper'

{ div, form, label, textarea }= React.DOM

ExpressionTestPrompt = React.createClass

  getInitialState: ->
    expression: ''
    alert: null

  mixins: [ React.addons.LinkedStateMixin ]
  render: ->
    ModalDialog (_.assign {}, @props,
      wantsReturn: true
      fullWidth: true
      title: 'Enter Test Expression'
      buttons: [ { label: 'Execute', class: 'btn-success' }, 'Close' ]
      validate: (results) =>
        if results.button is 'Execute'
          @props.factory.pubSub.trigger 'currentEventContext', (context) =>
            $.when(ExpressionEvaluator.evaluate @state.expression, {context})
              .done( (value) =>
                @setState alert: { message: value, severity: 'success' }
              )
              .fail (error) =>
                @setState alert: { message: error, severity: 'error' }

          # prevent dialog from closing when Execute is pressed
          false
    ),
      div {},
        form className: 'form-horizontal',
          div className: 'control-group',
            label className: 'control-label', 'Expression'
            div className: 'controls',
              textarea
                className: 'input-block-level'
                rows: 5
                valueLink: @linkState 'expression'

        if @state.alert
          div className: "alert alert-#{@state.alert.severity}",
            String @state.alert.message
            if @state.alert.severity is 'success'
              " (#{typeof @state.alert.message})"

class ContextFunctionHandler extends ExpressionFunctionHandler
  constructor: (@intents, @factory) ->
    super

    # hook F2 and display a prompt that let's you test expressions to see
    # what they evalutate to in the current context
    $(window).on 'keyup', (ev) =>
      if ev.which is 113 # F2
        @factory.pubSub.trigger 'displayModal',
          ExpressionTestPrompt { @factory }

    # register standard functions
    @registerFunction name for name in [
      'getLocale'
      'getUserName'
      'getUserDomain'
      'hasRole'
      'isGroupMember'
      'isInsert'
      'isUpdate'
      'isDelete'
      'isModified'
      'originalValue'
      'getSelectedField'
      'getViewName'
      'getViewIdentifier'
      'getQueryName'
      'isPopup'
      'isServer'
      'isHandheld'
      'isHtml5'
      'isCordova'
      'isCef'
      'hasPlugin'
      'isConnected'
      'displayMode'
      'parentValue'
    ]

    # bing - need to only allow functions with side effects when called
    # appropriately
    @registerFunction 'customEvent', async: true, sideEffects: true
    @registerFunction 'performAction', async: true, sideEffects: true
    @registerFunction 'collapsePane', sideEffects: true
    @registerFunction 'toggleSearch', sideEffects: true
    @registerFunction 'toggleRelationships', sideEffects: true
    @registerFunction 'setDisplayMode', sideEffects: true
    @registerFunction 'recordCount', sideEffects: true
    @registerFunction 'selectedRecordCount', sideEffects: true
    @registerFunction 'recordIndex', sideEffects: true
    @registerFunction 'findRecord', async: true, sideEffects: true
    @registerFunction 'moveNext', async: true, sideEffects: true
    @registerFunction 'movePrevious', async: true, sideEffects: true
    @registerFunction 'selectRecord', async: true, sideEffects: true
    @registerFunction 'selectField', async: true, sideEffects: true
    @registerFunction 'editField', async: true, sideEffects: true
    @registerFunction 'dataSync', sideEffects: true
    @registerFunction 'commit', async: true, sideEffects: true
    @registerFunction 'logOut', async: true, sideEffects: true
    @registerFunction 'connect', async: true, sideEffects: true
    @registerFunction 'disconnect', async: true, sideEffects: true
    @registerFunction 'lockSession', sideEffects: true
    @registerFunction 'homeScreen', sideEffects: true
    @registerFunction 'openUrl', sideEffects: true

    # this sucks and needs to go away
    @registerFunction 'pubSub', sideEffects: true

    # data oriented functions are asynchronous
    @registerFunction 'verifyRecord', async: true
    @registerFunction 'resetRecord', async: true
    @registerFunction 'createRecord', async: true
    @registerFunction 'deleteRecord', async: true
    @registerFunction 'refresh'
    @registerFunction 'query', async: true
    @registerFunction 'localQuery', async: true
    @registerFunction 'count', async: true
    @registerFunction 'localCount', async: true
    @registerFunction 'sum', async: true
    @registerFunction 'localSum', async: true
    @registerFunction 'list', async: true
    @registerFunction 'localList', async: true

    # misc functions
    @registerFunction 'getGeoPosition', async: true

  getLocale: ->
    @factory.dsApp.getLocale()

  getUserName: ->
    @factory.session?.userName()

  getUserDomain: ->
    @factory.session?.authDomain()

  hasRole: (values) ->
    test = values[0]
    roles = @factory.session.get 'roles'
    if roles
      for role in roles
        # the value passed is either a fully qualified identifier or just the
        # name
        if test is role or test is (Session.parseUserIdentifier role).name
          return true

    false

  isGroupMember: (values) ->
    # bing:deprecated - use hasRole instead
    @hasRole values

  isInsert: (values, options) ->
    @_isEventType options, 'insert'
  isUpdate: (values, options) ->
    @_isEventType options, 'update'
  isDelete: (values, options) ->
    @_isEventType options, 'delete'

  _isEventType: (options, event) ->
    # lots of uncertainty here... :)
    record = options.context?.record
    (record?.modification?.get 'eventType') is event

  isModified: (values, options) ->
    record = options.context?.record
    if record?.modification
      fieldName = values[0]
      changes = record.modification.get 'modifications'
      changes.hasOwnProperty fieldName
    else
      false

  originalValue: (values, options) ->
    record = options.context?.record
    return null unless record

    fieldName = values[0]
    if record.modification?
      (record.modification.get 'originalValues')[fieldName]
    else
      record.getValue fieldName

  getSelectedField: ->
    console.debug 'ContextFunctionHandler.getSelectedField', arguments

  getViewName: (values, options) ->
    options.context.view?.viewName()

  getViewIdentifier: (values, options) ->
    options.context.view?.id

  getQueryName: (values, options) ->
    options.context.state?.title()

  isPopup: (values, options) ->
    iface = options.context.displayInterface
    if iface
      !!iface.isModal()
    else
      false

  isServer: -> false
  isHandheld: -> false
  isHtml5: -> true
  isCordova: -> window.cordova?
  isCef: -> window.cef?

  # bing - what do we want to do here?
  hasPlugin: -> false

  isConnected: ->
    @factory.connectionManager.isConnected()

  displayMode: (values, options) ->
    iface = options.context.displayInterface
    iface.displayMode() if iface

  parentValue: (values, options) ->
    iface = @_assertDisplayInterface options

    parent = iface.parentState()
    if parent
      parent.selectedRecord()?.getValue values[0]
    else
      null

  customEvent: (values, options) ->
    ef = @factory.eventFactory

    if values[1]
      view = (@factory.session.get 'views').get values[1]
      unless view?
        throw new Error "Invalid view: #{values[1]}"

      controller = options.context.displayInterface?.controller
      state = controller?.findState { view }
      if state
        context = controller.eventContext { state }
      else
        context = ef.context { view }
        context.displayInterface = options.context.displayInterface
        _.extend context.getExplicitAttributes(),
          options.context.getExplicitAttributes()
    else
      context = options.context

    # fire a custom event with the identifier, the factory will find the
    # appropriate definition (from a view, role, etc) and execute that
    # pass silent option to the handler to keep it from displaying an error
    # message, instead it should just get passed up the chain
    identifier = EventRegistry.formatIdentifier EventRegistry.Custom, values[0]
    $.when(ef.execute identifier, context, null, silent: true)
      .done( -> options.complete true )
      .fail options.error

  performAction: (values, options) ->
    action = options.context.view?.getNavigationAction values[0]
    unless action?
      throw new Error "Invalid view action: #{values[0]}"

    iface = @_assertDisplayInterface options

    # the display interface triggers events within the data views that
    # handle the details of the action
    actionOptions =
      context: options.context
      state: options.context.state
      displayProps: values[1]
    $.when(iface.performAction action, actionOptions)
      .done( -> options.complete true )
      .fail options.error

  collapsePane: (values, options) ->
    iface = @_assertDisplayInterface options
    iface.collapsePane values[0]

  toggleSearch: (values, options) ->
    iface = @_assertDisplayInterface options
    iface.toggleSearch values[0]

  toggleRelationships: (values, options) ->
    iface = @_assertDisplayInterface options
    iface.toggleRelationships values[0]

  setDisplayMode: (values, options) ->
    iface = @_assertDisplayInterface options
    iface.setDisplayMode values[0]

  recordCount: (values, options) ->
    options.context.dataSet?.totalRecordCount

  selectedRecordCount: (values, options) ->
    iface = @_assertDisplayInterface options
    if iface.activeState().selectedRecord()? then 1 else 0

  recordIndex: (values, options) ->
    iface = @_assertDisplayInterface options
    iface.activeState().get 'selectedIndex'

  findRecord: (values, options) ->
    unless options.context.dataSet?.totalRecordCount > 0
      options.complete -1
      return

    filter = values[0]
    startIndex = values[1]

    query = @factory.dataController.createQuery options.context.view,
      filter: filter
      context: options.context

    # hook up events to listen for results
    query.dataSet.on 'reset', ->
      # collect the ids of the matching records
      matches = _.pluck query.dataSet.models, 'id'
      matches.sort()

      if matches.length
        # find the first record in the current data set that is in the
        # matches collection
        first = _.findIndex options.context.dataSet.models, (test, index) ->
          # skip initial records if requested
          return false if startIndex and index < startIndex

          (_.indexOf matches, test.id, true) >= 0

        options.complete first

      else
        options.complete -1

    query.on 'error', options.error

    # fetch the data that was requested
    query.fetch()

  moveNext: (values, options) ->
    @_doMove 1, true, options

  movePrevious: (values, options) ->
    @_doMove -1, true, options

  selectRecord: (values, options) ->
    @_doMove values[0], false, options

  _doMove: (delta, relative, options) ->
    iface = @_assertDisplayInterface options
    move = if relative then 'relative' else 'absolute'
    $.when(iface.selectRecord delta, { move })
      .done( ->
        # update the context to reference the newly selected record
        options.context.setRecord iface.activeState().selectedRecord()

        options.complete()
      )
      .fail options.error

  selectField: (values, options) ->
    iface = @_assertDisplayInterface options

    $.when(iface.selectField values[0])
      .done(options.complete)
      .fail(options.error)

  editField: (values, options) ->
    iface = @_assertDisplayInterface options

    $.when(iface.editField values[0], values[1])
      .done(options.complete)
      .fail(options.error)

  verifyRecord: (values, options) ->
    iface = options.context.displayInterface
    verify = if iface
      iface.validate context: options.context
    else
      record = options.context?.record
      if record
        @factory.modificationHandler.verifyRecord record
      else
        throw new Error 'No record available in the context'

    $.when(verify)
      .done(options.complete)
      .fail(options.error)

  resetRecord: (values, options) ->
    record = options.context?.record
    if record
      opts = context: options.context
      $.when(@factory.modificationHandler.resetRecord record, opts)
        .done( options.complete )
        .fail( options.error )
    else
      throw new Error 'No record available in the context'

  createRecord: (values, options) ->
    {context} = options

    ds = context.dataSet
    opts =
      context: context
      at: 1 + context.state.get 'selectedIndex'

    $.when(@factory.modificationHandler.createRecord ds, opts)
      .done (record) ->
        edit = if context.displayInterface?
          state = context.state
          pos = (state.get 'query.dataSet').indexOf record
          state.set 'selectedIndex', pos if pos?
          context.displayInterface.interactiveEdit { state }
        else
          true

        $.when(edit)
          .done ->
            # update the context to reference the newly created record
            context.setRecord state.selectedRecord()
            options.complete()
          .fail ->
            record.resetModifications()
            options.error()
      .fail options.error

  deleteRecord: (values, options) ->
    record = options.context?.record
    if record
      opts = context: options.context
      $.when(@factory.modificationHandler.markDeleted record, opts)
        .done( options.complete )
        .fail( options.error )
    else
      throw new Error 'No record available in the context'

  refresh: (values, options) ->
    iface = @_assertDisplayInterface options
    # bing - it would be better if this was asynchronous, but this works
    # around issues where 'refresh' is called while data is being modified
    # and the results don't reflect what is actually changing
    _.defer -> iface.fetchQuery bypassCache: true
    true

  dataSync: ->
    @factory.pubSub.trigger 'dataSync'
    true

  commit: (values, options) ->
    $.when(@factory.modificationHandler.commitChanges())
      .done( options.complete )
      .fail( options.error )

  logOut: (values, options) ->
    logoutOptions =
      promise: new $.Deferred

    # optional argument is to do a silent logout
    if(DataTypeHelper.coerceBoolean values[0])
      logoutOptions.force = true

    $.when(logoutOptions.promise)
      .done( options.complete )
      .fail( options.error )

    @factory.pubSub.trigger 'logOut', logoutOptions

  connect: (values, options) ->
    connectOpts = {}

    # optional argument is to do a silent connect
    if(DataTypeHelper.coerceBoolean values[0])
      connectOpts.silent = true

    silent = !!values[0]
    $.when(@factory.connectionManager.ensureConnected connectOpts)
      .done( options.complete )
      .fail (error) ->
        options.error if silent then null else error

  disconnect: (values, options) ->
    # bing - should we wait for this to actually complete?
    @factory.connectionManager.disconnect()
    options.complete()

  lockSession: (values, options) ->
    @factory.connectionManager.lockSession()
    true

  homeScreen: (values, options) ->
    @intents.navigate.home()
    true

  openUrl: (values, options) ->
    window.open values[0]

  pubSub: (values, options) ->
    # this is horrible
    $.when(ExpressionEvaluator.replaceReferences values[1],
      context: options.context
    ).done (replaced) =>
      _.defer =>
        @factory.pubSub.trigger values[0], replaced
    true

  query: (values, options) ->
    options or= {}

    options.viewName = values[0]
    options.fieldName = values[1]
    options.filterStatement = values[2]
    options.sortStatement = values[3]

    # only need one record returned here
    options.maxRecords = 1 unless options.list

    @_doQuery options

  localQuery: (values, options) ->
    options or= {}

    # set the local flag, otherwise this is the same as query
    options.local = true
    @query values, options

  count: (values, options) ->
    options or= {}

    options.viewName = values[0]
    options.filterStatement = values[1]

    options.count = true

    @_doQuery options

  localCount: (values, options) ->
    options or= {}

    # set the local flag, otherwise this is the same as count
    options.local = true
    @count values, options

  sum: (values, options) ->
    options or= {}

    options.viewName = values[0]
    options.fieldName = values[1]
    options.filterStatement = values[2]

    options.sum = true

    @_doQuery options

  localSum: (values, options) ->
    options or= {}

    # set the local flag, otherwise this is the same as sum
    options.local = true
    @sum values, options

  list: (values, options) ->
    options or= {}

    # same as query, just return multiple results
    options.list = true
    @query values, options

  localList: (values, options) ->
    options or= {}

    # same as query, just return multiple results
    options.list = true
    options.local = true
    @query values, options

  getGeoPosition: (values, options) ->
    unless navigator.geolocation
      options.error 'Geolocation services unavailable'
      return

    success = (pos) ->
      options.complete pos.coords[values[0]]
    error = (error) ->
      options.error error.message

    navigator.geolocation.getCurrentPosition success, error

  _doQuery: (options) ->
    try
      # the filter object automatically drops empty items, in the context
      # of query expressions we want to keep 'is null' statements
      if options.filterStatement
        filter = FilterItem.parseStatement options.filterStatement,
          keepNullItems: true

      query = @factory.dataController.createQuery options.viewName,
        filter: filter
        sort: options.sortStatement
        context: options.context
        localData: options.local

      # hook up events to listen for results
      query.dataSet.on 'reset', ->
        value = null
        if options.count
          value = query.dataSet.totalRecordCount
        else if options.list
          value = for record in query.dataSet.models
            record.getValue options.fieldName
        else if options.sum
          value = _.reduce query.dataSet.models, ( (sum, record) ->
            sum + record.getValue options.fieldName
          ), 0
        else
          if query.dataSet.models.length > 0
            record = query.dataSet.get 0
            value = record.getValue options.fieldName

        options.complete value

      query.on 'error', (error) ->
        options.error error

      # fetch the data that was requested
      query.fetch quiet: !!options.quiet

    catch error
      options.error error
      throw error

  _assertDisplayInterface: (options) ->
    iface = options.context.displayInterface
    if iface
      iface
    else
      throw new Error 'No display interface is available in the context to perform the action'

module.exports = ContextFunctionHandler
