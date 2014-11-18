module.exports = (dsApp) ->

  {React} = dsApp.shared
  {div} = React.DOM

  LeafletMap = React.createClass
    displayName: 'LeafletMap'
