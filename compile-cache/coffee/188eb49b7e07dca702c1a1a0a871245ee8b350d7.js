(function() {
  var $, CONFIGS, Debug, Delegato, EditorView, MinimapEditorView, MinimapIndicator, MinimapView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View, EditorView = _ref.EditorView;

  Debug = require('prolix');

  Delegato = require('delegato');

  MinimapEditorView = require('./minimap-editor-view');

  MinimapIndicator = require('./minimap-indicator');

  CONFIGS = require('./config');

  module.exports = MinimapView = (function(_super) {
    __extends(MinimapView, _super);

    Debug('minimap').includeInto(MinimapView);

    Delegato.includeInto(MinimapView);

    MinimapView.delegatesMethods('getLineHeight', 'getLinesCount', 'getMinimapHeight', 'getMinimapScreenHeight', 'getMinimapHeightInLines', 'getFirstVisibleScreenRow', 'getLastVisibleScreenRow', 'addLineClass', 'removeLineClass', 'removeAllLineClasses', {
      toProperty: 'miniEditorView'
    });

    MinimapView.content = function() {
      return this.div({
        "class": 'minimap'
      }, (function(_this) {
        return function() {
          return _this.div({
            outlet: 'miniWrapper',
            "class": "minimap-wrapper"
          }, function() {
            _this.div({
              outlet: 'miniUnderlayer',
              "class": "minimap-underlayer"
            });
            _this.subview('miniEditorView', new MinimapEditorView());
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
      this.scaleX = 0.2;
      this.scaleY = this.scaleX * 0.8;
      this.minimapScale = this.scale(this.scaleX, this.scaleY);
      this.miniScrollView = this.miniEditorView.scrollView;
      this.transform(this.miniWrapper[0], this.minimapScale);
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
      this.on('mousedown', this.onMouseDown);
      this.on('mousedown', '.minimap-visible-area', this.onDragStart);
      this.subscribe(this.paneView.model.$activeItem, this.onActiveItemChanged);
      this.subscribe(this.paneView.model, 'item-removed', function(item) {
        return typeof item.off === "function" ? item.off('.minimap') : void 0;
      });
      this.subscribe(this.miniEditorView, 'minimap:updated', this.updateMinimapView);
      this.subscribe($(window), 'resize:end', this.onScrollViewResized);
      themeProp = 'minimap.theme';
      return this.subscribe(atom.config.observe(themeProp, {
        callNow: true
      }, (function(_this) {
        return function() {
          var _ref1;
          _this.configs.theme = (_ref1 = atom.config.get(themeProp)) != null ? _ref1 : CONFIGS.theme;
          return _this.updateTheme();
        };
      })(this)));
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
      var editorViewRect, evh, evw, height, miniScrollViewRect, msvh, msvw, width, _ref1;
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
      width /= this.scaleX;
      height /= this.scaleY;
      evw = editorViewRect.width;
      evh = editorViewRect.height;
      this.miniWrapper.css({
        width: width
      });
      this.miniVisibleArea.css({
        width: this.indicator.width = width,
        height: this.indicator.height = evh
      });
      msvw = miniScrollViewRect.width || 0;
      msvh = miniScrollViewRect.height || 0;
      this.indicator.setWrapperSize(width, Math.min(height, msvh));
      this.indicator.setScrollerSize(msvw, msvh);
      this.indicator.updateBoundary();
      return setImmediate((function(_this) {
        return function() {
          return _this.updateScroll();
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
      this.indicator.setY(overlayY);
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
      this.transform(this.miniVisibleArea[0], this.translate(this.indicator.x, this.indicator.y));
      this.transform(this.miniWrapper[0], this.minimapScale + this.translate(this.indicator.scroller.x, this.indicator.scroller.y));
      return this.miniEditorView.scrollTop(this.indicator.scroller.y * -1);
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
        if (activeView instanceof EditorView) {
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
      top = this.indicator.computeFromCenterY(y / this.scaleY);
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
      return "translate3d(" + x + "px, " + y + "px, 0)";
    };

    MinimapView.prototype.transform = function(el, transform) {
      return el.style.webkitTransform = el.style.transform = transform;
    };

    return MinimapView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFHQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBd0IsT0FBQSxDQUFRLE1BQVIsQ0FBeEIsRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosRUFBVSxrQkFBQSxVQUFWLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFFBQVIsQ0FEUixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUlBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUpwQixDQUFBOztBQUFBLEVBS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBTG5CLENBQUE7O0FBQUEsRUFNQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVIsQ0FOVixDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGtDQUFBLENBQUE7O0FBQUEsSUFBQSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLFdBQWpCLENBQTZCLFdBQTdCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFFBQVEsQ0FBQyxXQUFULENBQXFCLFdBQXJCLENBREEsQ0FBQTs7QUFBQSxJQUdBLFdBQUMsQ0FBQSxnQkFBRCxDQUFrQixlQUFsQixFQUFtQyxlQUFuQyxFQUFvRCxrQkFBcEQsRUFBd0Usd0JBQXhFLEVBQWtHLHlCQUFsRyxFQUE2SCwwQkFBN0gsRUFBeUoseUJBQXpKLEVBQW9MLGNBQXBMLEVBQW9NLGlCQUFwTSxFQUF1TixzQkFBdk4sRUFBK087QUFBQSxNQUFBLFVBQUEsRUFBWSxnQkFBWjtLQUEvTyxDQUhBLENBQUE7O0FBQUEsSUFLQSxXQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFB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
//# sourceURL=/Users/daniel/.atom/packages/minimap/lib/minimap-view.coffee