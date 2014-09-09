# context object that represents the current state used to evaluate an event
# this is passed along as event actions are executed during event processing
ExpressionContext = require '../expressions/expressioncontext'

class EventContext extends ExpressionContext
  # defines the precedence for attribute objects in a collection. the
  # collection is sorted by weight, so higher numbers have lower precedence
  @AttributePrecedence =
    Explicit   : 0
    Record     : 1
    Session    : 5
    User       : 10
    Query      : 15
    View       : 20
    ViewFields : 21
    BuiltIn    : 40

  error: null

  constructor: (options) ->
    super
    return unless options

    @cid = _.uniqueId 'context'
    @_stateStack = []

    if options?.state
      @state = options.state
      @view = options.state.get 'view'
      @record = options.state.selectedRecord()
      @dataSet = options.state.get 'query.dataSet'

    else
      _.extend @, _.pick options, [ 'record', 'view', 'dataSet' ]

    precedence = EventContext.AttributePrecedence
    if @record
      @addAttributes @record, precedence.Record
      @view = @record.view unless @view
    else if @dataSet
      exclusive = (@dataSet.query.get 'filter')?.getExclusiveAttributes()
      unless _.isEmpty exclusive
        @addAttributes exclusive, precedence.Query

    if @view
      @addAttributes (@view.get 'attributes'), precedence.View

      # add empty field attributes if we don't have a record to avoid
      # reference errors
      unless @record
        @addAttributes @view.getFieldAttributes(), precedence.ViewFields

  availableFunctions: ->
    @_functions.map (functionSet) ->
      functionSet.map (func) -> func.name

  availableAttributes: ->

  setRecord: (record) ->
    # unregister the current record if needed
    @removeAttributes @record if @record
    @removeAttributes (@view.get 'attributes') if @view

    @addAttributes record, EventContext.AttributePrecedence.Record
    @record = record
    @view = record.view
    @addAttributes @view.get 'attributes'
    @dataSet = null
    @eventSource = null

  setError: (error) ->
    @error = String error

  getExplicitAttributes: ->
    if not @_explicit
      @_explicit = {}
      @addAttributes @_explicit, EventContext.AttributePrecedence.Explicit
    @_explicit

  # updates attributes in the current context. this will typically set values
  # in the explicit attributes collection, but if a record is available any
  # keys that match field names will be applied to the record
  setAttributes: (attributes, options) ->
    return if _.isEmpty attributes

    if @record and not options?.explicitOnly
      recordValues = {}
      for key, value of attributes
        continue unless (@record.view.fieldIndex key) >= 0
        recordValues[key] = value
        delete attributes[key]

      @record.setValue recordValues

    # apply remaining values to the explicit attributes collection
    _.extend @getExplicitAttributes(), attributes

  pushState: ->
    state =  { @state, @view, @record, @dataSet }

    # attributes are more work to push/clone
    _.extend state, { @_attributes, @_explicit }
    @_attributes = @removeAttributes @_explicit
    if @_explicit
      @_explicit = _.clone @_explicit
      @addAttributes @_explicit, EventContext.AttributePrecedence.Explicit

    @_stateStack.push state

  popState: ->
    _.extend @, @_stateStack.pop()

module.exports = EventContext
