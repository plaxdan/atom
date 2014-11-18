URLON = require 'URLON'
Fluxxor = require 'fluxxor'
{ FluxMessages } = require '../constants'

DisplayStateController = require '../data/displaystatecontroller'

RouteStore = Fluxxor.createStore

  _hashRegEx: ///
              [#]       # match literal hash at beginning
              ([^?]*)   # route/path
              (\?(.*))? # followed by optional props after question mark
              ///

  initialize: (@legacyFactory) ->
    @bindActions(
      FluxMessages.NAVIGATE_HOME, _.bind @_navigate, @, [ 'home' ]
      FluxMessages.NAVIGATE_SETTINGS, (options) =>
        @_navigate [ 'settings', options?.section ]
      FluxMessages.NAVIGATE_VIEW, @_navigateView
    )

    # this is needed at the moment because of the view action shenanigans
    # going on below - the session and views aren't available initially when
    # we're initialized
    @legacyFactory.pubSub.on 'sessionLoaded', @_updateRouteState

    window.addEventListener 'hashchange', @_updateRouteState
    @_updateRouteState()

  getState: -> @state

  _updateRouteState: ->
    @state = @_parseLocation()

    # todo - destroy this with fire
    vc = @legacyFactory.session.get 'views'
    if vc and @state.route[0] is 'view'
      view = vc.get (@state.route.slice 1).join '/'
      action = (view.getNavigationAction @state.routeProps?.action) or
        (view.get 'navigationActions')?.HomeScreenActions?[0]?.action
      if action
        if @_grossControllerReference
          @state.routeProps.displayStateController = @_grossControllerReference
          @_grossControllerReference = null
        else
          state = @legacyFactory.dataController.createDisplayState
            name: action.name
            viewIdentifier: action.query.target
            action: action
          @state.routeProps.displayStateController =
            new DisplayStateController state, @legacyFactory

    @emit 'change'

  _navigate: (route, options) ->
    if _.isArray route
      route = (_.compact route).join '/'

    location.hash = route

  _navigateView: (options) ->
    { action, controller } = options
    @_grossControllerReference = controller
    @_navigate "view/#{ action.query.target }?action=#{ action.name }"

  _parseLocation: ->
    if location.hash
      [ m, route, t, fragment ] = location.hash.match @_hashRegEx

      if route
        route = route.split '/'
        # deprecated - ignore leading ui component, it never meant anything
        route.shift() if route[0] is 'ui'

      routeProps = @_parseProperties fragment if fragment

    route: route or []
    routeProps: routeProps or {}

  _parseProperties: (fragment) ->
    # prefer URLON-encoded properties
    try
      URLON.parse routeProps
    catch
      # fall back to traditional HTTP encoded parameters
      parameters = {}
      for arg in fragment.split '&'
        pos = arg.indexOf '='
        if pos >= 0
          parameters[arg.substring 0, pos] = arg.substring pos + 1
        else
          parameters[arg] = null

      parameters

module.exports = RouteStore
