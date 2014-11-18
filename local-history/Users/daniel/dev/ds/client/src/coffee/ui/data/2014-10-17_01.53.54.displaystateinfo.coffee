NavigationActionStrip = require './navigationactionstrip'
BootstrapDropdown = require '../widgets/bootstrapdropdown'
BootstrapIcon = require '../widgets/bootstrapicon'
BreadCrumbs = require '../widgets/breadcrumbs'

{ div, ul, li, strong } = React.DOM
a = require '../widgets/anchor'

DisplayStateInfo = React.createClass
  displayName: 'DisplayStateInfo'

  propTypes:
    controller: React.PropTypes.object.isRequired
    activateState: React.PropTypes.func.isRequired
    performCommand: React.PropTypes.func.isRequired
    refreshQuery: React.PropTypes.func.isRequired
    createRecord: React.PropTypes.func
    resetRecord: React.PropTypes.func
    deleteRecord: React.PropTypes.func

  render: ->
    activeState = @props.controller.activeState()
    { commonActions } = activeState
    expanded = activeState.get 'expanded'
    parentState = @props.controller.parentState activeState

    breadCrumbProps =
      active:
        text: activeState.title()
        toolTip: 'Refresh Display'
        onClick: @props.refreshQuery

    if parentState
      parentTitle = parentState.selectedDescription or parentState.title()
      _.assign breadCrumbProps,
        parent:
          text: parentTitle
          toolTip: 'Back'
          onClick: _.bind activateState, @, parentState

    div className: 'display-state',
      div className: 'overflow-bar'
      BreadCrumbs breadCrumbProps

      NavigationActionStrip
        isUpdating: @props.controller.updated?.then?
        commonActions: commonActions
        performCommand: @props.performCommand
        createRecord: @props.createRecord
        resetRecord: @props.resetRecord
        deleteRecord: @props.deleteRecord

module.exports = DisplayStateInfo
