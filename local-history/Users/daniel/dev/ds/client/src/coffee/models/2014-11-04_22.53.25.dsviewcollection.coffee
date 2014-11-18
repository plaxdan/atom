# DataSplice View Collection
#
# A DSView collection represents a complete list of view configurations
# returned by the server. Methods to do lookups on views / view categories
# etc can be performed through it's instance methods.
#
# @XXX: It is important that this data serializes and deserializes nicely
# so it can exist as a json serialized entity in the local storage. In the future
# once we are working with larger datasets, it would be beneficial to use
# a separate offline datastore to keep this data (apart from the DWVIEW_* database)
Backbone = require 'backbone'
DSView = require './dsview'
StorageFactory = require '../storage/storagefactory'
UrlHelper = require '../utils/urlhelper'

class DSViewCollection extends Backbone.Collection
  model: DSView
  url: -> UrlHelper.prefix 'ds/views'

  constructor: ->
    super

    # use local storage to persist data
    @storage = StorageFactory.modelStorage [ 'webSql', 'localStorage' ]

  # The /ds/views api call returns a simple
  # list of IDs for the views. We need to convert them to
  # actual DSView objects.
  parse: (resp, xhr) ->
    @_json = JSON.stringify resp

    # return an array of identifier objects
    for item in resp
      id: item.name
      checksum: item.checksum

  toJSON: ->
    _.clone @models

  getViewIdentifiers: ->
    @pluck 'id'

  getViewNames: ->
    (_.collect @getViewIdentifiers(), (id) -> (id.match /([^\/]*$)/)[1]).sort()

  get: (key) ->
    # if key is an identifier the base implementation will be the most
    # efficient since it has a id map
    view = super
    if not view
      # also look the view up by name
      if _.isString key
        view = _.find @models, (dsView) -> (dsView.viewName() is key)

        # bing:deprecated - handle 4.0-style view references with backslash
        # delimiters
        if not view and key.match /\\/
          view = @get key.replace /\\/g, '/'

        view

      # or array index
      else if ( _.isNumber key ) and key >= 0 and key < @models.length
        view = @models[key]
    view

  deleteCache: ->
    keys = _.filter (_.keys localStorage), (key) ->
      key.match '^ds/views/get'

    localStorage.removeItem key for key in keys


  loadAllLocal = (arrayOfViews) ->
    

module.exports = DSViewCollection
