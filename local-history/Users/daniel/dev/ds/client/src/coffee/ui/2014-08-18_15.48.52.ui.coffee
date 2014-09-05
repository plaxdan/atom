ExpressionEvaluator = require '../expressions/expressionevaluator'

ModalManager = require './feedback/modalmanager'
Header = require './header'
Content = require './content'
Login = require './login'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getDefaultProps: ->
    requiresLogin: true
    contentView: undefined

  componentWillMount: ->
    @_setPersistedTextSize()
  #   @props.factory.pubSub.on 'serverError', _.bind @_onServerError, @
  #   @props.factory.pubSub.on 'serverLoaded', _.bind @_onServerLoaded, @
  #   @props.factory.pubSub.on 'sessionError', _.bind @_onSessionError, @
    @props.factory.pubSub.on 'sessionLoaded', _.bind @_onSessionLoaded, @
  #
  # componentWillUnmount: ->
  #   @props.factory.pubSub.off 'serverError'
  #   @props.factory.pubSub.off 'serverLoaded'
  #   @props.factory.pubSub.off 'sessionError'
    @props.factory.pubSub.off 'sessionLoaded'

  render: ->
    console.info "Rendering UI"
    app = [
      Header factory: @props.factory
      Content factory: @props.factory, contentView: @props.contentView
    ]

    div id: 'ui', className: 'page-container',
      ModalManager factory: @props.factory, pubSub: @props.factory.pubSub
      if @props.requiresLogin
        Login factory: @props.factory
      else
        app

  _setPersistedTextSize: ->
    body = (document.getElementsByTagName 'body')[0]
    bodyClasses = body.className
    for size in [ 'small', 'normal', 'large', 'xlarge' ]
      bodyClasses = bodyClasses.replace "base-size-#{size}", ''

    size = @props.factory.settings.get 'textSize'
    bodyClasses = "#{bodyClasses} base-size-#{size}" if size
    body.className = bodyClasses

  # _onServerLoaded: ->
  #   console.debug 'UI: onServerLoaded'
  #   @setState serverLoaded: true
  #
  # _onServerError: ->
  #   console.debug 'UI: onServerError'
  #   @setState serverLoaded: false

  _onSessionLoaded: ->
    console.debug 'UI: onSessionLoaded'
    @setState sessionLoaded: true

    unless @props.factory.settings.get 'textSize'
      context = @props.factory.eventFactory.context()
      $.when(ExpressionEvaluator.evaluateAttribute 'DS_TEXT_SIZE', null, { context })
        .done (size) =>
          @props.factory.settings.set 'textSize', size

  # Note: the logOut event is only raised when the user *intends* to log out
  #   the "Are you sure?" prompt is displayed on logOut. When the user actually
  #   succeeds in logging out then the sessionError event is raised.
  _onSessionError: ->
    console.debug 'UI: onSessionError'
    @setState sessionLoaded: false

module.exports = UI
