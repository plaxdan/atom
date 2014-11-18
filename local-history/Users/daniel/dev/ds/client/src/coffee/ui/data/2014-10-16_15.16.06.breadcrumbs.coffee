{ul, li, a, strong} = React.DOM

BreadCrumbs = React.createClass
  displayName: 'BreadCrumbs'

  propTypes:
    activeState: React.PropTypes.object.isRequired
    parentState: React.PropTypes.object.isRequired
    refreshQuery: React.PropTypes.func.isRequired

  render: ->
    { activeState, parentState, refreshQuery } = @props

    ul className: 'breadcrumbs nav nav-pills',
      if parentState?
        parentTitle = parentState.selectedDescription or parentState.title()
        li className: 'parent-state',
          a { onClick: _.bind activateState, @, parentState },
            "#{parentTitle} /"

      li className: 'active',
        a onClick: refreshQuery, title: 'Refresh Display',
          strong {}, activeState.title()

module.exports = BreadCrumbs
