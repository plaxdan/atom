module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM

  GoogleMap = React.createClass
    displayName: 'GoogleMap'

    getInitialState: ->
      googleMap: null

    componentWillMount: ->
      script = document.createElement 'script'
      script.type = 'text/javascript'
      script.src = 'https://maps.googleapis.com/maps/api/js?\
        v=3.exp&\
        key=AIzaSyAbg48k9kNngiO4EMo23RaaOZpj0XIWY54'
      document.body.appendChild script

    render: ->
      div {},
        'This is a Google Map'
