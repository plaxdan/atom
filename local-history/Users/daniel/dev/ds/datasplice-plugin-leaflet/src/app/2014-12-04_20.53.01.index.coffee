
# TODO: find a better way of making dsApp available to our plugins
module.exports = (dsApp) ->

  # require 'font-awesome-webpack'

  require 'leaflet/dist/leaflet'
  require 'leaflet/dist/leaflet.css'
  require '../styles/index.scss'
  require  'leaflet-locatecontrol/L.Control.Locate.css'
  require  'leaflet-locatecontrol/css/animation.css'

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
