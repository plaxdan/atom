BaseView = require './common/baseview'
MessageCenterView = require './session/messagecenter'
SessionMenuView = require './session/sessionmenu'
ExpressionEvaluator = require '../expressions/expressionevaluator'
OtherKup = require '../utils/otherkup'

class CoreApplicationView extends BaseView
  tagName: 'div'
  id: 'application'
  className: 'page-container'

  globalEvents:
    'currentView': 'currentView'
    'replaceView': 'replaceView'
    'sessionLoaded': 'sessionLoaded'

  objectEvents:
    'change:textSize settings': 'setPersistedTextSize'

  initialize: (options) ->
    super

    {@settings} = options

    @view = null

    # set the base text size if needed
    @setPersistedTextSize()

  currentView: (callback) ->
    callback @view

  replaceView: (newView) ->
    @gc()

    # reset document title - child view can override this if needed
    document.title = 'DataSplice'

    return unless newView

    @view = newView
    @$('#viewContainer').html newView.render().el

    if @options.session.isEmpty()
      @sessionMenu.$el.hide()
    else
      @sessionMenu.$el.show()

    # this helps hide the address bar on mobile operating systems, which
    # saves some screen real-estate
    window.scrollTo 0, 1

  sessionLoaded: ->
    # allow text size attribute to control default
    unless @settings.get 'textSize'
      context = @options.eventFactory.context()
      $.when(ExpressionEvaluator.evaluateAttribute 'DS_TEXT_SIZE', null, { context })
        .done (size) =>
          @settings.set 'textSize', size

  setPersistedTextSize: ->
    body = $ 'body'
    for temp in [ 'small', 'normal', 'large', 'xlarge' ]
      body.removeClass 'base-size-' + temp

    size = @settings.get 'textSize'
    body.addClass 'base-size-' + size if size

  gc: ->
    if @view
      @view.undelegateEvents()
      if @view.gc?
        @view.gc()
      else
        @view.remove()
      @view = null

  render: ->
    ok = new OtherKup @

    ok.div id: 'viewContainer'

    @

module.exports = CoreApplicationView
