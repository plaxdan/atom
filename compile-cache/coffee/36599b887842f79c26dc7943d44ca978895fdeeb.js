(function() {
  var View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = function() {
    var HighlightedAreaView, MinimapHighlightSelectedView, highlightSelected, highlightSelectedPackage, minimap, minimapPackage;
    highlightSelectedPackage = atom.packages.getLoadedPackage('highlight-selected');
    minimapPackage = atom.packages.getLoadedPackage('minimap');
    minimap = require(minimapPackage.path);
    highlightSelected = require(highlightSelectedPackage.path);
    HighlightedAreaView = require(highlightSelectedPackage.path + '/lib/highlighted-area-view');
    return MinimapHighlightSelectedView = (function(_super) {
      __extends(MinimapHighlightSelectedView, _super);

      function MinimapHighlightSelectedView(minimap) {
        this.minimap = minimap;
        MinimapHighlightSelectedView.__super__.constructor.apply(this, arguments);
      }

      MinimapHighlightSelectedView.prototype.getActiveEditor = function() {
        return this.minimap.getActiveMinimap();
      };

      return MinimapHighlightSelectedView;

    })(HighlightedAreaView);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLE1BQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBLEdBQUE7QUFDZixRQUFBLHVIQUFBO0FBQUEsSUFBQSx3QkFBQSxHQUEyQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLG9CQUEvQixDQUEzQixDQUFBO0FBQUEsSUFDQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsU0FBL0IsQ0FEakIsQ0FBQTtBQUFBLElBR0EsT0FBQSxHQUFVLE9BQUEsQ0FBUyxjQUFjLENBQUMsSUFBeEIsQ0FIVixDQUFBO0FBQUEsSUFJQSxpQkFBQSxHQUFvQixPQUFBLENBQVMsd0JBQXdCLENBQUMsSUFBbEMsQ0FKcEIsQ0FBQTtBQUFBLElBS0EsbUJBQUEsR0FBc0IsT0FBQSxDQUFTLHdCQUF3QixDQUFDLElBQXpCLEdBQWdDLDRCQUF6QyxDQUx0QixDQUFBO1dBT007QUFDSixxREFBQSxDQUFBOztBQUFhLE1BQUEsc0NBQUUsT0FBRixHQUFBO0FBQ1gsUUFEWSxJQUFDLENBQUEsVUFBQSxPQUNiLENBQUE7QUFBQSxRQUFBLCtEQUFBLFNBQUEsQ0FBQSxDQURXO01BQUEsQ0FBYjs7QUFBQSw2Q0FHQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtlQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQVQsQ0FBQSxFQUFIO01BQUEsQ0FIakIsQ0FBQTs7MENBQUE7O09BRHlDLHFCQVI1QjtFQUFBLENBRmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected-view.coffee