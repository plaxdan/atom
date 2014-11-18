# Event Factory
# global event factory that is used to create (and execute if desired) event
# handlers that perform client-side functionality in a way that can be
# extended/modified by the local configuration
EventContext = require './eventcontext'
EventHandler = require './eventhandler'
EventRegistry = require './eventregistry'
ContextFunctionHandler = require '../expressions/contextfunctionhandler'

class EventFactory

  # this is a singleton that is created by the application controller
  constructor: (@factory, @dataSpliceWebService) ->
    # register this object in the factory
    @factory.register 'eventFactory', @

    # this is the default event action chain we execute if nothing else is
    # defined
    @_defaultChain = [ type: 'DefaultChainAction' ]

    # default built-in attribues
    @_builtInAttributes =
      DS_CURRENT_TIME: ':= now()'
      DS_GMT_OFFSET: ':= getGmtOffset()'
      DS_LOCALE: ':= getLocale()'
      DS_USER: ':= getUserName()'
      DS_DOMAIN: ':= getUserDomain()'
      DS_VIEW_NAME: ':= getViewName()'
      DS_VIEW_IDENTIFIER: ':= getViewIdentifier()'
      DS_QUERY_NAME: ':= getQueryName()'
      DS_FIELD_NAME: ':= getSelectedField()'

    # handler for processing context-aware functions
    @_contextFunctions = new ContextFunctionHandler @factory

  # generate a new event context given the current environment
  context: (options) ->
    options or= {}

    if options.dataSet and not options.view
      vc = @factory.session.get 'views'
      options.view = vc.get options.dataSet.query.get 'target'
    context = new EventContext options

    # register the built in attributes and context function handler
    context.addAttributes @_builtInAttributes, EventContext.AttributePrecedence.BuiltIn
    context.registerFunctionHandler @_contextFunctions

    # add current session attributes - add default session settings and
    # locally persisted values
    t = @factory.session?.get 'attributes'
    context.addAttributes t, EventContext.AttributePrecedence.Session if t
    t = @factory.settings?.get 'sessionAttributes'
    context.addAttributes t, EventContext.AttributePrecedence.Session - 1 if t

    context

  # factory method to create a new event handler
  create: (identifier, context, defaultHandler, options) ->

    # find a event handler in the context
    # bing - this needs a lot of work
    vc = @factory.session.get 'views'
    actions = null
    source = if context.eventSource
      context.eventSource
    else if context.dataSet
      vc.get context.dataSet.query.get 'target'
    else if context.record
      context.record.view
    else if context.view
      context.view

    events = source?.get 'events'
    if events
      actions = @_findEvent events, EventRegistry.parseIdentifier identifier

    # also look at session for event definition
    unless actions
      events = @factory.session.get 'events'
      if events
        actions = @_findEvent events, EventRegistry.parseIdentifier identifier

      # fall back to the default chain
      actions = @_defaultChain unless actions

    # return a new handler for the event
    context.factory = @factory
    new EventHandler identifier, context, actions, defaultHandler, options

  # shortcut to directly create and execute an event handler
  execute: (identifier, context, defaultHandler, options) ->
    handler = @create identifier, context, defaultHandler, options
    handler.execute()

  _findEvent: (events, identifier) ->
    for key, actions of events
      test = EventRegistry.parseIdentifier key

      continue unless test.event is identifier.event

      # match qualifier as well - event bindings can specify a commas
      # separated qualifier list to match multiple values
      if identifier.qualifier
        list = (test.qualifier?.split /\s*,\s* /) or []
        continue unless _.contains list, identifier.qualifier

      return actions

    undefined

module.exports = EventFactory
