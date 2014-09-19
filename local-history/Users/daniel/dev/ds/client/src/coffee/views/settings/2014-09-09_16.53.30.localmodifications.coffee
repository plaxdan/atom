# Local Modifications View
#
# The local modifications view shows uncommitted record modifications that are
# stored in the current session, and allows them to be maintained
Backbone = require 'backbone'
BaseView = require '../common/baseview'
OtherKup = require '../../utils/otherkup'
DataTypeHelper = require '../../expressions/datatypehelper'
DisplayStateController = require '../../data/displaystatecontroller'
RecordModification = require '../../models/recordmodification'
ModalRecordAction = require '../../ui/data/modalrecordaction'

class LocalModificationsView extends BaseView

  events:
    "click a.filterView": "filterView"
    'change input.toggleAll': 'toggleAll'
    'click .btnCommit': 'commitSelected'
    'click .btnDelete': 'deleteSelected'

  initialize: (options) ->
    super options
    @mh = @options.modificationHandler

    @mh.on 'add remove', =>
      @renderViewList()
      @renderModificationList()

  filterView: (ev) ->
    filter = $.trim $(ev.target).text()

    @$('#activeView').text filter + ' '

    # add view as query to the current url
    fragment = (Backbone.history.fragment.match /([^?]*)(\?.*)?/)[1]
    if filter is 'All Views'
      Backbone.history.navigate fragment
      @options.query = ''
    else
      Backbone.history.navigate fragment + "?" + filter
      @options.query = filter

    @renderModificationList()

  toggleAll: (ev) ->
    @$('td input').attr 'checked', ev.target.checked

  commitSelected: ->
    list = @selectedModifications()
    @mh.commitChanges modifications: list if list.length > 0

  deleteSelected: ->
    list = @selectedModifications()
    return if list.length is 0

    # warn the user that this is destructive
    @options.pubSub.trigger 'displayModal',
      title: 'Confirm Delete'
      body: 'This will delete the selected modifications and there is no way to undo the changes! Continue?'
      buttons: [
        { label: 'OK', class: 'btn-warning', role: 'accept' }
        { label: 'Cancel', role: 'cancel' }
      ]
      validate: (results) =>
        if results.role is 'accept'
          @mh.remove list
        true

  selectedModifications: ->
    # the input value is the local id of the modification
    _.collect @$('td input:checked'), (input) => @mh.get input.value

  render: ->
    ok = new OtherKup @

    ok.div class: 'btn-toolbar', =>
      ok.div class: 'btn-group', =>
        ok.button class: 'btn dropdown-toggle', 'data-toggle': 'dropdown' , =>
          ok.icon class: 'icon-filter'
          ok.span { id: 'activeView' }, ( @options.query or 'All Views' ) + ' '
          ok.span class: 'caret'
        ok.ul id: 'viewList', class: 'dropdown-menu', =>
          @renderViewList ok
        ok.button class: 'btn btnCommit', ->
          ok.icon class: 'icon-retweet', label: 'Commit'
        ok.button class: 'btn btnDelete', ->
          ok.icon class: 'icon-trash', label: 'Delete'

    ok.table class: 'table table-striped', =>
      ok.thead ->
        ok.th -> ok.input type: 'checkbox', class: 'toggleAll'
        ok.th 'View Identifier'
        ok.th 'Modification'
        ok.th 'Details'
        ok.th '' # actions
      ok.tbody =>
        @renderModificationList ok

    @

  renderViewList: (ok) ->
    ok or= new OtherKup @, el: @$('#viewList')

    # grab the list of views that have modifications
    modified = _.uniq @mh.pluck 'viewId'

    ok.li -> ok.a class: 'filterView', ->
      ok.icon class: 'icon-asterisk', label: 'All Views'
    for view in modified
      ok.li ->
        ok.a { class: 'filterView' }, view
    @

  renderModificationList: (ok) ->
    ok or= new OtherKup @, el: @$('tbody')

    # generate a list of modifications to display
    if @options.query
      list = _.filter @mh.models, (model) =>
        model.get('viewId') is @options.query
    else
      list = @mh.models

    if list.length > 0
      options = _.clone @options
      for mod in list
        options.modification = mod
        ok.append ( new ModificationRowView options ).render()
    else
      ok.tr ->
        ok.td colspan: 6, 'No local modifications'
    @

class ModificationRowView extends BaseView
  tagName: 'tr'

  events:
    'click .record-edit': 'editRecord'

  initialize: (options) ->
    super options
    {@modification} = options

  editRecord: (ev) ->
    @options.dataController.findRecord { @modification }, (record) =>
      unless record
        @options.pubSub.trigger 'displayNotification',
          message: 'Record not found!'
          severity: 'error'
      else
        $.when(@options.configurationManager.updateRecordDisplayCache record)
          .done =>
            state = @options.dataController.createRecordDisplayState record
            controller = new DisplayStateController state, @options.factory

            promise = new $.Deferred
            @options.pubSub.trigger 'displayModal', ModalRecordAction
              factory: @options.factory
              controller: controller
              displayMode: 'record'
              promise: promise

            $.when(promise).always -> controller.gc()

  render: ->
    ok = new OtherKup @

    eventType = @modification.get 'eventType'
    viewId = @modification.get 'viewId'
    view = @options.session.get "views.#{viewId}"

    ok.td => ok.input type: 'checkbox', value: @modification.cid
    ok.td viewId
    ok.td =>
      ok.div ->
        icon = switch eventType
          when 'insert' then 'icon-asterisk'
          when 'update' then 'icon-upload'
          when 'delete' then 'icon-trash'
        label = DataTypeHelper.capitalize eventType
        ok.icon class: icon, label: label

      # format edit time using current locale
      m = moment @modification.get 'editTime'
      ok.div m.format 'L LT'

    ok.td =>
      ok.span class: 'description'

      ok.ul =>
        original = @modification.get 'originalValues'

        for key, changed of @modification.get 'modifications'
          # GUIDs are pretty useless to display
          field = view?.getField key
          continue if field?.dataType is 'Guid'

          # also don't display empty fields for insert events
          continue unless changed or eventType isnt RecordModification.InsertRecord

          ok.li ->
            ok.strong key
            if eventType is RecordModification.InsertRecord
              ok.append " (#{ JSON.stringify changed })" if changed
            else
              ok.append " (#{JSON.stringify original[key]} -> #{JSON.stringify changed})"

    ok.td style: 'vertical-align: middle', ->
      ok.a class: 'record-edit', ->
        ok.icon class: 'icon-edit'

    # record description isn't necessarily available synchronously
    @_updateDescription()

    @

  _updateDescription: ->
    @options.dataController.findRecord { @modification }, (record) =>
      description = if record
        @options.configurationManager.getRecordDescription record
      else
        'Invalid record'
      $.when(description).done (description) =>
        (@$ '.description').text description

module.exports = LocalModificationsView

