module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM

  GoogleMap = React.createClass
    displayName: 'GoogleMap'

    getInitialState: ->
      googleMap: undefined

    componentWillMount: ->

    render: ->
      div {},
        'This is a Google Map'