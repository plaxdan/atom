{div, a, span} = React.DOM

SessionLabel = React.createClass

  render: ->
    div className: 'brand-container',
      a
        href: '#ui/home'
        # onClick: _.bind @props.toggleMessageCenter, @, ''
        onClick: _.bind @props.clickHandler, @, ''
      ,
        span className: 'session-title brand',
          "#{@props.userName}@#{@props.serverInstance}"

module.exports = SessionLabel
