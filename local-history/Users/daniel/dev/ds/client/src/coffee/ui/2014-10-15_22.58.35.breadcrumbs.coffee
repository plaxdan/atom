{ul, li, a, strong} = React.DOM

BreadCrumbs = React.createClass

  render:
    if @props.parentState
      parentTitle = parentState.selectedDescription or parentState.title()
    ul className: 'breadcrumbs nav nav-pills',
        if parentState
          li className: 'parent-state',
            a { onClick: _.bind @props.activateState, @, parentState },
              "#{parentTitle} /"

        li className: 'active',
          a onClick: @props.refreshQuery, title: 'Refresh Display',
            strong {}, activeState.title()

module.exports = BreadCrumbs
