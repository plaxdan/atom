# App About View
#
# Displays basic information about the current application
BaseView = require '../common/baseview'
BaseFormView = require '../common/baseform'
OtherKup = require '../../utils/otherkup'
DataTypeHelper = require '../../expressions/datatypehelper'

class AppAboutView extends BaseView
  className: 'app-about accordion'

  events:
    'click .cache-update': 'updateApplicationCache'
    'click .reload-page': 'reloadPage'

  _cacheEvents: [
    'cached'
    'checking'
    'downloading'
    'error'
    'idle'
    'noupdate'
    'obsolete'
    'progress'
    'uncached'
    'updateready'
  ]

  initialize: (options) ->
    super

    clientVersion = ($ '#buildVersion').text()
    buildTime = moment ($ '#buildTimestamp').text()
    serverVersion = @options.server.get 'serverVersion'

    # the application cache doesn't have a mechanism for getting a readable
    # statue
    @appCache = window.applicationCache
    if @appCache
      statusLabels = {}
      for status, label of {
        CHECKING:    'Checking'
        DOWNLOADING: 'Downloading'
        IDLE:        'Idle'
        OBSOLETE:    'Obsolete'
        UNCACHED:    'Uncached'
        NOUPDATE:    'No Update'
      }
        statusLabels[@appCache[status]] = label

      $ac = $ @appCache
      _.each @_cacheEvents, (name) =>
        $ac.on "#{name}.about", (ev) =>
          status = if name is 'error'
            # bing - this probably means the storage quota was exceeded,
            # need to come up with a way to deal with that
            'Error!'
          else
            statusLabels[@appCache.status]
          (@$ '.cache-status').text status

    @details = [
      {
        key: 'Client Version'
        value: "#{clientVersion} - Build Time #{ buildTime.format 'L'} #{buildTime.format 'LT'}"
      }
      { key: 'Server Version', value: serverVersion }
      { key: 'Storage Driver', value: @options.dataController.storage.name }
      {
        key: 'Application Cache'
        value: (ok) =>
          ok.span class: 'input-block-level uneditable-input', =>
            if @appCache
              ok.span class: 'cache-status', statusLabels[@appCache.status]
              ok.append ' - '
              ok.a class: 'cache-update', ->
                ok.icon class: 'icon-retweet', label: 'Update'
            else
              ok.span class: 'cache-status', 'Unavailable'
              ok.append ' - '
              ok.a class: 'reload-page', ->
                ok.icon class: 'icon-retweet', label: 'Reload'
      }
      {
        key: 'Environment'
        value: if window.cordova
          'Cordova'
        else
          'Default'
      }
      {
        key: 'Locale'
        value: options.dsApp.getLocale()
      }
    ]

  updateApplicationCache: ->
    window.applicationCache.update()

  reloadPage: ->
    window.location.reload()

  render: ->
    ok = new OtherKup @

    ok.accordionGroup
      id: 'about'
      heading: (ok) -> ok.strong style: 'font-size: 150%', 'DataSplice HTML5 Client'
      body: (ok) =>

        # ugh - get something better
        ok.p """
        Provides access to mobile data on a variety of modern web browsers,
        including support for Android, iOS, and Windows tablets and computers.
        """

        form = @options.factory.create BaseFormView
        for deet in @details
          continue unless deet
          form.createReadonly deet.key, deet.value
        ok.append form.render()

    unless @options.session.isEmpty()
      ok.accordionGroup
        id: 'session'
        heading: (ok) -> ok.strong style: 'font-size: 150%', 'Session Information'
        body: (ok) =>
          form = @options.factory.create SessionInformationForm
          ok.append form.render()

    ok.accordionGroup
      id: 'credits'
      heading: (ok) -> ok.strong style: 'font-size: 150%', 'Credits'
      body: (ok) =>
        ok.p 'The following nifty tools are in use here:', ->
          ok.ul ->
            ok.li 'CoffeeScript - ', ->
              ok.a href: 'http://coffeescript.org/', 'http://coffeescript.org/'
            ok.li 'Backbone.js - ', ->
              ok.a href: 'http://backbonejs.org/', 'http://backbonejs.org'
            ok.li 'Bootstrap - ', ->
              ok.a href: 'http://twitter.github.com/bootstrap/index.html', 'http://twitter.github.com/bootstrap/index.html'

        ok.p 'Copyright &copy; DataSplice 2014 DataSplice LLC.'

    @

  gc: ->
    super

    $ac = $ @appCache
    _.each @_cacheEvents, (ev) =>
      $ac.off "#{ev}.about"

class SessionInformationForm extends BaseFormView
  className: 'session-information form-horizontal'

  initialize: (options) ->
    super

    {session} = options

    # the body scaling mechanism we use only works on webkit browsers
    if navigator.userAgent.toLowerCase().match /webkit/
      @registerField 'Text Size', @options.factory.create TextSizeSelectionView

    @createReadonly 'User Identifier', session.get 'userIdentifier'

    mode = session.get 'mode'
    @createReadonly 'Mode', DataTypeHelper.capitalize mode

    @createReadonly 'Roles',  (_.clone session.get 'roles')?.sort().join ', '

    if mode is 'offline' and @options.factory.connectionManager.isDisconnected()
      @registerField 'Update Password', @options.factory.create UpdatePasswordView

class TextSizeSelectionView extends BaseView

  sizes: [
    { key: 'small', fontSize: '10px', label: 'Small' }
    { key: 'normal', fontSize: '14px', label: 'Normal' }
    { key: 'large', fontSize: '20px', label: 'Large' }
    { key: 'xlarge', fontSize: '24px', label: 'X-Large' }
  ]

  events:
    'click .set-text-size': 'setTextSize'

  setTextSize: (ev) ->
    el = ($ ev.target).closest '.set-text-size'
    size = el.text().trim()

    key = (_.find @sizes, (test) -> test.label is size)?.key
    @options.settings.set 'textSize', key if key

    @render()

  render: ->
    ok = new OtherKup @

    current = (@options.settings.get 'textSize') or 'normal'
    ok.div class: 'btn-toolbar', style: 'margin: 0', =>
      ok.div class: 'btn-group', =>
        ok.button
          class: 'btn disabled'
          style:
            'font-size': '20px'
            'line-height': '30px'
        , ->
          ok.icon class: 'icon-font'
        for item in @sizes
          active = item.key is current
          ok.button
            class: 'set-text-size btn' + if active then ' active' else ''
            style:
              'font-size': item.fontSize
              'line-height': '30px'
          , item.label

    @

class UpdatePasswordView extends BaseView

  events:
    'click .update-password': 'updatePassword'

  updatePassword: ->
    @pubSub.trigger 'displayModal', UpdatePasswordPrompt
      updatePassword: (values) =>
        promise = new $.Deferred

        session = @options.factory.session
        unless session.verifyPassword values.currentPassword
          promise.reject 'The current password does not match'
        else if not values.newPassword
          promise.reject 'Please enter a new password'
        else if values.newPassword isnt values.confirmPassword
          promise.reject 'The new and confirm passwords do not match'

        else
          session.updatePassword values.newPassword
          @options.factory.pubSub.trigger 'displayNotification',
            message: 'Password successfully updated'
            severity: 'success'

          promise.resolve()

        promise.promise()

  render: ->
    ok = new OtherKup @

    ok.button class: 'update-password btn', 'Update'

{ div, form, label, input } = React.DOM
UpdatePasswordPrompt = React.createClass
  displayName: 'UpdatePasswordPrompt'

  propTypes:
    updatePassword: React.PropTypes.func.isRequired

  getInitialState: ->
    currentPassword: ''
    newPassword: ''
    confirmPassword: ''

  mixins: [ React.addons.LinkedStateMixin ]
  render: ->
    @transferPropsTo ModalDialog
      title: 'Update Session Password'
      buttons: [
        { label: 'Update', class: 'btn-primary', role: 'accept' }
        { label: 'Cancel', role: 'cancel' }
      ]
      validate: (results) =>
        if results.role is 'accept'
          @props.updatePassword @state
    ,
      form className: 'form-horizontal',
        div className: 'control-group',
          label className: 'control-label', 'Current'
          div className: 'controls',
            input
              type: 'password'
              className: 'input-block-level'
              valueLink: @linkState 'currentPassword'
        div className: 'control-group',
          label className: 'control-label', 'New'
          div className: 'controls',
            input
              type: 'password'
              className: 'input-block-level'
              valueLink: @linkState 'newPassword'
        div className: 'control-group',
          label className: 'control-label', 'Confirm'
          div className: 'controls',
            input
              type: 'password'
              className: 'input-block-level'
              valueLink: @linkState 'confirmPassword'

module.exports = AppAboutView

