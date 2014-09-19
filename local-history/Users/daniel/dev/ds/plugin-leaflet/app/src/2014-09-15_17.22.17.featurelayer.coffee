StyleHelper = require './stylehelper'

module.exports = (dsApp) ->

  FeatureLayer = L.GeoJSON.extend
    options:
      cellSize: 512
      debounce: 100

    initialize: (@name, options) ->
      @_featuresOnMap = {}
      @_selectedOnMap = []
      @_pendingFeatureCallbacks = {}
      @_dataController = options.factory.dataController

      # this doesn't get autobound like onAdd/onRemove
      _origOnEach = options.onEachFeature
      options.onEachFeature = (feature, layer) =>
        @_featuresOnMap[feature.id] = { feature, layer }

        # fire callback if something is waiting for the feature to be added to
        # the map
        if @_pendingFeatureCallbacks[feature.id]
          @_pendingFeatureCallbacks[feature.id] layer
          @_pendingFeatureCallbacks[feature.id] = null

        if _origOnEach
          _origOnEach feature, layer, =>
            @onEachFeature feature, layer
        else
          @onEachFeature feature, layer

      L.GeoJSON::initialize.call @, [], options

      @_debouncedMoveHandler = _.debounce @_moveHandler, options.debounce or 100

    onAdd: (map) ->
      console.debug "Being added to map: #{@name}"
      L.GeoJSON::onAdd.apply @, arguments
      map.on 'zoomend resize move', @_debouncedMoveHandler, @

    onRemove: (map) ->
      console.debug "Being removed from map: #{@name}"
      L.GeoJSON::onRemove.apply @, arguments
      map.off 'zoomend resize move', @_debouncedMoveHandler, @

    onEachFeature: (feature, layer) ->
      # select new features if they match the group selection
      if @_groupSelection and feature.properties[@_groupSelection.key] is @_groupSelection.value
        @_addFeatureToSelection feature.id, @_groupSelection.style

    visibleForZoom: (zoom) ->
      return false if @options?.maxZoomVisible? and zoom > @options.maxZoomVisible
      return false if @options?.minZoomVisible? and zoom < @options.minZoomVisible
      true

    applySelection: (selection) ->
      @_clearSelection()

      if selection.type is 'feature'
        if selection.layer is @name and @options.selection?.style
          { groupBy, style } = @options.selection
          if groupBy
            groupValue = selection.feature.properties[groupBy]
            @_selectFeaturesByProperty groupBy, groupValue, style

          else
            @_addFeatureToSelection selection.feature.id, style

        # apply styling associated with selected features in other layers
        else if @options["selection:#{selection.layer}"]
          selectOpts = @options["selection:#{selection.layer}"]
          { groupBy, style } = selectOpts
          groupValue = selection.feature.properties[groupBy]
          @_selectFeaturesByProperty groupBy, groupValue, style

    getFeatureLayer: (id) ->
      # return the layer directly on the map
      if @_featuresOnMap[id]
        @_featuresOnMap[id]?.layer
      # otherwise store a promise that can be resolved when/if the layer is
      # added to the map
      else
        promise = new $.Deferred
        @_pendingFeatureCallbacks[id] = promise.resolve
        promise.promise()

    queryFeatures: (properties) ->
      items = for key, value of properties
        new FilterItem operator: '=', arguments: [ key, value ]
      filter = if items.length is 1
        items[0]
      else
        new FilterItem operator: 'and', arguments: items

      query = @_dataController.createQuery @name,
        localData: true
        filter: filter

      promise = new $.Deferred

      query.dataSet.on 'reset', =>
        features = for record in query.dataSet.models
          if @_featuresOnMap[record.id]
            @_featuresOnMap[record.id].feature
          else
            @_recordToGeoJson record
        promise.resolve features

      query.fetch()

      promise.promise()

    _moveHandler: (e) ->
      zoom = e.target.getZoom()
      return unless @visibleForZoom zoom

      bounds = e.target.getBounds()
      switch @options.type
        when 'geoJson' then @_queryGeoJsonFeatures bounds
        when 'data' then @_queryDataFeatures bounds

    # these are the built-in overhead fields for a view that should be excluded
    # from the feature properties
    _geoJsonExcludeFields: [
      'GeoJSON'
      'X Min'
      'X Max'
      'Y Min'
      'Y Max'
    ]

    _recordToGeoJson: (record) ->
      type: 'Feature'
      id: record.id
      geometry: JSON.parse record.getValue 'GeoJSON'
      properties: record.getValues exclude: @_geoJsonExcludeFields

    _queryGeoJsonFeatures: (bounds) ->
      filter = [
        "'X Min' <= #{bounds.getEast()}"
        "'X Max' >= #{bounds.getWest()}"
        "'Y Min' <= #{bounds.getNorth()}"
        "'Y Max' >= #{bounds.getSouth()}"
      ]
      filter.push "id not in (#{@_featuresOnMap.keys.join ','})" if @_featuresOnMap.keys?
      query = @_dataController.createQuery @name,
        localData: true
        filter: filter.join ' and '

      query.dataSet.on 'reset', =>
        for record in query.dataSet.models
          unless @_featuresOnMap[record.id]?
            @addData @_recordToGeoJson record

      query.fetch()

    _queryDataFeatures: (bounds) ->
      latField = @options.latitudeField or 'Latitude'
      longField = @options.longitudeField or 'Longitude'
      filter = [
        "'#{longField}' <= #{bounds.getEast()}"
        "'#{longField}' >= #{bounds.getWest()}"
        "'#{latField}' <= #{bounds.getNorth()}"
        "'#{latField}' >= #{bounds.getSouth()}"
      ]
      filter.push @options.query if @options.query
      query = @_dataController.createQuery @name,
        filter: filter.join ' and '

      query.dataSet.on 'reset', =>
        for record in query.dataSet.models
          feature =
            type: 'Feature'
            id: record.id
            geometry:
              type: 'Point'
              coordinates: [
                record.getValue longField
                record.getValue latField
              ]
            properties: record.getValues()
            record: record
          @addData feature

      query.fetch()

    _selectFeaturesByProperty: (key, value, style) ->
      # remember criteria so we can update features as they are added to the
      # map by panning/zooming
      @_groupSelection =
        key: key
        value: value
        style: style
      for id, info of @_featuresOnMap
        if info.feature.properties[key] is value
          @_addFeatureToSelection id, style

    _addFeatureToSelection: (id, style) ->
      if @_featuresOnMap[id]
        { layer, feature } = @_featuresOnMap[id]

        context = @options.controller.eventContext()
        context.setAttributes feature.properties, explicitOnly: true
        ($.when StyleHelper.processStyleReferences style, context)
          .done (style) ->
            layer.setStyle style

      @_selectedOnMap.push id

    _clearSelection: ->
      @_groupSelection = null

      # remove and re-add selected features to restore the initial style
      for id in @_selectedOnMap
        continue unless @_featuresOnMap[id]
        { feature, layer } = @_featuresOnMap[id]
        @removeLayer layer
        @addData feature
      @_selectedOnMap = []
