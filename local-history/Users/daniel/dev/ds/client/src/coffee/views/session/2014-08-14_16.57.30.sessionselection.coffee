# SessionSelectionView
#
# Displays a login screen so the user can establish a new session with the
# server
#
# @TODO - support multiple sessions and allow the user to access an existing
# session by verifying the password
BaseView = require '../common/baseview'
AppAboutView = require '../settings/appaboutview'
Session = require '../../models/session'
OtherKup = require '../../utils/otherkup'

class SessionSelectionView extends BaseView

  globalEvents:
    'displayNotification': 'displayNotification'

  events:
    'click .select-server': 'selectServer'
    'click .app-about': 'displayAbout'
    'click .select-domain': 'selectAuthDomain'
    'click .login.btn': 'doLogin'
    'click .error-details': 'displayErrorDetails'
    'keyup input': 'onKeyup'

  selectServer: ->
    # we actually want to trigger a page reload here - that's the easiest
    # way to discard the dynamic content we've loaded with the current server
    # and force things to refresh
    window.location = '#select-server'
    window.location.reload()

  displayAbout: ->
    @pubSub.trigger 'displayModal',
      title: 'About DataSplice'
      body: (ok, cb) =>
        ok.append (@options.factory.create AppAboutView).render()
        cb()
        null

  selectAuthDomain: (ev) ->
    @authDomain = ((@$ ev.target).closest '.select-domain').text()
    (@$ '.auth-domain').text "@ #{@authDomain}"

  displayNotification: (notification) ->
    ok = new OtherKup @, el: @$ '.notifications'
    ok.div class: 'alert alert-error', =>
      if notification.error
        @_error = notification.error
        ok.a class: 'error-details close', title: 'Display Details', ->
          ok.icon class: 'icon-tasks'
      ok.append notification.message

  doLogin: ->
    session = new Session
      userName: (@$ '.user-name').val()
      password: (@$ '.user-password').val()
      domain: @authDomain
    @pubSub.trigger 'logIn', session

  displayErrorDetails: ->
    @options.pubSub.trigger 'displayError', @_error if @_error

  onKeyup: (ev) ->
    @doLogin() if ev.which is 13

  render: ->
    ok = new OtherKup @

    ok.div class: 'login-backdrop', ->
      ok.div class: 'logo'

    instance = @options.server.get 'instanceName'
    @authDomain = @options.server.get 'defaultAuthDomain'
    domains = @options.server.get 'authDomains'

    ok.div class: 'row-fluid', =>
      ok.div class: 'offset7 span5', =>
        ok.div class: 'login-form', =>
          ok.div class: 'header', =>
            ok.div class: 'pull-right dropdown', =>
              ok.a
                class: 'auth-domain pull-right dropdown-toggle'
                'data-toggle': 'dropdown'
              , "@ #{@authDomain}"
              ok.ul class: 'dropdown-menu', ->
                for domain in domains
                  ok.li -> ok.a class: 'select-domain', domain

            ok.h4 instance

          ok.div class: 'contents', =>
            ok.div class: 'title', 'Welcome to DataSplice, please log in:'

            # ok.append @form.render()
            ok.form class: 'credentials form-inline', =>
              ok.input
                type: 'text'
                class: 'user-name input-small'
                placeholder: 'User Name'
                autofocus: true
                autocapitalize: 'off'
                autocorrect: 'off'
                autocomplete: 'off'
                spellcheck: 'off'

              ok.append ' / '

              ok.input
                type: 'password'
                class: 'user-password input-small'
                placeholder: 'Password'

            ok.div class: 'actions', ->
              ok.a class: 'login btn btn-success', ->
                ok.icon class: 'icon-share-sign'

            ok.div class: 'notifications'

          banner = @options.server.get 'loginBanner'
          if banner
            ok.div class: 'footer', ->
              ok.append banner

    ok.div class: 'app-footer' , =>
      ok.a class: 'app-about', -=>
        ok.i "Version - #{@options.dsApp.buildVersion}"

      if window.isWrappedDsApp
        ok.a class: 'select-server pull-right', 'Select Server'
      else
        link = 'http://www.datasplice.com'
        ok.a class: 'site-link pull-right', target: '_blank', href: link, link
    @

module.exports = SessionSelectionView
