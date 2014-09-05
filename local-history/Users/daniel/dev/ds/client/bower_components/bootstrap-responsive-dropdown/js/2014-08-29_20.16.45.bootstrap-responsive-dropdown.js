!function ($) {

  "use strict"; // jshint ;_;


 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle=dropdown]'
    , Dropdown = function (element) {
        var $el = $(element).on('click.dropdown.data-api', this.toggle)
        $('html').on('click.dropdown.data-api', function () {
          $el.parent().removeClass('open')
        })
      }

  Dropdown.prototype = {

    constructor: Dropdown

  , toggle: function (e) {
      var $this = $(this)
        , $parent
        , isActive

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      clearMenus()

      if (!isActive) {
        // display dropdown as a modal if the screen is small
        if ( $(window).width() < 768 ) {
          modalMenu($parent)
        }
        else if( $this.hasClass('absolute') ||
          $parent.css('overflow') === 'hidden') {
          absoluteMenu($parent)
        }

        $parent.toggleClass('open')
      }

      $this.focus()

      return false
    }

  , keydown: function (e) {
      var $this
        , $items
        , $active
        , $parent
        , isActive
        , index

      if (!/(38|40|27)/.test(e.keyCode)) return

      $this = $(this)

      e.preventDefault()
      e.stopPropagation()

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      if (!isActive || (isActive && e.keyCode == 27)) {
        if (e.which == 27) $parent.find(toggle).focus()
        return $this.click()
      }

      $items = $('[role=menu] li:not(.divider):visible a', $parent)

      if (!$items.length) return

      index = $items.index($items.filter(':focus'))

      if (e.keyCode == 38 && index > 0) index--                                        // up
      if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
      if (!~index) index = 0

      $items
        .eq(index)
        .focus()
    }

  }

  function clearMenus() {
    $(toggle).each(function () {
      var $parent = getParent($(this))

      // restore menu if it was absolutely positioned
      var $menu = $parent.data('absolute-menu')
      if($menu) {
        $menu
          .css({ display: 'none' })
          .removeClass('absolute-menu')
          .appendTo($parent)
      }

      $parent.removeClass('open')
    })

    // clear orphaned absolute menus if needed
    $('.dropdown-menu.absolute-menu').remove()
  }

  function getParent($this) {
    var selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = selector && $(selector)

    if (!$parent || !$parent.length) $parent = $this.parent()

    return $parent
  }

  function modalMenu($parent) {
    // create a modal div and relocate the menu into the body of the modal
    var $modal = $('<div class="modal hide"><div class="modal-header">' +
      '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
      '<h3>&nbsp;</h3>' +
      '</div><div class="modal-body open"></div></div>').appendTo($parent)

    var $menu = $parent.find('.dropdown-menu')

    var clicked;
    $menu
      .appendTo($modal.find('.modal-body'))
      .find('a').attr('data-dismiss', 'modal')
      .on('click', function(ev) {
        clicked = $(ev.target)
      })

    $modal.modal()

    // restore the menu when the modal is closed
    $modal.on('hide', function() {
      $menu.find('a').removeAttr('data-dismiss')
      $menu.appendTo($parent)

      if(clicked) { clicked.click() }
    })
  }

  function absoluteMenu($parent) {
    var $menu = $parent.find('.dropdown-menu')

    var offset = $parent.offset()
    var style = {
      display: 'inline',
      position: 'absolute',
      top: offset.top + $parent.outerHeight(),
    }

    if($menu.hasClass('pull-right')) {
      style.right = $(window).width() - offset.left - $parent.outerWidth()
    }
    else {
      style.left = offset.left
    }

    $menu.css(style)
      .addClass('absolute-menu')
      .appendTo($('body'))

    $parent.data('absolute-menu', $menu)
  }

  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('dropdown')
      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown

  $.fn.clearMenus = function () {
    clearMenus()
  }

 /* DROPDOWN NO CONFLICT
  * ==================== */

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(document)
    .on('click.dropdown.data-api', clearMenus)
    .on('click.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.dropdown-menu', function (e) { e.stopPropagation() })
    .on('click.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(window.jQuery);
