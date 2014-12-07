# Connection Manager
#
# Responsible for maintaining the connection between the client and server
Session = require './models/session'
UserError = require './models/usererror'
ExpressionEvaluator = require './expressions/expressionevaluator'
EventRegistry = require './event/eventregistry'
UrlHelper = require './utils/urlhelper'
ModalDialog = require './ui/feedback/modaldialog'
OfflineSyncStatus = require './ui/feedback/offlinesyncstatus'
{ConnectionStates, OfflineBehaviors} = require './constants'

class ConnectionManager
  @validStates = [ 'unknown', 'connecting', 'connected', 'disconnected', 'dropped' ]
  state: 'unknown'

  constructor: (@intents, @webService, @legacyFactory) ->
    {@pubSub} = @legacyFactory

    # register this controller in the factory
    @legacyFactory.register 'connectionManager', @

    # global event listeners
    @pubSub.on
      'sessionError': =>
        @_handleExplicitCredentials()

      'sessionLoaded': (options) =>
        @_onSessionLoaded options unless @legacyFactory.session.isEmpty()

      'loggedOut': =>
<<<<<<< HEAD
=======
        @factory.settingsService.setUserSetting 'sessionLocked', false
>>>>>>> dev
        @disconnect silent: true

      # offline sync functionality
      'dataSync': (options) => @dataSync options

  isConnected: -> @state is 'connected'
  isDisconnected: -> @state is 'disconnected'
  isDropped: -> @state is 'dropped'
  isSyncing: -> !!@_syncPromise

  getOfflineBehavior: ->
    if @legacyFactory.session.get 'sessionName'
      context = @legacyFactory.eventFactory.context()
      ExpressionEvaluator.evaluateAttribute 'DS_OFFLINE_BEHAVIOR', null, { context }
    else
      null

  disconnect: (options) ->
    @_changeState options?.state or 'disconnected'

    # cancel the pending push request if needed
    # TODO: abortable promises from DataSpliceWebService
    # @_currentPush?.abort()
    @_currentPush = null

    unless options?.silent or @_unloaded
      session = @legacyFactory.session
      unless session.isEmpty()
        if (session.get 'mode') is 'offline'
          # try to let the server know we're disconnecting
          @webService.disconnectSession()

      else if options?.message
        @pubSub.trigger 'displayNotification', message: options.message

  ensureConnected: (options) ->
    return true if @isConnected()

    current = @legacyFactory.session
    session = new Session
      sessionName: current.get 'sessionName'
      userName: options?.userName or current.userName()
      domain: options?.domain or current.authDomain()
      password: options?.password or current.cachedPassword()

    tryConnect = =>
      promise = new $.Deferred

      session.save null,
        success: =>
          @intents.session.resume()
        error: (model, xhr) =>
          message = xhr.responseText
          try
            parsed = JSON.parse message
            if parsed?.message
              message = parsed.message.replace /#/g, ''
          message or= 'Cannot connect to server'

          # the cached password is likely wrong
          if xhr.status is 401
            @pubSub.trigger 'displayModal', ConfirmPasswordPrompt
              title: message
              instanceName: @legacyFactory.server.get 'instanceName'
              userName: @legacyFactory.session.userName()
              banner: @legacyFactory.server.get 'loginBanner'
              confirmPassword: (password) =>
                # retry the connection with the new password
                session.set { password }
                ($.when tryConnect())
                  .done promise.resolve
              logOut: _.bind @confirmLogOut, @
          else
            unless options?.silent
              @pubSub.trigger 'displayNotification',
                message: message
                severity: 'error'

            promise.reject message

      promise.promise()

    tryConnect()

  lockSession: (options) ->

<<<<<<< HEAD
    # TODO: move this into a flux action
    @legacyFactory.settingsService.setUserSetting 'sessionLocked', true
=======
    @factory.settingsService.setUserSetting 'sessionLocked', true
>>>>>>> dev

    # TODO: move this into the session action
    @pubSub.trigger 'displayModal', ConfirmPasswordPrompt
      instanceName: @legacyFactory.server.get 'instanceName'
      userName: @legacyFactory.session.userName()
      confirmPassword: (password) =>
        promise = new $.Deferred
        # validate the password provided by the user
        unless @legacyFactory.session.verifyPassword password
          promise.reject 'Incorrect password, please try again'
        else
          ($.when @unlockSession { password })
            .done promise.resolve
            .fail promise.reject
        promise.promise()
      logOut: _.bind @confirmLogOut, @

  unlockSession: (options) ->
<<<<<<< HEAD
    @legacyFactory.settingsService.setUserSetting 'sessionLocked', false
=======
    @factory.settingsService.setUserSetting 'sessionLocked', false
>>>>>>> dev

    if (@legacyFactory.session.get 'mode') is 'offline'
      true
    else
      # reconnect to the server before unlocking online sessions
      $.when(@ensureConnected options).fail =>
        # relock the session on failure
<<<<<<< HEAD
        @legacyFactory.settingsService.setUserSetting 'sessionLocked', false
=======
        @factory.settingsService.setUserSetting 'sessionLocked', false
>>>>>>> dev

  confirmLogOut: ->
    promise = new $.Deferred

    # present a more forceful message if uncommitted changes will be
    # lost
    if @legacyFactory.modificationHandler.length > 0
      message = 'The current session has uncommitted modifications, which will \
        be deleted permanently! Are you sure you want to continue?'
      buttons = [
        { label: 'No', role: 'cancel' }
        { label: 'Yes', class: 'btn-warning', role: 'accept' }
      ]
    else
      message = 'This will release the current session, are you sure you want \
        to continue?'
      buttons = [
        { label: 'Yes', class: 'btn-primary', role: 'accept' }
        { label: 'No', role: 'cancel' }
      ]

    # display a prompt to confirm logging out
    @pubSub.trigger 'displayModal',
      title: 'Confirm Log Out'
      body: message
      buttons: buttons
      promise: promise

    $.when(promise).done =>
      @legacyFactory.modificationHandler.reset()
      @intents.session.logout force: true

    promise.promise()

  # switches the current mode of a session to be online or offline.
  # returns a promise that is resolved on completion. this is a no-op if the
  # session is already in the specified mode
  setSessionMode: (mode) ->
    session = @legacyFactory.session
    return true if (session.get 'mode') is mode

    modeSetter = switch mode
      when 'online' then => @webService.setOnlineSessionMode()
      when 'offline' then => @webService.setOfflineSessionMode()
      else throw new Error "'#{mode}' is not a valid session mode"

    modeSetter()
      .then (result) =>
        session.set 'mode', result.payload.mode
        session.storeLocal()

        # todo - move this to the session service
        # manage a list of offline session names - this allows us to revoke
        # potentially orphaned sessions in some cases
<<<<<<< HEAD
        { settingsService } = @legacyFactory
=======
        { settingsService } = @factory
>>>>>>> dev
        offlineSessions = (settingsService.getAppSetting 'offlineSessions') or []
        sessionName = session.get 'sessionName'
        if mode is 'online' and sessionName in offlineSessions
          offlineSessions = _.without offlineSessions, sessionName
          settingsService.setAppSetting { offlineSessions }
        else if mode is 'offline' and sessionName not in offlineSessions
          offlineSessions = offlineSessions.concat sessionName
          settingsService.setAppSetting { offlineSessions }

      .catch (error) =>
        @pubSub.trigger 'displayNotification',
          message: error.message
          severity: 'error'

  monitorConnection: ->
    return if @_currentPush or @legacyFactory.session.isEmpty()

    wait = null

    waitForPushResponse = (result) =>
      wait = @_handlePushResponse result if result

    tryReconnect = (error) =>
      unless error.message in ['OK', 'timeout', 'abort']
        if error.payload
          message = if error.payload.message?
            error.payload.message
          else
            error.payload
        # try to reconnect and reestablish a session if possible
        @_changeState 'connecting'
        options =
          password: @legacyFactory.session.cachedPassword()
          silent: true
        Promise.resolve @ensureConnected options
          .catch (error) =>
            # errors here indicate that we've lost the connection, stop
            # monitoring it
            @disconnect state: 'dropped', message: error or message

    checkHandlingOfPushResponse = =>
      @_currentPush = null

      if @isConnected()
        if wait
          wait
            .then =>
              @monitorConnection()
            .catch (message) =>
              @_cancelSync()
              @pubSub.trigger 'displayError', new UserError { message }
              @monitorConnection()
        else
          @monitorConnection()

    @_currentPush = @webService.getPush timeout: 30000
      .then (result) ->
        waitForPushResponse result
        checkHandlingOfPushResponse()
      .catch (error) ->
        tryReconnect error
        checkHandlingOfPushResponse()

  # synchronizes the local client with the server. this commits any local
  # modifications first, and then updates the local storage cache to allow the
  # user to work in a disconnected state
  dataSync: ->
    return if @_syncPromise

    unless @legacyFactory.dataController.storage.supportsOffline
      @pubSub.trigger 'displayNotification',
        message: 'Offline functionality is not supported in this environment'
        severity: 'error'
      return

    ef = @legacyFactory.eventFactory
    context = ef.context()
    postponeErrors = ExpressionEvaluator.evaluateAttribute 'DS_POSTPONE_SYNC_ERRORS',
      null, { context }

    ef.execute EventRegistry.OfflineSync, context, =>
      # make sure we're connected to the server
      ($.when @ensureConnected())
        .then =>
          # commit changes if needed
          @legacyFactory.modificationHandler.commitChanges { postponeErrors }
        .then =>
          # switch session to offline mode if needed
          @setSessionMode 'offline'
        .then =>
          @_startSync()

  _handleExplicitCredentials: ->
    return if @_handledCredentials
    @_handledCredentials = true

    parameters = UrlHelper.parseParameters location.search
    if parameters?.credentials
      # credentials should be base64 encoded username:password, like HTTP
      # basic authentication
      tokens = (atob parameters.credentials).split ':'
      if tokens.length is 2
        wasEmpty = @legacyFactory.session.isEmpty()
        ($.when @ensureConnected
          userName: tokens[0]
          password: tokens[1]
          domain: @legacyFactory.server.get 'defaultAuthDomain'
        ).done =>
          # ensure the updated password is cached
          @legacyFactory.session.updatePassword tokens[1]

          # remove the credentials from the URL
          history.replaceState null, null, '/' + location.hash
          @intents.session.resume()

  _changeState: (state, options) ->
    return unless state isnt @state

    @state = state
    @pubSub.trigger 'connectionStateChanged'

    # when the connection drops, poll the connection periodically to see if
    # we can reconnect
    if state is 'dropped' and not options?.silent
      @_tryReconnect 5000

  _tryReconnect: (delay) ->
    _.delay ( =>
      # bail if we disconnected while waiting
      return if @state is 'disconnected'

      @_changeState 'connecting'
      $.when(@ensureConnected silent: true)
        .fail =>
          if @state is 'connecting'
            @_changeState 'dropped', silent: true
            @_tryReconnect delay
    ), delay or 5000

  _onSessionLoaded: (options) ->
    # begin monitoring the server connect to listen for push messages,
    # detect lost connections, etc
    # the event is fired with local: true options if we're offline and
    # don't have a connection to the server
    $.when(@getOfflineBehavior()).done (behavior) =>

      if behavior?.toUpperCase() is OfflineBehaviors.ALWAYS
        # begin synchronization if the user just authenticated
        # bing:gross - firing the sync directly is causing issues on the
        # server at the moment, but waiting a bit seems to work
        if options?.authenticated
          _.delay ( =>
            @_changeState 'connected'
            @dataSync()
          ), 1000

        # otherwise stay offline and disconnected
        else
          @_changeState 'disconnected'
      else
        unless options?.local
          # iOS only allows a few simultaneous connections, and having a long-
          # running ajax request tends to delay some requests so they aren't
          # processed until after the first timeout (30 seconds). waiting a
          # bit here lets that clear before starting the polling operation
          _.delay ( => @monitorConnection() ), 2000

          @_changeState 'connected'
        else
          @_changeState 'disconnected'

    # display session lock screen if needed
<<<<<<< HEAD
    if @legacyFactory.settingsService.getUserSetting 'sessionLocked'
=======
    if @factory.settingsService.getUserSetting 'sessionLocked'
>>>>>>> dev
      _.defer => @lockSession()

    @_handleExplicitCredentials()

  # Push Response Object
  # "status": [ { StatusObj }, { StatusObj } ... ]
  # "data": { QueryResponse }
  # "message": String - announce to the user
  # "action": String - a command for the application to respond to
  # "details": { SyncStats }
  #
  # StatusObj
  # "Description": String - How to display the status + identifier when parent
  # "Status": String (working | complete) - The status of the status.
  # "Parent": String - matches the description of another StatusObj
  # "Step": String - wrapped in ## that can be stripped (i18n)
  # "Current": int - number of work units complete
  # "Total": int - total number of work units
  # "Percent": int - percent complete work
  #
  _handlePushResponse: (result) ->
    { payload } = result
    if payload.action is 'disconnect'
      @disconnect message: payload.message

      if payload.message is 'Idle timeout'
        unless (@legacyFactory.session.get 'mode') is 'offline'
          @lockSession()

    else
      promise = null

      if payload.message
        @pubSub.trigger 'displayNotification', message: payload.message

      # return a deferred that resolves once the data is imported. the
      # push handler waits to fetch the next message until this is done,
      # which prevents the download from outpacing the database and queuing
      # up a ton of database requests
      if payload.data
        promise = new Promise (resolve, reject) =>
          @pubSub.trigger 'sync.offlineData', payload.data, (error) ->
            if error
              reject error
            else
              resolve()

      else if payload.purgeRecords
        promise = new Promise (resolve, reject) =>
          @pubSub.trigger 'sync.purgeRecords', payload.purgeRecords, (error) ->
            if error
              reject error
            else
              resolve()

      if payload.status and @_syncStatus
        @_syncStatus.addStatus item for item in payload.status

      if payload.error
        @pubSub.trigger 'displayError', new UserError payload.error

      if payload.result
        @_completeSync payload

      promise

  _startSync: ->
    unless @_currentPush
      @_changeState 'connected'
      @monitorConnection()

    @_syncStatus = OfflineSyncStatus
      factory: @legacyFactory
      onCancel: => @_cancelSync()
    @pubSub.trigger 'displayModal', @_syncStatus

    @_syncPromise = new $.Deferred

    # figure out what digest information we need to send to the server
    @_generateOfflineDigest()
      .then (digest) =>
        @webService.sync digest

    @_syncPromise.promise()

  _cancelSync: ->
    @webService.cancelSync()
      .catch (error) ->
        console.error 'Cancel sync failed:', error
      .then (result) =>
        @_completeSync result.payload

  _completeSync: (response) ->
    return unless @_syncPromise

    $.when(@legacyFactory.binaryResources.syncOfflineResources status: @_syncStatus)
      .done =>
        @_syncStatus.setResults response
        @_syncStatus = null

        @_syncPromise.resolve()
        @_syncPromise = null

        $.when(@getOfflineBehavior()).done (behavior) =>
          @pubSub.trigger 'sync.complete'

          if behavior?.toUpperCase() is OfflineBehaviors.ALWAYS
            # bing - seems pretty fragile, but this causes issues if we
            # disconnect immediately because the server is still in the
            # offline handler and the session isn't idle
            _.delay ( => @disconnect() ), 500

  _generateOfflineDigest: ->
    promise = new $.Deferred

    statusTask = 'Updating Offline Digest'
    @_syncStatus.addStatus
      Description: statusTask
      Percent: 0

    storage = @legacyFactory.dataController.storage
    @webService.getRemoteDigests()
      .then (result) =>
        # compare the server digest to the local data to see what we need to
        # send as an extended digest
        localDigest = {}
        serverDigest = result.payload
        keys = _.keys serverDigest
        statusCount = 0
        async.each keys,
          (view, done) =>
            info = serverDigest[view]
            storage.recordCount view
              .then (localCount) =>
                # bing:sync - need a way to calculate checksums locally to
                # verify against the server side checksum. for now, matching
                # the record count is the best we can do
                if localCount is info.recordCount
                  @_syncStatus.addStatus
                    Description: statusTask
                    Current: ++statusCount
                    Total: keys.length
                  done()
                else
                  storage.offlineDigest view
                    .then (viewDigest) =>
                      localDigest[view] =
                        recordCount: localCount
                        digest: viewDigest

                      @_syncStatus.addStatus
                        Description: statusTask
                        Current: ++statusCount
                        Total: keys.length
                      done()

          # async complete
          , ->
            promise.resolve localDigest
      .catch promise.reject

    promise.promise()

{ div, blockquote, form, label, input } = React.DOM
ConfirmPasswordPrompt = React.createClass
  displayName: 'ConfirmPasswordPrompt'

  propTypes:
    title: React.PropTypes.string
    instanceName: React.PropTypes.string.isRequired
    userName: React.PropTypes.string
    banner: React.PropTypes.string
    confirmPassword: React.PropTypes.func.isRequired
    logOut: React.PropTypes.func.isRequired

  getDefaultProps: ->
    title: 'Session Locked'

  getInitialState: ->
    verifyPassword: ''
    alert: null

  mixins: [ React.addons.LinkedStateMixin ]

  componentDidMount: ->
    # this seems pretty terrible, but it's needed as a workaround to allow
    # the login banner to inject scripts into the password confirmation
    # page. this supports integrating with other login mechanisms in some
    # cases. having an explicit client-side authentication handling plug-in
    # API would be a better solution
    scripts = @getDOMNode().querySelectorAll 'script'
    eval script.innerHTML for script in scripts

  render: ->
    ModalDialog (_.assign {}, @props,
      title: "#{@props.userName or ''}@#{@props.instanceName}: #{@props.title}"
      buttons: [
        { label: 'Continue', role: 'accept' }
        { label: 'Log Out', class: 'btn-warning', role: 'cancel' }
      ]
      validate: (results) =>
        if results.role is 'accept'
          @props.confirmPassword @state.verifyPassword
        else
          @props.logOut()
    ),
      if @props.banner
        div className: 'subheader',
          blockquote
            dangerouslySetInnerHTML: { __html: @props.banner }
      if @state.alert
        div className: 'alert alert-error', @state.alert

      div className: 'control-group',
        label className: 'control-label', 'Please enter your password to continue'
        div className: 'controls',
          input
            type: 'password'
            className: 'user-password input-block-level'
            placeholder: 'Password'
            valueLink: @linkState 'verifyPassword'

module.exports = ConnectionManager