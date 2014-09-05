ExpressionEvaluator = require '../expressions/expressionevaluator'

ModalManager = require './feedback/modalmanager'
Header = require './header'
Content = require './content'

{div} = React.DOM

UI = React.createClass
  displayName: 'UI'

  getInitialState: ->
    showHeader: false

  componentWillMount: ->
    @props.factory.pubSub.on 'sessionError', _.bind @_onSessionError, @
    @props.factory.pubSub.on 'sessionLoaded', _.bind @_onSessionLoaded, @


    body = (document.getElementsByTagName 'body')[0]
    for temp in [ 'small', 'normal', 'large', 'xlarge' ]
      body.removeClass 'base-size-' + temp

    size = @props.factory.settings.get 'textSize'
    body.addClass 'base-size-' + size if size

  render: ->
    div id: 'ui', className: 'page-container',
      ModalManager factory: @props.factory, pubSub: @props.factory.pubSub
      Header factory: @props.factory if @state.showHeader
      Content factory: @props.factory

      # TODO: render login screen if logged, in - above if not

  _onSessionLoaded: ->
    console.debug 'UI: onSessionLoaded'
    @setState showHeader: true

    unless @props.factory.settings.get 'textSize'
      context = @options.eventFactory.context()
      $.when(ExpressionEvaluator.evaluateAttribute 'DS_TEXT_SIZE', null, { context })
        .done (size) =>
          @props.factory.settings.set 'textSize', size

  # Note: the logOut event is only raised when the user *intends* to log out
  #   the "Are you sure?" prompt is displayed on logOut. When the user actually
  #   succeeds in logging out then the sessionError event is raised.
  _onSessionError: ->
    console.debug 'UI: sessionError'
    @setState showHeader: false

module.exports = UI
