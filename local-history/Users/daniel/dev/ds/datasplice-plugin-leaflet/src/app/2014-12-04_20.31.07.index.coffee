
# TODO: find a better way of making dsApp available to our plugins
module.exports = (dsApp) ->

  # require 'font-awesome-webpack'

  require 'leaflet/dist/leaflet'
  require 'leaflet/dist/leaflet.css'
  require 'esri-leaflet/dist/esri-leaflet'

  LeafletMap = (require './leafletmap') dsApp
  LeafletMapDisplay = (require './leafletmapdisplay') dsApp
  {$} = dsApp.shared
  {UrlHelper} = dsApp.utils

  class LeafletPlugin

    # specifies custom data display modes handled by this plug-in
    displayModes: [ 'map-leaflet' ]

    createDisplayComponent: (mode, props) ->
      LeafletMapDisplay props

  new LeafletPlugin
