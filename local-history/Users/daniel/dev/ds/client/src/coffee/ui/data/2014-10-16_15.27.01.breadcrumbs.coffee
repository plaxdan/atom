{ul, li, a, strong} = React.DOM

BreadCrumbs = React.createClass
  displayName: 'BreadCrumbs'

  _crumbShape:
    onClick: React.PropTypes.func
    text: React.PropTypes.string
    title: React.PropTypes.string

  propTypes:
    parent: React.PropTypes.shape _crumbShape
    active: React.PropTypes.shape _crumbShape

  render: ->
    ul className: 'breadcrumbs nav nav-pills',
      if @props.parent?
        li className: 'parent-state',
          a { onClick: @props.parent.onClick },
            "#{@props.parent.text} /"

      li className: 'active',
        a onClick: @props.active.onClick, title: 'Refresh Display',
          strong {}, @props.active.text

module.exports = BreadCrumbs
