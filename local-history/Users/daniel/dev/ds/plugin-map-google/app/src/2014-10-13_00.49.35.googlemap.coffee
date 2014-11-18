module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM


  loadScript = ->


  GoogleMap = React.createClass
    displayName: 'GoogleMap'

    componentWillMount: ->
      loadScript()

    componentDidMount: ->
      googleMap = new google.maps.Map (document.getElementById 'google-map'), @props.mapOptions
      @setState {googleMap}

    render: ->
      div id: 'google-map'
