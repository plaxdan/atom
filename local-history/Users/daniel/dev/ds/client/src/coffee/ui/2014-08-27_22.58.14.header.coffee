Fluxxor = require 'fluxxor'
FluxChildMixin = Fluxxor.FluxChildMixin React
{StoreWatchMixin} = Fluxxor


AppMenu = require './appmenu'
MessageCenter = require './messagecenter'
ModalRecordAction = require './data/modalrecordaction'

{ div } = React.DOM

DisplayStateController = require '../data/displaystatecontroller'
DSView = require '../models/dsview'

Header = React.createClass
  displayName: 'Header'

  mixins: [
    FluxChildMixin
    StoreWatchMixin 'SessionStore'
  ]

  getInitialState: ->
    messageCenterSection: null
    offlineBehavior: null
    startCenterCategories: []
    localModifications: []

  componentWillMount: ->
    # todo - move all of this into the appropriate store/service
    @_boundUpdate = @forceUpdate.bind @, null

    {
      pubSub
      modificationHandler
      connectionManager
    } = @props.factory
    pubSub.on 'connectionStateChanged', @_boundUpdate

    # the handler can fire a ton of events (especially when it's getting
    # cleared) which was causing timing errors below
    @_debounceModifications = _.debounce @_updateLocalModifications, 100
    modificationHandler.on 'add remove', @_debounceModifications

    document.addEventListener 'focusout', @_globalFocusOut

    (Promise.resolve connectionManager.getOfflineBehavior())
      .done (behavior) =>
        @setState offlineBehavior: behavior

    @_updateStartCenterCategories()
    @_updateLocalModifications()

  componentWillUnmount: ->
    { pubSub, modificationHandler } = @props.factory
    pubSub.off 'connectionStateChanged', @_boundUpdate
    modificationHandler.off 'add remove', @_debounceModifications
    document.removeEventListener 'focusout', @_globalFocusOut

  render: ->
    {
      server
      session
      connectionManager
      modificationHandler
      hardwareManager
    } = @props.factory

    barcodeDriver = hardwareManager.devices['barcode'].getActiveDriver()
    manualScanTrigger = barcodeDriver?.get 'manualTrigger'

    div null,
      AppMenu
        serverInstance: server.get 'instanceName'
        userName: session.userName()
        connectionState: connectionManager.state
        modificationCount: @state.localModifications.length
        notification: @props.notification
        triggerScan: @_triggerScan if manualScanTrigger
        toggleMessageCenter: @_toggleMessageCenter
        displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler

      if @state.messageCenterSection
        MessageCenter
          session: session
          section: @state.messageCenterSection
          connectionState: connectionManager.state
          offlineBehavior: @state.offlineBehavior
          startCenterCategories: @state.startCenterCategories
          localModifications: @state.localModifications
          toggleMessageCenter: @_toggleMessageCenter
          toggleConnection: @_toggleConnection
          dataSync: @_dataSync
          logOut: @_logOut
          commitChanges: @_commitChanges
          displaySettings: @_displaySettings
          displayModifications: @_displayModifications
          displayModification: @_displayModification
          displayNavigationAction: @_displayNavigationAction

  _triggerScan: ->
    { hardwareManager } = @props.factory
    barcodeDriver = hardwareManager.devices['barcode'].getActiveDriver()
    barcodeDriver?.triggerScan activeElement: @_activeElement

  _globalFocusOut: (ev) ->
    # remember previously focused input or textarea, and pass that as active
    # element to the default action of the scan event above since clicking the
    # trigger button changes focus
    if ev.target.tagName.toLowerCase() in [ 'input', 'textarea' ]
      @_activeElement = ev.target

  _hideMessageCenter: ->
    @setState messageCenterSection: null

  _toggleMessageCenter: (section) ->
    if section is @state.messageCenterSection or not section
      @setState messageCenterSection: null
    else
      @setState messageCenterSection: section

  _toggleConnection: ->
    { connectionManager } = @props.factory
    if connectionManager.state is 'disconnected'
      connectionManager.ensureConnected()
    else
      connectionManager.disconnect()

  _dataSync: ->
    @_hideMessageCenter()
    @props.factory.pubSub.trigger 'dataSync'

  _logOut: ->
    @_hideMessageCenter()
    @props.factory.pubSub.trigger 'logOut'

  _commitChanges: ->
    @_hideMessageCenter()
    @props.factory.modificationHandler.commitChanges()

  _displaySettings: ->
    @_hideMessageCenter()
    @props.factory.pubSub.trigger 'displaySettings'

  _displayModifications: ->
    @_hideMessageCenter()
    @props.factory.pubSub.trigger 'displaySettings', 'modifications'

  _displayModification: (cid) ->
    @_hideMessageCenter()

    {
      pubSub
      modificationHandler
      dataController
      configurationManager
    } = @props.factory
    modification = modificationHandler.get cid
    dataController.findRecord { modification }, (record) =>
      ($.when configurationManager.updateRecordDisplayCache record)
        .then =>
          state = dataController.createRecordDisplayState record
          controller = new DisplayStateController state, @props.factory

          promise = new $.Deferred
          pubSub.trigger 'displayModal', ModalRecordAction
            factory: @props.factory
            controller: controller
            displayMode: 'record'
            promise: promise

          $.when(promise).always -> controller.gc()

  _displayNavigationAction: (action) ->
    @_hideMessageCenter()
    @props.factory.pubSub.trigger 'displayNavigationAction', action

  _updateStartCenterCategories: ->
    { configurationManager } = @props.factory
    categories = configurationManager.getHomescreenCategories()
    list = []
    async.eachSeries categories, (cat, done) =>
      ($.when configurationManager.getHomescreenActionsForCategory cat)
        .done (actions) ->
          list.push { name: cat, actions } if actions.length
        .always -> done()
    , =>
      @setState startCenterCategories: list

  _updateLocalModifications: ->
    {
      configurationManager
      dataController
      modificationHandler
    } = @props.factory
    async.map modificationHandler.models,
      (modification, done) ->
        dataController.findRecord { modification }, (record) ->
          if record
            (configurationManager.getRecordDescription record)
              .then (description) ->
                done null,
                  cid: modification.cid
                  eventType: modification.get 'eventType'
                  viewName: DSView.getViewName modification.get 'viewId'
                  description: description
          else
            modificationHandler.remove modification
            done()
      , (error, list) =>
        @setState localModifications: _.compact list

module.exports = Header
