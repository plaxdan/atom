module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM

  # wait for scripts to load by detecting the global object they export -
  # this is pretty hacky, but it's tough to detect when scripts have
  # finished loading
  _waitFor = (property, callback) ->
    wait = 0
    check = ->
      if wait > 5000
        callback()
      else if window[property]?
        callback window[property]
      else
        wait += 100
        _.delay check, 100
    check()

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
      _waitFor 'google.maps', @_renderMap

    render: ->
      div id: 'google-map'

    _renderMap: ->
      mapOptions =
        zoom: 8
        center:
          lat: -34.397
          lng: 150.644
      map = new google.maps.Map (document.getElementById 'google-map'), mapOptions
