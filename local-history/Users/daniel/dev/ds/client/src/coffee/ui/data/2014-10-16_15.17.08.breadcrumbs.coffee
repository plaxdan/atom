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
      if @props.parent?
        li className: 'parent-state',
          a { onClick: @props.parent.onClick },
            "#{@props.parent.title} /"

      li className: 'active',
        a onClick: @props.active.onClick, title: 'Refresh Display',
          strong {}, @props.active.title

module.exports = BreadCrumbs
