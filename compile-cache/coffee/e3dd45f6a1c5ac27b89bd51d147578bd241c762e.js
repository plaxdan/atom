(function() {
  var HighlightedAreaView, areas;

  HighlightedAreaView = require('./highlighted-area-view');

  areas = [];

  module.exports = {
    configDefaults: {
      onlyHighlightWholeWords: false,
      hideHighlightOnSelectedWord: false,
      ignoreCase: false
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBCQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsRUFEUixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSx1QkFBQSxFQUF5QixLQUF6QjtBQUFBLE1BQ0EsMkJBQUEsRUFBNkIsS0FEN0I7QUFBQSxNQUVBLFVBQUEsRUFBWSxLQUZaO0tBREY7QUFBQSxJQUtBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsU0FBQyxVQUFELEdBQUE7QUFDaEMsWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFBLEdBQVcsSUFBQSxtQkFBQSxDQUFvQixVQUFwQixDQUFYLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FEQSxDQUFBO2VBRUEsS0FBSyxDQUFDLElBQU4sR0FBYSxLQUhtQjtNQUFBLENBQWxDLEVBRFE7SUFBQSxDQUxWO0FBQUEsSUFXQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSx3QkFBQTtBQUFBO1dBQUEsNENBQUE7eUJBQUE7QUFDRSxzQkFBQSxJQUFJLENBQUMsT0FBTCxDQUFBLEVBQUEsQ0FERjtBQUFBO3NCQURVO0lBQUEsQ0FYWjtHQUpGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/highlight-selected/lib/highlight-selected.coffee