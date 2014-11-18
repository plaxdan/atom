{div, a, span} = React.DOM

SessionLabel = React.createClass
  displayName: 'SessionLabel'

  propTypes:

    userName: React.PropTypes.string.isRequired
    serverInstance: React.PropTypes.string.isRequired

  render: ->
    div className: 'brand-container',
      a
        href: '#ui/home'
        onClick: @props.clickHandler
      ,
        span className: 'session-title brand',
          "#{@props.userName}@#{@props.serverInstance}"

module.exports = SessionLabel
