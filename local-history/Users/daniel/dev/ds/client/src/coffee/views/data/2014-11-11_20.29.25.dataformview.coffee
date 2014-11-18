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

    cache = if selected?
      cm.updateRecordDisplayCache selected, { context }
    else
      true

    Promise.resolve cache
      .then =>
        @controller.getVisibleFields { @state, displayMode }
      .then (visible) =>
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

            Promise.resolve @inputFactory.createFieldInput field, inputOptions
              .then (input) =>
                @registerField name, input
                done()
              .catch (error) ->
                # ignore individual field errors so the form is rendered
                console.error error
                done()
          # async done
          , =>
            @render()
      .catch (error) ->
        # ignore individual field errors so the form is rendered
        console.error error

  focusChanged: ->
    console.debug 'DataFormView.focusChanged' if TRACE
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
      cm.updateRecordDisplayCache @current, { context }
    else
      true

    (Promise.resolve cache).done =>
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
