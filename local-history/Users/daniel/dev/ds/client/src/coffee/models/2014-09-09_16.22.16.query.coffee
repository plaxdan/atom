# Query
#
# Query objects represent a set of data within a DataSplice view.
#
# The DataController listens to events posted by Query and DataSet objects to
# to perform the actual work of fetching data, storing it locally, and
# building the proper results for a query.
#
# Queries should be created using the DataController.createQuery factory
# method, rather than instantiating them directly
BaseModel = require './basemodel'
FilterItem = require './filteritem'
SortInfo = require './sortinfo'
DataSet = require './dataset'

class Query extends BaseModel
  defaults:
    target: ''
    localData: false
    filter: null
    sort: null

  constructor: (attributes) ->
    {@pubSub, @inhibitParse} = attributes

    @resolved = false

    # strip attributes that aren't in the defaults collection
    super @parse _.pick attributes, _.keys @defaults

  clone: ->
    clone = super
    clone.pubSub = @pubSub
    clone

  parse: (attributes) ->
    # inhibitParse keeps the filter/sort attributes unmodified. this is used
    # primarily by unit tests to simplify a few cases
    if not @inhibitParse
      newFilter = null
      newSort = null

      # convert filter to a model if needed
      if attributes?.filter
        if (_.isObject attributes.filter) and not (attributes.filter instanceof FilterItem)
          newFilter = new FilterItem attributes.filter

        # also support specifying filter as a string
        else if _.isString attributes.filter
          newFilter = FilterItem.parseStatement attributes.filter

      # do the same with the sort
      if attributes?.sort
        if (_.isObject attributes.sort) and not (attributes.sort instanceof SortInfo)
          newSort = new SortInfo attributes.sort

        # also support specifying sort as a string
        else if _.isString attributes.sort
          newSort = SortInfo.parseStatement attributes.sort

      # clone attributes if we're changing things so we don't clobber the
      # object passed to us
      if newFilter or newSort
        attributes = _.clone attributes
        attributes.filter = newFilter if newFilter
        attributes.sort = newSort if newSort

    attributes

  initialize: (options) ->
    @dataSet = new DataSet null, query: @
    @dataSet.on 'reset', => @isFetching = false

    if (@get "sort") is null
      sort = new SortInfo

  # completely bypass the collection's default fetch behavior and delegate
  # to someone listening on the global fetchQuery event (probably the data
  # controller)
  fetch: (options) ->
    # this event here is used to notify subscribers of this query that a fetch
    # attempt has started
    @isFetching = true
    @trigger 'fetchQuery', @

    # the pubsub version actually triggers the fetch
    @pubSub.trigger 'fetchQuery', @, options, ->
      options.success() if options?.success

  # notification from the data controller that an error has occurred during a
  # fetch
  fetchError: (error) ->
    @isFetching = false
    @trigger 'fetchError', @, error

  replaceAttributeReferences: (context) ->
    # cache timeout is in seconds
    @cacheTimeout = (parseInt context.getAttribute 'DS_CACHE_TIMEOUT') or 5

    # return quickly if there is nothing to do
    filter = @get 'filter'
    if filter instanceof FilterItem
      # defer all the processing to the filter object
      filter.replaceAttributeReferences context.then =>
        @resolved = true
        @trigger 'resolved', @

    else if not @resolved
      @resolved = true
      @trigger 'resolved', @

  toString: ->
    sections = [ "Target: #{ @get 'target' }" ]

    filter = @get 'filter'
    if filter and ( _.isString(filter) or not filter.isEmpty() )
      sections.push "Filter: #{ filter.toString() }"

    sort = @get 'sort'
    if sort
      sections.push "Sort: #{ sort.toString() }"

    sections.join ' '

module.exports = Query
