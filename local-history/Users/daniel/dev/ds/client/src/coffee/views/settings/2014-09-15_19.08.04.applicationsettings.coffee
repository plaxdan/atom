# Application Settings View
#
# The application settings view displays options for managing the settings,
# behavior, data, etc. associated with the current session
Backbone = require 'backbone'
BaseView = require '../common/baseview'
AppAboutView = require './appaboutview'
DataManagementView = require './datamanagement'
HardwareSettingsView = require './hardwaresettings'
LocalModificationsView = require './localmodifications'
OtherKup = require '../../utils/otherkup'
UrlHelper = require '../../utils/urlhelper'

class ApplicationSettingsView extends BaseView

  className: 'application-settings'
  title: 'Application Settings'
  route: 'settings'

  initialize: (options) ->
    super

    options or= {}
    { @path } = options
    frag = Backbone.history.getFragment()
    frag = frag.substr frag.indexOf "?"
    @parameters = UrlHelper.parseParameters frag

  render: ->
    ok = new OtherKup @

    ok.div class: 'page-banner' , =>
      ok.div class: 'container', =>
        @renderBanner ok

    ok.div class: 'page-body container', =>
      @renderBody ok

    if _.result @, 'hasFooter'
      ok.div class: 'page-footer' , =>
        ok.div class: 'container', =>
          @renderFooter ok
    @

  renderBanner: (ok) ->
    ok.ul class: 'nav nav-pills', =>
      ok.li -> ok.a class: 'info', 'Application Settings'

      # should be handled in base class probably
      root = '#ui/' + @route

      ok.li ->
        ok.a href: "#{root}/about", 'data-action': 'about', ->
          ok.icon class: 'icon-question-sign', label: 'About'

      ok.li ->
        ok.a href: "#{root}/hardware", 'data-action': 'hardware', ->
          ok.icon class: 'icon-wrench', label: 'Hardware'

      # only display data tabs if we're logged in
      if @options.session?.get 'sessionName'
        ok.li ->
          ok.a href: "#{root}/modifications", 'data-action': 'modifications', ->
            ok.icon class: 'icon-bolt', label: 'Modifications'
        ok.li ->
          ok.a href: "#{root}/storage", 'data-action': 'storage', ->
            ok.icon class: 'icon-hdd', label: 'Storage'

  renderBody: (ok) ->
    @unregisterChildView @childPane if @childPane
    @childPane = null

    (@$ '.page-banner .nav li').removeClass 'active'

    action = @path[0] or 'about'
    return unless action
    newChild = switch action
      when 'about' then @options.factory.create AppAboutView,
        { @parameters }
      when 'hardware' then @options.factory.create HardwareSettingsView,
        { @parameters }
      when 'modifications' then @options.factory.create LocalModificationsView,
        { @parameters }
      when 'storage' then @options.factory.create DataManagementView,
        { @parameters }

    return unless newChild

    $.when(newChild).done (view) =>
      container = (@$ '.page-body')
      container.empty()

      if view
        @childPane = @registerChildView view
        ok.append @childPane.render().$el

        # add the active style to the selected tab
        (@$el.find ".page-banner .nav li a[data-action=#{ action }]")
          .parent().addClass 'active'

module.exports = ApplicationSettingsView
