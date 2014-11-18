Fluxxor = require 'fluxxor'
FluxMixin = Fluxxor.FluxMixin React
{StoreWatchMixin} = Fluxxor

AppMenu = require './appmenu'
MessageCenter = require './messagecenter'
ModalRecordAction = require './data/modalrecordaction'
{ FluxStores } = require '../constants'

{ div } = React.DOM

DisplayStateController = require '../data/displaystatecontroller'
DSView = require '../models/dsview'

Header = React.createClass
  displayName: 'Header'

  propTypes:
    factory: React.PropTypes.object.isRequired
    notification: React.PropTypes.object
    searchVisible: React.PropTypes.bool
    toggleSearch: React.PropTypes.func
    displayNotificationDetailsHandler: React.PropTypes.func.isRequired

  mixins: [
    FluxMixin
    StoreWatchMixin Stores.Server, Stores.Session, Stores.TopLevelActions,
      Stores.ScannerIntegration
  ]

  getStateFromFlux: ->
    server: (@getFlux().store Stores.Server).getState()
    session: (@getFlux().store Stores.Session).getState()
    topLevelActions: (@getFlux().store Stores.TopLevelActions).getState()
    scanner: (@getFlux().store Stores.ScannerIntegration).getState()

  getInitialState: ->
    messageCenterSection: null
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
    # cleared) which was causing timing errors below. we run into problems
    # because the update processes records asynchronously and it's possible
    # for and initial update to complete after subsequent calls to the function
    # have been processed. definitely need to sort this out when moving the
    # functionality to a store
    @_debounceModifications = _.debounce @_updateLocalModifications, 500
    modificationHandler.on 'add remove', @_debounceModifications

    document.addEventListener 'focusout', @_globalFocusOut

    @_updateLocalModifications()

  componentWillReceiveProps: (nextProps) ->
    # update information about the scanner integration is needed so we know
    # if we need to display a badge to trigger a scan event
    if @state.scanner.uniwedgeStatus is 'unknown'
      @getFlux().actions.hardware.updateScannerConfig()

  componentWillReceiveProps: (nextProps) ->
    # hide message center when search is displayed
    if nextProps.searchVisible and not @props.searchVisible
      @setState messageCenterSection: null

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

    div null,
      AppMenu
        serverInstance: @state.server.instanceName
        userName: @state.session.userName
        connectionState: connectionManager.state
        modificationCount: @state.localModifications.length
        activeMessageCenterSection: @state.messageCenterSection
        notification: @props.notification
        searchVisible: @props.searchVisible
        triggerScan: @_triggerScan if @state.scanner?.manualTrigger
        toggleMessageCenter: @_toggleMessageCenter
        toggleSearch: @props.toggleSearch
        displayNotificationDetailsHandler: @props.displayNotificationDetailsHandler
        commitChanges: @_commitChanges

      if @state.messageCenterSection
        MessageCenter
          sessionMode: @state.session.mode
          userIdentifier: @state.session.userIdentifier
          section: @state.messageCenterSection
          connectionState: connectionManager.state
          offlineBehavior: @state.session.offlineBehavior
          startCenterCategories: @state.topLevelActions.categories
          startCenterActions: @state.topLevelActions.categoryActions
          localModifications: @state.localModifications
          toggleMessageCenter: @_toggleMessageCenter
          toggleConnection: @_toggleConnection
          dataSync: @_dataSync
          logOut: _.bind @_logOut, @
          commitChanges: @_commitChanges
          displaySettings: @_displaySettings
          displayModifications: @_displayModifications
          displayModification: @_displayModification
          resetModification: @_resetModification
          displayNavigationAction: @_displayNavigationAction

  _triggerScan: ->
    @getFlux().actions.hardware.triggerScan activeElement: @_activeElement

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

      @props.toggleSearch? false

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
    @getFlux().actions.session.logout()

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

  _resetModification: (cid) ->
    @_hideMessageCenter()

    {
      pubSub
      modificationHandler
      dataController
    } = @props.factory
    modification = modificationHandler.get cid
    dataController.findRecord { modification }, (record) =>
      state = dataController.createRecordDisplayState record
      controller = new DisplayStateController state, @props.factory
      controller.resetRecord()

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
