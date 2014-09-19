BaseInputView = require './baseinputview'
ExpressionEvaluator = require '../../expressions/expressionevaluator'
DropdownInput = require '../../ui/widgets/dropdowninput'

class DropdownInputView extends BaseInputView
  tagName: 'div'

  get: -> @_value

  set: (value) ->
    @_value = value
    @_rerender()

  enable: ->
    @_disabled = false
    @_rerender()

  disable: ->
    @_disabled = true
    @_rerender()

  defaultEl: ->
    @$el.find 'input'

  toModel: ->
    # bing - React complains about accessing methods on component instances,
    # but we don't have a better way to deal with pending modifications yet
    (Promise.resolve @_input.finishEdit()).then =>
      super
      @_rerender()

  render: ->
    @_input = DropdownInput
      value: @_value
      list: _.bind @_generateList, @
      restrictValueToList: @behavior.restrictToList
      disabled: @_disabled
      blockLevel: @options.blockLevel
      fixedPosition: @options.fixedPosition
      onChange: _.bind @_onChange, @
    React.renderComponent @_input, @el
    @focus()
    @

  gc: ->
    React.unmountComponentAtNode @el

  _rerender: ->
    refocus = @el.contains document.activeElement
    @gc()
    @render()

    @focus() if refocus

  _generateList: ->
    if _.isFunction @behavior.list
      @behavior.list @binding
    else if (@behavior.list.length is 1) and
        ExpressionEvaluator.isExpression @behavior.list[0]
      context = _.result @binding, 'context'
      ExpressionEvaluator.evaluate @behavior.list[0], { context }
    else
      @behavior.list

  _onChange: (value) ->
    @_value = value
    @toModel()

module.exports = DropdownInputView
