BoostrapDropdown = require './widgets/bootstrapdropdown'
{div, a, form, input, ul, li, i, h4} = React.DOM

Login = React.createClass
  displayName: 'Login'

  propTypes:
    loginHandler: React.PropTypes.func
    aboutHandler: React.PropTypes.func
    loginBanner: React.PropTypes.string
    buildVersion: React.PropTypes.string
    instanceName: React.PropTypes.string
    authDomains: React.PropTypes.array
    defaultAuthDomain: React.PropTypes.string

  getDefaultProps: ->
    defaultAuthDomain: '...'
    instanceName: '...'

  getInitialState: ->
    selectedAuthDomain: @props.defaultAuthDomain

  _selectAuthDomain: (authDomain) ->
    @setState selectedAuthDomain: authDomain

  _doAbout: ->
    @props.aboutHandler()

  _doLogin: ->
    username = @refs.username.getDOMNode().value.trim()
    password = @refs.password.getDOMNode().value.trim()
    domain = @state.selectedAuthDomain
    @props.loginHandler username, password, domain

  _handleKeyUp: (ev) ->
    @_doLogin() if ev.which is 13 # Enter

  render: ->
    div undefined,
      div className: 'login-backdrop',
        div className: 'logo'

      div id: 'login', className: 'row-fluid',
        div className: 'offset7 span5',
          div className: 'login-form',

            div className: 'header',
              BoostrapDropdown
                onClick: @_selectAuthDomain
                menuItems: @props.authDomains
                containerTag: div
                containerClass: 'pull-right dropdown'
                triggerTag: a
                triggerClass: 'auth-domain pull-right'
              ,
                "@ #{@state.selectedAuthDomain}"
              h4 undefined,
                @props.instanceName

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
              if @props.notification
                div className: 'notifications',
                  div className: "alert alert-#{@props.notification.severity}",
                  if @props.notification.error
                    a
                      className: "#{@props.notification.severity}-details close"
                      title: 'Display Details'
                    ,
                      i className: 'icon-tasks'
                    "#{@props.notification.message}"
                  else
                    "#{@props.notification.message}"

            if @props.loginBanner
              div className: 'footer',
                @props.loginBanner

      div className: 'app-footer',
        a className: 'app-about', onClick: @_doAbout,
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
