DataTypeHelper = require './datatypehelper'
OperatorHandler = require './operatorhandler'
DataSpliceParser = require '../../grammar/parser'

class ExpressionEvaluator
  # static functions for parsing, evaluating expressions
  @isExpression = (value) ->
    unless _.isString value
      false
    else
      ( value.match(/^:=/) or value.match(/^\${[^{}]*}$/) )?

  @parse = (statement) ->
    # bing - implement caching here
    ast = DataSpliceParser.parse statement

    # inject the original statement into the return so it is available in the
    # context
    ast.statement = statement

    ast

  # parses and evaluates the specified expression. the result is available
  # through the deferred object that is returned
  @evaluate = (statement, options = {}) ->
    new Promise (resolve, reject) ->
      if statement
        try
          # bing - might be nice to push the Deferred throughout the stack walk,
          # but I'm leaving that alone for now
          ast = ExpressionEvaluator.parse statement
          ev = new ExpressionEvaluator
          ev.evaluate ast, _.extend (_.clone options),
            complete: (value) ->
              resolve value
            error: (error) ->
              # bing - would be nice to pass back a more useful error object that
              # includes the original expression, context, etc.
              reject error

        catch error
          reject error

      # nothing to do
      else
        resolve statement

  # evaluates an attribute in the given context and returns the result (or the
  # default value if not defined) as a Deferred object
  @evaluateAttribute = (attributeName, defaultValue, options) ->
    value = options.context.getAttribute attributeName
    if value
      # process the attribute if needed
      if ExpressionEvaluator.isExpression value
        ExpressionEvaluator.evaluate value, options
      else
        value
    else
      defaultValue

  @evaluateAttributes = (attributes, options) ->
    return attributes if _.isEmpty attributes

    promise = new $.Deferred

    async.each _.keys(attributes),
      (name, done) ->
        value = attributes[name]
        # process the value if needed
        if ExpressionEvaluator.isExpression value
          $.when(ExpressionEvaluator.evaluate value, options)
            .done (evaluated) ->
              attributes[name] = evaluated
              done()
            .fail promise.reject
        else
          done()
      , ->
        promise.resolve attributes

    promise.promise()

  @replaceReferences = (statement, options) ->
    matches = statement.match /\${[^{}]*}/g
    return statement unless matches?.length

    promise = new $.Deferred

    $.when(ExpressionEvaluator.evaluateAttributes matches, options)
      .done( (values) ->
        # interleave the remaining text with the evaluated attributes
        tokens = statement.split /\${[^{}]*}/g
        interleave = []
        for test, index in tokens
          interleave.push test
          if index < values.length
            interleave.push DataTypeHelper.formatValue values[index]

        promise.resolve interleave.join ''
      )
      .fail (error) ->
        promise.reject error

    promise.promise()

  # evaluates the specified expression
  evaluate: (expression, options) ->
    options or= {}
    oldVisit = options.visit

    # need to hook the visit call so we can pass the final returned value
    options = _.clone options
    options.visit = (value, item) ->
      oldVisit value, item if oldVisit
      if item is expression and options.complete
        options.complete value

    options.expression = expression

    @walk expression, options

  collectValues: (values, options) ->
    collected = []
    if not values or values.length is 0
      options.complete collected

    else
      complete = _.after values.length, ->
        options.complete collected

      _.each values, (child, index) =>
        @walk child, _.extend _.clone(options),
          visit: (value, item) ->
            options.visit value, item if options.visit
            if item is child
              collected[index] = value
              complete()

  walk: (item, options) ->
    try
      if _.isObject item
        handler = switch item.type
          when 'exec' then new StatementHandler @, item
          when 'group' then new GroupHandler @, item
          when 'op' then new OperatorHandler @, item
          when 'func' then new FunctionHandler @, item
          when 'attr' then new AttributeHandler @, item
          else
            options.error "Unknown expression item type: #{item.type}", item
            null

        handler.handleItem options if handler

      else
        options.visit item, item

    catch error
      options.error error.message, @item

class StatementHandler
  constructor: (@parent, @item) ->

  handleItem: (options) ->
    value = null

    # can't use collectValues because we might need to short-circuit the
    # evaluation
    remaining = _.clone @item.values
    doNext = =>
      if remaining.length > 0
        next = remaining.shift()
        @parent.walk next, _.extend _.clone(options),
          visit: (value, ref) =>
            options.visit value, ref if options.visit

            if ref is next
              # handle the next item or return the final result
              doNext()
      else
        # pass the group result as the value of our item
        options.visit value, @item

    # process the first child
    doNext()

class GroupHandler
  constructor: (@parent, @item) ->

  handleItem: (options) ->
    test = true

    # can't use collectValues because we might need to short-circuit the
    # evaluation
    remaining = _.clone @item.values
    doNext = =>
      if remaining.length > 0
        child = remaining.shift()
        @parent.walk child, _.extend _.clone(options),
          visit: (value, ref) =>
            options.visit value, ref if options.visit

            if ref is child
              test = if value then true else false

              # detect if we can short-circuit the expression
              remaining = [] if @item.op is 'and' and not test
              remaining = [] if @item.op is 'or' and test

              # handle the next item or return the final result
              doNext()
      else
        # pass the group result as the value of our item
        options.visit test, @item

    # process the first child
    doNext()

class FunctionHandler
  constructor: (@parent, @item) ->

  handleItem: (options) ->

    handler = options.context?.getFunction @item.name
    if not handler
      options.error 'Function not found: ' + @item.name, @item
      return

    # we need an internal handler because we may or may not have to process
    # the function arguments
    invoke = (values) =>
      try
        # call the handler asynchronously if needed
        if handler.async
          handler.invoke values, _.extend _.clone(options),
            evaluator: @parent
            complete: (value) =>
              options.visit value, @item
            error: (error) =>
              options.error error, @item

        # otherwise the handler returns a value directly
        else
          value = handler.invoke values,
            evaluator: @parent
            context: options.context
          options.visit value, @item

      catch error
        options.error error, @item

    # process the values if needed
    if not handler.rawArguments
      @parent.collectValues @item.values, _.extend _.clone(options),
        complete: (values) -> invoke values

    # otherwise directly invoke the function
    else
      invoke @item.values

class AttributeHandler
  constructor: (@parent, @item) ->

  handleItem: (options) ->
    if options.context?.hasAttribute @item.name

      # add parameterized values to the context if needed
      if @item.list
        @parent.collectValues @item.list, _.extend _.clone(options),
          complete: (list) =>
            nested = {}
            for item, index in list
              nested[index + 1] = item
            options.context.addAttributes nested

            @_processValue options, nested
      else
        @_processValue options

    else
      options.error 'Attribute not found: ' + @item.name, @item


  _processValue: (options, removeAttributes) ->
    # process internal expressions if needed
    value = options.context.getAttribute @item.name
    if ExpressionEvaluator.isExpression value
      try
        # evaluate the sub expression - need to clone the options here
        # so evaluate doesn't clobber any existing callbacks
        $.when(ExpressionEvaluator.evaluate value, _.clone options)
          .done( (result) =>
            # clean up the attribute context if needed
            options.context.removeAttributes removeAttributes if removeAttributes

            options.visit result, @item
          )
          .fail( (error) =>
            options.error error, @item
          )

      catch error
        options.error error.message, @item

    else
      switch (String value).toLowerCase()
        when 'true' then options.visit true, @item
        when 'false' then options.visit false, @item
        when 'null' then options.visit null, @item
        else options.visit value, @item

module.exports = ExpressionEvaluator
