(function() {
  var CompositeDisposable,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  module.exports = function() {
    var MinimapFindResultsView, findAndReplace, minimap, minimapInstance;
    findAndReplace = atom.packages.getLoadedPackage('find-and-replace');
    minimap = atom.packages.getLoadedPackage('minimap');
    minimapInstance = require(minimap.path);
    return MinimapFindResultsView = (function() {
      function MinimapFindResultsView(model) {
        this.model = model;
        this.markersUpdated = __bind(this.markersUpdated, this);
        this.subscriptions = new CompositeDisposable;
        this.subscriptions.add(this.model.onDidUpdate(this.markersUpdated));
        this.decorationsByMarkerId = {};
      }

      MinimapFindResultsView.prototype.destroy = function() {
        this.subscriptions.dispose();
        this.destroyDecorations();
        this.decorationsByMarkerId = {};
        return this.markers = null;
      };

      MinimapFindResultsView.prototype.destroyDecorations = function() {
        var decoration, id, _ref, _results;
        _ref = this.decorationsByMarkerId;
        _results = [];
        for (id in _ref) {
          decoration = _ref[id];
          _results.push(decoration.destroy());
        }
        return _results;
      };

      MinimapFindResultsView.prototype.getMinimap = function() {
        return minimapInstance.getActiveMinimap();
      };

      MinimapFindResultsView.prototype.markersUpdated = function(markers) {
        var decoration, marker, _i, _len, _results;
        minimap = this.getMinimap();
        if (minimap == null) {
          return;
        }
        _results = [];
        for (_i = 0, _len = markers.length; _i < _len; _i++) {
          marker = markers[_i];
          decoration = minimap.decorateMarker(marker, {
            type: 'highlight',
            scope: '.minimap .search-result'
          });
          _results.push(this.decorationsByMarkerId[marker.id] = decoration);
        }
        return _results;
      };

      MinimapFindResultsView.prototype.activePaneItemChanged = function() {
        this.destroyDecorations();
        return setImmediate((function(_this) {
          return function() {
            if (_this.markers != null) {
              return _this.markersUpdated(_this.model.markers);
            }
          };
        })(this));
      };

      return MinimapFindResultsView;

    })();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFFBQUEsZ0VBQUE7QUFBQSxJQUFBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixrQkFBL0IsQ0FBakIsQ0FBQTtBQUFBLElBQ0EsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsU0FBL0IsQ0FEVixDQUFBO0FBQUEsSUFHQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUyxPQUFPLENBQUMsSUFBakIsQ0FIbEIsQ0FBQTtXQUtNO0FBRVMsTUFBQSxnQ0FBRSxLQUFGLEdBQUE7QUFDWCxRQURZLElBQUMsQ0FBQSxRQUFBLEtBQ2IsQ0FBQTtBQUFBLCtEQUFBLENBQUE7QUFBQSxRQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxLQUFLLENBQUMsV0FBUCxDQUFtQixJQUFDLENBQUEsY0FBcEIsQ0FBbkIsQ0FEQSxDQUFBO0FBQUEsUUFHQSxJQUFDLENBQUEscUJBQUQsR0FBeUIsRUFIekIsQ0FEVztNQUFBLENBQWI7O0FBQUEsdUNBTUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxRQUVBLElBQUMsQ0FBQSxxQkFBRCxHQUF5QixFQUZ6QixDQUFBO2VBR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUpKO01BQUEsQ0FOVCxDQUFBOztBQUFBLHVDQVlBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixZQUFBLDhCQUFBO0FBQUE7QUFBQTthQUFBLFVBQUE7Z0NBQUE7QUFBQSx3QkFBQSxVQUFVLENBQUMsT0FBWCxDQUFBLEVBQUEsQ0FBQTtBQUFBO3dCQURrQjtNQUFBLENBWnBCLENBQUE7O0FBQUEsdUNBZUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtlQUFHLGVBQWUsQ0FBQyxnQkFBaEIsQ0FBQSxFQUFIO01BQUEsQ0FmWixDQUFBOztBQUFBLHVDQWlCQSxjQUFBLEdBQWdCLFNBQUMsT0FBRCxHQUFBO0FBQ2QsWUFBQSxzQ0FBQTtBQUFBLFFBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBVixDQUFBO0FBQ0EsUUFBQSxJQUFjLGVBQWQ7QUFBQSxnQkFBQSxDQUFBO1NBREE7QUFHQTthQUFBLDhDQUFBOytCQUFBO0FBQ0UsVUFBQSxVQUFBLEdBQWEsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsTUFBdkIsRUFBK0I7QUFBQSxZQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsWUFBbUIsS0FBQSxFQUFPLHlCQUExQjtXQUEvQixDQUFiLENBQUE7QUFBQSx3QkFDQSxJQUFDLENBQUEscUJBQXNCLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBdkIsR0FBb0MsV0FEcEMsQ0FERjtBQUFBO3dCQUpjO01BQUEsQ0FqQmhCLENBQUE7O0FBQUEsdUNBeUJBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUNyQixRQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBQUEsQ0FBQTtlQUNBLFlBQUEsQ0FBYSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUFHLFlBQUEsSUFBbUMscUJBQW5DO3FCQUFBLEtBQUMsQ0FBQSxjQUFELENBQWdCLEtBQUMsQ0FBQSxLQUFLLENBQUMsT0FBdkIsRUFBQTthQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixFQUZxQjtNQUFBLENBekJ2QixDQUFBOztvQ0FBQTs7U0FSYTtFQUFBLENBRmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/minimap-find-and-replace/lib/minimap-find-results-view.coffee