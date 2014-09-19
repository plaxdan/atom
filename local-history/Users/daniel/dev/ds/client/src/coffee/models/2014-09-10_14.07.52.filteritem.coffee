# Model to define a filter/where clause for a query.
BaseModel = require './basemodel'
ExpressionEvaluator = require '../expressions/expressionevaluator'

class FilterItem extends BaseModel
  @operators = [ '=', '<>', '>', '>=', '<', '<=', 'is null', 'is not null' ]

  # static methods to create a filter item from a parsed statement
  @parseStatement = (statement, options) ->
    @createFromParseTree (ExpressionEvaluator.parse statement), options
  @createFromParseTree = (tree, options) ->
    switch tree.type
      when 'op'
        args = _.collect tree.values, (item) ->
            if _.isObject item
              if item.type is 'attr'
                return '${' + item.name + '}'
              else if item.type is 'op' and item.op is 'neg'
                -1 * item.values[0]
              else
                throw new Error 'Invalid filter statement'
            else
              item
        new FilterItem _.extend operator: tree.op, 'arguments': args, options

      when 'group'
        children = _.collect tree.values, (child) ->
          FilterItem.createFromParseTree child, options
        new FilterItem _.extend operator: tree.op, 'arguments': children, options
      else throw new Error 'Invalid filter statement'

  # defaults needs to be a function here because of the arguments array.
  # this ensures that each new instance gets its own array object
  defaults: ->
    operator: '='
    'arguments': []

  constructor: (attributes) ->
    if attributes?.keepNullItems
      @keepNullItems = attributes.keepNullItems
      delete attributes.keepNullItems

    super @parse attributes

  parse: (attributes) ->
    attributes = _.clone attributes

    # operator property comes from .NET with an uppercase O - fix that if
    # needed
    if attributes['Operator']
      attributes['operator'] = attributes['Operator']
      delete attributes['Operator']

    # also keep operators lowercase for simplicity
    if attributes['operator']
      attributes['operator'] = attributes['operator'].toLowerCase()

    # convert child items into model objects as well
    if attributes['arguments']
      args = _.clone attributes['arguments']
      for child, index in args
        child = args[index]
        if child and ( child['operator'] or child['Operator'] )
          args[index] = new FilterItem child
      attributes['arguments'] = args

    attributes

  clone: ->
    clone = super

    # process arguments and deep clone them if need
    args = clone.get 'arguments'
    for arg, index in args
      if arg instanceof FilterItem
        args[index] = arg.clone()

    clone

  replaceAttributeReferences: (context) ->
    promise = new $.Deferred

    op = @get 'operator'
    if op in [ 'and', 'or' ]

      async.each @get('arguments'),
        (child, done) ->
          $.when(child.replaceAttributeReferences context)
            .done( -> done() )
            .fail( (error) -> promise.reject error )

        , ->
          promise.resolve()

    else
      value = @getValue()
      if ExpressionEvaluator.isExpression value
        $.when(ExpressionEvaluator.evaluate value, context: context)
          .done( (replaced) =>
            @setValue replaced

            # change operator if value is null and we have keepNullItems flag
            if @keepNullItems and replaced is null
              switch @get 'operator'
                when '=' then @set 'operator', 'is null'
                when '<>' then @set 'operator', 'is not null'

            promise.resolve()
          )
          .fail( (error) ->
            promise.reject error
          )
      else
        promise.resolve()

    promise.promise()

  argumentCount: ->
    (@get 'arguments').length

  getFieldName: ->
    # AND/OR items don't have a field
    op = @get 'operator'
    if op in [ 'and', 'or' ]
      return null
    # otherwise the first argument is the field name
    else
      return (@get 'arguments')[0]

  setFieldName: (name) ->
    # AND/OR items don't have a field
    op = @get 'operator'
    if op in [ 'and', 'or' ]
      throw new Error 'Invalid operation - cannot set field on composite filter item'

    # otherwise the first argument is the field name
    # need a new array otherwise change event isn't fired
    args = _.clone @get 'arguments'
    args[0] = name
    @set 'arguments', args

  getValue: ->
    # AND/OR items don't have a field
    op = @get 'operator'
    if op in [ 'and', 'or' ]
      return null
    # otherwise the second argument is the value
    else
      return (@get 'arguments')[1]

  setValue: (value) ->
    # AND/OR items don't have a field
    op = @get 'operator'
    if op in [ 'and', 'or' ]
      throw new Error 'Invalid operation - cannot set value on composite filter item'

    # otherwise the first argument is the field name
    # need a new array otherwise change event isn't fired
    args = _.clone @get 'arguments'
    args[1] = value
    @set 'arguments', args

  appendItem: (field, options) ->
    op = @get 'operator'
    if op not in [ 'and', 'or' ]
      throw new Error 'Invalid filter operator'

    # allow items to be appended, or create a new item if a field name is
    # provided
    if field instanceof FilterItem
      item = field
    else
      options or= {}
      options['arguments'] = [ field ]
      item = new FilterItem options

    if _.isNumber options?.position
      (@get 'arguments').splice options.position, 0, item
    else
      (@get 'arguments').push item

    # return the new item
    item

  removeItem: (item) ->
    if item instanceof FilterItem
      newArgs = for child in @get 'arguments'
        if (child.get 'operator') in [ 'and', 'or' ]
          child.removeItem item
          if (child.get 'arguments').length
            child
        else if child isnt item
          child

      @set 'arguments', _.compact newArgs

    # also allow items to be removed by field name
    else
      for test, index in args
        if test.getFieldName() == item
          args.splice index, 1
          @set 'arguments', args
          return

  indentItem: (item) ->
    @locate item, (index, group) ->
      op = group.get 'operator'
      args = group.get 'arguments'
      return true if args.length == 1

      if index < args.length - 1
        next = args[index + 1]
      if index > 0
        prev = args[index - 1]

      group.removeItem item

      # add to an adjacent group if possible - prefer the next group
      for test in [ next, prev ]
        testOp = test?.get 'operator'
        if testOp in [ 'and', 'or' ]
          position = if test == next then 0 else prev.argumentCount()
          test.appendItem item, position: position
          return true

      # otherwise create a new group with the opposite operator
      if next
        group.removeItem next
        newArgs = [ item, next ]
      else
        group.removeItem prev
        newArgs = [ prev, item ]

      newGroup = new FilterItem
        operator: if op is 'and' then 'or' else 'and'
        'arguments': newArgs
      group.appendItem newGroup, position: index

      # prevent the locate iterator from finding the item again
      true

  outdentItem: (item) ->
    @locate item, (index, parent) =>

      # also need to locate the grandparent so we can modify it
      @locate parent, (parentIndex, grandParent) ->
        if parent.argumentCount() == 2
          grandParent.removeItem parent
          for item in parent.attributes.arguments
            grandParent.appendItem item, position: parentIndex++
        else
          parent.removeItem item
          grandParent.appendItem item, position: parentIndex

      # prevent the locate iterator from finding the item again
      true

  # iterates the filter hierarchy and invokes a callback method with each
  # filter item in the tree
  iterate: (callback) ->
    callback @

    for item in @get 'arguments'
      item.iterate callback if item instanceof FilterItem

  # locates a filter item within the filter hierarchy and executes a callback
  # with the index and parent group of the item
  locate: (item, callback) ->
    args = @get 'arguments'
    for test, index in args
      test = args[index]
      if test == item
        return if callback index, @
      else if test instanceof FilterItem
        anscestors = _.flatten [ @, anscestors ]
        return if test.locate item, callback

  getReferencedFields: ->
    op = @get 'operator'

    if op is 'and' or op is 'or'
      _.flatten _.collect ( @get 'arguments' ), (item) -> item.getReferencedFields()

    else
      [ @getFieldName() ]

  # Returns the set of values in the filter that narrow a set of data. For
  # instance, this is used when creating records to set default values so the
  # new record is contained in the current dataset
  getExclusiveAttributes: ->
    op = @get 'operator'

    op = @get 'operator'

    attributes = {}
    if op is '='
      attributes[@getFieldName()] = @getValue()
    else if op is 'and'
      args = @get 'arguments'
      for child in args
        if (child.get 'operator') is '=' and child.getValue()
          attributes[child.getFieldName()] = child.getValue()

    attributes

  # processes the filter and detects shortcut references. this supports the
  # following behavior
  # * wildcard characters (* or %) switch operator to like/not like
  detectShortcuts: (viewConfig, factory) ->
    @iterate (item) ->
      op = item.get 'operator'

      # process search flags on associated validation styles
      fieldName = item.getFieldName()
      style = (viewConfig?.getField fieldName)?.validationStyle
      if style and factory
        cm = factory.configurationManager
        styles = cm.getValidationStyleDefinitions style, view: viewConfig
        for def in styles
          if def.searchFlags
            # note we don't need to do anything with the IgnoreCase option,
            # queries are case-insensitive by default
            if _.contains def.searchFlags, 'PrefixWildcard'
              prefixWildcard = true
            if _.contains def.searchFlags, 'SuffixWildcard'
              suffixWildcard = true

      value = item.getValue()
      if op in [ '=', '<>' ]
        if (_.isString value) and value isnt ''
          # process prefix/suffix wildcard flags
          first = value[0]
          last = value[value.length - 1]
          if prefixWildcard and first not in [ '*', '%' ]
            value = '%' + value
          if suffixWildcard and last not in [ '*', '%' ]
            value += '%'

          # '<null>' changes operator to is <not> null
          if value is '<null>'
            item.set 'operator', if op is '=' then 'is null' else 'is not null'

          # allow asterisk or percent wildcard
          else if value.match /[*%]/
            item.set 'operator', if op is '=' then 'like' else 'not like'
            item.setValue value.replace /\*/g, '%'

          # split comma separated arguments
          else if value[0] is ','
            item.set 'operator', if op is '=' then 'in' else 'not in'

            list = (value.substring 1).split /\s*,\s*/
            item.setValue list

        # switch arrays to use in/not in
        else if _.isArray value
          item.set 'operator', if op is '=' then 'in' else 'not in'
    @

  simplify: ->
    op = @get 'operator'
    if op in [ 'and', 'or' ]
      args = @get 'arguments'

      # collapse grouping items with the same operator
      newArgs = _.flatten _.collect args, (child) ->
        child.simplify()
        # flatten child items with the same operator
        if op is child.get 'operator'
          child.get 'arguments'
        else
          child

      # remove duplicate items as well, this is easier in a second pass
      map = {}
      newArgs = _.filter newArgs, (child) ->
        formatted = child.toString()
        unless map[formatted]
          map[formatted] = true
          true

      @set 'arguments', newArgs

  toString: ->
    op = @get 'operator'
    args = @get 'arguments'

    # join composite operators
    if op in [ 'and', 'or' ]
      children = _.compact( _.collect args, (item) -> item.toString() )
      if children.length == 0
        return ''
      else if children.length is 1
        return children[0]

      '( ' + ( children.join " #{ op } " ) + ' )'

    else
      fieldName = @getFieldName()
      if fieldName.match /\s/
        fieldName = "'#{ fieldName }'"

      # unary operators
      if op in [ 'is null', 'is not null' ]
        [ fieldName, op ].join ' '
      # binary operators with a value
      else if args[1]? and args[1] isnt ''
        value = args[1]
        # convert arrays to composite and/or queries
        if _.isArray value
          if value.length
            group = if op is '<>' then ' and ' else ' or '
            items = for item in value
              [ fieldName, op, @_formatValue item ].join ' '
            '( ' + (items.join group) + ' )'
          else
            ''
        else
          [ fieldName, op, @_formatValue value ].join ' '
      # omit empty filters
      else
        ''

  isEmpty: ->
    op = @get 'operator'

    if op in [ 'and', 'or' ]
      (@get 'arguments').length is 0

    else if @getFieldName() then false else true

  _formatValue: (value) ->
    if _.isString value
      # replace any quotes
      value = value.replace /\"/g, '\\"'
      # quote non-numeric strings - text that has a leading zero needs to be
      # escaped so it isn't converted to a number by the server
      if (value.match /[^\d.]/) or value[0] is '0'
        '"' + value + '"'
      else
        value
    else if _.isDate value
      JSON.stringify value
    else if _.isBoolean value
      if value then 1 else 0
    else
      value

module.exports = FilterItem
