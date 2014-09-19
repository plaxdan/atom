Fluxxor = require 'fluxxor'
FluxChildMixin = Fluxxor.FluxChildMixin React

BoostrapDropdown = require './widgets/bootstrapdropdown'
{div, a, form, input, ul, li, i, h4} = React.DOM

Login = React.createClass
  displayName: 'Login'

  mixins: [FluxChildMixin]

  propTypes:
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

  _doSelectServer: ->
    # we actually want to trigger a page reload here - that's the easiest
    # way to discard the dynamic content we've loaded with the current server
    # and force things to refresh
    window.location = '#select-server'
    window.location.reload()

  _doSelectAuthDomain: (authDomain) ->
    @setState selectedAuthDomain: authDomain

  _doLogin: ->
    userName = @refs.userName.getDOMNode().value.trim()
    password = @refs.password.getDOMNode().value.trim()
    domain = @state.selectedAuthDomain

    @getFlux().actions.auth.login userName, password, domain

  _doDisplayNotificationDetails: ->
    @props.displayNotificationDetailsHandler @props.notification

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
                onClick: @_doSelectAuthDomain
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
                  ref: 'userName'
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
                # This could be a model
                notification = if @props.notification.cid?
                  @props.notification.attributes
                else
                  @props.notification
                div className: 'notifications',
                  div className: "alert alert-#{notification.severity}",
                    if notification.error
                      a
                        className: "#{notification.severity}-details close"
                        title: 'Display Details'
                        onClick: @_doDisplayNotificationDetails
                      ,
                        i className: 'icon-tasks'
                    "#{notification.message}"

            if @props.loginBanner
              div className: 'footer',
                @props.loginBanner

      div className: 'app-footer',
        a className: 'app-about', onClick: @props.aboutHandler,
          i undefined,
            "Version - #{@props.buildVersion}"
        if window.isWrappedDsApp
          a className: 'select-server pull-right', onClick: @_doSelectServer,
            'Select Server'
        else
          link = 'http://www.datasplice.com'
          a className: 'site-link pull-right', target: '_blank', href: link,
            link

module.exports = Login
