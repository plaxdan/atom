(function() {
  module.exports = {
    activate: function() {
      atom.workspaceView.command("url-encode:encode", (function(_this) {
        return function() {
          return _this.transfromSel(encodeURIComponent);
        };
      })(this));
      return atom.workspaceView.command("url-encode:decode", (function(_this) {
        return function() {
          return _this.transfromSel(decodeURIComponent);
        };
      })(this));
    },
    transfromSel: function(t) {
      var editor, editorView, sel, selections, _i, _len, _results;
      editorView = atom.workspaceView.getActiveView();
      editor = editorView != null ? editorView.getEditor() : void 0;
      if ((editor != null)) {
        selections = editor.getSelections();
        _results = [];
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          sel = selections[_i];
          _results.push(sel.insertText(t(sel.getText()), {
            "select": true
          }));
        }
        return _results;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsbUJBQTNCLEVBQWdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBYyxrQkFBZCxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEQsQ0FBQSxDQUFBO2FBQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixtQkFBM0IsRUFBZ0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFjLGtCQUFkLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRCxFQUZRO0lBQUEsQ0FBVjtBQUFBLElBS0EsWUFBQSxFQUFjLFNBQUMsQ0FBRCxHQUFBO0FBRVosVUFBQSx1REFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBbkIsQ0FBQSxDQUFiLENBQUE7QUFBQSxNQUNBLE1BQUEsd0JBQVMsVUFBVSxDQUFFLFNBQVosQ0FBQSxVQURULENBQUE7QUFFQSxNQUFBLElBQUcsQ0FBQyxjQUFELENBQUg7QUFDRSxRQUFBLFVBQUEsR0FBYSxNQUFNLENBQUMsYUFBUCxDQUFBLENBQWIsQ0FBQTtBQUNBO2FBQUEsaURBQUE7K0JBQUE7QUFBQSx3QkFBQSxHQUFHLENBQUMsVUFBSixDQUFlLENBQUEsQ0FBRSxHQUFHLENBQUMsT0FBSixDQUFBLENBQUYsQ0FBZixFQUFpQztBQUFBLFlBQUUsUUFBQSxFQUFVLElBQVo7V0FBakMsRUFBQSxDQUFBO0FBQUE7d0JBRkY7T0FKWTtJQUFBLENBTGQ7R0FERixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/url-encode/lib/url-encode.coffee