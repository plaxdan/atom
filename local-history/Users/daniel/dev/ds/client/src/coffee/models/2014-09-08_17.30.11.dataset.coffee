# Model that represents the set of records that are the results of a query.
# This is populated by calling query.fetch, and listening to the 'reset' event
# on the dataset.
Backbone = require 'backbone'
Record = require './record'
UrlHelper = require '../utils/urlhelper'

class DataSet extends Backbone.Collection
  model: Record

  url: -> UrlHelper.prefix "ds/views/fetch/#{ @query.get 'target' }"

  initialize: (models, options) ->
    {@query} = options

    @totalRecordCount = undefined
    @hasFinalRecordCount = false

    # makes debugging object references a little easier
    @cid = _.uniqueId 'ds'

  get: (key) ->
    if _.isNumber key
      # fire an event if the record has not been fetched.  something (the data
      # controller) should be listening and fetch more records
      if not @models[key] and @totalRecordCount? and key < @totalRecordCount
        @query.pubSub.trigger 'cacheMiss', @, index: key

      @models[key]
    else
      super

  indexOf: (key) ->
    # use default implementation if possible
    index = super
    return index if index >= 0

    # also search by id
    for test, index in @models
      return index if test.id in [ key, key.id, key.oldId ]

    -1

  add: (models, options) ->
    # increment record count for new records if we don't have a high water mark
    if options?.updateCount
      count = if _.isArray models then models.length else 1

      # need to set an initial count if the dataset hasn't been fetched yet
      if @totalRecordCount is undefined
        @totalRecordCount = count
        @hasFinalRecordCount = true

      # otherwise only increase the count if we don't have a high water mark
      else if @hasFinalRecordCount
        @totalRecordCount += count

    super

  remove: (models, options) ->
    # decrement record count for new records if we don't have a high water mark
    if @hasFinalRecordCount and options?.updateCount
      count = if _.isArray models then models.length else 1
      @totalRecordCount -= count

    super

  # updates the stored version of a record within the dataset
  update: (models) ->
    if not _.isArray models
      models = [ models ]

    for record in models
      index = @indexOf record

      # also handle updates where the record id changed
      if index < 0 and record.oldId
        index = @indexOf record.oldId
      @models[index] = record if index >= 0

  # fire an event to create a record in this dataset. note this does not
  # return the deferred object to notify when the record has been completed,
  # if the caller is interested in that information it should invoke
  # createRecord directly with the modification handler
  createRecord: (options) ->
    result = {}
    @query.pubSub.trigger 'createRecord', @, options

module.exports = DataSet

