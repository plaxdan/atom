module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM

  loadScript = ->
    script = document.createElement 'script'
    script.type = 'text/javascript'
    script.src = 'https://maps.googleapis.com/maps/api/js?\
      v=3.exp&\
      key=AIzaSyAbg48k9kNngiO4EMo23RaaOZpj0XIWY54'
    document.body.appendChild script

  GoogleMap = React.createClass
    displayName: 'GoogleMap'

    componentWillMount: ->
      loadScript()

    componentDidMount: ->
      mapOptions =
        center:
          lat: -34.397
          lng: 150.644
        zoom: 8
      map = new google.maps.Map (document.getElementById 'google-map'), mapOptions

    render: ->
      div id: 'google-map',
        'Loading Google Map...'
