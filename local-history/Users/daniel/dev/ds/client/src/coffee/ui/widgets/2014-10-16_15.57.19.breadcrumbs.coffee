{ul, li, a,} = React.DOM

BreadCrumbs = React.createClass
  displayName: 'BreadCrumbs'

  _crumbShape:
    onClick: React.PropTypes.func
    text: React.PropTypes.string.isRequired
    toolTip: React.PropTypes.string

  propTypes:
    parent: React.PropTypes.shape @_crumbShape
    active: React.PropTypes.shape @_crumbShape

  render: ->
    ul className: 'breadcrumbs nav nav-pills',
      if @props.parent?
        li className: 'parent-state',
          a onClick: @props.parent.onClick, title: @props.parent.toolTip,
            "#{@props.parent.text} /"

      li className: 'active',
        a onClick: @props.active.onClick, title: @props.active.toolTip,
          @props.active.text

module.exports = BreadCrumbs
