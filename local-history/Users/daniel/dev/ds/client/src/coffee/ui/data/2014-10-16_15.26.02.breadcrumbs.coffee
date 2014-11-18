{ul, li, a, strong} = React.DOM

BreadCrumbs = React.createClass
  displayName: 'BreadCrumbs'

  _crumbShape:
    onClick: React.PropTypes.func
    title: React.PropTypes.string

  propTypes:
    parent: React.PropTypes.shape _crumbShape
    active: React.PropTypes.shape _crumbShape

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
