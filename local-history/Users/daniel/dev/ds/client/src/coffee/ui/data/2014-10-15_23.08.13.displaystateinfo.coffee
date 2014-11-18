NavigationActionStrip = require './navigationactionstrip'
BootstrapDropdown = require '../widgets/bootstrapdropdown'
BootstrapIcon = require '../widgets/bootstrapicon'
BreadCrumbs = require './breadcrumbs'

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

    if parentState
      parentTitle = parentState.selectedDescription or parentState.title()

    div className: 'display-state',
      div className: 'overflow-bar'
      BreadCrumbs {
        activeState
        parentState
        refreshQuery: @props.refreshQuery
      }
      # ul className: 'breadcrumbs nav nav-pills',
      #   if parentState
      #     li className: 'parent-state',
      #       a { onClick: _.bind @props.activateState, @, parentState },
      #         "#{parentTitle} /"
      #
      #   li className: 'active',
      #     a onClick: @props.refreshQuery, title: 'Refresh Display',
      #       strong {}, activeState.title()

      NavigationActionStrip
        isUpdating: @props.controller.updated?.then?
        commonActions: commonActions
        performCommand: @props.performCommand
        createRecord: @props.createRecord
        resetRecord: @props.resetRecord
        deleteRecord: @props.deleteRecord

module.exports = DisplayStateInfo
