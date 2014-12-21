(function() {
  var MinimapSelectionView;

  MinimapSelectionView = require('./minimap-selection-view');

  module.exports = {
    active: false,
    views: {},
    activate: function(state) {
      try {
        return atom.packages.activatePackage('minimap').then((function(_this) {
          return function(minimapPackage) {
            _this.minimap = require(minimapPackage.path);
            if (!_this.minimap.versionMatch('3.x')) {
              return _this.deactivate();
            }
            return _this.minimap.registerPlugin('selection', _this);
          };
        })(this));
      } catch (_error) {
        return this.deactivate;
      }
    },
    deactivate: function() {
      this.minimap.unregisterPlugin('selection');
      return this.minimap = null;
    },
    isActive: function() {
      return this.active;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      this.active = true;
      return this.subscription = this.minimap.observeMinimaps((function(_this) {
        return function(_arg) {
          var selectionView, view;
          view = _arg.view;
          selectionView = new MinimapSelectionView(view);
          selectionView.attach();
          return _this.views[view.editor.id] = selectionView;
        };
      })(this));
    },
    deactivatePlugin: function() {
      var id, view, _ref;
      _ref = this.views;
      for (id in _ref) {
        view = _ref[id];
        view.destroy();
      }
      if (!this.active) {
        return;
      }
      this.active = false;
      this.views = {};
      return this.subscription.off();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDBCQUFSLENBQXZCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxNQUFBLEVBQVEsS0FBUjtBQUFBLElBQ0EsS0FBQSxFQUFPLEVBRFA7QUFBQSxJQUdBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSO2VBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFNBQTlCLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLGNBQUQsR0FBQTtBQUM1QyxZQUFBLEtBQUMsQ0FBQSxPQUFELEdBQVcsT0FBQSxDQUFRLGNBQWMsQ0FBQyxJQUF2QixDQUFYLENBQUE7QUFDQSxZQUFBLElBQUEsQ0FBQSxLQUE2QixDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLEtBQXRCLENBQTVCO0FBQUEscUJBQU8sS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFQLENBQUE7YUFEQTttQkFHQSxLQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0IsV0FBeEIsRUFBcUMsS0FBckMsRUFKNEM7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QyxFQURGO09BQUEsY0FBQTtlQU9FLElBQUMsQ0FBQSxXQVBIO09BRFE7SUFBQSxDQUhWO0FBQUEsSUFhQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULENBQTBCLFdBQTFCLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FGRDtJQUFBLENBYlo7QUFBQSxJQWlCQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLE9BQUo7SUFBQSxDQWpCVjtBQUFBLElBa0JBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFEVixDQUFBO2FBR0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFULENBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUN2QyxjQUFBLG1CQUFBO0FBQUEsVUFEeUMsT0FBRCxLQUFDLElBQ3pDLENBQUE7QUFBQSxVQUFBLGFBQUEsR0FBb0IsSUFBQSxvQkFBQSxDQUFxQixJQUFyQixDQUFwQixDQUFBO0FBQUEsVUFDQSxhQUFhLENBQUMsTUFBZCxDQUFBLENBREEsQ0FBQTtpQkFHQSxLQUFDLENBQUEsS0FBTSxDQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBWixDQUFQLEdBQXlCLGNBSmM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixFQUpGO0lBQUEsQ0FsQmhCO0FBQUEsSUE0QkEsZ0JBQUEsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsY0FBQTtBQUFBO0FBQUEsV0FBQSxVQUFBO3dCQUFBO0FBQUEsUUFBQSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQUEsQ0FBQTtBQUFBLE9BQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsTUFBZjtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBRlYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUhULENBQUE7YUFLQSxJQUFDLENBQUEsWUFBWSxDQUFDLEdBQWQsQ0FBQSxFQU5nQjtJQUFBLENBNUJsQjtHQUpGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/minimap-selection/lib/minimap-selection.coffee