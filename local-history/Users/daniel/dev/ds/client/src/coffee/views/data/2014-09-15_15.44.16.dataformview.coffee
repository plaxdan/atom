# Data Form View
#
# Displays data in the current ViewDisplayState in a form that shows one
# record at a time.
BaseFormView = require '../common/baseform'

class DataFormView extends BaseFormView
  className: 'data-form form-horizontal'

  events:
    'focus input': 'focusChanged'
    'blur input': 'focusChanged'
    'change .html-editor': 'contentEditableChanged'
    'blur span[contenteditable]': 'contentEditableChanged'

  objectEvents:
    'change:selectedField state': 'selectedFieldChanged'
    'change:selection state': 'bindSelectedRecord'
    'modified:selected state': 'bindSelectedRecord'
    'field:select controller': 'selectField'
    'field:edit controller': 'editField'

  displayMode: 'record'

  initialize: (options) ->
    super options
    {@controller} = options
    @state = options.state or @controller.activeState()

    view = @state.get 'view'
    selected = @state.selectedRecord()
    context = @controller.eventContext { @state }
    cm = @options.configurationManager

    displayMode = if @options.homeScreen then 'home' else @displayMode
    $.when(@controller.getVisibleFields { @state, displayMode })
      .done (visible) =>
        async.eachSeries visible,
          (name, done) =>
            field = view.getField name
            inputOptions =
              binding: @controller.createRecordBinding name, { @state }
              view: view
              record: selected
              # the record display cache will have the style cached, but we need to 
              # pass it in if nothing is selected. bing - this needs to evaluate
              # expressions
              validationStyle: field.validationStyle unless selected
            $.when(@inputFactory.createFieldInput field, inputOptions)
              .done (input) =>
                @registerField name, input
                done()

  focusChanged: ->
    field = @focusedField()
    @state.set 'selectedField', field?.input.binding.key

  contentEditableChanged: (ev) ->
    target = $ ev.target
    test = @lookupField target
    test.toModel() if test

  selectedFieldChanged: ->
    fieldName = @state.get 'selectedField'
    (@getEditor fieldName)?.focus()

  bindSelectedRecord: ->
    @current = @state.selectedRecord()

    cache = if @current?
      # have the configuration manager update the display cache if needed
      context = @controller.eventContext { @state }
      cm = @options.configurationManager
      cache = cm.updateRecordDisplayCache @current, { context }
    else
      true

    $.when(cache).done =>
      @syncModelToForm()

      # apply custom record background color to handle if needed
      bg = @current?.displayCache.textStyle?['bg'] or 'transparent'
      (@$ '.form-horizontal').css 'border-color', bg

  selectField: (field) ->
    (@getEditor field)?.focus()

  editField: (field, action) ->
    editor = @getEditor field
    return unless editor

    actions = editor.behavior.actions()
    if actions?.length
      if action
        editAction = _.find actions, (test) -> test.key is action
      editAction or= actions[0]
      options =
        input: editor
        factory: @options.factory
      editAction.callback.call editor.behavior, editor.binding, options
    else
      editor.focus()

module.exports = DataFormView

