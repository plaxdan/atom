ModalDialog = require './modaldialog'
BootstrapIcon = require '../widgets/bootstrapicon'

{ div, h5, strong, em, button } = React.DOM
{ div, h5, em } = React.DOM
{ classSet } = React.addons
a = require '../widgets/anchor'

OfflineSyncStatus = React.createClass
  displayName: 'OfflineSyncStatus'

  getInitialState: ->
    results: null
    steps: {}

  setResults: (json) ->
    # massage the JSON object from the server
    results = switch json.result.toLowerCase()
      when 'cancelled'
        title: 'Synchronization cancelled', severity: 'warning'
      when 'error'
        title: 'Synchronization failed', severity: 'error'
      else
        title: 'Synchronization complete!', severity: 'success'

    if @props.factory.modificationHandler.getModificationsWithErrors()?.length
      results.message = div null,
        'One or more changes could not be saved successfully during the sync.'
        React.DOM.button
          className: 'btn btn-danger'
          onClick: @_viewPostponedErrors
        ,'View Errors'
      results.severity = 'error'

    details = {}
    for temp, value of json.details
      [ m, id, prop ] = temp.match /([^:]+)\s*:\s*(.*)/
      id = @_clean id
      prop = @_clean prop
      if id.length is 1
        details[prop] or= {}
        details[prop].value = value
      else
        details[id] or= {}
        details[id].properties or= {}
        details[id].properties[prop] = value

    results.details = details

    @setState { results }

  addStatus: (item) ->
    steps = @_pendingState?.steps or @state?.steps
    return unless steps
    if item.Parent
      step = steps[item.Parent]
      step.children or= {}
      child = step.children[@_clean item.Description] or= {}
      for prop in [ 'Status', 'Step', 'Percent', 'Current', 'Total' ]
        child[prop.toLowerCase()] = @_clean item[prop]
    else if item.Description
      step = steps[item.Description] or= {}
      for prop in [ 'Status', 'Step', 'Percent', 'Current', 'Total' ]
        step[prop.toLowerCase()] = @_clean item[prop]

    @forceUpdate()

  render: ->
    complete = @state.results?

    buttons = if complete
      [
        label: 'OK', class: 'btn-primary', role: 'accept'
      ]
    else
      [
        { label: 'OK', class: 'btn-primary', disabled: true }
        { label: 'Cancel' }
      ]

    @transferPropsTo ModalDialog
      fullHeight: true
      title: 'Offline Synchronization'
      buttons: buttons
      validate: (results) =>
        if results.button is 'Cancel'
          @props.onCancel()
          false
    ,
      SyncResults @state.results if @state.results

      for key, item of @state.steps
        SyncItemDetails _.extend { key }, item

  _viewPostponedErrors: ->
    @props.removeModal @props.modalId
    _.defer =>
      @props.factory.pubSub.trigger 'displayModal', PostponedErrors
        factory: @props.factory

  _clean: (value) ->
    if _.isString value
      # strip localization hashmarks
      value.replace /#/g, ''
    else
      value

SyncResults = React.createClass
  displayName: 'SyncResults'

  render: ->
    div className: 'sync-progress',
      div className: "alert alert-#{@props.severity}",
        strong null, @props.title
        @props.message if @props.message
      div className: 'task-details alert alert-muted',
        for key, details of @props.details
          SyncResultDetails _.extend { key }, details

SyncResultDetails = React.createClass
  displayName: 'SyncResultDetails'

  getInitialState: ->
    open: false

  toggleOpen: ->
    @setState open: not @state.open

  render: ->
    hasProperties = not _.isEmpty @props.properties
    toggleIcon = if @state.open then 'icon-collapse-top' else 'icon-collapse'

    div
      className: classSet
        'sync-tree': true
        open: @state.open
    ,
      div className: 'status-item',
        if hasProperties
          a className: 'toggle-open pull-left', onClick: @toggleOpen,
            BootstrapIcon icon: toggleIcon, title: 'Toggle'
        h5 {},
          @props.key
          div className: 'complete pull-right', @props.value
      if hasProperties
        div className: 'child',
          for key, value of @props.properties
            div key: key, className: 'status-item',
              em {}, key
              div className: 'pull-right', value

SyncItemDetails = React.createClass
  displayName: 'SyncItemDetails'

  render: ->
    hasChildren = not _.isEmpty @props.children

    div className: 'sync-tree open',
      h5 {},
        @props.key
        " - #{@props.step}" if @props.step
        div className: 'complete pull-right',
          if @props.percent?
            "#{@props.percent}%"
          else
            "#{@props.current}/#{@props.total}"
      div className: 'progress',
        div className: 'bar', style: { width: "#{@props.percent}%" }

      if hasChildren
        div className: 'child',
          for key, child of @props.children
              div key: key, className: 'status-item',
                em {},
                  key
                  " - #{child.step}" if child.step
                if child.current?
                  if child.status is 'Complete'
                    div className: 'pull-right', "#{child.current}"
                  else
                    div className: 'pull-right', "#{child.current}/#{child.total}"
                if child.percent? and child.status isnt 'Complete'
                  div className: 'progress',
                    div className: 'bar', style: { width: "#{child.percent}%" }

module.exports = OfflineSyncStatus
