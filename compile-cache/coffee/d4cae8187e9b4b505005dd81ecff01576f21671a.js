(function() {
  var HighlightedAreaView;

  HighlightedAreaView = require('./highlighted-area-view');

  module.exports = {
    configDefaults: {
      onlyHighlightWholeWords: false,
      hideHighlightOnSelectedWord: false,
      ignoreCase: false,
      lightTheme: false,
      highlightBackground: false
    },
    areaView: null,
    activate: function(state) {
      this.areaView = new HighlightedAreaView();
      return this.areaView.attach();
    },
    deactivate: function() {
      this.areaView.destroy();
      return this.areaView = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxjQUFBLEVBQ0U7QUFBQSxNQUFBLHVCQUFBLEVBQXlCLEtBQXpCO0FBQUEsTUFDQSwyQkFBQSxFQUE2QixLQUQ3QjtBQUFBLE1BRUEsVUFBQSxFQUFZLEtBRlo7QUFBQSxNQUdBLFVBQUEsRUFBWSxLQUhaO0FBQUEsTUFJQSxtQkFBQSxFQUFxQixLQUpyQjtLQURGO0FBQUEsSUFNQSxRQUFBLEVBQVUsSUFOVjtBQUFBLElBUUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLG1CQUFBLENBQUEsQ0FBaEIsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFBLEVBRlE7SUFBQSxDQVJWO0FBQUEsSUFZQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBRkY7SUFBQSxDQVpaO0dBSEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/highlight-selected/lib/highlight-selected.coffee