# SlickGrid View
#
# Wrapper view to simplify dealing with SlickGrid

BaseView = require './baseview'
OtherKup = require '../../utils/otherkup'

# interface that exposes data
# class SlickGridData
#   getColumns: -> throw new Error 'Not implemented'
#   getLength: -> throw new Error 'Not implemented'
#   getItem: (index) -> throw new Error 'Not implemented'
#   getEditor: (row, column) -> null
#   valueExtractor: (context, column) -> throw new Error 'Not implemented'
#   valueAccepter: (context, column, value) -> throw new Error 'Not implemented'

class SlickGridView extends BaseView
  class: 'boundDataGrid'

  events:
    'click .slick-header-column': 'clickHeader'

  defaultGridOptions:
    enableColumnReorder: false
    enableCellNavigation: true
    editable: true
    autoEdit: true
    asyncEditorLoading: false
    rowHeight: 30
    defaultColumnWidth: 100
    width: '100%'
    height: '300px'
    frozenColumn: 0

  initialize: (options) ->
    if not options.data
      throw new Error 'No grid data specified!'
    @_gridData = options.data

    @_gridOptions = _.extend _.clone(@defaultGridOptions), options

  clickHeader: (ev) ->
    t = $(ev.target)
    return false if t.hasClass 'slick-resizable-handle'

    dropdown = ($ ev.target).closest '.dropdown'
    menu = dropdown.find '.dropdown-menu'
    return if dropdown.hasClass 'open'

    column = t.closest('.slick-header-column').data 'column'
    items = if _.isFunction column.menuItems then column.menuItems column else column.menuItems
    return false unless items

    ok = new OtherKup @, el: menu
    for item in items
      continue unless item?

      if item.hasOwnProperty 'enabled'
        enabled = _.result item, 'enabled'
        continue unless enabled

      ok.li ->
        anchor = ok.a
          class: item.class
          href: item.href
          'data-column': column.id
        , ->
          if item.icon
            ok.icon class: item.icon, label: item.label
          else
            ok.append item.label

        if item.data
          for key, value of item.data
            anchor.data key, value

    # bing - this is pretty hack-tastic
    # for some reason the event bindings work fine when displayed as a modal,
    # but not when absolutely positioned. this works around it, but is
    # pretty terrible
    if ($ window).width() >= 768
      menu.off '.delegateEvents'
      for key, method of @events
        method = @[ @events[key] ] if !_.isFunction method
        continue unless method
        method = _.bind method, @
        [ m, eventName, selector ] = key.match /^(\S+)\s*(.*)$/
        eventName += '.delegateEvents'
        if selector is ''
          menu.bind eventName, method
        else
          menu.delegate selector, eventName, method

  updateColumns: (columns) ->
    @_ignoreScroll = true
    @_grid.setColumns columns
    @_ignoreScroll = false

  render: ->
    # bing - move to stylesheet
    @$el.css
      width: @_gridOptions.width
      height: @_gridOptions.height

    # the grid doesn't work well if you attach it to an element that is not in
    # the DOM yet. defer creating the grid until that is the case
    _.defer => @renderGrid()

    # If we don't render anything out, otherkup will mistakenly re-render the
    # whole shebang.
    @$el.append "<div>&nbsp;</div>"
    @

  renderGrid: ->
    # kill an old grid.
    @_grid.destroy() if @_grid?

    # columns can be an array or deferred
    columns = @_gridData.getColumns()
    $.when(columns).done (columns) =>
      @_grid = new Slick.Grid @$el, @_gridData, columns,
        _.extend @_gridOptions,
          dataItemColumnValueExtractor: =>
            @_gridData.valueExtractor.apply @_gridData, arguments
          dataItemColumnValueAccepter: =>
            @_gridData.valueAccepter.apply @_gridData, arguments

      @_grid.setSelectionModel new Slick.RowSelectionModel
      @_grid.registerPlugin @options.factory.create HeaderPlugin

      # bind event handlers to match Backbone-style events
      @_grid.onScroll.subscribe (event, details) =>
        return if @_ignoreScroll

        # hide dropdowns on scroll
        $.fn.clearMenus?()

        @trigger 'scroll', event, details

      # touch devices need some love so scrolling works
      # if @isTouchDevice()
      #   vp = @$ ".slick-viewport"
      #   scrollStartX = 0
      #   scrollStartY = 0
      #
      #   vp.on 'touchstart', (ev) =>
      #     touch = event.touches[0]
      #     scrollStartX = vp[1].scrollLeft + touch.pageX
      #     scrollStartY = vp.scrollTop() + touch.pageY
      #
      #     cell = @_grid.getCellFromEvent ev
      #     @_activateDataBoundCell cell
      #
      #     ($ '.dropdown.open').removeClass 'open'
      #     ev.preventDefault()
      #
      #   vp.on 'touchmove', (ev) ->
      #     touch = event.touches[0]
      #     # don't need to scroll the fixed pane horizontally
      #     vp[1].scrollLeft = scrollStartX - touch.pageX
      #     vp.scrollTop scrollStartY - touch.pageY
      #
      #     ev.preventDefault()
      #
      #   vp.on 'touchend', (ev) =>
      #     cell = @_grid.getCellFromEvent ev
      #     @_activateDataBoundCell cell
      #
      #     ev.preventDefault()

      # convert events so they work with Backbone style listeners
      @_grid.onSelectedRowsChanged.subscribe (ev, cell) =>
        @trigger 'selectedRowsChanged', ev, cell
      @_grid.onActiveCellChanged.subscribe (ev, cell) =>
        @trigger 'activeCellChanged', ev, cell

  _activateDataBoundCell: (cell) ->
    if cell and cell.cell isnt 0 # first column is not data-bound
      @_grid.setActiveCell cell.row, cell.cell

  gc: ->
    $.fn.clearMenus()

    # TODO: Find out what about the SlickGrid isn't cleaning up correctly.
    @_grid?.destroy()
    @remove()

    super

  isTouchDevice: ->
    try
      document.createEvent 'TouchEvent'
      true
    catch error
      false

# plug-in for adding icons and drop menus to the header
class HeaderPlugin
  constructor: (@options) ->

  init: (@grid) ->
    @grid.onHeaderCellRendered.subscribe @onHeaderRendered

    # Force the grid to re-render the header now that the events are hooked up.
    @grid.setColumns @grid.getColumns()

  onHeaderRendered: (ev, args) =>
    el = ($ args.node)
    el.data 'column', args.column

    # inject markup to render Bootstrap drop menus if needed
    if args.column.menuItems
      el.addClass 'dropdown'
      el
        .addClass('dropdown-toggle')
        .attr(
          'data-toggle': 'dropdown'
          'data-target': '#' + el.attr 'id'
        )
        .find('span')
          .after '<ul class="dropdown-menu header-menu"></ul>'

    for prop in [ 'prepend-icon', 'append-icon' ]
      icon = args.column[prop]
      if icon
        icon = icon args.column if _.isFunction icon
        if icon
          icon += ' pull-right' if prop is 'append-icon'
          el.prepend "<i class='#{ icon }'/></i>"

  # Due to the way that references are being passed around rather than using
  # events we have references to dead views in code which is stopping the
  # garbage collector from getting rid of it.
  destroy: ->
    @grid.onHeaderCellRendered.unsubscribe @onHeaderRendered

module.exports = SlickGridView
