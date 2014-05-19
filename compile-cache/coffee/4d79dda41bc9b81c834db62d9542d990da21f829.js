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

    ViewManagement.prototype.eachMinimapView = function(callback) {
      var createdCallback, id, minimapView, _ref;
      _ref = this.minimapViews;
      for (id in _ref) {
        minimapView = _ref[id];
        callback({
          view: minimapView
        });
      }
      createdCallback = function(minimapView) {
        return callback(minimapView);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBRFIsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxPQUFBLENBQVEsaUJBQVIsQ0FGZCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw2QkFBQSxZQUFBLEdBQWMsRUFBZCxDQUFBOztBQUFBLDZCQUdBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSx3QkFBQTtBQUFBO0FBQUE7V0FBQSxVQUFBO3dCQUFBO0FBQUEsc0JBQUEsSUFBSSxDQUFDLG1CQUFMLENBQUEsRUFBQSxDQUFBO0FBQUE7c0JBRGM7SUFBQSxDQUhoQixDQUFBOztBQUFBLDZCQWFBLG9CQUFBLEdBQXNCLFNBQUMsVUFBRCxHQUFBO2FBQ3BCLElBQUMsQ0FBQSxnQkFBRCxzQkFBa0IsVUFBVSxDQUFFLFNBQVosQ0FBQSxVQUFsQixFQURvQjtJQUFBLENBYnRCLENBQUE7O0FBQUEsNkJBZ0JBLGdCQUFBLEdBQWtCLFNBQUMsTUFBRCxHQUFBO0FBQ2hCLE1BQUEsSUFBNEIsY0FBNUI7ZUFBQSxJQUFDLENBQUEsWUFBYSxDQUFBLE1BQU0sQ0FBQyxFQUFQLEVBQWQ7T0FEZ0I7SUFBQSxDQWhCbEIsQ0FBQTs7QUFBQSw2QkFvQkEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFVBQUEscUJBQUE7QUFBQTtBQUFBLFdBQUEsVUFBQTt3QkFBQTtBQUFBLFFBQUEsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFBLENBQUE7QUFBQSxPQUFBOzthQUMyQixDQUFFLEdBQTdC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
//# sourceURL=/Users/daniel/.atom/packages/minimap/lib/mixins/view-management.coffee