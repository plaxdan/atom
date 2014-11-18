
# TODO: find a better way of making dsApp available to our plugins
module.exports = (dsApp) ->

  require '../styles/index.scss'

  GoogleMap = (require './googlemap') dsApp
  {$} = dsApp.shared
  {UrlHelper} = dsApp.utils

  class GoogleMapPlugin

    # This callback is called by the google maps script after it successfully
    # loads.
    #
    # See: https://developers.google.com/maps/documentation/javascript/examples/map-simple-async
    window.renderGoogleMap = ->
      mapOptions =
        zoom: 8
        center:
          lat: -34.397
          lng: 150.644
      map = new google.maps.Map (document.getElementById 'google-map'), mapOptions


    # specifies custom data display modes handled by this plug-in
    displayModes: [ 'map-google' ]

    createDisplayComponent: (mode, props) ->
      GoogleMap props

  new GoogleMapPlugin
