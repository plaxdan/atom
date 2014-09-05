SessionSelectionView = require '../views/session/sessionselection'

{div, a, form, input, ul, li, i} = React.DOM

Login = React.createClass
  displayName: 'Login'

  getDefaultProps: ->
    domains: ['Apple', 'Banana']

  componentDidMount: (prevProps, prevState) ->
    @_createView @getDOMNode()

  componentWillUnmount: ->
    @sessionSelectionView?.gc()

  render: ->
    div id: 'login', className: 'row-fluid',
      div className: 'offset7 span5',
        div className: 'login-form',

          div className: 'header',
            div className: 'pull-right dropdown',
              a className: 'auth-domain pull-right dropdown-toggle', 'data-toggle': 'dropdown',
                "@ #{@state.authDomain}"
              ul className: 'dropdown-menu',
                for domain in @props.domains
                  li undefined,
                    a className 'select-domain',
                      domain
            h4 undefined,
              @props.instance

          div className: 'contents'

  _createView: (node) ->
    @sessionSelectionView = @props.factory.create SessionSelectionView
    @sessionSelectionView.render().$el.appendTo node

module.exports = Login
