(function() {
  var EditorView, MinimapView, Mixin, ViewManagement,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EditorView = require('atom').EditorView;

  Mixin = require('mixto');

  MinimapView = require('../minimap-view');

  module.exports = ViewManagement = (function(_super) {
    __extends(ViewManagement, _super);

    function ViewManagement() {
      return ViewManagement.__super__.constructor.apply(this, arguments);
    }

    ViewManagement.prototype.minimapViews = {};

    ViewManagement.prototype.updateAllViews = function() {
      var id, view, _ref, _results;
      _ref = this.minimapViews;
      _results = [];
      for (id in _ref) {
        view = _ref[id];
        _results.push(view.onScrollViewResized());
      }
      return _results;
    };

    ViewManagement.prototype.minimapForEditorView = function(editorView) {
      return this.minimapForEditor(editorView != null ? editorView.getEditor() : void 0);
    };

    ViewManagement.prototype.minimapForEditor = function(editor) {
      if (editor != null) {
        return this.minimapViews[editor.id];
      }
    };

    ViewManagement.prototype.eachMinimapView = function(iterator) {
      var createdCallback, id, minimapView, _ref;
      if (iterator == null) {
        return;
      }
      _ref = this.minimapViews;
      for (id in _ref) {
        minimapView = _ref[id];
        iterator({
          view: minimapView
        });
      }
      createdCallback = function(minimapView) {
        return iterator(minimapView);
      };
      this.on('minimap-view:created', createdCallback);
      return {
        off: (function(_this) {
          return function() {
            return _this.off('minimap-view:created', createdCallback);
          };
        })(this)
      };
    };

    ViewManagement.prototype.destroyViews = function() {
      var id, view, _ref, _ref1;
      _ref = this.minimapViews;
      for (id in _ref) {
        view = _ref[id];
        view.destroy();
      }
      if ((_ref1 = this.eachEditorViewSubscription) != null) {
        _ref1.off();
      }
      return this.minimapViews = {};
    };

    ViewManagement.prototype.createViews = function() {
      return this.eachEditorViewSubscription = atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          var editorId, paneView, view;
          editorId = editorView.editor.id;
          paneView = editorView.getPane();
          view = new MinimapView(editorView);
          _this.minimapViews[editorId] = view;
          _this.emit('minimap-view:created', {
            view: view
          });
          view.updateMinimapEditorView();
          return editorView.editor.on('destroyed', function() {
            view = _this.minimapViews[editorId];
            if (view != null) {
              _this.emit('minimap-view:will-be-destroyed', {
                view: view
              });
              view.destroy();
              delete _this.minimapViews[editorId];
              _this.emit('minimap-view:destroyed', {
                view: view
              });
              if (paneView.activeView instanceof EditorView) {
                return paneView.addClass('with-minimap');
              }
            }
          });
        };
      })(this));
    };

    return ViewManagement;

  })(Mixin);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBRFIsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxPQUFBLENBQVEsaUJBQVIsQ0FGZCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw2QkFBQSxZQUFBLEdBQWMsRUFBZCxDQUFBOztBQUFBLDZCQUdBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSx3QkFBQTtBQUFBO0FBQUE7V0FBQSxVQUFBO3dCQUFBO0FBQUEsc0JBQUEsSUFBSSxDQUFDLG1CQUFMLENBQUEsRUFBQSxDQUFBO0FBQUE7c0JBRGM7SUFBQSxDQUhoQixDQUFBOztBQUFBLDZCQVlBLG9CQUFBLEdBQXNCLFNBQUMsVUFBRCxHQUFBO2FBQ3BCLElBQUMsQ0FBQSxnQkFBRCxzQkFBa0IsVUFBVSxDQUFFLFNBQVosQ0FBQSxVQUFsQixFQURvQjtJQUFBLENBWnRCLENBQUE7O0FBQUEsNkJBcUJBLGdCQUFBLEdBQWtCLFNBQUMsTUFBRCxHQUFBO0FBQ2hCLE1BQUEsSUFBNEIsY0FBNUI7ZUFBQSxJQUFDLENBQUEsWUFBYSxDQUFBLE1BQU0sQ0FBQyxFQUFQLEVBQWQ7T0FEZ0I7SUFBQSxDQXJCbEIsQ0FBQTs7QUFBQSw2QkFnQ0EsZUFBQSxHQUFpQixTQUFDLFFBQUQsR0FBQTtBQUNmLFVBQUEsc0NBQUE7QUFBQSxNQUFBLElBQWMsZ0JBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUNBO0FBQUEsV0FBQSxVQUFBOytCQUFBO0FBQUEsUUFBQSxRQUFBLENBQVM7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
//# sourceURL=/Users/daniel/.atom/packages/minimap/lib/mixins/view-management.coffee