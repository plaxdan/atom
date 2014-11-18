
# TODO: find a better way of making dsApp available to our plugins
module.exports = (dsApp) ->

  require '../styles/index.scss'

  GoogleMap = (require './GoogleMap') dsApp
  {$} = dsApp.shared
  {UrlHelper} = dsApp.utils

  class GoogleMapPlugin

    # specifies custom data display modes handled by this plug-in
    displayModes: [ 'map-google' ]

    createDisplayComponent: (mode, props) ->
      GoogleMap props

  new GoogleMapPlugin
