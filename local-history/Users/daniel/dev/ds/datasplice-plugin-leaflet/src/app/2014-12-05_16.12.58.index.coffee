
# TODO: find a better way of making dsApp available to our plugins
module.exports = (dsApp) ->

  require 'leaflet/dist/leaflet'
  require 'leaflet/dist/leaflet.css'
  require 'leaflet-locatecontrol/src/css/animation.css'
  require 'leaflet-locatecontrol/src/L.Control.Locate.js'
  require 'leaflet-locatecontrol/src/L.Control.Locate.css'

  require '../styles/index.scss'

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
