
# TODO: find a better way of making dsApp available to our plugins
module.exports = (dsApp) ->

  require 'script!../../build/vendor/global.js'
  require '../../build/vendor/leaflet/leaflet.css'
  require '../../build/vendor/leaflet-locatecontrol/L.Control.Locate.css'
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
