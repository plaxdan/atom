Fluxxor = require 'fluxxor'
FluxChildMixin = Fluxxor.FluxChildMixin React
{StoreWatchMixin} = Fluxxor

AppMenu = require './appmenu'
MessageCenter = require './messagecenter'
ModalRecordAction = require './data/modalrecordaction'
{ Stores } = require '../flux/constants'

{ div } = React.DOM

DisplayStateController = require '../data/displaystatecontroller'
DSView = require '../models/dsview'

Header = React.createClass
  displayName: 'Header'

  mixins: [
    FluxChildMixin
    StoreWatchMixin Stores.Server, Stores.Session, Stores.TopLevelActions
  ]

  getStateFromFlux: ->
    session: (@getFlux().store Stores.Session).getState()
    server: (@getFlux().store Stores.Server).getState()
    topLevelActions: (@getFlux().store Stores.TopLevelActions).getState()

  getInitialState: ->
    messageCenterSection: null
    offlineBehavior: null
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

    @_updateLocalModifications()

  componentWillUnmount: ->
    { pubSub, modificationHandler } = @props.factory
    pubSub.off 'connectionStateChanged', @_boundUpdate
    modificationHandler.off 'add remove', @_debounceModifications
    document.removeEventListener 'focusout', @_globalFocusOut

  render: ->
    {
      connectionManager
      modificationHandler
      hardwareManager
    } = @props.factory

    barcodeDriver = hardwareManager.devices['barcode'].getActiveDriver()
    manualScanTrigger = barcodeDriver?.get 'manualTrigger'

    div null,
      AppMenu
        # TODO: just pass the server and session stores down?
        # server: @state.server
        # session: @state.session
        serverInstance: @state.server.instanceName
        userName: @state.session.userName
        connectionState: connectionManager.state
        modificationCount: @state.localModifications.length
        activeMessageCenterSection: @state.messageCenterSection
        notification: @props.notification
        triggerScan: @_triggerScan if manualScanTrigger
        toggleMessageCenter: @_toggleMessageCenter
        displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler
        commitChanges: @_commitChanges

      if @state.messageCenterSection
        MessageCenter
          sessionMode: @state.session.mode
          userIdentifier: @state.session.userIdentifier
          section: @state.messageCenterSection
          connectionState: connectionManager.state
          offlineBehavior: @state.offlineBehavior
          startCenterCategories: @state.topLevelActions.categories
          startCenterActions: @state.topLevelActions.categoryActions
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
    confirmLogoutPromise = new $.Deferred
    @props.factory.pubSub.trigger 'displayModal',
      title: 'Confirm Log Out'
      body: 'Are you sure you want to log out?'
      buttons: [
        { label: 'Yes', class: 'btn-primary', role: 'accept' }
        { label: 'No', role: 'cancel' }
      ]
      promise: confirmLogoutPromise

    Promise.resolve confirmLogoutPromise
    .then ->
      getFlux().actions.session.destroy()
    .catch ->
      # do nothing, logout was cancelled

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
