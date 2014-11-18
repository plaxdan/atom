# Configuration Manager
#
# This class handles evaluating the dynamic conditions and permissions
# throughout the configuration.
DataTypeHelper = require './datatypehelper'
ExpressionEvaluator = require './expressionevaluator'

class ConfigurationManager
  @permissionDefaults =
    ViewQuery: true
    ViewUpdate: false
    ViewInsert: false
    ViewDelete: false
    ViewCommit: true
    FieldVisible: true
    FieldEditable: true
    FieldSearchable: true
    FieldSortable: true

  constructor: (@factory) ->
    @factory.register 'configurationManager', @

  # Grab the Homescreen Categories for rendering the home
  # views
  getHomescreenCategories: ->
    categories = []

    # first collect the individual category names
    temp = {}
    vc = @factory.session.get 'views'
    if vc
      for view in vc.models
        nav = view.get 'navigationActions'
        if nav?.HomeScreenActions
          for ref in nav.HomeScreenActions
            temp[ref.category] = '' 

    categories = _.keys temp

    # the DS_CATEGORY_ORDER attribute can specify a particular order
    # for the results
    context = @factory.eventFactory.context()
    order = context.getAttribute 'DS_CATEGORY_ORDER'
    if order
      # put the explicitly defined categories first
      order = order.split /\s*,\s*/
      first = _.intersection order, categories
      first.concat _.difference categories, order
    else
      categories

  getHomescreenActions: ->
    hsActions = []
    vc = @factory.session.get 'views'
    if vc
      for dsView in vc.models
        actions = dsView.get 'navigationActions'
        if actions?.HomeScreenActions
          hsActions.push homeAction for homeAction in actions.HomeScreenActions

    _.sortBy hsActions, (action) ->
      # pad the weight with zeros so it sorts well
      weight = ('000' + action.weight).slice -4
      "#{weight}.#{action.name}"

  # retuns the actions available on the home screen for a category, filtered
  # on enabled actions given the current context
  #
  # @returns {Deferred} - provides list of actions when resolved
  getHomescreenActionsForCategory: (category) ->
    # first get a list of actions within the category
    actions = _.filter @getHomescreenActions(), (action) ->
      action.category is category

    # now process the collection and only return enabled actions
    @_processCollectionExpression actions, 'condition', defaultInclude: true

  getViewPermission: (view, permission, options) ->
    if not _.isObject view
      vc = @factory.session.get 'views'
      view = vc.get view

    promise = new $.Deferred

    if not view
      promise.resolve false
    else
      condition = (view.get 'permissions')?[permission]
      if condition
        context = options?.context or @factory.eventFactory.context { view }
        $.when(ExpressionEvaluator.evaluate condition, { context })
          .done( (value) ->
            promise.resolve value
          )
          .fail( (error) ->
            promise.resolve false
          )
      else
        promise.resolve ConfigurationManager.permissionDefaults[permission]

    promise.promise()

  # returns a list of field names that have a particular permission.
  # the list is returned through a deferred object to support conditional
  # statements that are potentially evaluated asyncronously
  getFieldsWithPermission: (view, permission, options) ->
    if not _.isObject view
      vc = @factory.session.get 'views'
      view = vc.get view

    if not view
      # just return an empty list here
      []

    else
      context = options?.context or @factory.eventFactory.context { view }

      # provide a function that returns the field permission statement
      pluckPermission = (field) -> field.permissions?[permission]

      # this returns a deferred that will resolve to the list of matching
      # fields
      @_processCollectionExpression (view.get 'fields'), pluckPermission,
        defaultInclude: true
        context: context
        accept: (field, permission) ->
          # collect field names
          field.name if permission

  # returns the view/record message that should be displayed to the user
  # as a deferred
  getViewMessage: (options) ->
    if not _.isObject options.view
      vc = @factory.session.get 'views'
      options.view = vc.get options.view

    promise = new $.Deferred

    if not options.view
      promise.resolve ''

    else
      context = options.context or @factory.eventFactory.context options
      messages = []

      attributes = [ 'DS_VIEW_MESSAGE' ]
      if options.record
        attributes.push 'DS_RECORD_MESSAGE'
      async.each attributes,
        (attribute, done) =>
          $.when(ExpressionEvaluator.evaluateAttribute attribute, '', context: context)
            .done( (value) ->
              messages.push value
            )
            .fail( (error) =>
              console.error error
              unless options.silent
                @factory.pubSub.trigger 'displayNotification',
                  message: error.message or error
                  severity: 'error'
            )
            .always -> done()

        # async done
        , ->
          promise.resolve (_.compact messages).join '<br/>\r\n'

    promise.promise()

  # returns an array of validation style definitions defined for a view,
  # falling back to role definitions as needed. built in styles (UpperCase,
  # etc) are returned as text
  getValidationStyleDefinitions: (validationStyle, options) ->
    # see if there is an associated view in the context
    view = options.record?.view or options.view
    session = @factory.session

    # return the collection of style definitions
    styles = validationStyle.split ','
    for style in styles
      style = style.trim()

      definition = (view?.get 'styles')?[style]
      unless definition
        definition = (session?.get 'styles')?[style]

      definition or style

  getMenuActions: (options) ->
    @getNavigationActions 'NavigationMenuActions', options

  getChildViews: (options) ->
    @getNavigationActions 'ChildViews', options

  getNavigationActions: (collection, options) ->
    if _.isString options.view
      vc = @factory.session.get 'views'
      options.view = vc.get options.view
    else if options.record and not options.view?
      options.view = options.record.view

    promise = new $.Deferred

    actions = (options.view?.get 'navigationActions')?[collection]
    if not actions? or actions.length is 0
      promise.resolve []

    else
      # we need to evaluate two expressions here, first whether or not the
      # tab is visible, and then whether or not it should be enabled
      context = options.context or @factory.eventFactory.context options

      # first evaluate the actions to get a list that should be visible
      $.when(@_processCollectionExpression actions, 'condition',
        defaultInclude: true
        context: context
      ).done (visible) =>
        # now evaluate the list and calculate whether or not the actions are
        # enabled
        $.when(@_processCollectionExpression visible, 'enabled',
          defaultInclude: true
          context: context
          accept: (ref, enabled) ->
            # clone the reference so we can update properties
            clone = _.clone ref
            clone.enabled = enabled

            # accept the value regardless of whether it is enabled or not
            clone

        ).done (list) ->
          # sort the list by weight
          promise.resolve list.sort (a, b) ->
            if a.weight < b.weight
              -1
            else if a.weight > b.weight
              1
            else
              0

    promise.promise()

  getRecordDescription: (record, options) ->
    context = options?.context or @factory.eventFactory.context { record }

    if context.hasAttribute 'DS_RECORD_DESCRIPTION'
      # return the deferred the evaluates the attribute
      ExpressionEvaluator.evaluateAttribute 'DS_RECORD_DESCRIPTION', '', { context }
    else
      promise = new $.Deferred

      # use the primary key, and fall back to the first couple of fields if
      # the pk is not visible. that keeps us from displaying GUIDs, etc which
      # are typically pretty useless
      $.when(@getFieldsWithPermission record.view, 'FieldVisible').done (visible) ->
        fields = _.collect record.view.getPrimaryKeyFields(), (field) -> field.name

        fields = _.filter fields, (test) -> _.contains visible, test
        if fields.length is 0
          fields = _.first visible, 2

        description = ''
        for name in fields
          description += ', ' if description

          # bing - formatting
          description += "#{ name }: #{ record.getValue name }"

        promise.resolve description

      promise.promise()

  updateRecordDisplayCache: (record, options) ->
    if !options?.force and record.displayCache and !record.displayCache.stale
      return record.displayCache

    displayCache = new RecordDisplayCache
    displayCache.cid = _.uniqueId 'huh'
    record.displayCache = displayCache
    context = options?.context or @factory.eventFactory.context { record }

    # first check for update permission
    checkEditable = if record.isInsert()
      true
    else if record.isDelete()
      false
    else
      @getViewPermission record.view, 'ViewUpdate', { context }

    # also calculate record text style
    if context.hasAttribute 'DS_TEXT_STYLE'
      # wrap the style statement in an additional promise so errors don't
      # prevent the cache from being generated
      textStyle = new $.Deferred
      ($.when ExpressionEvaluator.evaluateAttribute 'DS_TEXT_STYLE',
        '', { context }
      ).then (value) ->
        textStyle.resolve value
      .fail (error) ->
        console.error error
        textStyle.resolve ''
    else
      textStyle = null

    $.when(checkEditable, textStyle).done (recordEditable, recordTextStyle) =>
      displayCache.textStyle = @_parseTextStyle recordTextStyle

      fields = record.view.get 'fields'
      async.eachSeries fields,
        (field, done) =>
          settings = _.clone RecordDisplayCache.fieldDefaults

          # evaluate the validation style if needed
          validationPromise = if ExpressionEvaluator.isExpression field.validationStyle
            ExpressionEvaluator.evaluate field.validationStyle, { context }
          else
            field.validationStyle

          # also evaluate the editable statement if needed
          settings.editable = recordEditable
          condition = field.permissions?['FieldEditable']
          editablePromise = if recordEditable and condition
            ExpressionEvaluator.evaluate condition, { context }
          else
            recordEditable

          # wait as needed for the asynchronous actions
          $.when(validationPromise, editablePromise)
            .done (validationStyle, editable) =>
              # set a default validation style based on the data type
              unless validationStyle
                validationStyle = switch field.dataType
                  when 'Integer' then 'Integer'
                  when 'Double' then 'Numeric2'
                  when 'DateTime' then 'DateTime'
                  when 'Boolean' then 'Bit'
                  when 'Binary' then 'Binary'

              settings.editable = editable
              settings.validationStyle = validationStyle

              value = record.getValue field.name
              settings.formatted = DataTypeHelper.formatValue value,
                format: validationStyle

              # cache our settings and complete the current iteration
              displayCache.cacheField field.name, settings

            .fail (error) =>
              console.error error
              # bing:error - don't eat this
              unless options.silent
                @factory.pubSub.trigger 'displayNotification',
                  message: error.message or error
                  severity: 'error'

            # keep the async loop going
            .always -> done()

        # async complete
        , ->
          displayCache.resolve()

    displayCache

  _parseTextStyle: (style) ->
    return unless style

    m = style.match /normal\s?{([^{}]*)}/
    if m?[1]
      normal = m[1]
      parsed = {}
      for item in normal.split /\s*;\s*/
        m = item.match /([a-z]+)(:\s*([^: ]+))?/
        parsed[m[1]] = m[3] if m
      parsed

  # processes a collection, evaluating an expression property, and returns the
  # where the expression evaluates to true. this respects the order of the
  # original collection
  #
  # @returns {Deferred} - notifies when iteration is complete
  # @param [] collection - collection to iterate
  # @param {String/function} property - property on iterated items that defines
  #   the expression to evaluate. can be a callback function
  # @param {} options -
  #   .defaultInclude - add item to the collection if property is not defined
  #   .context - explicit context for evaluating statements
  #   .accept - optional callback to accept items into the returned
  #     collection. by default just includes items when the statement is true
  _processCollectionExpression: (collection, property, options) ->
    options or= {}

    # use a generic context unless specified
    options.context or= @factory.eventFactory.context()

    # default accept function - only include if statement evaluates to true
    options.accept or= (test, value) -> test if value

    promise = new $.Deferred

    async.map collection,
      (test, done) =>
        if _.isFunction property
          statement = property test
        else
          statement = test[property]

        if statement?
          $.when(ExpressionEvaluator.evaluate statement, context: options.context )
            .done (value) ->
              # pass item off to the accept callback
              done null, options.accept test, value

            .fail (error) =>
              console.error error.message or error
              unless options.silent
                @factory.pubSub.trigger 'displayNotification',
                  message: error.message or error
                  severity: 'error'

              done()
        else
          # pass to the accept callback using the default statement value
          done null, options.accept test, options.defaultInclude or false

      # async complete
      , (err, list) ->
        promise.resolve _.compact list

    promise.promise()

class RecordDisplayCache
  @fieldDefaults =
    editable: true
    formatted: ''
    validationStyle: null

  constructor: ->
    @fields = {}

    _.extend @, new $.Deferred

  cacheField: (name, options) ->
    @fields[name] = options

  editable: (key) ->
    if _.isObject key
      key = key.name

    if @fields[key]?.editable then true else false

  formatted: (key) ->
    if _.isObject key
      key = key.name

    @fields[key]?.formatted or ''

  validationStyle: (key) ->
    if _.isObject key
      key = key.name

    @fields[key]?.validationStyle or null

  fieldTextStyle: (key) ->
    if _.isObject key
      key = key.name

    @fields[key]?.textStyle or null

  setStale: ->
    # no reason to invalidate if we're still being evaluated
    @stale = true unless @state() is 'pending'

module.exports = ConfigurationManager
