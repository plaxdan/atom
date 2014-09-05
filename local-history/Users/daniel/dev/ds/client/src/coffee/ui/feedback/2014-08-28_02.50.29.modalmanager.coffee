ModalDialog = require './modaldialog'
UserPrompt = require './userprompt'
ErrorDialog = require '../errors/errordialog'

{ div, h1 } = React.DOM

ModalManager = React.createClass
  displayName: 'ModalManager'

  getDefaultProps: ->
    baseZIndex: 1050

  getInitialState: ->
    waitCount: 0
    stack: []
    spinner: null

  globalEvents: [
    'showWait'
    'hideWait'
    'displayModal'
    'displayPrompt'
    'displayError'
  ]

  showWait: (options) ->
    unless @state.waitCount
      modalId = _.uniqueId 'modal'
      spinner = ProgressSpinner { modalId }
      stack = (_.clone @state.stack).concat [ spinner ]
      @setState { waitCount: 1, stack, spinner }
    else
      @setState waitCount: @state.waitCount + 1

  hideWait: (options) ->
    if @state.waitCount <= 1
      @setState
        waitCount: 0
        stack: _.without @state.stack, @state.spinner
        spinner: null
    else
      @setState waitCount: @state.waitCount - 1

  displayModal: (options) ->
    modalId = _.uniqueId 'modal'

    # can either receive a modal component or options for creating one
    modal = if React.isValidComponent options
      # bing - this seems evil to directly mutate the props here, but
      # setProps is not allowed before the component is mounted
      options.props.removeModal = @removeModal
      options.props.modalId = modalId
      options
    else
      ModalDialog _.extend { @removeModal, modalId }, options
    stack = (_.clone @state.stack).concat [ modal ]
    @setState { stack }

  displayPrompt: (options) ->
    @displayModal UserPrompt options

  displayError: (error) ->
    @displayModal ErrorDialog { error }

  removeModal: (key) ->
    # depending on _pendingState seems undesirable
    currentStack = @_pendingState?.stack or @state.stack
    @setState stack: _.filter currentStack, (test) ->
      # key is either a modal reference or unique id
      test isnt key and test.props.modalId isnt key

  componentWillMount: ->
    # bind to global pubSub events
    for ev in @globalEvents
      bound = _.bind @[ev], @
      @['_bound_' + ev] = bound
      @props.pubSub.on ev, _.bind @[ev], bound

  componentDidUpdate: ->
    if @state.stack.length
      ($ 'body').addClass 'modal-open'
    else
      ($ 'body').removeClass 'modal-open'

  componentWillUnmount: ->
    # unbind to global pubSub events
    for ev in @globalEvents
      @props.pubSub.off ev, @['_bound_' + ev]

  render: ->
    zIndex = @props.baseZIndex
    div className: 'modal-container',
      if @state.stack.length
        ModalBackdrop
          key: 'backdrop'
          # put the backdrop under the last modal
          zIndex: zIndex + (10 * @state.stack.length) - 1

      for modal, index in @state.stack
        zIndex += 10
        div
          key: modal.props.modalId
          className: 'modal-scrollable'
          style: { zIndex }
        ,
          modal.props.topModal = index is @state.stack.length - 1
          modal

ModalBackdrop = React.createClass
  displayName: 'ModalBackdrop'

  render: ->
    div
      className: 'modal-backdrop fade in'
      style: { zIndex: @props.zIndex }

ProgressSpinner = React.createClass
  displayName: 'ProgressSpinner'

  getDefaultProps: ->
    progress: 100

  render: ->
    {message} = @props
    div
      className: 'loading-spinner fade in'
      style: { width: '200px', marginLeft: '-100px' }
    ,
      div className: 'progress progress-striped active',
        div className: 'bar', style: { width: "#{@props.progress}%" }

module.exports = ModalManager
