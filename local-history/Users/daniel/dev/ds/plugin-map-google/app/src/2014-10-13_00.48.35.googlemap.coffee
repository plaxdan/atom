module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM

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

  loadScript = ->
    script = document.createElement 'script'
    script.type = 'text/javascript'
    script.src = 'https://maps.googleapis.com/maps/api/js?\
      v=3.exp&\
      callback=renderGoogleMap&\
      key=AIzaSyAbg48k9kNngiO4EMo23RaaOZpj0XIWY54'
    document.body.appendChild script

  GoogleMap = React.createClass
    displayName: 'GoogleMap'

    componentWillMount: ->
      loadScript()

    # componentDidMount: ->
    #   _waitFor 'google.maps', @_renderMap

    render: ->
      div id: 'google-map'
