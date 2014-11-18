{ul, li, a, strong} = React.DOM

BreadCrumbs = React.createClass

  render:

    ul className: 'breadcrumbs nav nav-pills',
      if @props.parentState?
        parentTitle = parentState.selectedDescription or parentState.title()
        li className: 'parent-state',
          a { onClick: _.bind @props.activateState, @, parentState },
            "#{parentTitle} /"
      else
        li className: 'active',
          a onClick: @props.refreshQuery, title: 'Refresh Display',
            strong {}, activeState.title()

module.exports = BreadCrumbs
