ModalManager = require './feedback/modalmanager'
Login = require './login'
Header = require './header'
Content = require './content'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getDefaultProps:
    hasServer: false
    hasSession: false

  componentWillMount: ->

    @props.factory.pubSub.on 'serverError', _.bind @_onServerError, @
    @props.factory.pubSub.on 'serverLoaded', _.bind @_onServerLoaded, @

  render: ->
    div id: 'ui', className: 'page-container',
      ModalManager factory: @props.factory, pubSub: @props.factory.pubSub

      if @props.hasSession and @props.hasServer
        console.debug 'SESSION AND SERVER'
        Header factory: @props.factory
        Content factory: @props.factory
      else if @props.hasServer and not @props.hasSession
        console.debug 'SERVER, NO SESSION'
        Login factory: @props.factory

  _onServerLoaded: ->
    console.debug 'UI: serverLoaded'
    @setState hasServer: true

  _onServerError: ->
    console.debug 'UI: serverError'
    @setState hasServer: false


module.exports = UI
