BootstrapIcon = require '../widgets/bootstrapicon'

cx = require 'classnames'
{ div, ul, li, a } = React.DOM

ModalDialog = React.createClass
  displayName: 'ModalDialog'

  propTypes:
    className: React.PropTypes.string
    title: React.PropTypes.oneOfType [
      React.PropTypes.string
      React.PropTypes.component
    ]
    body: React.PropTypes.renderable
    buttons: React.PropTypes.array
    seamless: React.PropTypes.bool
    middle: React.PropTypes.bool
    fullWidth: React.PropTypes.bool
    fullHeight: React.PropTypes.bool
    topModal: React.PropTypes.bool
    wantsReturn: React.PropTypes.bool
    inhibitCloseButton: React.PropTypes.bool
    legacyView: React.PropTypes.object
    validate: React.PropTypes.func

  getInitialState: ->
    alert: null

  dismissAlert: ->
    @setState alert: null

  componentDidMount: ->
    @_appendView @props.legacyView if @props.legacyView
    window.addEventListener 'keyup', @_onKeyUp

    @_acquireFocus() if @props.topModal

  componentWillUnmount: ->
    @_detachView @props.legacyView if @props.legacyView
    window.removeEventListener 'keyup', @_onKeyUp

  _appendView: (legacyView) ->
    legacyView?.render().$el.appendTo @getDOMNode()

  _detachView: (legacyView) ->
    legacyView?.gc()

  render: ->
    body = (_.result @props, 'body') or @props.children

    showClose = not @props.inhibitCloseButton and not @props.buttons?.length

    div
      className: cx 'modal fade in', @props.className,
        # vertically center prompts if specified, or body is just text
        middle: if @props.middle? then @props.middle else _.isString body
        'full-width': @props.fullWidth
        'full-height': @props.fullHeight
        footer: @props.buttons?.length > 0
    ,
      if @props.title or showClose
        div className: 'modal-header',
          ModalTitle
            title: @props.title
            showClose: showClose
            cancelModal: @cancelModal

      div className: (cx 'modal-body', seamless: @props.seamless),
        if @state.alert
          div className: "alert alert-#{@state.alert.severity or 'info'}",
            React.DOM.button
              type: 'button'
              className: 'close'
              onClick: @dismissAlert
            , String.fromCharCode 215 # &times;
            @state.alert.message

        body

      if @props.buttons?.length
        div className: 'modal-footer',
          ModalButtons
            buttons: @props.buttons
            acceptModal: @acceptModal

  acceptModal: (results) ->
    if results?.button
      results.role = @_getButtonRole results.button

    # allow validate to return a promise that accepts/rejects the modal
    Promise.resolve @props.validate? results
      .then (validated) =>
        # also allow validate to prevent the modal from closing by returning
        # an explicit false
        @props.removeModal @props.modalId unless validated is false
      , (error) =>
        if error
          @setState
            alert:
              message: error
              severity: 'error'

  cancelModal: ->
    @acceptModal role: 'cancel'

  _getButtonRole: (label) ->
    (_.find @props.buttons, (test) -> test?.label is label)?.role

  _onKeyUp: (ev) ->
    return unless @props.topModal

    if ev.which is 27
      @acceptModal role: 'cancel'
    else if ev.keyIdentifier is 'Enter' and not @props.wantsReturn
      @acceptModal role: 'accept'

  _acquireFocus: ->
    node = @getDOMNode()
    # find the first input or button and focus it
    focus = node.querySelector 'input, textarea, .btn'
    focus?.focus()

ModalTitle = React.createClass
  displayName: 'ModalTitle'

  render: ->
    title = _.result @props, 'title'

    div className: 'navbar navbar-inverse',
      div className: 'navbar-inner',
        if _.isString title
          ul className: 'nav nav-pills',
            li {},
              a className: 'info', title
        else
          title

        if @props.showClose
          ul className: 'nav nav-pills pull-right',
            li {},
              a onClick: @props.cancelModal,
                BootstrapIcon icon: 'icon-remove', title: 'Close'

ModalButtons = React.createClass
  displayName: 'ModalButtons'

  render: ->
    div className: 'btn-group',
      for button, index in @props.buttons
        continue if _.isEmpty button

        # button can be either a plain string or an object with additional
        # settings
        tag = React.DOM[ button.tag or 'button' ]
        classes = 'btn'
        classes += ' disabled' if button.disabled
        classes += " #{button.class}" if button.class
        label = button.label or button

        onClick = unless button.disabled
          _.bind @props.acceptModal, @, button: label

        tag
          key: label
          className: classes
          role: button.role
          onClick: onClick
        ,
          if button.icon
            BootstrapIcon
              icon: button:icon
              label: label
              rightIcon: button.rightIcon
          else
            label

module.exports = ModalDialog
