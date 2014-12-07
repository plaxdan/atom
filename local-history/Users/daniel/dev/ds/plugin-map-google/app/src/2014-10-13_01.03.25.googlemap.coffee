module.exports = (dsApp) ->

  # This callback is called by the google maps script after it successfully
  # loads.
  #
  # See: https://developers.google.com/maps/documentation/javascript/examples/map-simple-async
  window.renderGoogleMap = ->
    GoogleMap
      mapOptions:
        zoom: 8
        center:
          lat: -34.397
          lng: 150.644

  {React} = dsApp.shared
  {div} = React.DOM

  GoogleMap = React.createClass
    displayName: 'GoogleMap'

    componentWillMount: ->
      script = document.createElement 'script'
      script.type = 'text/javascript'
      script.src = 'https://maps.googleapis.com/maps/api/js?\
        v=3.exp&\
        callback=renderGoogleMap&\
        key=AIzaSyAbg48k9kNngiO4EMo23RaaOZpj0XIWY54'
      document.body.appendChild script

    componentDidMount: ->
      googleMap = new google.maps.Map (document.getElementById 'google-map'),
        @props.mapOptions

      @setState {googleMap}

    render: ->
      div id: 'google-map',
        'Loading Google Map'