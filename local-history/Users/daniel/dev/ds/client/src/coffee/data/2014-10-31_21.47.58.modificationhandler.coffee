# The Modification Handler for the application.
#
# This handler is responsible for handling modification events on records and
# data sets, maintaining the list of RecordModification objects that
# represent unsaved changes, and committing these changes to the server
#
# The Record model delegates any modification events to this controller by
# posting events to the global pubSub. These are routed directly to matching
# methods so calling code can either invoke methods directly on the data
# objects or through the modification handler and get the same result. ie, the
# following statements are equivalent:
# record.resetRecord()
# @factory.modificationHandler.resetRecord record
Backbone = require 'backbone'
DisplayStateController = require './displaystatecontroller'
Record = require '../models/record'
RecordModification = require '../models/recordmodification'
UserError = require '../models/usererror'
EventRegistry = require '../event/eventregistry'
DataTypeHelper = require '../expressions/datatypehelper'
ExpressionEvaluator = require '../expressions/expressionevaluator'
ModalRecordAction = require '../ui/data/modalrecordaction'
CommitStatus = require '../ui/feedback/commitstatus'

class ModificationHandler extends Backbone.Collection
  model: RecordModification

  @_storagePrefix = 'Modification:'

  constructor: (@factory) ->
    super null

    # register this handler in the factory
    @factory.register 'modificationHandler', @

    # map of modifications by record id so we look them up easily
    @_byRecordId = {}

    # map to store records while we process them
    @_recordMap = {}

    # listen to global events triggered by records
    @factory.pubSub.on 'resetRecord', (record) =>
      @resetRecord record
    @factory.pubSub.on 'verifyRecordChanges', (record, changes, options) =>
      @verifyRecordChanges record, changes, options
    @factory.pubSub.on 'createRecord', (dataSet, options) =>
      @createRecord dataSet, options
    @factory.pubSub.on 'markDeleted', (record) =>
      @markDeleted record

    @load()

  # returns a collection of the modification counts for a view, grouped by
  # transaction type
  viewStats: (view) ->
    key = view.id or view

    details = {}
    for mod in @models
      continue unless key is mod.get 'viewId'

      type = mod.get 'eventType'
      if details[type]?
        details[type]++
      else
        details[type] = 1

    details

  get: (key) ->
    # look up by record key if possible
    if key instanceof Record
      m = @_byRecordId[@_getKey key]
      return m if m

    super

  remove: (models, options) ->
    super

    unless _.isArray models
      models = [ models ]

    _.each models, (modification) =>
      key = @_getKey modification
      delete @_byRecordId[key]

      # this will remove local storage for the modification
      @save { key }

      @_forgetBinaryResource modification

      # try to find the record associated with the modification and remove any
      # changes
      unless options?.ignoreRecord
        d = options?.record
        unless d
          d = new $.Deferred
          @_findRecord modification, d.resolve

        $.when(d).done (record) =>
          if record
            # remove new records from storage unless an updated version is
            # available
            if (modification.get 'eventType') is RecordModification.InsertRecord
              if options?.updated
                record.modification = null
              else
                @factory.dataController.removeRecord record, =>
                  unless options?.silent
                    @factory.pubSub.trigger 'recordRemoved', record

            # otherwise undo any changes made by the modification
            else
              modification.removeModifications record, silent: options?.silent
              @factory.dataController.storeRecord record

  reset: (models, options) ->
    for key of @_byRecordId
      localStorage.removeItem ModificationHandler._storagePrefix + key
    @_byRecordId = {}

    super

  getModificationsWithErrors: ->
    _.filter @models, (test) -> (test.get 'error')?

  # commits any local modifications to the DataSplice server
  commitChanges: (options) ->

    # either use the list of modifications from the options, or clone the
    # internal collection since it will be modified as we process things
    changeList = options?.modifications or _.clone @models
    return if changeList.length is 0

    ef = @factory.eventFactory
    ef.execute EventRegistry.CommitChanges, ef.context(), =>
      # first need to make sure we're connected to the server
      $.when(@factory.connectionManager.ensureConnected()).then =>
        promise = new $.Deferred

        # display a progress dialog for the commit
        status = CommitStatus
          total: changeList.length
        @factory.pubSub.trigger 'displayModal', status

        $.when(promise)
          .done =>
            status.removeModal()
            @factory.pubSub.trigger 'displayNotification',
              message: 'Commit complete'
              severity: 'success'
          .fail ->
            status.setError 'Commit failed :('

        # need to process each record in turn asynchronously
        @_processNextChange changeList,
          progress: 0
          total: changeList.length
          status: status
          promise: promise
          postponeErrors: options?.postponeErrors

        promise.promise()

  _processNextChange: (changeList, options) ->
    cm = @factory.configurationManager
    vc = @factory.session.get 'views'

    options.status.setProgress options.progress

    if changeList.length
      mod = changeList.shift()

      view = vc.get( mod.get 'viewId' )
      @_findRecord mod, (current) =>
        # process the commit permission to see whether we should skip this
        # modification
        context = @factory.eventFactory.context record: current
        $.when(cm.getViewPermission view, 'ViewCommit', { context })
          .done (doCommit) =>
            if doCommit
              recordId = mod.get 'recordId'

              start = new Date()
              options.status.updateRecord recordId,
                eventType: mod.get 'eventType'
                viewName: view.viewName()

              reject = (error) ->
                options.status.updateRecord recordId,
                  elapsed: new Date() - start
                  success: false
                options.promise.reject error

              # clone the modification so we can fixup binary resources, etc
              # before sending it to the server
              ($.when @_massageModForSave mod, view)
                .then (clone) =>
                  # now we can process the actual commit
                  @_commitModification clone, view, current, options
                .then =>
                  options.status.updateRecord recordId,
                    elapsed: new Date() - start
                    success: true
                  options.progress++
                  @_processNextChange changeList, options
                .fail reject
            else
              @_processNextChange changeList, options
    else
      # nothing left to commit
      options.promise.resolve()

  # loads any persisted modifications that have been cached previously
  load: (options) ->
    key = options?.key

    # only load the specified modification if requested
    if key
      # remove the existing modification
      @remove key, silent: true

      storageKey = ModificationHandler._storagePrefix + key
      json = localStorage[storageKey]
      if json
        mod = new RecordModification JSON.parse json
        @_byRecordId[@_getKey mod] = mod
        @add mod

    # otherwise load everything
    else
      # clear the current collection if any
      @reset null, silent: true

      keys = _.filter (_.keys localStorage), (key) ->
        key.match "^#{ModificationHandler._storagePrefix}"

      models = []
      for key in keys
        json = localStorage[key]

        mod = new RecordModification JSON.parse json
        @_byRecordId[@_getKey mod] = mod
        models.push mod

      # sort the modifications based on the time they were created and add them
      # to the collection. this will fire a change event
      @add _.sortBy models, (model) -> model.attributes.editTime

  # persists change information so the information is not lost on browser
  # refresh
  save: (options) ->
    key = options?.key

    # only save the specified modification if requested
    if key
      mod = @_byRecordId[key]
      storageKey = ModificationHandler._storagePrefix + key
      if mod
        localStorage.setItem storageKey, JSON.stringify mod
      else
        localStorage.removeItem storageKey

    # otherwise save everything
    else
      for mod in @models
        storageKey = ModificationHandler._storagePrefix + mod.get 'recordId'
        localStorage.setItem storageKey, JSON.stringify mod

  resetRecord: (record) ->
    # invoke the event handler
    context = @factory.eventFactory.context record: record
    @factory.eventFactory.execute EventRegistry.ResetRecord, context, (context) =>
      # find the modification associated with this record and remove it
      mod = @get record
      @remove mod, record: record if mod

      true

  verifyRecord: (record, options) ->
    # there is no default action handler here
    ef = @factory.eventFactory
    context = options?.context or ef.context { record }
    ef.execute EventRegistry.VerifyRecord, context, null, options

  verifyRecordChanges: (record, changes, options) ->
    mod = @get record
    if (mod?.get 'eventType') is RecordModification.DeleteRecord
      throw new Error 'Cannot modify record marked for delete'

    key = @_getKey record

    # ensure changes are valid fields
    changes = _.pick changes, record.view.fieldNames()
    fieldNames = _.keys changes

    # handle fields with ignore modifications flag
    ignore = {}
    for name, value of changes
      if (record.view.getField name).ignoreModifications
        ignore[name] = value
        delete changes[name]

    # update the modification up front - this improves cases where the event
    # handler performs other actions that end up modifying the record, or
    # if the handlers fire events (like commit) that depend on the
    # modifications
    unless _.isEmpty changes
      if mod
        restoreModifications = _.clone mod.get 'modifications'
        _.extend (mod.get 'modifications'), changes
      else
        mod = new RecordModification
          eventType: RecordModification.UpdateRecord
          viewId: record.view.id
          recordId: record.id
          originalValues: options.original
          modifications: changes

        # associate the modification with the record
        @_byRecordId[@_getKey mod] = mod
        record.modification = mod

        @add mod
        modCreated = true

      @save { key }

    # apply the proposed changes as explicit attributes so the values are
    # available in expressions, etc.
    context = options?.context or @factory.eventFactory.context { record }
    context.pushState()
    context.setAttributes changes, explicitOnly: true
    context.setAttributes ignore, explicitOnly: true
    if options?.explicit
      context.setAttributes options.explicit, explicitOnly: true
    explicit = context.getExplicitAttributes()

    # cache the map while we're processing it - this ensures _findRecord
    # returns the same active reference, instead of potentially allowing
    # the storage adapter to create new instances
    unless @_recordMap[key]
      @_recordMap[key] = record
      clearCache = true

    # iterate the changes and invoke the verify field event to accept the
    # values
    async.each fieldNames,
      (fieldName, done) =>
        # add current field name to the context and fire the event
        explicit.DS_FIELD_NAME = fieldName
        event = EventRegistry.formatIdentifier EventRegistry.VerifyField, fieldName
        $.when(@factory.eventFactory.execute event, context)
          .done -> done()
          .fail (error) ->
            # error param is null in some cases but we need to pass something
            # to fail the async iteration
            done error or 'fail'

      # async complete
      , (error) =>
        context.popState()

        @_recordMap[key] = null if clearCache

        if error
          # need to restore the original record values
          for key, value of options.original
            index = record.view.fieldIndex key
            record.attributes.values[index] = value
          record.displayCache?.setStale()

          # restore the modification
          delete record.modification
          if modCreated
            @remove mod
          else
            mod.set modifications: restoreModifications
            @save key: @_getKey mod
        else
          # the record values are already changed so nothing needs to happen
          # there
          @factory.dataController.storeRecord record

          # fire the change event for the record
          @factory.pubSub.trigger 'recordModified', record, fieldNames

  createRecord: (dataSet, options) ->
    options or= {}

    # invoke the event handler - this returns the deferred execution object
    context = options.context or @factory.eventFactory.context { dataSet }
    @factory.eventFactory.execute EventRegistry.CreateRecord, context, (context) =>

      vc = @factory.session.get 'views'
      view = vc.get dataSet.query.get 'target'

      record = new Record
        pubSub: @factory.pubSub
        view: view
      # create a random initial id
      record.id = (DataTypeHelper.createGuid().match /{([^-]+)-/)[1]

      context.setRecord record
      options.context = context

      # create the modification object and associate it with the record
      mod = new RecordModification
        eventType: RecordModification.InsertRecord
        viewId: record.view.id
        recordId: record.id
        modifications: record.getValues()
      @_byRecordId[@_getKey mod] = mod
      record.modification = mod
      @add mod

      # set default values and anything passed in through the options collection
      # do this after the modification is created so we don't think the record
      # is being updated
      # include narrowing values from the current filter as well
      options.values or= {}
      filter = dataSet.query.get 'filter'
      filterValues = if filter
        # don't overwrite values already in the collection
        _.omit filter.getExclusiveAttributes(), _.keys options.values
      else
        {}

      _.extend options.values, filterValues, context.getExplicitAttributes()

      promise = new $.Deferred
      $.when(@_setRecordDefaults record, options)
        .done( =>
          @save key: @_getKey mod

          # store the record and return it
          @factory.dataController.storeRecord record, { query: dataSet.query }, (record) =>
            # add record to the dataset - don't append unless the dataset is
            # completely populated
            if not options.at and dataSet.totalRecordCount > dataSet.models.length
              options.at = 0
            dataSet.add record, updateCount: true, at: options.at

            @factory.pubSub.trigger 'recordCreated', record

            promise.resolve()
        )
        .fail promise.reject

      $.when(promise).fail => @remove mod

      promise.promise()

  markDeleted: (record, options) ->
    # some callers provide a context for us
    context = options?.context or @factory.eventFactory.context {record}

    # invoke the event handler - this returns the deferred execution object
    @factory.eventFactory.execute EventRegistry.MarkForDelete, context, (context) =>
      switch record.modification?.get 'eventType'
        when RecordModification.InsertRecord
          # new record, just remove it
          return @resetRecord record
        when RecordModification.UpdateRecord
          # reset existing changes to the record
          @resetRecord record
        when RecordModification.DeleteRecord
          # already marked for delete, nothing to do
          return true

      # create new delete modification
      mod = new RecordModification
        eventType: RecordModification.DeleteRecord
        viewId: record.view.id
        recordId: record.id
        originalValues: record.getValues()

      # associate the modification with the record
      key = @_getKey mod
      @_byRecordId[key] = mod
      record.modification = mod

      @add mod

      @save { key }

      @factory.pubSub.trigger 'recordModified', record

      # resolve the event
      true

  # apply local modifications and related information to a set of records
  # this is used to ensure that local results are displayed for results coming
  # back from the server
  applyLocalModifications: (records) ->
    unless _.isArray records
      records = [ records ]

    for record in records
      mod = @get record
      if mod and mod isnt record.modification
        mod.applyModifications record, silent: true

  _findRecord: (modification, callback) ->
    key = @_getKey modification
    if @_recordMap[key]
      callback @_recordMap[key]
    else
      @factory.dataController.findRecord { modification }, callback

  _setRecordDefaults: (record, options) ->
    promise = new $.Deferred

    # add pending values as explicit attributes so they are available in
    # the context
    { context, values } = options
    context.pushState()
    values or= {}
    context.setAttributes values, explicitOnly: true
    explicit = context.getExplicitAttributes()

    fields = record.view.get 'fields'
    async.each record.view.get('fields'),
      (field, done) ->
        if values[field.name]
          done()
        else if field.defaultValue
          name = field.name
          $.when(ExpressionEvaluator.evaluate field.defaultValue,
            { context }
          )
            .done( (value) ->
              values[name] = value
              explicit[name] = value
              done()
            )
            .fail( (error) ->
              # bing:error
              console.error error.message or error
              done()
            )
        # provide defaults for primary key GUID identifiers
        else if field.primaryKey and field.dataType is 'Guid'
          values[field.name] = DataTypeHelper.createGuid()
          done()
        else
          done()
      # async complete
      , ->
        context.popState()
        record.setValue values
        promise.resolve()

    promise.promise()

  # commits a record modification to the server - this respond to errors on
  # commit and allow the user to update the values being sent and optionally
  # retry the commit
  # @param {RecordModification} mod - the modification to commit
  # @param {DSView} view - view config associated with modification
  # @param {Record} current - current version of the record from storage
  _commitModification: (mod, view, record, options) ->
    promise = new $.Deferred

    # function to attempt to commit the record - this might get called
    # multiple times if errors are encountered that need to be resolved
    tryCommit = =>
      # first need to verify that the current state of the record is valid
      ($.when @verifyRecord record,
        postponeErrors: options?.postponeErrors
        silent: options?.postponeErrors
      )
        .done =>
          start = new Date
          mod.save {},
            success: (model, resp) =>
              end = new Date
              console.debug "Committed record #{ mod.get 'viewId' } (#{ mod.get 'eventType' }) in #{ end - start }ms"

              @_handleCommitSuccess mod, view, record, resp, promise

            error: (model, xhr) =>
              error = new UserError error: xhr.responseText
              mod.set { error }
              @save key: @_getKey mod

              # bing - might want a different event here, but this at least
              # lets listeners know something with the record changed
              @factory.pubSub.trigger 'recordModified', record

              if options?.postponeErrors
                promise.resolve()
              else
                @_displayError record, promise, tryCommit
        .fail (error) =>
          if error
            mod.set error: new UserError message: error

          if options?.postponeErrors
            promise.resolve()
          else
            @_displayError record, promise, tryCommit

    # kick off the commit loop
    tryCommit()

    promise.promise()

  # show the current record in a modal display with the current error
  # information and allow a choice whether to retry the commit, reset
  # the changes, or abort the commit
  _displayError: (record, promise, retryCommit) ->
    state = @factory.dataController.createRecordDisplayState record
    controller = new DisplayStateController state, @factory

    $.when(@factory.configurationManager.updateRecordDisplayCache record)
      .done =>
        @factory.pubSub.trigger 'displayModal', ModalRecordAction
          factory: @factory
          controller: controller
          displayMode: 'record'
          # override the buttons and validation for the modal
          buttons: [
            { label: 'Retry', class: 'btn-success' }
            { label: 'Reset', class: 'btn-warning' }
            'Cancel'
          ]
          validate: (results) =>
            switch results.button
              when 'Retry'
                # retry the commit
                _.defer retryCommit
                controller.gc()
              when 'Reset'
                prompt = new $.Deferred
                @factory.pubSub.trigger 'displayModal',
                  title: 'Confirm Reset'
                  body: 'Are you sure you want to reset changes to the selected record?'
                  buttons: [
                    { label: 'Yes', class: 'btn-primary', role: 'accept' }
                    { label: 'No', role: 'cancel' }
                  ]
                  promise: prompt

                $.when(prompt).done ->
                  record.resetModifications()
                  controller.gc()
                  promise.resolve()

                # chain validation to the prompt
                prompt
              else
                promise.reject()
                controller.gc()

  _massageModForSave: (mod, view) ->
    # need to send actual data for binary resources
    toUpdate = {}
    for fieldName, value of mod.get 'modifications'
      if value and (view.getField fieldName).dataType is 'Binary'
        toUpdate[fieldName] = value

    unless _.isEmpty toUpdate
      promise = new $.Deferred
      resources = @factory.binaryResources

      # clone the modifications so we can muck with them
      changes = _.clone mod.get 'modifications'

      async.each (_.keys toUpdate),
        (fieldName, done) =>
          info = resources.lookup toUpdate[fieldName]
          ($.when info.loadLocal()).done (loaded) ->
            if loaded
              changes[fieldName] = info
              done()
            else
              promise.reject 'Cannot load binary resource'

        # async complete - return a new model object with the updated changes
        , ->
          clone = mod.clone()
          clone.cid = mod.cid
          clone.set 'modifications', changes
          promise.resolve clone

      promise
    else
      mod

  _handleCommitSuccess: (mod, view, record, resp, promise) ->
    # update the locally stored record if possible
    dc = @factory.dataController
    oldId = record?.id
    if resp.identity
      stored = new $.Deferred
      # bypass local modifications during store
      options = { view, oldId, ignoreModifications: true }
      dc.storeRecord resp, options, (r) -> stored.resolve r

      event = 'recordModified'

    # otherwise remove the record from the system
    else if record
      dc.removeRecord record

      event = 'recordRemoved'
      stored = record

    $.when(stored).done (updated) =>
      # forget binary resources associated with the modification
      @_forgetBinaryResource mod

      # remove the local modification from our list
      # the record has already been updated so we don't need to
      # restore changes made by the modification
      @remove mod, ignoreRecord: true
      for test in [ record, updated ]
        if test?
          delete test.modification
          delete test.error

      # also need to clean things up if the record id changed
      if oldId and oldId isnt updated.id
        key = @_getKey view.id, oldId
        delete @_byRecordId[key]
        @save { key }

        # associate the original id with the record so other views
        # can be aware of the change
        updated.oldId = oldId

      # fire the changed or removed event
      @factory.pubSub.trigger event, updated

      promise.resolve()

  _forgetBinaryResource: (mod) ->
    vc = @factory.session.get 'views'
    view = vc.get( mod.get 'viewId' )

    resources = @factory.binaryResources
    for fieldName, value of mod.get 'modifications'
      if value and (view.getField fieldName)?.dataType is 'Binary'
        resources.forget resources.lookup value

  # returns the internal key we use to track modifications - this is a
  # combination of the view and record ids
  _getKey: (first, second) ->
    if first instanceof RecordModification
      "#{first.get 'viewId'}:#{first.get 'recordId'}"
    else if first instanceof Record
      "#{first.view.id}:#{first.id}"
    else
      "#{first}:#{second}"

module.exports = ModificationHandler
