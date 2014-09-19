(function() {
  var $, CONFIGS, Debug, Delegato, EditorView, MinimapEditorView, MinimapIndicator, MinimapOpenQuickSettingsView, MinimapView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View, EditorView = _ref.EditorView;

  Debug = require('prolix');

  Delegato = require('delegato');

  MinimapEditorView = require('./minimap-editor-view');

  MinimapIndicator = require('./minimap-indicator');

  MinimapOpenQuickSettingsView = require('./minimap-open-quick-settings-view');

  CONFIGS = require('./config');

  module.exports = MinimapView = (function(_super) {
    __extends(MinimapView, _super);

    Debug('minimap').includeInto(MinimapView);

    Delegato.includeInto(MinimapView);

    MinimapView.delegatesMethods('getLineHeight', 'getLinesCount', 'getMinimapHeight', 'getMinimapScreenHeight', 'getMinimapHeightInLines', 'getFirstVisibleScreenRow', 'getLastVisibleScreenRow', 'addLineClass', 'removeLineClass', 'removeAllLineClasses', 'pixelPositionForScreenPosition', {
      toProperty: 'miniEditorView'
    });

    MinimapView.content = function() {
      return this.div({
        "class": 'minimap'
      }, (function(_this) {
        return function() {
          if (atom.config.get('minimap.displayPluginsControls')) {
            _this.subview('openQuickSettings', new MinimapOpenQuickSettingsView);
          }
          _this.div({
            outlet: 'miniScroller',
            "class": "minimap-scroller"
          });
          return _this.div({
            outlet: 'miniWrapper',
            "class": "minimap-wrapper"
          }, function() {
            _this.div({
              outlet: 'miniUnderlayer',
              "class": "minimap-underlayer"
            });
            _this.subview('miniEditorView', new MinimapEditorView);
            return _this.div({
              outlet: 'miniOverlayer',
              "class": "minimap-overlayer"
            }, function() {
              return _this.div({
                outlet: 'miniVisibleArea',
                "class": "minimap-visible-area"
              });
            });
          });
        };
      })(this));
    };

    MinimapView.prototype.configs = {};

    MinimapView.prototype.isClicked = false;

    function MinimapView(editorView) {
      this.editorView = editorView;
      this.onDragEnd = __bind(this.onDragEnd, this);
      this.onMove = __bind(this.onMove, this);
      this.onDragStart = __bind(this.onDragStart, this);
      this.onScrollViewResized = __bind(this.onScrollViewResized, this);
      this.onMouseDown = __bind(this.onMouseDown, this);
      this.onMouseWheel = __bind(this.onMouseWheel, this);
      this.onActiveItemChanged = __bind(this.onActiveItemChanged, this);
      this.updateScroll = __bind(this.updateScroll, this);
      this.updateScrollX = __bind(this.updateScrollX, this);
      this.updateScrollY = __bind(this.updateScrollY, this);
      this.updateMinimapView = __bind(this.updateMinimapView, this);
      this.updateMinimapEditorView = __bind(this.updateMinimapEditorView, this);
      this.editor = this.editorView.getEditor();
      this.paneView = this.editorView.getPane();
      MinimapView.__super__.constructor.apply(this, arguments);
      this.computeScale();
      this.miniScrollView = this.miniEditorView.scrollView;
      this.isPressed = false;
      this.offsetLeft = 0;
      this.offsetTop = 0;
      this.indicator = new MinimapIndicator();
      this.scrollView = this.editorView.scrollView;
      this.scrollViewLines = this.scrollView.find('.lines');
      this.subscribeToEditor();
      this.miniEditorView.minimapView = this;
      this.miniEditorView.setEditorView(this.editorView);
      this.updateMinimapView();
    }

    MinimapView.prototype.initialize = function() {
      var themeProp;
      this.on('mousewheel', this.onMouseWheel);
      this.on('mousedown', (function(_this) {
        return function(e) {
          _this.onMouseDown(e);
          return _this.onDragStart(e);
        };
      })(this));
      this.on('mousedown', '.minimap-visible-area', this.onDragStart);
      this.subscribe(this.paneView.model.$activeItem, this.onActiveItemChanged);
      this.subscribe(this.paneView.model, 'item-removed', function(item) {
        return typeof item.off === "function" ? item.off('.minimap') : void 0;
      });
      this.subscribe(this.miniEditorView, 'minimap:updated', this.updateMinimapView);
      this.subscribe($(window), 'resize:end', this.onScrollViewResized);
      themeProp = 'minimap.theme';
      this.subscribe(atom.config.observe(themeProp, {
        callNow: true
      }, (function(_this) {
        return function() {
          var _ref1;
          _this.configs.theme = (_ref1 = atom.config.get(themeProp)) != null ? _ref1 : CONFIGS.theme;
          return _this.updateTheme();
        };
      })(this)));
      this.miniScrollVisible = atom.config.get('minimap.minimapScrollIndicator');
      this.miniScroller.toggleClass('visible', this.miniScrollVisible);
      this.displayCodeHighlights = atom.config.get('minimap.displayCodeHighlights');
      atom.config.observe('minimap.minimapScrollIndicator', (function(_this) {
        return function() {
          _this.miniScrollVisible = atom.config.get('minimap.minimapScrollIndicator');
          return _this.miniScroller.toggleClass('visible', _this.miniScrollVisible);
        };
      })(this));
      atom.config.observe('minimap.useHardwareAcceleration', (function(_this) {
        return function() {
          if (_this.ScrollView != null) {
            return _this.updateScroll();
          }
        };
      })(this));
      return atom.config.observe('minimap.displayCodeHighlights', (function(_this) {
        return function() {
          var newOptionValue;
          newOptionValue = atom.config.get('minimap.displayCodeHighlights');
          return _this.setDisplayCodeHighlights(newOptionValue);
        };
      })(this));
    };

    MinimapView.prototype.computeScale = function() {
      var computedLineHeight, originalLineHeight, scaleY;
      scaleY = atom.config.get('minimap.scale');
      originalLineHeight = parseInt(this.editorView.find('.lines').css('line-height'));
      computedLineHeight = this.getLineHeight();
      return this.scaleX = this.scaleY = computedLineHeight / originalLineHeight;
    };

    MinimapView.prototype.getLineHeight = function() {
      return this.lineHeight || (this.lineHeight = Math.round(parseInt(this.editorView.find('.lines').css('line-height')) * atom.config.get('minimap.scale')));
    };

    MinimapView.prototype.getFontSize = function() {
      return this.fontSize || (this.fontSize = Math.round(parseInt(this.editorView.find('.lines').css('font-size')) * atom.config.get('minimap.scale')));
    };

    MinimapView.prototype.setDisplayCodeHighlights = function(value) {
      if (value !== this.displayCodeHighlights) {
        this.displayCodeHighlights = value;
        return this.miniEditorView.forceUpdate();
      }
    };

    MinimapView.prototype.destroy = function() {
      this.off();
      this.unsubscribe();
      this.detachFromPaneView();
      this.miniEditorView.destroy();
      return this.remove();
    };

    MinimapView.prototype.attachToPaneView = function() {
      this.paneView.addClass('with-minimap');
      return this.paneView.append(this);
    };

    MinimapView.prototype.detachFromPaneView = function() {
      this.paneView.removeClass('with-minimap');
      return this.detach();
    };

    MinimapView.prototype.minimapIsAttached = function() {
      return this.paneView.find('.minimap').length === 1;
    };

    MinimapView.prototype.unsubscribeFromEditor = function() {
      if (this.editor != null) {
        this.unsubscribe(this.editor, '.minimap');
      }
      if (this.scrollView != null) {
        return this.unsubscribe(this.scrollView, '.minimap');
      }
    };

    MinimapView.prototype.subscribeToEditor = function() {
      this.subscribe(this.editor, 'scroll-top-changed.minimap', this.updateScrollY);
      return this.subscribe(this.scrollView, 'scroll.minimap', this.updateScrollX);
    };

    MinimapView.prototype.getEditorViewClientRect = function() {
      return this.scrollView[0].getBoundingClientRect();
    };

    MinimapView.prototype.getScrollViewClientRect = function() {
      return this.scrollViewLines[0].getBoundingClientRect();
    };

    MinimapView.prototype.getMinimapClientRect = function() {
      return this[0].getBoundingClientRect();
    };

    MinimapView.prototype.updateTheme = function() {
      return this.attr({
        'data-theme': this.configs.theme
      });
    };

    MinimapView.prototype.updateMinimapEditorView = function() {
      return this.miniEditorView.update();
    };

    MinimapView.prototype.updateMinimapView = function() {
      var editorViewRect, evh, evw, height, miniScrollViewRect, minimapVisibilityRatio, msvh, msvw, width, _ref1;
      if (!this.editorView) {
        return;
      }
      if (!this.indicator) {
        return;
      }
      this.offset({
        top: (this.offsetTop = this.editorView.offset().top)
      });
      _ref1 = this.getMinimapClientRect(), width = _ref1.width, height = _ref1.height;
      editorViewRect = this.getEditorViewClientRect();
      miniScrollViewRect = this.miniEditorView.getClientRect();
      evw = editorViewRect.width;
      evh = editorViewRect.height;
      minimapVisibilityRatio = miniScrollViewRect.height / height;
      this.miniScroller.height(evh / minimapVisibilityRatio);
      this.miniScroller.toggleClass('visible', minimapVisibilityRatio > 1 && this.miniScrollVisible);
      this.miniWrapper.css({
        width: width
      });
      this.indicator.height = evh * this.scaleY;
      this.indicator.width = width / this.scaleX;
      this.miniVisibleArea.css({
        width: width / this.scaleX,
        height: evh * this.scaleY
      });
      msvw = miniScrollViewRect.width || 0;
      msvh = miniScrollViewRect.height || 0;
      this.indicator.setWrapperSize(width, Math.min(height, msvh));
      this.indicator.setScrollerSize(msvw, msvh);
      this.indicator.updateBoundary();
      if (this.frameRequested) {
        return;
      }
      this.frameRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateScroll();
          return _this.frameRequested = false;
        };
      })(this));
    };

    MinimapView.prototype.updateScrollY = function(top) {
      var overlayY, overlayerOffset, scrollViewOffset;
      if (top != null) {
        overlayY = top;
      } else {
        scrollViewOffset = this.scrollView.offset().top;
        overlayerOffset = this.scrollView.find('.overlayer').offset().top;
        overlayY = -overlayerOffset + scrollViewOffset;
      }
      this.indicator.setY(overlayY * this.scaleY);
      return this.updatePositions();
    };

    MinimapView.prototype.updateScrollX = function() {
      this.indicator.setX(this.scrollView[0].scrollLeft);
      return this.updatePositions();
    };

    MinimapView.prototype.updateScroll = function() {
      this.updateScrollX();
      this.updateScrollY();
      return this.trigger('minimap:scroll');
    };

    MinimapView.prototype.updatePositions = function() {
      this.transform(this.miniVisibleArea[0], this.translate(0, this.indicator.y));
      this.transform(this.miniWrapper[0], this.translate(0, this.indicator.scroller.y));
      this.miniEditorView.scrollTop(this.indicator.scroller.y * -1);
      return this.updateScrollerPosition();
    };

    MinimapView.prototype.updateScrollerPosition = function() {
      var height, scrollRange, totalHeight;
      height = this.miniScroller.height();
      totalHeight = this.height();
      scrollRange = totalHeight - height;
      return this.transform(this.miniScroller[0], this.translate(0, this.indicator.ratioY * scrollRange));
    };

    MinimapView.prototype.onActiveItemChanged = function(item) {
      var activeView;
      activeView = this.paneView.viewForItem(item);
      if (activeView === this.editorView) {
        if (this.parent().length === 0) {
          this.attachToPaneView();
        }
        this.updateMinimapEditorView();
        return this.updateMinimapView();
      } else {
        if (this.parent().length === 1) {
          this.detachFromPaneView();
        }
        if (activeView != null ? activeView.hasClass('editor') : void 0) {
          return this.paneView.addClass('with-minimap');
        }
      }
    };

    MinimapView.prototype.onMouseWheel = function(e) {
      var wheelDeltaX, wheelDeltaY, _ref1;
      if (this.isClicked) {
        return;
      }
      _ref1 = e.originalEvent, wheelDeltaX = _ref1.wheelDeltaX, wheelDeltaY = _ref1.wheelDeltaY;
      if (wheelDeltaX) {
        this.editorView.scrollLeft(this.editorView.scrollLeft() - wheelDeltaX);
      }
      if (wheelDeltaY) {
        return this.editorView.scrollTop(this.editorView.scrollTop() - wheelDeltaY);
      }
    };

    MinimapView.prototype.onMouseDown = function(e) {
      var top, y;
      this.isClicked = true;
      e.preventDefault();
      e.stopPropagation();
      y = e.pageY - this.offsetTop;
      top = this.indicator.computeFromCenterY(y) / this.scaleY;
      this.editorView.scrollTop(top);
      return setTimeout((function(_this) {
        return function() {
          return _this.isClicked = false;
        };
      })(this), 377);
    };

    MinimapView.prototype.onScrollViewResized = function() {
      return this.updateMinimapView();
    };

    MinimapView.prototype.onDragStart = function(e) {
      if (e.which !== 1) {
        return;
      }
      this.isPressed = true;
      this.on('mousemove.visible-area', this.onMove);
      return this.on('mouseup.visible-area', this.onDragEnd);
    };

    MinimapView.prototype.onMove = function(e) {
      if (this.isPressed) {
        return this.onMouseDown(e);
      }
    };

    MinimapView.prototype.onDragEnd = function(e) {
      this.isPressed = false;
      return this.off('.visible-area');
    };

    MinimapView.prototype.scale = function(x, y) {
      if (x == null) {
        x = 1;
      }
      if (y == null) {
        y = 1;
      }
      return "scale(" + x + ", " + y + ") ";
    };

    MinimapView.prototype.translate = function(x, y) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (atom.config.get('minimap.useHardwareAcceleration')) {
        return "translate3d(" + x + "px, " + y + "px, 0)";
      } else {
        return "translate(" + x + "px, " + y + "px)";
      }
    };

    MinimapView.prototype.transform = function(el, transform) {
      return el.style.webkitTransform = el.style.transform = transform;
    };

    return MinimapView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1JQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBd0IsT0FBQSxDQUFRLE1BQVIsQ0FBeEIsRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosRUFBVSxrQkFBQSxVQUFWLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFFBQVIsQ0FEUixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUlBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUpwQixDQUFBOztBQUFBLEVBS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBTG5CLENBQUE7O0FBQUEsRUFNQSw0QkFBQSxHQUErQixPQUFBLENBQVEsb0NBQVIsQ0FOL0IsQ0FBQTs7QUFBQSxFQU9BLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQVBWLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsQ0FBQTs7QUFBQSxJQUFBLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsV0FBakIsQ0FBNkIsV0FBN0IsQ0FBQSxDQUFBOztBQUFBLElBQ0EsUUFBUSxDQUFDLFdBQVQsQ0FBcUIsV0FBckIsQ0FEQSxDQUFBOztBQUFBLElBR0EsV0FBQyxDQUFBLGdCQUFELENBQWtCLGVBQWxCLEVBQW1DLGVBQW5DLEVBQW9ELGtCQUFwRCxFQUF3RSx3QkFBeEUsRUFBa0cseUJBQWxHLEVBQTZILDBCQUE3SCxFQUF5Six5QkFBekosRUFBb0wsY0FBcEwsRUFBb00saUJBQXBNLEVBQXVOLHNCQUF2TixFQUErTyxnQ0FBL08sRUFBaVI7QUFBQSxNQUFBLFVBQUEsRUFBWSxnQkFBWjtLQUFqUixDQUhBLENBQUE7O0FBQUEs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
//# sourceURL=/Users/daniel/.atom/packages/minimap/lib/minimap-view.coffee