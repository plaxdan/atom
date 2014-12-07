DisplayStateController = require '../data/displaystatecontroller'
ModalRecordAction = require '../ui/data/modalrecordaction'

ModificationIntents = (legacyFactory) ->

  commit: ->
    legacyFactory.modificationHandler.commitChanges()

  displayModification: (cid) ->
    {
      pubSub
      modificationHandler
      dataController
      configurationManager
    } = legacyFactory
    modification = modificationHandler.get cid
    dataController.findRecord { modification }, (record) ->
      ($.when configurationManager.updateRecordDisplayCache record)
        .then =>
          state = dataController.createRecordDisplayState record
          controller = new DisplayStateController state, legacyFactory

          promise = new $.Deferred
          pubSub.trigger 'displayModal', ModalRecordAction
            factory: legacyFactory
            controller: controller
            displayMode: 'record'
            promise: promise

          $.when(promise).always -> controller.gc()


  resetModification: (cid) ->
    {
      pubSub
      modificationHandler
      dataController
    } = legacyFactory
    modification = modificationHandler.get cid
    dataController.findRecord { modification }, (record) =>
      state = dataController.createRecordDisplayState record
      controller = new DisplayStateController state, legacyFactory
      controller.resetRecord()

module.exports = ModificationIntents
