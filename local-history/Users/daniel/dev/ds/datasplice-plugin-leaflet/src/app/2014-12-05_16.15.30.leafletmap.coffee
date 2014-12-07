module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM

  LeafletMap = React.createClass
    displayName: 'LeafletMap'

    propTypes:
      baseMap: React.PropTypes.string
      center: React.PropTypes.array
      zoom: React.PropTypes.number
      showScale: React.PropTypes.bool
      attributions: React.PropTypes.array
      # See: https://github.com/DataSplice/leaflet-locatecontrol#possible-options
      locateControl: React.PropTypes.object

    getDefaultProps: ->
      zoom: 15
      showScale: true
      imagePath: '../vendor/leaflet/images'
      attributions: ['<a href="http://www.datasplice.com">&copy; DataSplice, 2014</a>']
      # See: https://github.com/DataSplice/leaflet-locatecontrol#possible-options
      locateControl:
        position: 'topright'
        icon: 'icon-location-arrow'
        follow: true,
        stopFollowingOnDrag: true,
        keepCurrentZoomLevel: true

    getInitialState: -> {}

    shouldComponentUpdate: (nextProps, nextState) ->
      panOrZoomHasChanged = =>
        nextProps.zoom isnt @props.zoom or
          not _.isEqual nextProps.center, @props.center

      @panAndZoom nextProps.center, nextProps.zoom if panOrZoomHasChanged()

      false

    componentDidMount: ->
      # bing:hack - the defer is needed here at the moment because there are
      # cases this component is mounted in a disconnect dom node, which
      # angers the map. once the app has a top-level React component this
      # should no longer be necessary
      _.defer => @_initializeMap()

    componentWillUnmount: ->
      # Clear all watchers
      console.debug "Clearing #{@watchers?.length} watchers"
      (clearInterval watcher) for watcher in @watchers if @watchers

    render: ->
      div id:'map', className: 'map'

    _hackImagePath: ->
      # :-(
      # https://github.com/Leaflet/Leaflet/blob/efba6b4d1c92ecbfe6505c7ada3ff3a3114f8753/src/layer/marker/Icon.Default.js#L31
      L.Icon.Default.imagePath = @props.imagePath

    _initializeMap: ->
      @_hackImagePath()

      # TODO: turn off inertia for better performance?
      @state.map = L.map 'map'
      @state.map.on 'contextmenu', @_onContextMenu
      @state.map.on 'moveend', @_onMoveEnd
      @state.map.on 'zoomend', @_onZoomEnd

      # Scale & Attributions
      L.control.scale?().addTo @state.map if @props.showScale
      for attribution in @props.attributions
        @state.map.attributionControl.addAttribution attribution

      # Locate button
      if @props.locateControl
        (L.control.locate @props.locateControl).addTo @state.map

      # Use GPS sensor hardware?
      @_useGPSSensor() if @props.gpsSensor

      # Move to position
      @panAndZoom @props.center, @props.zoom if @props.center

      if @props.legend
        @_addLegend @props.legend

      if @props.baseMap
        (L.esri.basemapLayer @props.baseMap).addTo @state.map

    # Monkey patch our GPS service into the geolocation API
    _useGPSSensor: ->
      geolocation = navigator.geolocation
      geolocation.getCurrentPosition = _.bind @getCurrentPosition(), geolocation
      geolocation.watchPosition = _.bind (@watchPosition @), geolocation
      geolocation.clearWatch = _.bind @clearWatch(), geolocation

    _addLegend: (content) ->
      legend = L.control position: 'topright'
      legend.onAdd = (map) ->
        container = L.DomUtil.create 'div', 'leaflet-legend leaflet-bar leaflet-control'
        a = L.DomUtil.create 'a', 'leaflet-bar-part pull-right', container
        a.addEventListener 'click', (ev) ->
          container.classList.toggle 'open'
          ev.stopPropagation()

        L.DomUtil.create 'i', 'icon-bar-chart', a

        body = L.DomUtil.create 'div', 'body', container

        if _.isArray content
          content = content.join '\n'
        body.innerHTML = content

        container
      legend.addTo @state.map

    clearWatch: ->
      (locationWatchId) ->
        console.debug "Monkey patched navigator.geolocation.clearWatch"
        clearInterval locationWatchId

    watchPosition: (self) ->
      getCurrPos = @getCurrentPosition()
      {interval} = @props.gpsSensor
      self.watchers or= []
      (onResponse, onError, options) =>
        console.debug "Monkey patched navigator.geolocation.watchPosition"
        watcher = setInterval getCurrPos, interval, onResponse, onError, options
        self.watchers.push watcher
        watcher

    getCurrentPosition: ->
      {endpoint, timeout} = @props.gpsSensor
      (onResponse, onError, options) ->
        console.debug "Monkey patched navigator.geolocation.getCurrentPosition"
        $.ajax endpoint,
          timeout: timeout
          dataType: 'json'
          success: (successResponse) ->
            payload = JSON.parse successResponse
            # The GPS service will return an error object
            # if we're unable to get the position
            # See: http://diveintohtml5.info/geolocation.html#errors
            if payload.code and payload.message
              console.debug "Error: #{successResponse}"
              onError payload
            else
              console.debug "Your position: #{successResponse}"
              onResponse payload
          error: (errorResponse) ->
            # We're unable to even talk to the GPS sensor
            console.debug "GPS Sensor Service Error"
            console.debug errorResponse
            onError code: 2, message: 'Position unavailable'

    pan: (coords, panOptions) ->
      @state.map.panTo coords, panOptions

    zoom: (zoomLevel, zoomOptions) ->
      @state.map.setZoom zoomLevel, zoomOptions

    panAndZoom: (coords, zoom) ->
      @state.map.setView coords, zoom

    _onContextMenu: (ev) ->
      @props.selectCoordinates ev.latlng

    _onMoveEnd: (ev) ->
      center = @state.map.getCenter()
      @props.mapPositionChanged
        center: [ center.lat, center.lng ]
        zoom: @state.map.getZoom()

    _onZoomEnd: (ev) ->
      zoom = @state.map.getZoom()
      if @props.layers?
        @_toggleLayer layer for name, layer of @props.layers

    _toggleLayer: (layer) ->
      zoom = @state.map.getZoom()
      allowed = layer.visibleForZoom zoom

      if allowed and not @state.map.hasLayer layer
        console.debug "Adding layer #{layer.name} #{zoom}"
        @state.map.addLayer layer
      else if not allowed and @state.map.hasLayer layer
        console.debug "Removing layer #{layer.name}"
        @state.map.removeLayer layer
