module.exports = (dsApp) ->

  LeafletMap = (require './leafletmap') dsApp
  FeatureLayer = (require './featurelayer') dsApp
  StyleHelper = require './stylehelper'
  {$, React} = dsApp.shared
  {FilterItem} = dsApp.utils
  {div} = React.DOM

  LeafletMapDisplay = React.createClass
    displayName: 'LeafletMapDisplay'

    defaultLayerOptions:
      opacity: 1
      fillOpacity: 1

    propTypes:
      settings: React.PropTypes.object.isRequired

    componentWillMount: ->
      @props.factory.pubSub.on 'mapSelectFeatures', @_pubSubSelectFeatures

    componentWillReceiveProps: (nextProps) ->
      @_fetchMapLayers()

      # apply any existing selection criteria - the map seems to not be settled
      # yet so we need to defer
      _.defer =>
        selection = @props.controller.activeState().get 'mapSelection'
        @_applySelection selection if selection

    componentWillUnmount: ->
      @props.factory.pubSub.off 'mapSelectFeatures', @_pubSubSelectFeatures

    render: ->
      return div null unless @props.settings?
      activeState = @props.controller.activeState()

      # prefer cached position and fall back to defaults
      # todo - this should use the extent of selected features or the user
      # position when applicable
      center = (activeState.get 'center') or @props.settings.initialCenter
      zoom = (activeState.get 'zoom') or @props.settings.initialZoom

      LeafletMap _.extend {}, @props.settings,
        ref: 'leafletMap'
        layers: @state?.layers
        mapPositionChanged: @mapPositionChanged
        selectCoordinates: @selectCoordinates
        center: center
        zoom: zoom

    setHeight: (height) ->
      $('#map').height height
      @_getMap()?.invalidateSize()

    mapPositionChanged: (state) ->
      # push position (center, zoom) into display state so it will be
      # persistent if the pane is displayed again
      @props.controller.activeState().set state

    selectCoordinates: (latlng) ->
      # selection options at the top settings level refer to pinned gps
      # coordinates
      if @props.settings.selection
        @_applySelection
          type: 'latlng'
          latlng: latlng
          options: @props.settings.selection

    _getMap: ->
      @refs.leafletMap?.state?.map

    _handleEvent: (actionOrEvent, ev) ->
      # Build context and pass in GIS feature properties
      context = @props.controller.eventContext()
      { feature } = ev.layer
      context.setAttributes feature.properties, explicitOnly: true

      # Fire the DataSplice action
      console.debug "firing DataSplice '#{actionOrEvent}' in response to #{ev.type}"
      @props.controller.performCommand actionOrEvent, {context}

    _attachEventHandlers: (layer, layerOpts) ->
      # Handle any of the leaflet events
      # See: http://leafletjs.com/reference.html#featuregroup-click
      if layerOpts.events
        leafletEvents = [
          'click'
          'dblclick'
          'mouseover'
          'mouseout'
          'mousemove'
          'contextmenu'
          'layeradd'
          'layerremove'
        ]
        for name in leafletEvents
          if layerOpts.events[name]
            layer.on name, _.bind @_handleEvent, @, layerOpts.events[name]

      # attach default handler to output feature info when clicked
      layer.on 'click', (ev) =>
        console.debug "click #{ev.target.name}: #{JSON.stringify ev.layer.feature.properties}"

        if layerOpts.selection
          @_selectFeature layer, ev.layer

    _fetchMapLayers: ->
      return unless @props.settings?

      baseOpts =
        factory: @props.factory

      layers = {}
      map =
        geoJson: @props.settings.layers
        data: @props.settings.dataLayers
      for type, list of map
        for name, options of list
          layerOpts = @_optionsForLayer _.extend { type }, options
          layer = new FeatureLayer name, _.extend {}, baseOpts, layerOpts
          @_attachEventHandlers layer, layerOpts
          layers[name] = layer

      @setState { layers }

    _optionsForLayer: (configOptions) ->
      options = _.clone configOptions
      options.controller = @props.controller
      options.style = _.extend {}, @defaultLayerOptions, options.style

      # Handle point features
      { style } = options
      if options.style?.marker
        delete options.style
        # pointToLayer callback will be called by leaflet
        # See: http://leafletjs.com/reference.html#geojson-pointtolayer
        options.pointToLayer = (feature, latlng) =>
          # pointToLayer must return the marker synchronously, so return one
          # with the base/fixed layer style and apply the dynamic style after
          # it is processed
          marker = @_createMarker style, feature, latlng
          if options.dynamicStyle
            @_queueDynamicStyleTask options.dynamicStyle, feature, (style) ->
              marker.applyStyle style if style

          marker
      # Handle vector features
      else
        if options.dynamicStyle?
          options.onEachFeature = (feature, layer, cb) =>
            @_queueDynamicStyleTask options.dynamicStyle, feature, (style) ->
              layer.setStyle style if style
              cb?()

      options

    # Given the following admin client configuration:
    #
    # ```json
    # "labelpoints": {
    #   "minZoomVisible": 15,
    #   "style": {
    #     "marker": "text",
    #     "className": "no-wrap",
    #     "html": "${TextString}",
    #     "rotation": "${Angle}"
    #   }
    # }
    # ```
    #
    # ...the values for the style keys are interpreted either as literals
    # or as properties of the GIS feature if the $ syntax is used.
    _styleExpression: (styleVal, feature) ->
      if /^\${\w+}$/.test styleVal
        # Strip off the ${}
        key = (styleVal.match /\w+/)[0]
        val = feature.properties["#{key}"]
        val
      else
        styleVal

    _rotatedDivIcon: (degrees, content) ->
      rotate = "rotate(#{-1 * degrees}deg)"
      transforms = [
        "-webkit-transform:#{rotate}" # Chrome, Safari 3.1+
        "-moz-transform:#{rotate}" # Firefox 3.5-15
        "-ms-transform:#{rotate}" # IE 9
        "-o-transform:#{rotate}" # Opera 10.50-12.00
        "transform:#{rotate}" # Firefox 16+, IE 10+, Opera 12.10+
      ]
      transforms = transforms.join ';'
      html = "<div style='#{transforms}'>#{content}</div>"
      html

    # Creates either one of:
    # - CircleMarker http://leafletjs.com/reference.html#circlemarker
    # - DivIcon http://leafletjs.com/reference.html#divicon
    _createMarker: (style, feature, latlng) ->
      marker = switch style.marker
        when 'circle'
          L.circleMarker latlng, style
        when 'text'
          divIcon =
            # If we define rotation in the style we have to wrap the divIcon
            # in another div so we can apply the necessary CSS transform.
            if style.rotation?
              degrees = @_styleExpression style.rotation, feature
              content = @_styleExpression style.html, feature
              rotatedDivIcon = @_rotatedDivIcon degrees, content
              L.divIcon
                className: @_styleExpression style.className, feature
                html: rotatedDivIcon
            else
              L.divIcon
                className: @_styleExpression style.className, feature
                html: @_styleExpression style.html, feature

          L.marker latlng,
            icon: divIcon

      marker.applyStyle = @_applyDynamicStyle[style.marker]
      marker

    # throttle the handling of dynamic styles for features
    _queueDynamicStyleTask: (dynamicStyles, feature, cb) ->
      @_styleQueue or= []
      @_processQueue or= _.throttle ( =>
        @_inProcess = true
        queue = @_styleQueue
        @_styleQueue = []

        start = new Date()
        async.eachLimit queue, 10, (item, done) =>
          $.when(@_calculateDynamicStyle item.dynamicStyles, item.feature)
            .done (style) ->
              item.cb style unless _.isEmpty style
              done()
            .fail (error) ->
              console.error error
              done()
        , =>
          console.debug "Processed #{queue.length} style task(s) in #{new Date() - start}ms"
          @_inProcess = false
          @_processQueue() if @_styleQueue.length

      ), 100

      @_styleQueue.push { dynamicStyles, feature, cb }
      @_processQueue() unless @_inProcess

    # calculate the dynamic style specific to a particular feature
    _calculateDynamicStyle: (dynamicStyles, feature) ->
      context = @props.controller.eventContext()
      _.extend context.getExplicitAttributes(), feature.properties

      ($.when @_activeDynamicStyle dynamicStyles, context)
        .then (style) =>
          if style
            ($.when StyleHelper.processStyleReferences style, context)
              .done (style) =>
                @_parseStyleJSON style

    _numericStyleProps: [ 'radius', 'weight', 'opacity', 'fillOpacity' ]

    _parseStyleJSON: (expression) ->
      style = if _.isString expression
        JSON.parse expression
      else
        expression

      # certain properties need to be numeric
      for key, value of style
        if key in @_numericStyleProps and _.isString value
          style[key] = parseFloat value

      style

    # given a ordered key/value pairs of expressions and styles, this resolves
    # to the value of the first key expression that evaluates as true
    _activeDynamicStyle: (dynamicStyles, context) ->
      # this uses eachSeries a little strangely - if an expression evaluates
      # to true we pass the value back as an 'error', which causes the
      # iteration to stop. the complete callback then passes the value as the
      # resolution to the initial promise
      promise = new $.Deferred
      async.eachSeries (_.pairs dynamicStyles),
        (pair, done) ->
          ($.when ExpressionEvaluator.evaluate pair[0],
            context: context
            quiet: true
          ).done (value) ->
            if value
              done pair[1]
            else
              done()
          .fail promise.reject
        , promise.resolve
      promise.promise()

    # these apply the dynamically calculated styles based on the marker type
    _applyDynamicStyle:
      'circle': (style) ->
        @setStyle style
      'text': (style) ->

    _selectFeature: (layer, featureLayer) ->
      selectionOpts = _.extend { featureLayer }, layer.options.selection

      @_applySelection
        type: 'feature'
        layer: layer.name
        feature: featureLayer.feature
        options: selectionOpts

    _applySelection: (selection) ->
      @_clearGpsPin()

      context = @props.controller.eventContext()
      { options } = selection

      switch selection.type
        when 'feature'
          context.setAttributes selection.feature.properties, explicitOnly: true

          if options.featureLayer
            # add label and center on selected feature
            label = options?.label or selection.layer
            @_addFeaturePopup options.featureLayer, label, context
            @refs.leafletMap.pan options.featureLayer.getBounds().getCenter()

        when 'latlng'
          context.setAttributes selection.latlng, explicitOnly: true

          @_gpsMarker = L.marker selection.latlng,
            icon: L.divIcon
              className: 'gps-pin'
              html: '<i class="icon-map-marker"></i>'
          @_gpsMarker.addTo @_getMap()

          @refs.leafletMap.pan selection.latlng

      # sync dataset to selection if needed
      if options?.dataMapping
        @_syncDataSet options.dataMapping, context

      else if selection.feature?.record
        ds = @props.controller.activeDataSet()
        ds.totalRecordCount = 1
        ds.hasFinalRecordCount = true
        ds.reset [ selection.feature?.record ]

      layer.applySelection selection for name, layer of @state.layers

      @props.controller.activeState().set mapSelection: selection

    _clearGpsPin: ->
      if @_gpsMarker
        @_getMap().removeLayer @_gpsMarker
        @_gpsMarker = null

    _addFeaturePopup: (featureLayer, label, context) ->
      $.when(ExpressionEvaluator.replaceReferences label, { context })
        .done (replaced) =>
          L.popup( closeButton: false )
            .setLatLng(featureLayer.getBounds().getCenter())
            .setContent(replaced)
            .openOn @_getMap()

    _syncDataSet: (mapping, context) ->
      filter = FilterItem.parseStatement mapping
      $.when(filter.replaceAttributeReferences context)
        .done =>
          query = @props.controller.activeQuery()
          query.set { filter }
          query.fetch()

    _pubSubSelectFeatures: (message) ->
      options = JSON.parse message
      if options.layer
        layers = if _.isArray options.layer
          options.layer
        else
          [ options.layer ]
        _.each layers, (name) =>
          layer = @state.layers[name]
          return unless layer
          $.when(layer.queryFeatures options.properties)
            .done (features) =>
              return unless features?.length

              # pan to the first feature in the list
              center = @_getGeometryCenter features[0].geometry
              @refs.leafletMap.pan lat: center.y, lng: center.x if center

              # select the feature once it is on the map
              ($.when layer.getFeatureLayer features[0].id)
                .done (featureLayer) =>
                  selectionOpts = _.extend { featureLayer }, layer.options.selection
                  @_applySelection
                    type: 'feature'
                    layer: name
                    feature: features[0]
                    options: selectionOpts

      else if options.latlng
        _.defer =>
          console.warn "latlng: #{JSON.stringify options.latlng}"
          @refs.leafletMap.pan
            lat: options.latlng[0]
            lng: options.latlng[1]

    _getGeometryCenter: (geometry) ->
      switch geometry.type
        when 'LineString'
          (new L.bounds geometry.coordinates).getCenter()
        when 'Point'
          new L.point geometry.coordinates
