SessionSelectionView = require '../views/session/sessionselection'

{div, a, form, input, ul, li, i, h4} = React.DOM

Login = React.createClass
  displayName: 'Login'

  getDefaultProps: ->
    domains: ['Apple', 'Banana']
    instance: 'DS-BANANA 5.1'
    banner: 'Here is a banner!!!'
    buildVersion: 'JAFFACAKE'
    loginHandler: (username, password, domain) ->
      console.debug "Handling login: \n
        username: #{username},
        password: #{password},
        domain: #{domain}"

  getInitialState: ->
    authDomain: 'Apple'

  componentWillUnmount: ->
    @sessionSelectionView?.gc()

  _selectAuthDomain: (ev) ->
    @authDomain = ((@$ ev.target).closest '.select-domain').text()
    (@$ '.auth-domain').text "@ #{@authDomain}"

  _doLogin: ->
    username = @refs.username.getDOMNode().value.trim()
    password = @refs.password.getDOMNode().value.trim()
    domain = 'Some domain'
    @props.loginHandler username, password, domain

  _handleKeyUp: (evt) ->
    @_doLogin() if evt.which is 13 # Enter

  render: ->
    div undefined,
      div className: 'login-backdrop',
        div className: 'logo'

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
                      a className: 'select-domain', onClick: @_selectAuthDomain,
                        domain
              h4 undefined,
                @props.instance

            div className: 'contents',
              div className: 'title',
                'Welcome to DataSplice, please log in:'
              form className: 'credentials form-inline',
                input
                  onKeyUp: @_handleKeyUp
                  ref: 'username'
                  type: 'text'
                  className: 'user-name input-small'
                  placeholder: 'User Name'
                  autoFocus: true
                  autoCapitalize: 'off'
                  autoCorrect: 'off'
                  autoComplete: 'off'
                  spellCheck: 'off'
                ' / '
                input
                  onKeyUp: @_handleKeyUp
                  ref: 'password'
                  type: 'password'
                  className: 'user-password input-small'
                  placeholder: 'Password'
              div className: 'actions',
                a className: 'login btn btn-success', onClick: @_doLogin,
                  i className: 'icon-signin'
              div className: 'notifications'

            if @props.banner
              div className: 'footer',
                @props.banner

      div className: 'app-footer',
        a className: 'app-about',
          i undefined,
            "Version - #{@props.buildVersion}"
        if window.isWrappedDsApp
          a className: 'select-server pull-right',
            'Select Server'
        else
          link = 'http://www.datasplice.com'
          a className: 'site-link pull-right', target: '_blank', href: link,
            link

module.exports = Login
