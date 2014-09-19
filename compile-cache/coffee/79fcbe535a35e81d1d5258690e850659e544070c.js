(function() {
  var EditorView, FindResultsView, MarkerView, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), EditorView = _ref.EditorView, View = _ref.View;

  MarkerView = require('./marker-view');

  module.exports = FindResultsView = (function(_super) {
    __extends(FindResultsView, _super);

    function FindResultsView() {
      this.markersUpdated = __bind(this.markersUpdated, this);
      return FindResultsView.__super__.constructor.apply(this, arguments);
    }

    FindResultsView.content = function() {
      return this.div({
        "class": 'search-results'
      });
    };

    FindResultsView.prototype.initialize = function(findModel) {
      this.findModel = findModel;
      this.markerViews = {};
      return this.subscribe(this.findModel, 'updated', this.markersUpdated);
    };

    FindResultsView.prototype.attach = function() {
      var editor, pane;
      pane = this.getPane();
      this.paneDestroySubscription = this.subscribe(pane, 'pane:before-item-destroyed', (function(_this) {
        return function() {
          if (pane != null) {
            return _this.detach();
          }
        };
      })(this));
      editor = this.getEditor();
      return editor != null ? editor.underlayer.append(this) : void 0;
    };

    FindResultsView.prototype.detach = function() {
      var _ref1;
      if ((_ref1 = this.paneDestroySubscription) != null) {
        _ref1.off();
      }
      return FindResultsView.__super__.detach.apply(this, arguments);
    };

    FindResultsView.prototype.beforeRemove = function() {
      return this.destroyAllViews();
    };

    FindResultsView.prototype.getEditor = function() {
      var activeView;
      activeView = atom.workspaceView.getActiveView();
      if ((activeView != null ? activeView.hasClass('editor') : void 0) && !(activeView != null ? activeView.hasClass('react') : void 0)) {
        return activeView;
      } else {
        return null;
      }
    };

    FindResultsView.prototype.getPane = function() {
      return atom.workspaceView.getActivePaneView();
    };

    FindResultsView.prototype.markersUpdated = function() {
      var editor, id, marker, markerView, markerViewsToRemoveById, markers, _i, _len, _results;
      editor = this.getEditor();
      markers = this.findModel.markers;
      if (editor == null) {
        return this.destroyAllViews();
      } else {
        markerViewsToRemoveById = _.clone(this.markerViews);
        for (_i = 0, _len = markers.length; _i < _len; _i++) {
          marker = markers[_i];
          if (this.markerViews[marker.id]) {
            delete markerViewsToRemoveById[marker.id];
          } else {
            markerView = new MarkerView({
              editor: editor,
              marker: marker
            });
            this.append(markerView.element);
            this.markerViews[marker.id] = markerView;
          }
        }
        _results = [];
        for (id in markerViewsToRemoveById) {
          markerView = markerViewsToRemoveById[id];
          delete this.markerViews[id];
          _results.push(markerView.remove());
        }
        return _results;
      }
    };

    FindResultsView.prototype.destroyAllViews = function() {
      this.empty();
      return this.markerViews = {};
    };

    return FindResultsView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFxQixPQUFBLENBQVEsTUFBUixDQUFyQixFQUFDLGtCQUFBLFVBQUQsRUFBYSxZQUFBLElBRGIsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUZiLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosc0NBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLGdCQUFQO09BQUwsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSw4QkFHQSxVQUFBLEdBQVksU0FBRSxTQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxZQUFBLFNBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLElBQUMsQ0FBQSxjQUFuQyxFQUZVO0lBQUEsQ0FIWixDQUFBOztBQUFBLDhCQU9BLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFHTixVQUFBLFlBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVAsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLHVCQUFELEdBQTJCLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQiw0QkFBakIsRUFBK0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUFH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
//# sourceURL=/Users/daniel/.atom/packages/minimap-find-and-replace/lib/find-results-view.coffee