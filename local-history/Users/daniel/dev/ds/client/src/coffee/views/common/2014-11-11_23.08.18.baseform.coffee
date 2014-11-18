Backbone = require 'backbone'
BaseView = require './baseview'
InputControlFactory = require './inputcontrolfactory'
OtherKup = require '../../utils/otherkup'

class BaseFormView extends BaseView
  tagName: 'form'
  className: 'form-horizontal'

  initialize: (options) ->
    super
    @model = options.model or new Backbone.Model

    @_fields = []

    { @inputFactory } = @options.factory

  # creates a binding object to get/set data from the underlying model
  # the default is to just get/set the matching attribute in the current model
  # derived classes should override this if a different underlying
  # representation is used
  createBinding: (key) ->
    model = @model
    binding =
      key: key
      get: -> model.get key
      set: (value) -> model.set key, value

  createLabel: (label, options) ->
    @_fields.push new FormLabelView { label }

  createReadonly: (label, value) ->
    @_fields.push new ReadonlyFieldView { label, value }

  # register an input field within the form. the input can be any control
  # created by the InputControlFactory, or options specified to create a new
  # input
  registerField: (label, options) ->
    # inflate options into input view if needed
    if options instanceof BaseView
      input = options
    else
      if not options.title? and label? then options.title = label
      input = @inputFactory.createInput options

    # have form input elements fill available space
    input.options.blockLevel = true

    field = @registerChildView new @options.factory.create FormFieldView,
      { label, input, @model, parent: @ }
    @_fields.push field
    field

  # find a field in the form with the matching binding key
  getField: (key) ->
    _.find @_fields, (test) ->
      (test.input?.binding.key is key) or (test.input?.fieldId is key)

  # returns the input view used as the editor for a field
  getEditor: (key) ->
    (@getField key)?.input

  # reverse lookup a field view based on the associated input element
  lookupField: (el) ->
    el = $ el
    _.find @_fields, (test) ->
      # see if the target element is a descendent of this field
      el.closest(test.$el).length > 0

  # return the field view that contains focus
  focusedField: ->
    focusedField = if document.activeElement
      @lookupField document.activeElement
    console.debug "And the focused field IS! #{focusedField.input.binding.key}"
    focusedField

  render: ->
    ok = new OtherKup @

    # forms are always handled in script, so prevent submit from posting any
    # data
    @$el.attr 'action', 'javascript: void(0)'

    if @options.title
      ok.div class: 'legend-pad', =>
        ok.legend @options.title

    for field in @_fields
      ok.append field.render()

    if @buttons
      buttons = _.result @, 'buttons'

      ok.div class: 'form-actions', ->
        for button in buttons
          label = button.label or button
          if button.class
            classes = 'btn ' + button.class
          else
            classes = 'btn'
          ok.button class: classes, label

          # this keeps the buttons from stacking up
          ok.append ' '

    @$el.addClass 'striped' if @options.striped

    @

  syncModelToForm: ->
    # delegate to individual fields
    field.syncModelToForm() for field in @_fields

  # some unit tests depend on this being here, should probably move it
  renderFieldId: (key) -> InputControlFactory.renderFieldId key

  # clear out the fields so they can change dynamically in render
  clearAllFields: ->
    @_fields = []

# A generic label view for a form field. Nothing special.
class FormLabelView extends BaseView
  className: 'control-group'

  render: ->
    ok = new OtherKup @
    ok.span @options.label
    @

# Displays a label and value in a readonly input
class ReadonlyFieldView extends BaseView
  className: 'control-group'

  render: ->
    ok = new OtherKup @
    ok.label { class: 'control-label' }, @options.label
    ok.div class: 'controls', =>
      if _.isFunction @options.value
        @options.value ok
      else
        ok.span { class: 'input-block-level uneditable-input' }, @options.value

    @

# A base form field view which all other fields extend.
class FormFieldView extends BaseView
  className: 'control-group'

  initialize: (options) ->
    super

    { @input, @parent } = options
    @registerChildView @input

    # update field map so syncing to/from model happens automatically
    if @input.binding
      @fieldMap = {}
      @fieldMap['#' + @input.fieldId] =
        field: @input.binding.key
        toForm: 'toForm'
        toModel: 'toModel'

  toForm: -> @input.toForm()
  toModel: -> @input.toModel()

  render: ->
    ok = new OtherKup @

    if @options.label
      ok.label
        class: 'control-label' + if @input.options?.leftAlignLabel then ' left-align' else ''
        for: @input.fieldId
      , =>
        if _.isFunction @options.label
          @options.label ok
        else
          ok.append @options.label
      ok.div class: 'controls', =>
        ok.append @input
    else
      ok.append @input

    @syncModelToForm()
    @

  syncFormToModel: ->
    super

    @parent.trigger 'sync', @input.binding.key

module.exports = BaseFormView
