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
Server = require './models/server'
Session = require './models/session'
PersistentApplicationState = require './models/persistentapplicationstate'
UserError = require './models/usererror'
DataController = require './data/datacontroller'
ModificationHandler = require './data/modificationhandler'
BinaryResourceHandler = require './data/binaryresourcehandler'
EventFactory = require './event/eventfactory'
EventRegistry = require './event/eventregistry'
ConfigurationManager = require './expressions/configurationmanager'
ExpressionEvaluator = require './expressions/expressionevaluator'
HardwareManager = require './hardware/hardwaremanager'
PluginRegistry = require './plugins/pluginregistry'
InputControlFactory = require './views/common/inputcontrolfactory'
UrlHelper = require './utils/urlhelper'

class DataSpliceController

  constructor: (@pubSub, @factory) ->

    @initializeFactory()

    @pubSub.on 'restartSession', (options) => @startSession options
    @pubSub.on 'logOut', (options) => @logOut options
    @pubSub.on 'resolveViews', (options) => @resolveViews options

  initializeFactory: ->
    @server = new Server
    @session = new Session
    @factory.register 'server', @server
    @factory.register 'session', @session

    # Initialize settings object for application to use.
    @settings = new PersistentApplicationState

    # Announce over pubSub whenever the offline state is changed
    @factory.register 'settings', @settings

    @dataController = new DataController @factory
    @modificationHandler = new ModificationHandler @factory
    @eventFactory = new EventFactory @factory
    @configurationManager = new ConfigurationManager @factory
    @binaryResources = new BinaryResourceHandler @factory
    @hardwareManager = new HardwareManager @factory
    @pluginRegistry = new PluginRegistry @factory
    @inputFactory = new InputControlFactory @factory

  # Start the session by fetching the server data, and checking
  # the session from there.
  startSession: (options) ->
    @pubSub.trigger 'showWait'

    # only load server information if needed
    if not @server.get 'instanceName'

      new Promise (resolve, reject) =>
        @server.fetch
          bypassCache: true
          timeout: 10000
          success: =>
            @server.storeLocal()
            @pubSub.trigger 'serverLoaded'
            resolve()

          error: (model, error) =>
            # try to load persisted information if possible - if the browser is
            # offline the status code is zero, so we should try to load local
            # state
            if @server.loadLocal()
              @pubSub.trigger 'serverLoaded'
              resolve()
            else
              reject error
    else
      loadServer = true

    Promise.resolve(loadServer)
      .then =>
        @checkSession options unless options?.serverOnly
      .catch (error) =>
        console.debug 'Failed to load server info!'
        @pubSub.trigger 'serverError'
        @pubSub.trigger 'hideWait'
        @pubSub.trigger 'displayNotification',
          message: 'Error fetching server'
          severity: 'error'

  # Grab the session from the server, and resolve the views
  checkSession: (options) ->
    options or= {}
    loadSession = new Promise (resolve, reject) =>

      @_ensureSessionCookie()

      # always try to refetch the session from the server
      @session.fetch
        bypassCache: true
        success: =>
          resolve options

        error: (model, error) =>
          # try to load a persisted session if we're offline
          if (error.status isnt 400) and @session.loadLocal()
            # pass flag that we need to load a local copy of the views
            resolve _.extend options, local: true
          else
            reject error

    Promise.resolve(loadSession)
      .then (options) =>
        @resolveViews options
      .catch =>
        @_clearSession()

        console.debug 'Failed to load session'

        # display warning message if the session was lost
        if @session.isCached()
          @pubSub.trigger 'displayNotification',
            message: 'Session timout'
            severity: 'warning'

        @pubSub.trigger 'hideWait'

        # show login screen
        # There was a problem getting the session
        @pubSub.trigger 'sessionError'

  # Make requests to all grab all the view details data for the
  # session collection
  resolveViews: (options) ->
    vc = @session.get('views')

    if vc.length is 0

      @pubSub.trigger 'showWait'

      loadViews = new $.Deferred
      if options?.local
        # load the locally cached views
        $.when(vc.storage.getKeys /^ds\/views\/get/).done (keys) ->
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
                $.when(view.loadLocal()).done (loaded) ->
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
        @pubSub.trigger 'hideWait'
        @_postSync options

    else
      @_postSync options

  # attempts to authenticate with the server and establish a new session
  logIn: (session) ->
    promise = new $.Deferred

    @pubSub.trigger 'showWait'
    session.save null,
      success: =>
        @pubSub.trigger 'hideWait'

        @pubSub.trigger 'restartSession', authenticated: true

        promise.resolve(session)

      error: (model, response) =>
        @pubSub.trigger 'hideWait'

        message = if response.responseJSON
          error = new UserError response.responseJSON
          error.get 'message'
        else if response.responseText
          response.responseText
        else if response.statusText is 'error'
          'Authentication failed! Cannot contact the server'
        else
          'Authentication failed! No message from the server'

        @pubSub.trigger 'displayNotification',
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

    Promise.resolve(prompt).then =>
      ef = @factory.eventFactory
      ef.execute EventRegistry.LogOut, ef.context(), (context) =>
        # first commit any changes - this chains the deferred as the default
        # action return value
        Promise.resolve @factory.modificationHandler.commitChanges()
          .then =>
            @pubSub.trigger 'loggedOut'

            # restart the session regardless of whether the ajax call succeeds
            @_ensureSessionCookie()
            ($.ajax timeout: 5000, url: UrlHelper.prefix 'ds/session/logout')
              .always =>
                @_clearSession()

                # attempt to reload things, which should get us back to a
                # login screen
                @startSession()

                # this is a good time to check if an application update is
                # available
                ac = window.applicationCache
                if ac and ac.status isnt ApplicationCache.UNCACHED
                  ac.update()

                options?.promise?.resolve()
            .catch options?.promise?.reject

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

    @session.storeLocal()

    @pubSub.trigger 'sessionLoaded', options

    # trigger logged in event
    ef.execute EventRegistry.LoggedIn, context if options?.authenticated

    @pubSub.trigger 'hideWait'

    # sometimes this is called with a deferred that we need to trigger
    options?.promise?.resolve()

  _ensureSessionCookie: ->
    # some environments don't persist cookies (running as a shortcut from iOS
    # home screen), but local storage does work. restore the token cookie
    # if needed so we don't lose the current session
    if not document.cookie and (!@session.isEmpty() or @session.loadLocal())
      document.cookie = "DS_SESSION_NAME=#{@session.get 'sessionName'}"

  # clear local information about the current session
  _clearSession: ->
    document.cookie = 'DS_SESSION_NAME=invalid'
    for obj in [ @settings, @session ]
      obj.deleteCache()

module.exports = DataSpliceController
