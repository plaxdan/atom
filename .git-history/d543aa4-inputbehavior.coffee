# Input Behavior
#
# These classes define the behaviors associated with various input controls
BaseInputView = require '../input/baseinputview'
BinaryResourcePrompt = require '../../ui/binary/binaryresourceprompt'
ModalTextEditor = require '../../ui/feedback/modaltexteditor'
ModalHtmlEditor = require '../../ui/wysiwyg/modalhtmleditor'
BinaryResourceHandler = require '../../data/binaryresourcehandler'
DataTypeHelper = require '../../utils/datatypehelper'

class InputBehavior
  type: 'text'

  constructor: (@options) ->
    # allow options to extend base functions
    if options
      _.extend @, _.pick options, 'type', 'format', 'validate', 'attrs', 'list', 'actions'

  format: (value) -> value
  validate: (value) -> value

  attrs: null
  list: null
  actions: null

  # extends a behavior with additional settings and returs a composite result
  # rhs can be either an InputBehavior, where the returned result will be a
  # combination of both behaviors (with rhs taking precedence where
  # appropriate), or a simple object of additional settings to apply to the
  # behavior. this leaves the current behavior object unmodified
  extend: (rhs) ->
    # do nothing if this will have no effect
    return @ if rhs is @

    lhs = @
    merged = new InputBehavior

    # pass through the latter type
    merged.type = rhs.type or lhs.type

    merged.format = (value) ->
      value = lhs.format value
      if rhs.format? then (rhs.format value) else value

    # chain deferreds to validate the value
    merged.validate = (value, current) ->
      if rhs.validate?
        $.when(lhs.validate value, current).pipe (done) ->
          rhs.validate done, current
      else
        lhs.validate value, current

    # merge attributes
    merged.attrs = ->
      attrs = _.result lhs, 'attrs'
      if rhs.attrs?
        _.extend (attrs or {}), _.result rhs, 'attrs'
      else
        attrs

    # not sure how to merge a list selection if both behaviors define one
    merged.list = rhs.list or lhs.list

    # merge actions
    merged.actions = ->
      l = _.result lhs, 'actions'
      r = _.result rhs, 'actions'
      _.compact _.flatten [ l, r ]

    # return the extended behavior
    merged

  getEnabledActions: (binding) ->
    actions = _.result @, 'actions'
    return unless actions
    _.compact( for action in actions
      if not action.enabled? or action.enabled binding
        action
      else
        null
    )

  # common behaviors
  @DEFAULT = new InputBehavior
  @SECRET = new InputBehavior
    type: 'password'
  @READONLY = new InputBehavior
    attrs: { disableInput: true }
  @LONGTEXT = new InputBehavior
    type: 'longtext'
  @LONGTEXT_READONLY = new InputBehavior
    type: 'longtext'
    attrs: { disableInput: true }
  @HYPERLINKS = new InputBehavior
    type: 'hyperlinks'
  @LONGTEXT_HTML = new InputBehavior
    type: 'longtext'
    attrs: { textFormat: 'html' }

class FilteredInputBehavior extends InputBehavior

  constructor: (@filter, options) ->
    super options

  format: (value) ->
    if _.isArray value
      for item, index in value
        value[index] = @filter item
    else
      @filter value

  validate: (value) ->
    if _.isArray value
      for item, index in value
        value[index] = @filter item
    else
      @filter value

  # common behaviors
  @UPPERCASE = new FilteredInputBehavior ( (value) -> value?.toUpperCase() ),
    attrs:
      css:
        'text-transform': 'uppercase'
  @LOWERCASE = new FilteredInputBehavior ( (value) -> value?.toLowerCase() ),
    attrs:
      css:
        'text-transform': 'lowercase'

class MaxLengthInputBehavior extends FilteredInputBehavior

  constructor: (@maxLength, options) ->
    super @trim, options

  trim: (value) =>
      value?.substring 0, @maxLength

  attrs: ->
    maxLength: @maxLength

class NumericInputBehavior extends InputBehavior

  type: 'numeric'

  constructor: (@precision, options) ->
    super options

  attrs: ->
    precision: @precision

  format: (value) ->
    return '' unless value?
    num = if _.isNumber value then value else parseFloat value
    if _.isNaN num
      ''
    else
      num.toFixed @precision

  validate: (value) ->
    return null unless value? and value isnt ''

    promise = new $.Deferred

    try
      formatted = @format value
      value = parseFloat formatted
      if _.isNaN value
        promise.reject()
      else
        promise.resolve value
    catch error
      promise.reject error
      throw error

    promise.promise()

  # common behaviors
  @INTEGER = new NumericInputBehavior 0
  @PRECISION1 = new NumericInputBehavior 1
  @PRECISION2 = new NumericInputBehavior 2
  @PRECISION3 = new NumericInputBehavior 3
  @PRECISION4 = new NumericInputBehavior 4
  @PRECISION5 = new NumericInputBehavior 5
  @PRECISION6 = new NumericInputBehavior 6

class CheckboxInputBehavior extends InputBehavior

  type: 'checkbox'

  constructor: (@checkedValue, @uncheckedValue, options) ->
    super options

  attrs: ->
    { @checkedValue, @uncheckedValue }

  validate: (value) ->
    DataTypeHelper.coerceBoolean value

  # common behaviors
  @DEFAULT = new CheckboxInputBehavior 1, 0
  @BOOLEAN = new CheckboxInputBehavior true, false
  @YESNO = new CheckboxInputBehavior 'Y', 'N'

class DateTimeInputBehavior extends InputBehavior

  type: 'datetime'

  constructor: (options) ->
    super options

    {@key, @dateFormat, @timeFormat} = options

  format: (value) ->
    return null unless value? and value isnt ''

    # use validate to ensure the value is a date
    m = if @dateFormat
      moment @validate value
    else
      moment value

    full = DataTypeHelper.combineDateTimeFormats @dateFormat, @timeFormat
    m.format full

  validate: (value, current) ->
    # moment doesn't support parsing with localized formats (L/LT)
    date = DataTypeHelper.localizedDateTimeFormat @dateFormat
    time = DataTypeHelper.localizedDateTimeFormat @timeFormat
    full = DataTypeHelper.combineDateTimeFormats date, time
    DataTypeHelper.coerceDateTime value, { format: full, current }

  attrs: ->
    { @dateFormat, @timeFormat, @fullFormat }

  # common behaviors
  @DEFAULT = new DateTimeInputBehavior key: 'datetime', dateFormat: 'L', timeFormat: 'LT'
  @DATEONLY = new DateTimeInputBehavior key: 'date', dateFormat: 'L'
  @TIMEONLY = new DateTimeInputBehavior key: 'time', timeFormat: 'LT'

class ModalEditBehavior extends InputBehavior

  constructor: (actions, options) ->
    super options

    @_actions = []
    if _.isArray actions
      @registerAction a for a in actions
    else if actions?
      @registerAction actions

  registerAction: (action) ->
    @_actions.push action

  actions: ->
    @_actions

class ModalTextEditBehavior extends ModalEditBehavior

  constructor: (options) ->
    super null, options

    @registerAction
      icon: 'icon-edit'
      key: 'edit'
      title: 'Edit Text'
      callback: @editText

  editText: (binding, options) ->
    current = binding.get()

    bindingAttrs = _.result binding, 'attrs'
    enabled = (not bindingAttrs?.enabled?) or bindingAttrs.enabled

    thisAttrs = _.result @, 'attrs'

    editor = if thisAttrs?.textFormat is 'html'
      ModalHtmlEditor
    else
      ModalTextEditor
    options.factory.pubSub.trigger 'displayModal', editor
      readOnly: not enabled
      value: current
      fieldId: BaseInputView.renderFieldId binding.key
      textFormat: thisAttrs?.textFormat
      validate: (results) ->
        if results.role is 'accept'
          binding.set results.value

  # common behaviors
  @DEFAULT = new ModalTextEditBehavior

class ModalBinaryResourceBehavior extends ModalEditBehavior

  type: 'binary'

  constructor: (options) ->
    super null, options

    @registerAction
      icon: 'icon-picture'
      key: 'view'
      title: 'View Resource'
      enabled: @_canView
      callback: @viewBinary
    @registerAction
      icon: 'icon-cloud-upload'
      key: 'upload'
      title: 'Upload File'
      enabled: @_canUpload
      callback: @uploadFile
    @registerAction
      icon: 'icon-camera'
      key: 'camera'
      title: 'Camera Capture'
      enabled: @_canCamera
      callback: @cameraCapture

  format: (value) ->
    DataTypeHelper.formatBinaryInfo value, humanize: true

  # don't allow input for field to be edited directly
  attrs: { disableInput: true }

  viewBinary: (binding, options) ->
    { pubSub, binaryResources } = options.factory

    formatted = binding.get()
    return unless formatted

    pubSub.trigger 'showWait'
    resource = binaryResources.lookup formatted
    (binaryResources.loadData resource).done (data) ->
      pubSub.trigger 'hideWait'
      pubSub.trigger 'displayModal',
        BinaryResourcePrompt binaryData: data

  uploadFile: (binding, options) ->
    { binaryResources } = options.factory
    (binaryResources.uploadFile options).done (resource) ->
      binding.set resource,
        attributes:
          'DS_LAST_PROMPT_FILE_NAME': resource.get 'fileName'
      options.promise?.resolve resource

  cameraCapture: (binding, options) ->
    { binaryResources } = options.factory
    (binaryResources.cameraCapture options).done (resource) ->
      binding.set resource
      options.promise?.resolve resource

  _canView: (binding) ->
    !!binding.get()

  _canUpload: (binding) ->
    attrs = _.result binding, 'attrs'
    # just display the camera action on devices, that is the primary source for
    # binary data
    ios = navigator.userAgent.match /i(Pod|Phone|Pad)/i
    android = navigator.userAgent.match /Android/i
    attrs.enabled and not (ios or android)

  _canCamera: (binding) ->
    attrs = _.result binding, 'attrs'
    attrs.enabled and BinaryResourceHandler.hasCamera

  # common behaviors
  @DEFAULT = new ModalBinaryResourceBehavior

module.exports = {
  InputBehavior
  FilteredInputBehavior
  MaxLengthInputBehavior
  NumericInputBehavior
  CheckboxInputBehavior
  DateTimeInputBehavior
  ModalEditBehavior
  ModalTextEditBehavior
  ModalBinaryResourceBehavior
}
