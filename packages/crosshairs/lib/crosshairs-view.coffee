{$, View} = require 'atom'

module.exports =
class CrosshairsView extends View
  @activate: ->
    atom.workspaceView.eachEditorView (v) ->
      v.underlayer.append(new CrosshairsView(v)) if v.attached and v.getPane()

  @content: ->
    @div class: 'crosshairs'

  initialize: (@editorView) ->
    @subscribe atom.config.observe 'editor.fontSize', => @updateCrosshairsWidth()
    @subscribe @editorView, 'editor:display-updated', => @updateCrosshairsPosition()

  appendNewCrosshair: ->
    @append View.render -> @div class: 'crosshair'

  getCrosshairs: (count) ->
    crosshairs = @find('.crosshair')
    # create more crosshairs if needed
    if crosshairs.length < count
      @appendNewCrosshair() for i in [1..(count - crosshairs.length)]
      crosshairs = @find('.crosshair')
    crosshairs

  updateCrosshairsWidth: ->
    @find('.crosshair').css('width', @editorView.charWidth)

  updateCrosshairsPosition: ->
    cursors = @editorView.getEditor().getCursors()
    crosshairs = @getCrosshairs(cursors.length).hide()
    for cursor, i in cursors
      crosshair = $ crosshairs[i]
      leftPosition = @editorView.pixelPositionForBufferPosition(cursor.getBufferPosition()).left
      crosshair.css('left', leftPosition).show()
    @updateCrosshairsWidth()
