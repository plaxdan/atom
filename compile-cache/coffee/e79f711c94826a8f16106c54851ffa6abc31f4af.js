(function() {
  var HighlightedAreaView, areas;

  HighlightedAreaView = require('./highlighted-area-view');

  areas = [];

  module.exports = {
    configDefaults: {
      onlyHighlightWholeWords: false,
      hideHighlightOnSelectedWord: false,
      ignoreCase: false,
      lightTheme: false,
      highlightBackgorund: false
    },
    activate: function(state) {
      return atom.workspaceView.eachEditorView(function(editorView) {
        var area;
        area = new HighlightedAreaView(editorView);
        area.attach();
        return areas.push = area;
      });
    },
    deactivate: function() {
      var area, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = areas.length; _i < _len; _i++) {
        area = areas[_i];
        _results.push(area.destroy());
      }
      return _results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBCQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsRUFEUixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSx1QkFBQSxFQUF5QixLQUF6QjtBQUFBLE1BQ0EsMkJBQUEsRUFBNkIsS0FEN0I7QUFBQSxNQUVBLFVBQUEsRUFBWSxLQUZaO0FBQUEsTUFHQSxVQUFBLEVBQVksS0FIWjtBQUFBLE1BSUEsbUJBQUEsRUFBcUIsS0FKckI7S0FERjtBQUFBLElBT0EsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFuQixDQUFrQyxTQUFDLFVBQUQsR0FBQTtBQUNoQyxZQUFBLElBQUE7QUFBQSxRQUFBLElBQUEsR0FBVyxJQUFBLG1CQUFBLENBQW9CLFVBQXBCLENBQVgsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQURBLENBQUE7ZUFFQSxLQUFLLENBQUMsSUFBTixHQUFhLEtBSG1CO01BQUEsQ0FBbEMsRUFEUTtJQUFBLENBUFY7QUFBQSxJQWFBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixVQUFBLHdCQUFBO0FBQUE7V0FBQSw0Q0FBQTt5QkFBQTtBQUNFLHNCQUFBLElBQUksQ0FBQyxPQUFMLENBQUEsRUFBQSxDQURGO0FBQUE7c0JBRFU7SUFBQSxDQWJaO0dBSkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/highlight-selected/lib/highlight-selected.coffee