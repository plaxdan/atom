# Event Handler Class
#
# This object handles the actual details of performing a client side event,
# taking into account the actions that are potentially configured for the
# handler. Use EventFactory.create or EventFactory.execute to create these
# objects, they should not be instantiated directly.
#
# The individual actions are executed asynchronously so they can query data
# and perform other processing that can't necessarily be done procedurally.
# Callback methods are used to chain the actions together and notify the
# original caller that the action is complete
#
# @TODO - probably need exception handling to make sure we don't get lost in
# the action processing
EventContext = require './eventcontext'
EventRegistry = require './eventregistry'
ExpressionEvaluator = require '../expressions/expressionevaluator'
FilterItem = require '../models/filteritem'
UserError = require '../models/usererror'
UrlHelper = require '../utils/urlhelper'

class EventHandler
  # this should not be created directly - use EventFactory.create instead
  constructor: (@identifier, @context, actions, @defaultHandler, options) ->
    # clone the action array (so we can modify it) and step through the
    # actions asynchronously
    @actions = _.clone actions

    @options = options or {}

  execute: ->
    @promise = Promise.resolve @_performNextAction @actions

  _performNextAction: ->
    action = @actions.shift()

    # we're done if there are no more actions
    if not action
      @_complete true
      return

    invokeAction = =>
      # invoke the correct handler based on the action type
      { type } = action
      if @[type]
        try
          # actions return a deferred indicating success/failure
          @[type] action
            .then =>
              # continue processing the event chain if needed
              @_performNextAction()
            .catch (error) =>
              # ignore the error if needed
              if action.continueOnError
                @_performNextAction()
              else
                # otherwise we're done
                @context.setError error if error
                @_complete false
        catch error
          @context.setError error.message
          @_complete false
          throw error
      else
        @context.setError 'Invalid action type: ' + type
        @_complete false

    # evaluate condition to see if we should execute this action
    condition = action.condition
    if condition
      ExpressionEvaluator.evaluate condition, { @context }
        .then (value) =>
          # invoke the action if the expression evaluated to something truthy
          if value
            invokeAction()
          # otherwise skip this action and perform the next one
          else
            @_performNextAction()
        .catch (error) =>
          @context.setError error
          @_complete false

    else
      invokeAction()

  _complete: (success) ->
    if success
      # return the associated object with the event as the first argument to
      # the callback
      id = EventRegistry.parseIdentifier @identifier
      obj = switch id.event
        when EventRegistry.CreateRecord then @context.record
        when EventRegistry.MarkForDelete then @context.record
        when EventRegistry.ResetRecord then @context.record
        when EventRegistry.VerifyRecord then @context.record
        when EventRegistry.VerifyField then @context.record
        else @context

      @promise.resolve obj, @context

    # reject the promise if an action did not complete successfully
    else
      # display an error message if something happened
      if @context.error and not @options.silent
        # bing - make this prettier
        @context.factory.pubSub.trigger 'displayModal',
          title: 'An Error Occurred'
          body: @context.error

      @promise.reject @context.error

  # action type handlers - these take two arguments: the action model that
  # contains details about how an action should be performed, and a callback
  # that is executed when the action is complete. It is essential the callback
  # is invoked in all cases, otherwise the event handler will stall. Details
  # about the event state (errors, etc) should be pushed to the @context
  # object

  CreateRecordAction: (action) ->
    EventHandler.performCreateRecordAction (action.options), @context, @context.factory

  # bing - need a better place for this (maybe break out the event handlers
  # into separate classes). this provides a shared handler for creating
  # records from an action (navigation actions, events, etc)
  @performCreateRecordAction: (action, context, factory) ->

    # process the values that should be supplied to the new record
    values = _.clone action.recordValues
    ExpressionEvaluator.evaluateAttributes values, { context }
      .done ->
        dc = factory.dataController

        if action.targetView is context.dataSet?.query.get 'target'
          useContext = true
          query = context.dataSet.query
        else
          useContext = false

          query = dc.createQuery action.targetView, { context }
          # this prevents the controller from fetching the dataset
          query.dataSet.totalRecordCount = 0
          query.dataSet.hasFinalRecordCount = true

        # use the display interface to create a new record interactively
        newRecord = if action.interactiveEdit
          state = if useContext
            context.state
          else
            dc.createDisplayState { query }

          context.displayInterface.createRecord { state, values }

        # otherwise just create a new record in the background
        else
          createOpts = { values, context }
          if useContext
            createOpts.at = 1 + context.state.get 'selectedIndex'
          else
            # need to create a context associated with the target data set
            createOpts.context = factory.eventFactory.context
              dataSet: query.dataSet
            createOpts.context.addAttributes values,
              EventContext.AttributePrecedence.Record
            createOpts.context.setAttributes context.getExplicitAttributes(),
              explicitOnly: true

          factory.modificationHandler.createRecord query.dataSet, createOpts

        Promise.resolve(newRecord)
          .done (record) ->
            context.state.selectRecord record if useContext
            # update the new record in the context
            context.setRecord record


  DefaultChainAction: (action) ->
    # execute if default handler if we have one, otherwise this is a no-op
    if @defaultHandler
      @defaultHandler @context
    else
      true

  DeleteRecordsAction: (action) ->
    actionOptions = action.options
    mh = @context.factory.modificationHandler

    promise = new $.Deferred

    # callback to delete records that match the query
    deleteRecord = (recordContext, done) ->
      $.when(mh.markDeleted recordContext.record, context: recordContext)
        .done( -> done() )
        # bing - see comment below in ModifyDataAction
        .fail( (error) -> promise.reject error )

    # process and iterate the query
    @_iterateActionQuery actionOptions, deleteRecord, promise

    promise.promise()

  ExecuteCommandAction: (action) ->
    actionOptions = action.options

    # bing - need to support sending command to the server to be invoked there
    if actionOptions.disposition is 'Server'
      throw new Error 'Invoking server side expressions is not supported at the moment'

    switch actionOptions.commandType
      when 'CustomEvent'
        statement = "customEvent('#{actionOptions.command}')"
      when 'ViewAction'
        statement = "performAction('#{actionOptions.command}')"
      else
        statement = actionOptions.command

    @context.pushState() if actionOptions.resetContext

    maybePopState = =>
      @context.popState() if actionOptions.resetContext

    ExpressionEvaluator.evaluate statement, {@context}
      .then -> maybePopState, maybePopState

  IterateCommandAction: (action) ->
    actionOptions = action.options

    promise = new $.Deferred

    # command type can specify shortcut for common actions
    command = switch actionOptions.commandType
      when 'CustomEvent' then ":= customEvent( '#{actionOptions.command}' )"
      when 'PeformAction' then ":= performAction( '#{actionOptions.command}' )"
      else actionOptions.command

    # callback to execute command on a particular record
    iterateRecord = (recordContext, done) ->
      $.when(ExpressionEvaluator.evaluate command, context: recordContext)
        .done( -> done() )
        # bing - see comment below in ModifyDataAction
        .fail( (error) -> promise.reject error )

    # process and iterate the query
    @_iterateActionQuery actionOptions, iterateRecord, promise

    promise.promise()

  ModifyAttributesAction: (action) ->
    actionOptions = action.options

    # return the deferred associated with evaluating the attributes
    attributes = _.clone actionOptions.attributesOption
    $.when(ExpressionEvaluator.evaluateAttributes attributes, {@context})
      .done =>
        # modify session attributes if requested - store in the persisent
        # app state so the values are not lost when the session is refetched
        if actionOptions.modifySessionAttributesOption
          settings = @context.factory.settings
          attrs = settings.get 'sessionAttributes'
          unless attrs
            attrs = {}
            settings.set sessionAttributes: attrs
          _.extend attrs, attributes
          settings.storeLocal()

        explicit = @context.getExplicitAttributes()
        recordAttrs = {}
        otherAttrs = {}
        for name, value of attributes
          if @context.record?.hasAttribute name
            recordAttrs[name] = value
          else
            explicit[name] = value
            otherAttrs[name] = value

        unless _.isEmpty recordAttrs
          @context.record.setValue recordAttrs, explicit: otherAttrs

  ModifyDataAction: (action) ->
    actionOptions = action.options

    promise = new $.Deferred

    # callback to modify values on a particular record
    modifyRecord = (recordContext, done) =>
      # evaluate the attribute collection within the record's context
      attributes = _.clone actionOptions.attributesOption
      $.when(ExpressionEvaluator.evaluateAttributes attributes, {@context})
        .done( =>
          recordContext.record.setValue attributes
          done()
        )
        .fail (error) ->
          # bing - this 'stops' the current iteration process by not calling
          # the done callback, but we should investigate whether there is a
          # more graceful way of halting the action
          promise.reject error

    # process and iterate the query
    @_iterateActionQuery actionOptions, modifyRecord, promise

    promise.promise()

  ModifyFilterAction: (action) ->
    actionOptions = action.options

    promise = new $.Deferred

    unless @context.dataSet
      promise.reject 'Cannot modify filter in this context'
    else
      query = @context.dataSet.query

      filter = new FilterItem actionOptions.filterOption
      $.when(filter.replaceAttributeReferences @context)
        .fail(promise.resolve)
        .done ->
          if actionOptions.replaceFilterOption
            query.set { filter }
          else
            # this doesn't have to be too smart - simplify() will clean up the
            # filter
            merged = new FilterItem operator: 'and'
            merged.appendItem query.get 'filter'
            merged.appendItem filter
            merged.simplify()
            query.set filter: merged

          promise.resolve()

    promise.promise()

  PluginFunctionAction: (action) ->
    actionOptions = action.options

    promise = new $.Deferred

    async.map (_.pluck actionOptions.parameterBindings, 'parameterValue'),
      (param, done) =>
        # handle nested attribute collection parameters
        if _.isObject param
          param = _.clone param
          $.when(ExpressionEvaluator.evaluateAttributes param, { @context })
            .done (evaluated) ->
              done null, value: evaluated
            .fail promise.reject
        else
          # remember attribute names for bare references so we can push
          # changes back into the context
          m = param?.match /^\${([^{}]*)}$/
          attributeName = m?[1]

          if ExpressionEvaluator.isExpression param
            $.when(ExpressionEvaluator.evaluate param, { @context })
              .done (evaluated) ->
                done null, { attributeName, value: evaluated }
              .fail promise.reject
          else
            done null, { attributeName, value: param }

      # async complete
      , (err, paramInfo) =>
        # bing - not sure how we're going to deal with client side plug-in
        # functions
        if actionOptions.disposition isnt 'Server'
          promise.reject 'Client-side plug-in function actions are not implemented at the moment...'
        else
          data =
            provider: actionOptions.functionProvider
            group: actionOptions.functionGroup
            name: actionOptions.functionName
            parameters: _.pluck paramInfo, 'value'

          $.ajax
            url: UrlHelper.prefix 'ds/plugin/performaction'
            dataType: 'json'
            data: JSON.stringify data
            complete: (xhr) =>
              # push the results back into the context as needed
              response = JSON.parse xhr.responseText
              if xhr.status is 200
                updates = {}
                for value, index in response
                  attributeName = paramInfo[index].attributeName
                  updates[attributeName] = value if attributeName

                @context.setAttributes updates unless _.isEmpty updates

                promise.resolve()

              else
                { message } = response
                try
                  error = JSON.parse message
                  message = (new UserError error).toString()
                promise.reject message

    promise.promise()

  PromptAction: (action) ->
    promise = new $.Deferred

    # don't display an interactive prompt if the postponeErrors option is
    # enabled, this happens during offline sync in some cases
    promptOptions = action.options
    if @options?.postponeErrors
      if promptOptions.acceptButton and promptOptions.cancelButton
        promise.reject 'Cannot display interactive prompt'
      else if promptOptions.cancelButton
        promise.reject promptOptions.promptMessage
      else
        promise.resolve()
    else
      promptPromise = new $.Deferred
      $.when(promptPromise)
        .done (results) =>
          # push the updated attributes from the prompt back into the context
          # bing - handle session attributes
          @context.setAttributes results.values
          promise.resolve()
        .fail promise.reject

      @context.factory.pubSub.trigger 'displayPrompt',
        context: @context
        action: promptOptions
        promise: promptPromise

    promise.promise()

  _iterateActionQuery: (action, recordCallback, promise) ->
    factory = @context.factory

    # trigger the waiting state in case this takes a while. nothing will be
    # displayed if the action finishes in less than half a second
    factory.pubSub.trigger 'showWait', message: action.statusLabelOption

    # bing - would be nice if local data was a property of the query in the
    # server object
    queryOptions = _.extend { @context, localData: action.localQuery },
      action.targetQueryOption

    query = factory.dataController.createQuery queryOptions.target, queryOptions
    query.dataSet.on 'reset', =>
      # need to process the records in series to prevent the context from
      # getting clobbered
      async.eachSeries query.dataSet.models,
        (record, done) =>
          # update the context to contain the selected record
          @context.pushState()
          @context.setRecord record
          recordCallback @context, =>
            # keep explicit attributes so they are available to the next
            # event action
            explicit = @context.getExplicitAttributes()
            @context.popState()
            @context.setAttributes explicit, explicitOnly: true

            done()
        # async complete
        , ->
          factory.pubSub.trigger 'hideWait'
          promise.resolve()

    # bing - query errors get lost here, should fail the promise
    query.fetch()

module.exports = EventHandler
