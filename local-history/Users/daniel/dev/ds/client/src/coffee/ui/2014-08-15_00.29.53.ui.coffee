ModalManager = require './feedback/modalmanager'
Login = require './login'
Header = require './header'
Content = require './content'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getInitialState: ->
    hasServer: false
    hasSession: false

  componentWillMount: ->
    @props.factory.pubSub.on 'sessionError','sessionError', _.bind @_onSessionError, @
    @props.factory.pubSub.on 'sessionLoaded','sessionLoaded', _.bind @_onSessionLoaded, @

    @props.factory.pubSub.on 'serverError', _.bind @_onServerError, @
    @props.factory.pubSub.on 'serverLoaded', _.bind @_onServerLoaded, @

  render: ->
    div id: 'ui', className: 'page-container',
      ModalManager factory: @props.factory, pubSub: @props.factory.pubSub

      if @state.hasSession and @state.hasServer
        console.debug 'SESSION AND SERVER'
        Header factory: @props.factory
        Content factory: @props.factory
      else if @state.hasServer and not @state.hasSession
        console.debug 'SERVER, NO SESSION'
        Login factory: @props.factory

  _onSessionLoaded: ->
    console.debug 'UI: onSessionLoaded'
    @setState hasSession: true

  _onSessionError: ->
    console.debug 'UI: onSessionError'
    @setState hasSession: false

  _onServerLoaded: ->
    console.debug 'UI: serverLoaded'
    @setState hasServer: true

  _onServerError: ->
    console.debug 'UI: serverError'
    @setState hasServer: false

module.exports = UI
