ExpressionEvaluator = require '../expressions/expressionevaluator'

ModalManager = require './feedback/modalmanager'
Header = require './header'
Content = require './content'
Login = require './login'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getDefaultProps: ->
    serverLoaded: false
    sessionLoaded: false
    contentView: undefined

  render: ->
    console.debug "Rendering UI: \
      {serverLoaded: #{@props.serverLoaded}, \
      sessionLoaded: #{@props.sessionLoaded}}"

    modalManager =  ModalManager factory: @props.factory, pubSub: @props.factory.pubSub

    div id: 'ui', className: 'page-container',
      if @props.serverLoaded
        if @props.sessionLoaded
          [
            modalManager
            Header factory: @props.factory
            Content factory: @props.factory, contentView: @props.contentView
          ]
        else
          [
            modalManager
            Login factory: @props.factory
          ]
      else
        # TODO: what to display when not @serverLoaded?
        'Server not loaded'

module.exports = UI