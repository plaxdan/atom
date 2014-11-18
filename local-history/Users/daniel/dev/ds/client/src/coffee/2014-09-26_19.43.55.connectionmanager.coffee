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

class ConnectionManager
  @validStates = [ 'unknown', 'connecting', 'connected', 'disconnected', 'dropped' ]
  state: 'unknown'

  constructor: (@factory, @dataSpliceWebService) ->
    {@pubSub} = @factory

    # register this controller in the factory
    @factory.register 'connectionManager', @

    # global event listeners
    @pubSub.on
      'sessionError': =>
        @_handleExplicitCredentials()

      'sessionLoaded': (options) =>
        @_onSessionLoaded options unless @factory.session.isEmpty()

      'loggedOut': =>
        @factory.settings.set 'sessionLocked', false
        @disconnect silent: true

      # offline sync functionality
      'dataSync': (options) => @dataSync options

  isConnected: -> @state is 'connected'
  isDisconnected: -> @state is 'disconnected'
  isDropped: -> @state is 'dropped'
  isSyncing: -> !!@_syncPromise

  getOfflineBehavior: ->
    if @factory.session.get 'sessionName'
      context = @factory.eventFactory.context()
      ExpressionEvaluator.evaluateAttribute 'DS_OFFLINE_BEHAVIOR', null, { context }
    else
      null

  disconnect: (options) ->
    @_changeState options?.state or 'disconnected'

    # cancel the pending push request if needed
    @_currentPush?.abort()
    @_currentPush = null

    unless options?.silent or @_unloaded
      session = @factory.session
      unless session.isEmpty()
        if (session.get 'mode') is 'offline'
          # try to let the server know we're disconnecting
          $.ajax url: UrlHelper.prefix 'ds/session/disconnect'

      else if options?.message
        @pubSub.trigger 'displayNotification', message: options.message

  ensureConnected: (options) ->
    return true if @isConnected()

    current = @factory.session
    session = new Session
      sessionName: current.get 'sessionName'
      userName: options?.userName or current.userName()
      domain: options?.domain or current.authDomain()
      password: options?.password or current.cachedPassword()

    tryConnect = =>
      promise = new $.Deferred

      session.save null,
        success: =>
          @pubSub.trigger 'restartSession', { promise }
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
              instanceName: @factory.server.get 'instanceName'
              userName: @factory.session.userName()
              banner: @factory.server.get 'loginBanner'
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

    @factory.settings.set 'sessionLocked', true

    @pubSub.trigger 'displayModal', ConfirmPasswordPrompt
      instanceName: @factory.server.get 'instanceName'
      userName: @factory.session.userName()
      confirmPassword: (password) =>
        promise = new $.Deferred
        # validate the password provided by the user
        unless @factory.session.verifyPassword password
          promise.reject 'Incorrect password, please try again'
        else
          ($.when @unlockSession { password })
            .done promise.resolve
            .fail promise.reject
        promise.promise()
      logOut: _.bind @confirmLogOut, @

  unlockSession: (options) ->
    @factory.settings.set 'sessionLocked', false

    if (@factory.session.get 'mode') is 'offline'
      true
    else
      # reconnect to the server before unlocking online sessions
      $.when(@ensureConnected options).fail =>
        # relock the session on failure
        @factory.settings.set 'sessionLocked', false

  confirmLogOut: ->
    promise = new $.Deferred

    # present a more forceful message if uncommitted changes will be
    # lost
    if @factory.modificationHandler.length > 0
      message = 'The current session has uncommitted modifications, which will be deleted permanently! Are you sure you want to continue?'
      buttons = [
        { label: 'No', role: 'cancel' }
        { label: 'Yes', class: 'btn-warning', role: 'accept' }
      ]
    else
      message = 'This will release the current session, are you sure you want to continue?'
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
      @factory.modificationHandler.reset()
      @pubSub.trigger 'logOut', force: true

    promise.promise()

  # switches the current mode of a session to be online or offline.
  # returns a Deferred that is resolved on completion. this is a no-op if the
  # session is already in the specified mode
  setSessionMode: (mode) ->
    session = @factory.session
    return true unless (session.get 'mode') isnt mode

    # bing - shouldn't need a new deferred here, but can't get the ajax return
    # to work with $.when at the moment
    # promise = new $.Deferred

    # @dataSpliceWebService.setSessionMode mode
    .then (result) =>
      session.set 'mode', result.payload.mode
      session.storeLocal()
      promise.resolve()
    .catch (error) =>
      @pubSub.trigger 'displayNotification',
        message: error.message
        severity: 'error'
      promise.reject()

    # $.ajax
    #   url: UrlHelper.prefix "ds/session/#{mode}"
    #   complete: (response) =>
    #     data = JSON.parse response.responseText
    #     if response.status is 200
    #       # update the session mode from the response, the other attributes
    #       # don't change
    #       session.set 'mode', data.mode
    #       session.storeLocal()
    #
    #       promise.resolve()
    #
    #     else
    #       @pubSub.trigger 'displayNotification',
    #         message: data.message
    #         severity: 'error'
    #
    #       promise.reject()
    #
    # promise.promise()

  monitorConnection: ->
    return if @_currentPush or @factory.session.isEmpty()

    wait = null
    @_currentPush = $.ajax UrlHelper.prefix('ds/push'),
      timeout: 30000
      dataType: 'json'
      success: (response) =>
        wait = @_handlePushResponse response if response
      error: (xhr) =>
        unless xhr.statusText in [ 'OK', 'timeout', 'abort' ]
          if xhr.responseText
            try
              message = JSON.parse(xhr.responseText).message
            catch error
              message = xhr.responseText

          # message or= 'Lost connection to the server'

          # try to reconnect and reestablish a session if possible
          @_changeState 'connecting'
          options =
            password: @factory.session.cachedPassword()
            silent: true
          $.when(@ensureConnected options).fail (error) =>
            # errors here indicate that we've lost the connection, stop
            # monitoring it
            @disconnect state: 'dropped', message: error or message

      complete: =>
        @_currentPush = null

        if @isConnected()
          if wait
            $.when(wait)
              .fail (message) =>
                @_cancelSync()
                @pubSub.trigger 'displayError', new UserError { message }
              .always => @monitorConnection()
          else
            # use defer to restart the monitor, otherwise we build up the call
            # stack
            _.defer => @monitorConnection()

  # synchronizes the local client with the server. this commits any local
  # modifications first, and then updates the local storage cache to allow the
  # user to work in a disconnected state
  dataSync: ->
    return if @_syncPromise

    unless @factory.dataController.storage.supportsOffline
      @pubSub.trigger 'displayNotification',
        message: 'Offline functionality is not supported in this environment'
        severity: 'error'
      return

    ef = @factory.eventFactory
    context = ef.context()
    postponeErrors = ExpressionEvaluator.evaluateAttribute 'DS_POSTPONE_SYNC_ERRORS',
      null, { context }

    ef.execute EventRegistry.OfflineSync, context, =>
      # make sure we're connected to the server
      ($.when @ensureConnected())
        .then =>
          # commit changes if needed
          @factory.modificationHandler.commitChanges { postponeErrors }
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
        wasEmpty = @factory.session.isEmpty()
        ($.when @ensureConnected
          userName: tokens[0]
          password: tokens[1]
          domain: @factory.server.get 'defaultAuthDomain'
        ).done =>
          # ensure the updated password is cached
          @factory.session.updatePassword tokens[1]

          # remove the credentials from the URL
          history.replaceState null, null, '/' + location.hash
          @factory.pubSub.trigger 'restartSession', authenticated: wasEmpty

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

      if behavior?.toLowerCase() is 'always'
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
    if @factory.settings.get 'sessionLocked'
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
  _handlePushResponse: (response) ->

    if response.action is 'disconnect'
      @disconnect message: response.message

      if response.message is 'Idle timeout'
        unless (@factory.session.get 'mode') is 'offline'
          @lockSession()

    else
      promise = null

      if response.message
        @pubSub.trigger 'displayNotification', message: response.message

      # return a deferred that resolves once the data is imported. the
      # push handler waits to fetch the next message until this is done,
      # which prevents the download from outpacing the database and queuing
      # up a ton of database requests
      if response.data
        promise = new $.Deferred
        @pubSub.trigger 'sync.offlineData', response.data, (error) ->
          if error
            promise.reject error
          else
            promise.resolve()

      else if response.purgeRecords
        promise = new $.Deferred
        @pubSub.trigger 'sync.purgeRecords', response.purgeRecords, (error) ->
          if error
            promise.reject error
          else
            promise.resolve()

      if response.status and @_syncStatus
        @_syncStatus.addStatus item for item in response.status

      if response.error
        @pubSub.trigger 'displayError', new UserError response.error

      if response.result
        @_completeSync response

      promise

  _startSync: ->
    unless @_currentPush
      @_changeState 'connected'
      @monitorConnection()

    @_syncStatus = OfflineSyncStatus
      factory: @factory
      onCancel: =>
        @_cancelSync()
    @pubSub.trigger 'displayModal', @_syncStatus

    @_syncPromise = new $.Deferred

    # figure out what digest information we need to send to the server
    $.when(@_generateOfflineDigest())
      .done (digest) ->
        # now start the actual sync - status and data will be available
        # through the push notification mechanism
        $.ajax
          url: UrlHelper.prefix 'ds/session/sync'
          type: 'POST'
          dataType: 'json'
          contentType: 'text/javascript'
          data: JSON.stringify digest

    @_syncPromise.promise()

  _cancelSync: ->
    # send a message to the server to cancel the current operation
    $.ajax
      url: UrlHelper.prefix 'ds/session/cancel'
      type: 'POST'

  _completeSync: (response) ->
    return unless @_syncPromise

    $.when(@factory.binaryResources.syncOfflineResources status: @_syncStatus)
      .done =>
        @_syncStatus.setResults response
        @_syncStatus = null

        @_syncPromise.resolve()
        @_syncPromise = null

        $.when(@getOfflineBehavior()).done (behavior) =>
          @pubSub.trigger 'sync.complete'

          if behavior?.toLowerCase() is 'always'
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

    storage = @factory.dataController.storage
    @dataSpliceWebService.getConfigurationDigests()
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
          storage.recordCount view, (localCount) =>
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
              storage.offlineDigest view, (viewDigest) =>
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
    .catch (error) =>
      promise.reject error

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
    @transferPropsTo ModalDialog
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
    ,
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
