(function() {
  var MarkerView, View, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  View = require('atom').View;

  MarkerView = require('./marker-view');

  module.exports = function() {
    var HighlightedAreaView, MinimapHighlightSelectedView, highlightSelected, highlightSelectedPackage, minimap, minimapPackage;
    highlightSelectedPackage = atom.packages.getLoadedPackage('highlight-selected');
    minimapPackage = atom.packages.getLoadedPackage('minimap');
    minimap = require(minimapPackage.path);
    highlightSelected = require(highlightSelectedPackage.path);
    HighlightedAreaView = require(highlightSelectedPackage.path + '/lib/highlighted-area-view');
    return MinimapHighlightSelectedView = (function(_super) {
      __extends(MinimapHighlightSelectedView, _super);

      function MinimapHighlightSelectedView(editorView) {
        this.editorView = editorView;
        this.removeMarkers = __bind(this.removeMarkers, this);
        this.handleSelection = __bind(this.handleSelection, this);
        this.onActiveItemChanged = __bind(this.onActiveItemChanged, this);
        MinimapHighlightSelectedView.__super__.constructor.apply(this, arguments);
        this.paneView = this.editorView.editorView.getPane();
        this.subscribe(this.paneView.model.$activeItem, this.onActiveItemChanged);
      }

      MinimapHighlightSelectedView.prototype.attach = function() {
        this.subscribe(this.editorView.editorView, "selection:changed", this.handleSelection);
        if (this.editorView != null) {
          this.editorView.miniOverlayer.append(this);
          return this.css({
            fontSize: this.editorView.getLineHeight() + 'px'
          });
        }
      };

      MinimapHighlightSelectedView.prototype.detach = function() {
        MinimapHighlightSelectedView.__super__.detach.apply(this, arguments);
        return this.unsubscribe(this.editorView.editorView, "selection:changed", this.handleSelection);
      };

      MinimapHighlightSelectedView.prototype.destroy = function() {
        this.detach();
        return MinimapHighlightSelectedView.__super__.destroy.apply(this, arguments);
      };

      MinimapHighlightSelectedView.prototype.adjustResults = function() {
        return this.css('-webkit-transform', "scale3d(" + (minimap.getCharWidthRatio()) + ",1,1)");
      };

      MinimapHighlightSelectedView.prototype.onActiveItemChanged = function(item) {
        if (item === this.activeItem) {
          return;
        }
        if (this.paneView.activeView === this.editorView.editorView) {
          return this.attach();
        } else {
          return this.detach();
        }
      };

      MinimapHighlightSelectedView.prototype.handleSelection = function() {
        var editor, range, regex, regexSearch, result, text, view, _i, _len, _ref, _results;
        this.removeMarkers();
        if (!(editor = this.getActiveEditor())) {
          return;
        }
        if (editor.getSelection().isEmpty()) {
          return;
        }
        if (!this.isWordSelected(editor.getSelection())) {
          return;
        }
        this.selections = editor.getSelections();
        text = _.escapeRegExp(this.selections[0].getText());
        regex = new RegExp("\\W*\\w*\\b", 'gi');
        result = regex.exec(text);
        if (result == null) {
          return;
        }
        if (result.length === 0 || result.index !== 0 || result[0] !== result.input) {
          return;
        }
        range = [[0, 0], editor.getEofBufferPosition()];
        this.ranges = [];
        regexSearch = result[0];
        if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
          regexSearch = "\\b" + regexSearch + "\\b";
        }
        editor.scanInBufferRange(new RegExp(regexSearch, 'g'), range, (function(_this) {
          return function(result) {
            var prefix;
            if (prefix = result.match[1]) {
              result.range = result.range.translate([0, prefix.length], [0, 0]);
            }
            return _this.ranges.push(editor.markBufferRange(result.range).getScreenRange());
          };
        })(this));
        _ref = this.ranges;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          range = _ref[_i];
          if (!this.showHighlightOnSelectedWord(range, this.selections)) {
            view = new MarkerView(range, this, this.editorView);
            this.append(view.element);
            _results.push(this.views.push(view));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      MinimapHighlightSelectedView.prototype.removeMarkers = function() {
        var view, _i, _len, _ref;
        if (this.views == null) {
          return;
        }
        if (this.views.length === 0) {
          return;
        }
        _ref = this.views;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          view = _ref[_i];
          view.destroy();
          view = null;
        }
        return this.views = [];
      };

      return MinimapHighlightSelectedView;

    })(HighlightedAreaView);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFERCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFFBQUEsdUhBQUE7QUFBQSxJQUFBLHdCQUFBLEdBQTJCLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0Isb0JBQS9CLENBQTNCLENBQUE7QUFBQSxJQUNBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixTQUEvQixDQURqQixDQUFBO0FBQUEsSUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFTLGNBQWMsQ0FBQyxJQUF4QixDQUhWLENBQUE7QUFBQSxJQUlBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUyx3QkFBd0IsQ0FBQyxJQUFsQyxDQUpwQixDQUFBO0FBQUEsSUFLQSxtQkFBQSxHQUFzQixPQUFBLENBQVMsd0JBQXdCLENBQUMsSUFBekIsR0FBZ0MsNEJBQXpDLENBTHRCLENBQUE7V0FPTTtBQUNKLHFEQUFBLENBQUE7O0FBQWEsTUFBQSxzQ0FBRSxVQUFGLEdBQUE7QUFDWCxRQURZLElBQUMsQ0FBQSxhQUFBLFVBQ2IsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEseUVBQUEsQ0FBQTtBQUFBLFFBQUEsK0RBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBdkIs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
//# sourceURL=/Users/daniel/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected-view.coffee