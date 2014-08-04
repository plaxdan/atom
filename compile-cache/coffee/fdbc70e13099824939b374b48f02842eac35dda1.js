(function() {
  var EditorView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), View = _ref.View, EditorView = _ref.EditorView;

  module.exports = function() {
    var HighlightedAreaView, MinimapHighlightSelectedView, highlightSelected, highlightSelectedPackage, minimap, minimapPackage;
    highlightSelectedPackage = atom.packages.getLoadedPackage('highlight-selected');
    minimapPackage = atom.packages.getLoadedPackage('minimap');
    minimap = require(minimapPackage.path);
    highlightSelected = require(highlightSelectedPackage.path);
    HighlightedAreaView = require(highlightSelectedPackage.path + '/lib/highlighted-area-view');
    return MinimapHighlightSelectedView = (function(_super) {
      __extends(MinimapHighlightSelectedView, _super);

      function MinimapHighlightSelectedView() {
        this.onActiveItemChanged = __bind(this.onActiveItemChanged, this);
        MinimapHighlightSelectedView.__super__.constructor.apply(this, arguments);
        this.paneView = this.editorView.getPane();
        this.subscribe(this.paneView.model.$activeItem, this.onActiveItemChanged);
      }

      MinimapHighlightSelectedView.prototype.attach = function() {
        var minimapView;
        this.subscribe(this.editorView, "selection:changed", this.handleSelection);
        minimapView = this.getMinimap();
        if (minimapView != null) {
          minimapView.miniOverlayer.append(this);
          return this.adjustResults();
        }
      };

      MinimapHighlightSelectedView.prototype.detach = function() {
        MinimapHighlightSelectedView.__super__.detach.apply(this, arguments);
        return this.unsubscribe(this.editorView, "selection:changed", this.handleSelection);
      };

      MinimapHighlightSelectedView.prototype.adjustResults = function() {
        return this.css('-webkit-transform', "scale3d(" + (minimap.getCharWidthRatio()) + ",1,1)");
      };

      MinimapHighlightSelectedView.prototype.onActiveItemChanged = function(item) {
        if (item === this.activeItem) {
          return;
        }
        if (this.paneView.activeView === this.editorView) {
          return this.attach();
        } else {
          return this.detach();
        }
      };

      MinimapHighlightSelectedView.prototype.getMinimap = function() {
        if (this.editorView instanceof EditorView) {
          return minimap.minimapForEditorView(this.editorView);
        }
      };

      return MinimapHighlightSelectedView;

    })(HighlightedAreaView);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBcUIsT0FBQSxDQUFRLE1BQVIsQ0FBckIsRUFBQyxZQUFBLElBQUQsRUFBTyxrQkFBQSxVQUFQLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBLEdBQUE7QUFDZixRQUFBLHVIQUFBO0FBQUEsSUFBQSx3QkFBQSxHQUEyQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLG9CQUEvQixDQUEzQixDQUFBO0FBQUEsSUFDQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsU0FBL0IsQ0FEakIsQ0FBQTtBQUFBLElBR0EsT0FBQSxHQUFVLE9BQUEsQ0FBUyxjQUFjLENBQUMsSUFBeEIsQ0FIVixDQUFBO0FBQUEsSUFJQSxpQkFBQSxHQUFvQixPQUFBLENBQVMsd0JBQXdCLENBQUMsSUFBbEMsQ0FKcEIsQ0FBQTtBQUFBLElBS0EsbUJBQUEsR0FBc0IsT0FBQSxDQUFTLHdCQUF3QixDQUFDLElBQXpCLEdBQWdDLDRCQUF6QyxDQUx0QixDQUFBO1dBT007QUFDSixxREFBQSxDQUFBOztBQUFhLE1BQUEsc0NBQUEsR0FBQTtBQUNYLHlFQUFBLENBQUE7QUFBQSxRQUFBLCtEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBRFosQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUEzQixFQUF3QyxJQUFDLENBQUEsbUJBQXpDLENBRkEsQ0FEVztNQUFBLENBQWI7O0FBQUEsNkNBS0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFlBQUEsV0FBQTtBQUFBLFFBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3QixtQkFBeEIsRUFBNkMsSUFBQyxDQUFBLGVBQTlDLENBQUEsQ0FBQTtBQUFBLFFBRUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FGZCxDQUFBO0FBSUEsUUFBQSxJQUFHLG1CQUFIO0FBQ0UsVUFBQSxXQUFXLENBQUMsYUFBYSxDQUFDLE1BQTFCLENBQWlDLElBQWpDLENBQUEsQ0FBQTtpQkFDQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBRkY7U0FMTTtNQUFBLENBTFIsQ0FBQTs7QUFBQSw2Q0FjQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sUUFBQSwwREFBQSxTQUFBLENBQUEsQ0FBQTtlQUNBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLFVBQWQsRUFBMEIsbUJBQTFCLEVBQStDLElBQUMsQ0FBQSxlQUFoRCxFQUZNO01BQUEsQ0FkUixDQUFBOztBQUFBLDZDQWtCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2VBQ2IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxtQkFBTCxFQUEyQixVQUFBLEdBQVMsQ0FBQSxPQUFPLENBQUMsaUJBQVIsQ0FBQSxDQUFBLENBQVQsR0FBc0MsT0FBakUsRUFEYTtNQUFBLENBbEJmLENBQUE7O0FBQUEsNkNBcUJBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxHQUFBO0FBQ25CLFFBQUEsSUFBVSxJQUFBLEtBQVEsSUFBQyxDQUFBLFVBQW5CO0FBQUEsZ0JBQUEsQ0FBQTtTQUFBO0FBRUEsUUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsVUFBVixLQUF3QixJQUFDLENBQUEsVUFBNUI7aUJBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGO1NBQUEsTUFBQTtpQkFHRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBSEY7U0FIbUI7TUFBQSxDQXJCckIsQ0FBQTs7QUFBQSw2Q0E2QkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFFBQUEsSUFBRyxJQUFDLENBQUEsVUFBRCxZQUF1QixVQUExQjtBQUNFLGlCQUFPLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixJQUFDLENBQUEsVUFBOUIsQ0FBUCxDQURGO1NBRFU7TUFBQSxDQTdCWixDQUFBOzswQ0FBQTs7T0FEeUMscUJBUjVCO0VBQUEsQ0FGakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected-view.coffee