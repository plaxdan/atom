(function() {
  var $, fs,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = require('atom').$;

  fs = require('fs');

  module.exports = function() {
    var FindResultsView, MinimapFindResultsView, findAndReplace, minimap, minimapInstance;
    findAndReplace = atom.packages.getLoadedPackage('find-and-replace');
    minimap = atom.packages.getLoadedPackage('minimap');
    minimapInstance = require(minimap.path);
    FindResultsView = require('./find-results-view');
    return MinimapFindResultsView = (function(_super) {
      __extends(MinimapFindResultsView, _super);

      function MinimapFindResultsView() {
        return MinimapFindResultsView.__super__.constructor.apply(this, arguments);
      }

      MinimapFindResultsView.prototype.attach = function() {
        minimap = this.getMinimap();
        if (minimap != null) {
          minimap.miniOverlayer.append(this);
          return this.patchMarkers();
        }
      };

      MinimapFindResultsView.prototype.getEditor = function() {
        var activeView;
        activeView = atom.workspaceView.getActiveView();
        if (activeView != null ? activeView.hasClass('editor') : void 0) {
          return activeView;
        } else {
          return null;
        }
      };

      MinimapFindResultsView.prototype.getMinimap = function() {
        var editorView;
        editorView = this.getEditor();
        if (editorView != null) {
          return minimapInstance.minimapForEditorView(editorView);
        }
      };

      MinimapFindResultsView.prototype.markersUpdated = function(markers) {
        minimap = this.getMinimap();
        MinimapFindResultsView.__super__.markersUpdated.call(this, markers);
        return this.patchMarkers();
      };

      MinimapFindResultsView.prototype.patchMarkers = function() {
        var k, marker, _ref, _results;
        _ref = this.markerViews;
        _results = [];
        for (k in _ref) {
          marker = _ref[k];
          marker.intersectsRenderedScreenRows = function(range) {
            if (minimap == null) {
              return false;
            }
            return range.intersectsRowRange(minimap.miniEditorView.firstRenderedScreenRow, minimap.miniEditorView.lastRenderedScreenRow);
          };
          marker.editor = minimap;
          marker.updateNeeded = true;
          _results.push(marker.updateDisplay());
        }
        return _results;
      };

      return MinimapFindResultsView;

    })(FindResultsView);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLEtBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLElBQUssT0FBQSxDQUFRLE1BQVIsRUFBTCxDQUFELENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsUUFBQSxpRkFBQTtBQUFBLElBQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLGtCQUEvQixDQUFqQixDQUFBO0FBQUEsSUFDQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixTQUEvQixDQURWLENBQUE7QUFBQSxJQUdBLGVBQUEsR0FBa0IsT0FBQSxDQUFTLE9BQU8sQ0FBQyxJQUFqQixDQUhsQixDQUFBO0FBQUEsSUFJQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUixDQUpsQixDQUFBO1dBTU07QUFDSiwrQ0FBQSxDQUFBOzs7O09BQUE7O0FBQUEsdUNBQUEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFFBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBVixDQUFBO0FBRUEsUUFBQSxJQUFHLGVBQUg7QUFDRSxVQUFBLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBdEIsQ0FBNkIsSUFBN0IsQ0FBQSxDQUFBO2lCQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFGRjtTQUhNO01BQUEsQ0FBUixDQUFBOztBQUFBLHVDQU9BLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxZQUFBLFVBQUE7QUFBQSxRQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQW5CLENBQUEsQ0FBYixDQUFBO0FBQ0EsUUFBQSx5QkFBRyxVQUFVLENBQUUsUUFBWixDQUFxQixRQUFyQixVQUFIO2lCQUF1QyxXQUF2QztTQUFBLE1BQUE7aUJBQXVELEtBQXZEO1NBRlM7TUFBQSxDQVBYLENBQUE7O0FBQUEsdUNBV0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFlBQUEsVUFBQTtBQUFBLFFBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBYixDQUFBO0FBQ0EsUUFBQSxJQUEyRCxrQkFBM0Q7QUFBQSxpQkFBTyxlQUFlLENBQUMsb0JBQWhCLENBQXFDLFVBQXJDLENBQVAsQ0FBQTtTQUZVO01BQUEsQ0FYWixDQUFBOztBQUFBLHVDQW1CQSxjQUFBLEdBQWdCLFNBQUMsT0FBRCxHQUFBO0FBQ2QsUUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFWLENBQUE7QUFBQSxRQUNBLDJEQUFNLE9BQU4sQ0FEQSxDQUFBO2VBRUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUhjO01BQUEsQ0FuQmhCLENBQUE7O0FBQUEsdUNBd0JBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixZQUFBLHlCQUFBO0FBQUE7QUFBQTthQUFBLFNBQUE7MkJBQUE7QUFDRSxVQUFBLE1BQU0sQ0FBQyw0QkFBUCxHQUFzQyxTQUFDLEtBQUQsR0FBQTtBQUNwQyxZQUFBLElBQW9CLGVBQXBCO0FBQUEscUJBQU8sS0FBUCxDQUFBO2FBQUE7bUJBQ0EsS0FBSyxDQUFDLGtCQUFOLENBQXlCLE9BQU8sQ0FBQyxjQUFjLENBQUMsc0JBQWhELEVBQXdFLE9BQU8sQ0FBQyxjQUFjLENBQUMscUJBQS9GLEVBRm9DO1VBQUEsQ0FBdEMsQ0FBQTtBQUFBLFVBSUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsT0FKaEIsQ0FBQTtBQUFBLFVBS0EsTUFBTSxDQUFDLFlBQVAsR0FBc0IsSUFMdEIsQ0FBQTtBQUFBLHdCQU1BLE1BQU0sQ0FBQyxhQUFQLENBQUEsRUFOQSxDQURGO0FBQUE7d0JBRFk7TUFBQSxDQXhCZCxDQUFBOztvQ0FBQTs7T0FEbUMsaUJBUHRCO0VBQUEsQ0FSakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/minimap-find-and-replace/lib/minimap-find-results-view.coffee