# The Data Controller for the application.
#
# This controller is responsible for maintaining the storage and data
# associated with the view objects available to the session. It listens to
# global events indicating that data needs to be fetched, and mediates between
# the server and local storage adapter to construct the desired results.
#
# It also acts as a factory for properly creating ViewDisplayState and Query
# objects
Backbone = require 'backbone'
StorageFactory = require '../storage/storagefactory'
DSView = require '../models/dsview'
Query = require '../models/query'
FilterItem = require '../models/filteritem'
SortInfo = require '../models/sortinfo'
Record = require '../models/record'
ViewDisplayState = require '../models/viewdisplaystate'
UserError = require '../models/usererror'
EventRegistry = require '../event/eventregistry'

class DataController

  constructor: (@factory, options) ->
    # register this controller in the factory
    @factory.register 'dataController', @

    # initialize storage adapter - allow global options to specify the
    # adapter driver to use
    adapter = options?.storageAdapter or [ 'webSql', 'memory' ]
    # adapter = options?.storageAdapter or [ 'memory' ]
    @storage = StorageFactory.dataStorage adapter, @factory

    # map of cached query results
    @_queryCache = {}

    @factory.pubSub.on

      # TODO: move this event handler into a DataService class which is then
      # used within the SessionService.

      # listen to view change events once the session has loaded
      sessionLoaded: => @initializeViewStorage()

      # listen for requests to fetch data for a query
      fetchQuery: (query, options, callback) =>
        Promise.resolve @fetchQuery query, options
          .done ->
            callback() if callback

      # listen for cache miss events on datasets to fetch additional records
      cacheMiss: (dataSet, options) =>
        # fetch the next page of records for the query
        # note, this doesn't necessarily get the page needed by the caller if
        # scrolling a large amount, etc
        options = data:
          Offset: dataSet.models.length if dataSet.models.length > 0

        cacheKey = @_createCacheKey dataSet.query, options.data?.Offset
        unless @_queryCache[cacheKey]
          @fetchQuery dataSet.query, options

      # invalidate the local cache when the connection state changes
      'app.connected app.disconnected': =>
        @clearQueryCache()

      # also clear the cache when data is modified
      'recordCreated recordModified recordRemoved': =>
        @clearQueryCache()

      # handle the firehose of sync data being pushed onto the device.
      'sync.offlineData': (data, cb) =>
        @handleOfflineData data, cb
      'sync.purgeRecords': (purgeMap, cb) =>
        @handlePurgeRecords purgeMap, cb

  initializeViewStorage: ->
    vc = @factory.session.get 'views'

    # process the existing views and ensure the internal schema is set up
    validUrls = for view in vc.models
      @storage.ensureSchema view
      view.url()

    # clean up locally cached views that are no longer available
    cachedViews = _.filter (_.keys localStorage), (test) ->
      test.match /^ds\/views\/get\//

    for url in cachedViews
      continue if (_.indexOf validUrls, url) >= 0

      # remove the cached view configuration
      localStorage.removeItem url

      # also delete the data for the view
      [m, id] = url.match /^ds\/views\/get\/(.*)/
      @storage.truncateData id, destroy: true


  clearQueryCache: ->
    @_queryCache = {}

  # factory method to create view display state objects. these are used by the
  # UI views to maintain query and data state information
  createDisplayState: (options) ->
    options or= {}

    # ensure that we have a view available
    unless options.view
      vc = @factory.session.get "views"

      # prefer settings from the query
      if options.query
        # convert to model object if needed
        unless options.query instanceof Query
          options.viewIdentifier = options.query.target
        else
          options.viewIdentifier = options.query.get 'target'

        options.view = vc.get options.viewIdentifier
        unless options.query instanceof Query
          # pass optional context if possible
          options.query = @createQuery options.view,
            _.extend { context: options.context }, options.query

      # fall back to the view identifier
      else if options.viewIdentifier
        options.view = vc.get options.viewIdentifier

    # fail if we weren't able to resolve a view
    unless options.view
      throw new Error "Invalid view: #{ options.viewIdentifier }"

    # make sure the identifer is correct
    options.viewIdentifier = options.view.id

    # set up the query properly
    unless options.query
      queryOptions = if options.action
        # bing:deprecated - need to get local query moved to be a property
        # of the query
        _.extend localData: options.action.localQuery,
          options.action.query
      else
        _.pick options, 'localData', 'filter', 'sort'

      # pass valid options along to the query
      options.query = @createQuery options.view.id, queryOptions
    else if (options.query.get 'target') != options.view.id
      throw new Error "Query target mismatch: #{ options.query.get 'target' }"

    new ViewDisplayState options

  # creates a display state object that contains a single record
  createRecordDisplayState: (record, options) ->
    options or= {}

    options.view = record.view
    options.viewIdentifier = options.view.id

    # bing - create query with a filter that matches the record's primary key
    options.query = @createQuery record.view
    options.query.dataSet.reset record
    options.query.dataSet.totalRecordCount = 1
    options.query.dataSet.hasFinalRecordCount = true
    options.selectedIndex = 0

    new ViewDisplayState options

  # Whenever a UIView needs a query to back it, it must delegate to this
  # function in order for event consistency to be maintained.
  # The returned @see {Query} object will have event handlers bound directly
  # within the data controller.
  #
  # TODO: return a ppromise for the Query that is fulfilled only when the
  # Query's attributed have been evaluated against the current context. Also
  # put context into the method signature instead of in options.
  createQuery: (view, options) ->
    vc = @factory.session.get 'views'
    if view instanceof DSView
      viewConfig = view
    else
      viewConfig = vc.get view

    throw (new Error "Invalid query target: #{view}") if not viewConfig

    options or= {}
    options.target = viewConfig.get 'identifier'

    # create the new query
    query = new Query _.extend options, pubSub: @factory.pubSub

    # update attribute references
    ef = @factory.eventFactory
    context = options.context or ef.context _.extend options, view: viewConfig
    (Promise.resolve query.replaceAttributeReferences context)
      .catch (error) =>
        @factory.pubSub.trigger 'displayNotification',
          severity: 'error'
          message: error

    query

  fetchQuery: (query, options) ->
    options or= {}

    @factory.pubSub.trigger 'showWait' if options.showWait

    # calculate a unique key we can use to group requests for the same data
    cacheKey = @_createCacheKey query, options.data?.Offset

    # see if we have cached results for this query
    lookup = @_queryCache[cacheKey]
    cached = true
    if options.bypassCache or not lookup
      # insert a cache entry so subsequent calls refer to the same results
      lookup = new $.Deferred
      @_queryCache[cacheKey] = lookup
      cached = false

    doFetch = =>
      unless cached
        doQuery = =>
          # decide if we need to make a request to the server to update the
          # local storage so localQuery has data to refer to
          server = if !@_canQueryServer() or query.get 'localData'
            options.trace = not options.quiet
            # pass empty server results in this case
            null
          else
            @_serverQuery query, options

          Promise.resolve(server).done (serverResults) =>
            # pass to localQuery to handle the final results
            options.serverResults = serverResults
            Promise.resolve(@_localQuery query, options).done (localResults) =>
              unless options.bypassCache
                @_cacheResults cacheKey, localResults, query
              lookup.resolve localResults

        # first need to wait for the query to resolve attribute references
        if query.resolved
          doQuery()
        else
          query.on 'resolved', doQuery

      (Promise.resolve lookup)
        .then (results) =>
          ds = query.dataSet
          ds.totalRecordCount = results.totalRecordCount
          ds.hasFinalRecordCount = results.hasFinalRecordCount
          ds.reset results.records

          @factory.pubSub.trigger 'hideWait' if options.showWait
        , (error) =>
          # error was already displayed
          @factory.pubSub.trigger 'hideWait' if options.showWait

    # use the ClientQuery event to trigger the fetch when executed with a
    # display state context - this happens for interactive queries executed
    # by the UI and allows the configuration to hook into the process
    if options.context
      @factory.eventFactory.execute EventRegistry.ClientQuery,
        options.context, doFetch
      .then undefined, (error) ->
        query.fetchError error
    else
      doFetch()

    # return the lookup promise
    lookup

  # Stores a record in the database (depends on which adapter is enabled).
  #
  # @param record - the record you want to store
  # @param options - an object of options (must contain a view, and optionally
  #       a query object.)
  # @param storedCallback (optional) - a callback that notifies you when the
  #       record has actually been stored in the database. Both use cases can
  #       be useful, as eventual consistency is desired when loading lots of
  #       data initially.
  storeRecord: (record, options, storedCallback) ->
    # convert to a model object if needed
    if record not instanceof Record
      if not options?.view
        throw new Error 'View must be specified to store record'

      # values are passed as ISO 8601 formatted strings
      values = for field, index in options.view.get 'fields'
        value = record['values'][index]
        if value and field.dataType is 'DateTime'
          new Date value
        else
          value

      id = record.identity
      record = new Record
        pubSub: @factory.pubSub
        view: options.view
        checksum: record.checksum
        values: values
      record.id = id

    # handle if the record is locally modified
    unless options?.ignoreModifications
      @factory.modificationHandler.applyLocalModifications record

    # delegate to the storage handler to actually persist the data
    # the bulkData option is passed when importing offline data and the records
    # will be batched into bulk transactions
    unless options?.bulkData
      Promise.resolve @storage.storeRecord record, options
        .then ->
          storedCallback? record
    else
      # return the new record synchronously here
      record

  removeRecord: (record, callback) ->
    Promise.resolve @storage.removeRecord record
      .then callback

  # attempts to find the specified record. this only works for data that is
  # locally cached, it will return null otherwise
  findRecord: (options, callback) ->
    # allow a modification object to be passed as well
    if options?.modification
      options.recordId = options.modification.get 'recordId'
      options.viewId = options.modification.get 'viewId'
    # delegate to the storage handler
    Promise.resolve @storage.findRecord options
      .then (record) =>
        # handle if the record is locally modified
        @factory.modificationHandler.applyLocalModifications record if record

        callback record

  # Stores offline sync data in the local storage adapter
  #
  # @param response - server response during the offline sync data firehose.
  handleOfflineData: (response, cb) ->
    view = (@factory.session.get 'views').get response['viewIdentifier']

    # make sure the view schemas are all in place before we get rolling with
    # the data updates.
    # store all the records in the correct storage facility
    records = _.map response['records'], (record) =>
      @storeRecord record, { view, bulkData: true }
    @storage.bulkStoreRecords records
      .then cb

  handlePurgeRecords: (purgeMap, cb) ->
    async.eachSeries (_.keys purgeMap),
      (viewName, done) =>
        recordIds = purgeMap[viewName]
        if recordIds?.length
          @storage.purgeRecords viewName, recordIds
            .then -> done()
        # an empty purge list means to truncate the table
        else
          @storage.truncateData viewName
            .then -> done()
      , cb

  _canQueryServer: ->
    # queries can be fired before the session is completely initialized
    # the state isn't connected yet
    cm = @factory.connectionManager
    not cm.isSyncing() and cm.state in [ 'connected', 'unknown' ]

  _serverQuery: (query, options) ->
    return false unless @_canQueryServer()

    # pass options to the server that affect the query
    if _.isString options.data
      queryOptions = JSON.parse options.data
    else
      queryOptions = options.data or {}

    # bing - might be nice to be able to pass JSON filter and sort objects
    filter = query.get 'filter'
    if filter instanceof FilterItem
      filter = filter.toString()
    if filter
      queryOptions['filter'] = filter

    sort = query.get 'sort'
    if sort instanceof SortInfo
      sort = sort.toString()
    if sort
      queryOptions['sort'] = sort

    promise = new $.Deferred

    # queue server requests so we can process them serially. this prevents
    # 'session in use errors' if we send multiple requests where one or more
    # take over 5 seconds to complete
    @_serverFetchQueue or= []
    @_serverFetchQueue.push
      query: query
      queryOptions: queryOptions
      quiet: options.quiet
      promise: promise
    @_processServerFetchQueue()

    promise.promise()

  _processServerFetchQueue: ->
    return if @_inServerFetch or not @_serverFetchQueue?.length
    @_inServerFetch = true

    next = @_serverFetchQueue.shift()
    { query, queryOptions, promise } = next

    unless next.quiet
      console.debug "[DataController] Remote fetch: #{ query.get 'target' } - #{ JSON.stringify queryOptions } (#{query.cid})"

    start = new Date
    Backbone.sync 'read', query.dataSet,
      dataType: 'json'
      data: @_encodeQueryString queryOptions unless _.isEmpty queryOptions
      success: (resp) =>
        end = new Date

        results = _.pick resp, [ 'totalRecordCount', 'hasFinalRecordCount' ]

        view = (@factory.session.get 'views').get query.get 'target'
        async.mapSeries resp['records'],
          (r, done) =>
            @storeRecord r, { view, query }, (stored) ->
              done null, stored

          , (err, records) ->
            results.records = records
            unless next.quiet
              console.debug "Fetched #{ resp.records.length } record(s) in #{ end - start }ms (#{query.cid})"
            promise.resolve results

      error: (error) =>
        error = new UserError error: error.responseText
        query.fetchError error
        @factory.pubSub.trigger 'displayNotification',
          severity: 'error'
          message: error.get 'message'
          error: error

        promise.reject error

    promise.always =>
      @_inServerFetch = false
      @_processServerFetchQueue()

  _localQuery: (query, options) ->
    promise = new $.Deferred

    if options.trace
      start = new Date
      console.debug "Local fetch: #{ query.toString() } - (#{query.cid})"

    Promise.resolve @storage.doQuery query, options
      .then (records) =>
        # handle if the records are locally modified
        @factory.modificationHandler.applyLocalModifications records

        localResults =
          totalRecordCount: records.length
          hasFinalRecordCount: true
          records: records

        # make sure local and remote results are consistent
        if options.serverResults?
          @_mergeResults options.serverResults, localResults

        if options.trace
          end = new Date
          console.debug "Fetched #{ records.length } record(s) in #{ end - start }ms (#{query.cid})"

        promise.resolve localResults

    promise.promise()

  _mergeResults: (server, local) ->
    # detect local records that are no longer available - this is only
    # possible when the server resultset contains the complete set of data
    # for the query, then we can compare that against the local results
    # and remove records that are no longer available
    local.offset = server.offset
    unless server.hasFinalRecordCount
      local.totalRecordCount = server.totalRecordCount
      local.hasFinalRecordCount = false

    else if server.records.length is server.totalRecordCount
      serverIds = _.pluck server.records, 'id'
      # use indexOf optimized for sorted arrays
      serverIds.sort()

      prune = []
      for record in local.records
        continue if record.modification?
        if (_.indexOf serverIds, record.id, true) < 0
          prune.push record

      if prune.length
        @removeRecord record for record in prune

        local.records = _.difference local.records, prune
        local.totalRecordCount -= prune.length

    # incomplete server results are available
    else
      local.totalRecordCount = server.totalRecordCount

    # push high-water mark to be greater than the current results length
    # this ensures we can keep scrolling when partial local data is available
    if not local.hasFinalRecordCount and local.records.length >= local.totalRecordCount
      local.totalRecordCount = local.records.length + 1

  _createCacheKey: (query, offset) ->
    "#{ query.toString() } Offset: #{ offset or 0 }"

  _cacheResults: (key, results, query) ->
    # results are cached until the local data is resolved, and clearQueryCache
    # might have been called since the initial fetch. if this is the case
    # the entry for this key will have been removed, so we don't want to add
    # the results to the cache
    return unless @_queryCache[key]?

    # bing - we probably don't want one timeout per query, but rather an
    # interval to clean the cache occasionally
    timeout = 1000 * query.cacheTimeout
    if timeout
      _.delay =>
        delete @_queryCache[key]
      , timeout

      # resolve the original deferred so anything queued up is notified
      @_queryCache[key] = results

  _encodeQueryString: (options) ->
    encoded = JSON.stringify options
    # hash characters in the data will truncate the request string, so they
    # need to be encoded
    encoded.replace /#/g, '%23'

module.exports = DataController