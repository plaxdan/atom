SessionSelectionView = require '../views/session/sessionselection'

{div, a, form, input, ul, li, i, h4} = React.DOM

Login = React.createClass
  displayName: 'Login'

  getDefaultProps: ->
    domains: ['Apple', 'Banana']
    instance: 'DS-BANANA 5.1'

  getInitialState: ->
    authDomain: 'Apple'

  componentDidMount: (prevProps, prevState) ->
    # @_createView @getDOMNode()

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
                    a className: 'select-domain',
                      domain
            h4 undefined,
              @props.instance

          div className: 'contents',
            div className: 'title',
              'Welcome to DataSplice, please log in:'
            form className: 'credentials form-inline',
              input
                type: 'text'
                className: 'user-name input-small'
                placeholder: 'User Name'
                autofocus: true
                autocapitalize: 'off'
                autocorrect: 'off'
                autocomplete: 'off'
                spellcheck: 'off'
              ' / '
              input
                type: 'password'
                className: 'user-password input-small'
                placeholder: 'Password'
            div className: 'actions',
              a className: 'login btn btn-success',
                i className: 'icon-share-sign'
            div className: 'notifications'

  _createView: (node) ->
    @sessionSelectionView = @props.factory.create SessionSelectionView
    @sessionSelectionView.render().$el.appendTo node

module.exports = Login
