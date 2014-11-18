Backbone = require 'backbone'

class BaseModel extends Backbone.Model

  constructor: (attributes) ->
    # default implementation bypasses parse for constructor, which is a
    # useful place to set up the class (inflate child objects, etc)
    unless _.isEmpty attributes
      super @parse _.clone attributes
    else
      super

  # Adds support for accessing model attributes in a chained "." separated
  # attr call. ex:
  # @state.get "query.dataSet"  ==  (@state.get "query").dataSet
  # @state.get "query.view.submodel"    ==  ((@state.get "query").get "view").get "submodel"
  get: (attr) ->
    return if not _.isString attr
    if attr.indexOf(".") == -1
      return @.attributes[attr]
    chain = attr.split "."
    resolved = @
    for _p, index in chain
      # prefer attributes over properties
      # check for get method (support for raw JS objects as accessors as well)
      resolved = if resolved.get? then (resolved.get _p) or resolved[_p] else resolved[_p]

      if resolved is undefined
        if index < chain.length - 1
          console.warn "#{attr} not resolvable in #{@constructor.name}"
        return
    resolved

  isCached: ->
    (@storage?.isCached @) or false

  deleteCache: ->
    # call deleteCache before clear since the storageKey might depend on the
    # current attributes
    d = @storage?.deleteCache @
    @clear()

    # return the delete deferred (if any)
    d

  storageKey: -> _.result @, 'url'

  storeLocal: ->
    unless @storage
      throw new Error 'No storage mechanism associated with the model'
    @storage.store @

  loadLocal: ->
    unless @storage
      throw new Error 'No storage mechanism associated with the model'
    try
      @storage.load @
      @loadedLocal = true
    catch
      @loadedLocal = false

  fetch: ->
    # persist locally after fetch is complete if storage is specified
    super.done => @storeLocal() if @storage

  save: ->
    # also save after store if possible
    super.done => @storeLocal() if @storage

module.exports = BaseModel
