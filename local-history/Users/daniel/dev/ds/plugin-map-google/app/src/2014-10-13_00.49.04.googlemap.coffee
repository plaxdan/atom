module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM


  loadScript = ->


  GoogleMap = React.createClass
    displayName: 'GoogleMap'

    componentWillMount: ->
      loadScript()

    componentDidMount: ->
      map = new google.maps.Map (document.getElementById 'google-map'), mapOptions
      @setState {map}

    render: ->
      div id: 'google-map'
