# DataSplice Controller
#
# This class is responsible for setting up the main environment that supports
# the DataSplice web client. It is shared between the main web application
# router, along with the unit test framework so the latter performs as much
# like a 'real' client as possible.
#
# The controller should be created with a global pubSub and factory that will
# be shared across the main objects in the environment. initializeFactory()
# resets everything to a consistent state, and startSession() fires up the
# requests to load server and session
Session = require './models/session'
UserError = require './models/usererror'

ExpressionEvaluator = require './expressions/expressionevaluator'
EventRegistry = require './event/eventregistry'

class DataSpliceController

<<<<<<< HEAD
  constructor: (@pubSub, @fluxActions, @webService, @factory) ->

    @initializeFactory()

    @pubSub.on 'restartSession', (options) => @restartSession options

  initializeFactory: ->
    # Initialize settings object for application to use.
    @settings = new PersistentApplicationState

    # Announce over pubSub whenever the offline state is changed
    @factory.register 'settings', @settings

    @dataController = new DataController @factory
    @modificationHandler = new ModificationHandler @factory
    @eventFactory = new EventFactory @fluxActions, @webService, @factory
    @configurationManager = new ConfigurationManager @factory
    @binaryResources = new BinaryResourceHandler @factory
    @pluginRegistry = new PluginRegistry @factory, @webService
    @inputFactory = new InputControlFactory @factory

  restartSession: (options) ->
    @fluxActions.system.initialize()
=======
  constructor: (@factory, @webService) ->

    @factory.pubSub.on 'restartSession', (options) => @startSession options
    @factory.pubSub.on 'logOut', (options) => @logOut options
    @factory.pubSub.on 'resolveViews', (options) => @resolveViews options

  # Start the session by fetching the server data, and checking
  # the session from there.
  startSession: (options) ->
    @factory.pubSub.trigger 'showWait'

    accumulatedPayload = {}

    # only load server information if needed
    loadServer = new Promise (resolve, reject) =>
      { server } = @factory
      if server.get 'instanceName'
        resolve server.attributes
      else
        loadServer = new $.Deferred
        server.fetch
          bypassCache: true
          timeout: 10000
          success: =>
            server.storeLocal()
            @factory.pubSub.trigger 'serverLoaded'
            resolve server.attributes

          error: (model, error) =>
            # try to load persisted information if possible - if the browser is
            # offline the status code is zero, so we should try to load local
            # state
            if server.loadLocal()
              @factory.pubSub.trigger 'serverLoaded'
              resolve server.attributes
            else
              reject error

    Promise.resolve(loadServer)
      .then (serverAttributes) =>
        _.extend accumulatedPayload, serverAttributes
      .then => @checkSession options
      .then (sessionAttributes) =>
        _.extend accumulatedPayload, sessionAttributes
        _.extend accumulatedPayload, userName: @factory.session.userName()
      .catch (error) =>
        console.debug 'Failed to load server info!'
        @factory.pubSub.trigger 'serverError'
        @factory.pubSub.trigger 'hideWait'
        @factory.pubSub.trigger 'displayNotification',
          message: 'Error fetching server'
          severity: 'error'

  # Grab the session from the server, and resolve the views
  checkSession: (options) ->
    return if options?.serverOnly
    options or= {}
    { session } = @factory
    loadSession = new Promise (resolve, reject) =>
      @_ensureSessionCookie()

      # always try to refetch the session from the server
      session.fetch
        bypassCache: true
        success: =>
          resolve session.attributes

        error: (model, error) =>
          # try to load a persisted session if we're offline
          if (error.status isnt 400) and session.loadLocal()
            # pass flag that we need to load a local copy of the views
            _.extend options, local: true
            resolve session.attributes
          else
            reject error

    Promise.resolve(loadSession)
      .then (sessionAttributes) =>
        @resolveViews options
        sessionAttributes
      .catch =>
        @_clearSession()

        console.debug 'Failed to load session'

        # display warning message if the session was lost
        if session.isCached()
          @factory.pubSub.trigger 'displayNotification',
            message: 'Session timout'
            severity: 'warning'

        @factory.pubSub.trigger 'hideWait'

        # show login screen
        # There was a problem getting the session
        @factory.pubSub.trigger 'sessionError'

  # Make requests to all grab all the view details data for the
  # session collection
  resolveViews: (options) ->
    vc = @factory.session.get('views')

    if vc.length is 0

      @factory.pubSub.trigger 'showWait'

      loadViews = new $.Deferred
      if options?.local
        # load the locally cached views
        (Promise.resolve vc.storage.getKeys /^ds\/views\/get/).done (keys) ->
          async.each keys,
            (url, done) ->
              [m, id] = url.match /ds\/views\/get\/(.*)/
              view = vc.create { id }
              # need to call async done with no args
              $.when(view.loadLocal()).done -> done()
            , ->
              loadViews.resolve()
      else
        vc.fetch
          success: =>
            async.each vc.models,
              (view, done) ->
                # use the locally cached view if available and the checksum
                # matches
                checksum = view.get 'checksum'
                (Promise.resolve view.loadLocal()).done (loaded) ->
                  if loaded and checksum is view.get 'checksum'
                    done()
                  else
                    view.fetch
                      bypassCache: true
                      success: ->
                        # response for individual views does not contain the
                        # checksum
                        view.set { checksum }
                        view.storeLocal()
                        done()
                      error: (model) =>
                        console.error "Error resolving view #{model.id}"
                        done()
              # async complete
              , ->
                loadViews.resolve()

          error: ->
            console.error 'Error fetching views'
            loadViews.resolve()

      $.when(loadViews).done =>
        @factory.pubSub.trigger 'hideWait'
        @_postSync options

    else
      @_postSync options

  # attempts to authenticate with the server and establish a new session
  logIn: (userName, password, domain) ->
    promise = new $.Deferred

    @factory.pubSub.trigger 'showWait'
    session = new Session {userName, password, domain}
    session.save null,
      success: =>
        @factory.pubSub.trigger 'hideWait'

        @factory.pubSub.trigger 'restartSession', authenticated: true

        # todo - move this to the session service
        # revoke previously registered offline sessions - these are probably
        # stale so this is a good chance to free them
        { settingsService } = @factory
        offlineSessions = settingsService.getAppSetting 'offlineSessions'
        if offlineSessions?.length
          sessionName = session.get 'sessionName'
          for name in offlineSessions
            @webService.revokeSession name if name isnt sessionName

          offlineSessions = _.intersection offlineSessions, [ sessionName ]
          settingsService.setAppSetting { offlineSessions }

        promise.resolve session.attributes

      error: (model, response) =>
        @factory.pubSub.trigger 'hideWait'

        message = if response.responseJSON
          error = new UserError response.responseJSON
          error.get 'message'
        else if response.responseText
          response.responseText
        else if response.statusText is 'error'
          'Authentication failed! Cannot contact the server'
        else
          'Authentication failed! No message from the server'

        @factory.pubSub.trigger 'displayNotification',
          message: message
          error: error
          severity: 'error'

        promise.reject message

    promise.promise()

  # releases the current session with the server and any associated local
  # caches/data
  logOut: (options) ->
    prompt = unless options?.force
      # prompt the user unless a force option is specified
      promise = new $.Deferred
      @factory.pubSub.trigger 'displayModal',
        title: 'Confirm Log Out'
        body: 'Are you sure you want to log out?'
        buttons: [
          { label: 'Yes', class: 'btn-primary', role: 'accept' }
          { label: 'No', role: 'cancel' }
        ]
        promise: promise

      promise
    else
      true

    $.when(prompt).done =>
      ef = @factory.eventFactory
      ef.execute EventRegistry.LogOut, ef.context(), (context) =>
        # first commit any changes - this chains the deferred as the default
        # action return value
        ($.when @factory.modificationHandler.commitChanges())
          .done =>
            @factory.pubSub.trigger 'loggedOut'

            # restart the session regardless of whether the ajax call succeeds
            @_ensureSessionCookie()

            # run this whether the destroySession() promise resolves or not
            afterDestroySession = =>
              @_clearSession()

              # attempt to reload things, which should get us back to a
              # login screen
              @startSession()

              # this is a good time to check if an application update is
              # available
              ac = window.applicationCache
              if ac? and ac.status isnt ac.UNCACHED
                ac.update()

              options?.promise?.resolve()

            sessionName = @factory.session.get 'sessionName'
            @webService.destroySession()
              .then =>
                # todo - move this to the sessions service
                # remove this session from the list of outstanding offline
                # sessions
                { settingsService } = @factory
                offlineSessions = settingsService.getAppSetting 'offlineSessions'
                if offlineSessions and sessionName in offlineSessions
                  offlineSessions = _.without offlineSessions, sessionName
                  settingsService.setAppSetting { offlineSessions }

                afterDestroySession()
              .catch ->
                afterDestroySession()
                options?.promise?.reject()

  # All syncing was successful, moving on
  _postSync: (options) ->
    ef = @factory.eventFactory
    context = ef.context()

    # bing:localization - this needs a lot more thought. for now, we can at
    # least load non-US time formats based on the browser accept language
    (Promise.resolve ExpressionEvaluator.evaluateAttribute 'DS_LOCALE', 'en', { context })
      .then (locale) ->
        console.info "Setting locale: #{locale}"
        if locale and locale not in [ 'en', 'en-us' ]
          moment.lang 'en-gb'
        else
          moment.lang 'en'

    @factory.session.storeLocal()

    @factory.pubSub.trigger 'sessionLoaded', options

    # trigger logged in event
    ef.execute EventRegistry.LoggedIn, context if options?.authenticated

    @factory.pubSub.trigger 'hideWait'

    # sometimes this is called with a deferred that we need to trigger
    options?.promise?.resolve()

  _ensureSessionCookie: ->
    # some environments don't persist cookies (running as a shortcut from iOS
    # home screen), but local storage does work. restore the token cookie
    # if needed so we don't lose the current session
    { session } = @factory
    if not document.cookie and (!session.isEmpty() or session.loadLocal())
      document.cookie = "DS_SESSION_NAME=#{session.get 'sessionName'}"

  # clear local information about the current session
  _clearSession: ->
    document.cookie = 'DS_SESSION_NAME=invalid'
    @factory.session.deleteCache()
>>>>>>> dev

module.exports = DataSpliceController
