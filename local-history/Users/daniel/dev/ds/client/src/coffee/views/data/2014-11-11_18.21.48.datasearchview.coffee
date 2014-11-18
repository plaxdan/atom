# Data Search View
#
# Displays a search form that allows the user to specify the filter for the
# DataSplice view being displayed. Changes are posted to the ViewDisplayState
# used to initialize the view, which will typically have a data view listening
# for changes to display the matching results.
BaseView = require '../common/baseview'
ExpressionEvaluator = require '../../expressions/expressionevaluator'
EventRegistry = require '../../event/eventregistry'
FilterItem = require '../../models/filteritem'
OtherKup = require '../../utils/otherkup'

class DataSearchView extends BaseView
  className: 'search-form'

  events:
    'submit form': 'onFormSubmit'
    'click .query-submit': 'updateResults'
    'click .query-reset': 'resetFilter'
    'click .item-add': 'addItem'
    'click .item-indent': 'indentItem'
    'click .item-outdent': 'outdentItem'

  objectEvents:
    'change:query state': 'queryChanged'
    'change:filter state.query': 'queryChanged'
    'resolved state.query': 'updateDisplay'

  displayMode: 'filter'

  # list of searchable field names in the current view
  searchableFields: []

  initialize: (options) ->
    super
    {@controller} = options
    @state = options.state or @controller.activeState()

    { @inputFactory } = @options.factory

    # get the list of searchable fields
    cm = @options.configurationManager
    view = @state.get 'view'
    $.when(cm.getFieldsWithPermission view, 'FieldSearchable').done (fields) =>

      # move guid fields to the end of the list so they aren't selected
      # automatically
      otherFields = []
      guidFields = []
      for name in fields
        field = view.getField name
        if field?.dataType is 'Guid'
          guidFields.push name
        else
          otherFields.push name

      @searchableFields = _.flatten [ otherFields, guidFields ]
      @updateDisplay()

    @

  eventContext: ->
    # don't add full display state to the context, we don't want attributes
    # from the selected record
    context = @options.eventFactory.context view: @state.get 'view'
    context.controller = @controller

    # add current filter values to the context as attributes
    # also want to have empty attributes for all the fields so we don't get
    # reference errors
    filter = _.extend context.view.getFieldAttributes(),
      (@state.get 'query.filter').getExclusiveAttributes()
    context.addAttributes filter

    context

  # do nothing here - the search items detect the enter keypresses and refetch
  # the query. for some reason this is only called when there is a single
  # input in the form, so it's not consistent to handle submitting the query
  # here
  onFormSubmit: ->
    false

  updateResults: ->
    context = @eventContext()

    # fire the verify query event, the default action performs the action
    # search
    @options.eventFactory.execute EventRegistry.VerifyQuery, context, =>
      @trigger 'defaultCommand'

  resetFilter: (ev) ->
    @filter = new FilterItem operator: 'and'
    (@state.get 'query').set 'filter', @filter

    @_addSearchItem()

  addItem: (ev) ->
    @_addSearchItem after: @_currentItem?.filterItem

  removeItem: (item) ->
    # remove from the filter object and update the display
    @filter.removeItem item
    if (@filter.get 'arguments').length
      @render()
    else
      @_addSearchItem()

  indentItem: (ev) ->
    @filter.indentItem @_currentItem?.filterItem
    @render()

  outdentItem: (ev) ->
    @filter.outdentItem @_currentItem?.filterItem
    @render()

  queryChanged: ->
    # need to rebind since query changed
    @delegateEvents()
    @updateDisplay()

  updateDisplay: ->
    query = @state.get 'query'
    @filter = query.get 'filter'
    if not @filter
      @resetFilter()

    else
      # add a grouping operator at the root if needed
      op = @filter.get 'operator'
      if op isnt 'and' and op isnt 'or'
        hold = @filter
        @filter = new FilterItem operator: 'and'
        @filter.appendItem hold
        query.set 'filter', @filter

      @render()

  render: ->
    # don't do anything until the query is resolved - we should get another
    # event that will trigger a refresh when the query is available
    query = @state.get 'query'
    return @ unless query.resolved

    ok = new OtherKup @

    if query.resolved
      ok.form class: 'form-horizontal', =>

        # add the root filter item to the display
        view = @_createFilterItemView @filter
        ok.append view.render()

    unless @options.readOnly
      ok.button class: 'item-add btn input-block-level', 'New Item'

    @

  _addSearchItem: (options) ->
    # figure out the search field - use the passed in value by default, fall
    # back to the next unfiltered field
    fieldName = options?.fieldName
    if not fieldName
      remaining = _.difference @searchableFields, @filter.getReferencedFields()
      fieldName = remaining[0] or @searchableFields[0]

    # append the new item after the selected one if possible
    doAppend = true
    if options?.after
      @filter.locate options.after, (index, group) ->
        doAppend = false
        group.appendItem fieldName, position: index + 1

    # otherwise add it at the end
    item = @filter.appendItem fieldName if doAppend

    # update the display
    @render()

  _createFilterItemView: (item) ->
    op = item.get 'operator'
    # bing - register items so they are garbage collected
    if op is 'and' or op is 'or'
      @options.factory.create ItemGroupView, parent: @, filterItem: item
    else
      @options.factory.create SearchInputItem, parent: @, filterItem: item

class ItemGroupView extends BaseView
  events:
    'click .grouping-operator-toggle': 'toggleGroupOperator'

  className: 'search-group'

  initialize: (options) ->
    super
    {@parent, @filterItem} = options

  toggleGroupOperator: (ev) ->
    @parent.filter.iterate (item) ->
      op = item.get 'operator'
      if op is 'and'
        item.set 'operator', 'or'
      else if op is 'or'
        item.set 'operator', 'and'

    @parent.render()

  render: ->
    ok = new OtherKup @
    ok.div class: "row-cell", =>
      operator = @filterItem.get 'operator'
      ok.div class: 'vertical-cell grouping-operator-toggle grouping-' + operator, ->
        ok.div { class: 'operator-toggle' }, operator

      ok.div class: 'vertical-cell', =>
        for child in @filterItem.get 'arguments'
          view = @parent._createFilterItemView child
          ok.append view.render()

    @

class SearchInputItem extends BaseView
  events:
    'click .currentField': 'renderFieldMenu'
    'click .currentOperator': 'renderOperatorMenu'
    'click .changeFieldName': 'changeFieldName'
    'click .changeOperator': 'changeOperator'
    'click .removeItem': 'removeItem'
    'focus input': 'onInputFocus'
    'change .ds-checkbox': 'onInputChanged'
    'input input': 'onInputChanged'
    'keyup input': 'onKeyUp'

  className: 'control-group'

  initialize: (options) ->
    super
    {@parent, @filterItem, @factory} = options

    # create an input binding that moves data in and out of the filter item
    @_binding =
      # just need a locally unique value
      key: @filterItem.cid
      get: => @searchValue()
      set: (value) =>
        @filterItem.setValue value
        @input.toForm()
      context: => @parent.eventContext()

  searchField: ->
    @filterItem.getFieldName()

  searchValue: ->
    op = @filterItem.get 'operator'
    m = op.match /\s(.*)/
    if m
      m[1]
    else
      @filterItem.getValue()

  render: ->
    ok = new OtherKup @

    # render the current search field and the selection drop list
    ok.span class: 'dropdown', =>
      ok.label
        class: 'currentField control-label dropdown-toggle'
        'data-toggle': 'dropdown'
      , =>
        ok.span { class: 'fieldLabel' }, @searchField() + ' '
        ok.span class: 'caret'
      ok.ul class: 'dropdown-menu'

    # now render the input field
    ok.div class: 'controls'
    @renderInput()

    @

  renderFieldMenu: (ev) ->
    dropdown = ($ ev.target).closest '.dropdown'
    isActive = dropdown.hasClass 'open'
    return if isActive

    ok = new OtherKup @, el: dropdown.find '.dropdown-menu'
    for fieldName in @parent.searchableFields
      ok.li -> ok.a class: 'changeFieldName', fieldName

  renderOperatorMenu: (ev) ->
    dropdown = ($ ev.target).closest '.dropdown'
    isActive = dropdown.hasClass 'open'
    return if isActive

    ok = new OtherKup @, el: dropdown.find '.dropdown-menu'
    for op in FilterItem.operators
      ok.li -> ok.a class: 'changeOperator', op
    ok.li class: 'highlight', -> ok.a class: 'removeItem', 'Remove Item'

  renderInput: ->
    view = @parent.state.get 'view'
    field = view.getField @searchField()
    operator = @filterItem.get 'operator'

    # need to evaluate this if it is an expression
    style = field?.validationStyle
    if ExpressionEvaluator.isExpression style
      context = @parent.eventContext()
      style = ExpressionEvaluator.evaluate style, { context }

    $.when(style).done (styleName) =>
      styleDefinition = (view.get 'styles')?[styleName]
      unless styleDefinition
        styleDefinition = (@factory.session.get 'styles')?[styleName]

      inputOptions =
        view: view
        binding: @_binding
        blockLevel: true
        compact: true
        multiSelect: _.contains styleDefinition?.searchFlags, 'MultiSelect'
        modifiedEvent: 'input'
        validationStyle: styleName

        # add a prepended add-on that displays the current operator and
        # lets the user select a different one
        prepend: (ok) ->
          ok.div class: 'btn-group', ->
            ok.span class: 'btn dropdown', ->
              ok.a
                class: 'currentOperator dropdown-toggle'
                'data-toggle': 'dropdown'
              , (operator.match /[^ ]*/)[0]
              ok.ul class: 'dropdown-menu'

      $.when(@parent.inputFactory.createFieldInput field, inputOptions)
        .done (@input) =>
          (@$ '.controls').html @input.render().el

          # trigger initial data load - don't format is null/is not null
          @input.toForm bypassFormat: operator in [ 'is null', 'is not null' ]

  changeFieldName: (arg) ->
    # this is either called from an event or directly
    fieldName = if arg.target then $(arg.target).text() else arg

    @filterItem.setFieldName fieldName

    # also update the displayed value
    @$('.fieldLabel').text fieldName + ' '
    @renderInput()

  changeOperator: (arg) ->
    # this is either called from an event or directly
    operator = if arg.target then $(arg.target).text() else arg

    prevOp = @filterItem.get 'operator'
    @filterItem.set 'operator', operator

    # also update the displayed value - split complex operators like 'is null'
    # and 'is not null' into a short part (is) and stick the rest in the input
    [m0, operator, m2, value] = operator.match /([^ ]*)( (.*))?/

    @$('.currentOperator').text operator
    if value or prevOp is 'is null' or prevOp is 'is not null'
      @input.set value

  removeItem: ->
    @parent.removeItem @filterItem

  onInputFocus: (ev) ->
    console.debug 'DataSearchView.onInputFocus()' if TRACE
    @parent.state.set 'selectedField', @filterItem.getFieldName()
    @parent._currentItem = @

  onInputChanged: (ev) ->
    # changing the 'null' or 'not null' values in the input should switch the
    # operator back to '='
    operator = @filterItem.get 'operator'
    if operator is 'is null' or operator is 'is not null'
      @changeOperator '='

    # also detect if an operator is entered followed by a space
    value = @input.get()
    lower = (String value).toLowerCase()
    if lower[lower.length - 1] is ' ' and
        ( _.indexOf FilterItem.operators, lower.trim() ) >= 0
      @changeOperator lower.trim()
      @filterItem.setValue ''
      (@$ 'input').val '' if lower.trim() not in [ 'is null', 'is not null' ]
    else
      $.when(@input.behavior.validate value)
        .done( (validated) => @filterItem.setValue validated )
        .fail (error) => @input.throb()

  onKeyUp: (ev) ->
    # submit query with enter key
    if ev.which is 13
      @parent.updateResults()
      false
    # bing: gross - IE9 does not fire the input event for backspace/delete,
    # so we miss those changes: http://help.dottoro.com/ljhxklln.php
    # this ends up firing onInputChanged twice in other environments, but
    # the end result is the same
    else if ev.which in [ 8, 46 ]
      @onInputChanged ev

module.exports = DataSearchView
