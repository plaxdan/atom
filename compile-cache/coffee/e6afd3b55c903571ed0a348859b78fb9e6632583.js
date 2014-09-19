(function() {
  var ChangeCase, Commands, makeCommand, updateCurrentWord;

  ChangeCase = require('change-case');

  Commands = {
    camel: 'camelCase',
    snake: 'snakeCase',
    dot: 'dotCase',
    param: 'paramCase',
    path: 'pathCase',
    constant: 'constantCase'
  };

  module.exports = {
    activate: function(state) {
      var command, _results;
      _results = [];
      for (command in Commands) {
        _results.push(makeCommand(command));
      }
      return _results;
    }
  };

  makeCommand = function(command) {
    return atom.workspaceView.command("change-case:" + command, function() {
      var converter, editor, method;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      method = Commands[command];
      converter = ChangeCase[method];
      return updateCurrentWord(editor, function(word) {
        return converter(word);
      });
    });
  };

  updateCurrentWord = function(editor, callback) {
    var newText, selection, text;
    selection = editor.getSelection();
    text = selection.getText();
    if (text) {
      newText = callback(text);
      return selection.insertText(newText);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9EQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FDRTtBQUFBLElBQUEsS0FBQSxFQUFPLFdBQVA7QUFBQSxJQUNBLEtBQUEsRUFBTyxXQURQO0FBQUEsSUFFQSxHQUFBLEVBQUssU0FGTDtBQUFBLElBR0EsS0FBQSxFQUFPLFdBSFA7QUFBQSxJQUlBLElBQUEsRUFBTSxVQUpOO0FBQUEsSUFLQSxRQUFBLEVBQVUsY0FMVjtHQUhGLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixVQUFBLGlCQUFBO0FBQUE7V0FBQSxtQkFBQSxHQUFBO0FBQ0Usc0JBQUEsV0FBQSxDQUFZLE9BQVosRUFBQSxDQURGO0FBQUE7c0JBRFE7SUFBQSxDQUFWO0dBWEYsQ0FBQTs7QUFBQSxFQWVBLFdBQUEsR0FBYyxTQUFDLE9BQUQsR0FBQTtXQUNaLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBNEIsY0FBQSxHQUFhLE9BQXpDLEVBQXFELFNBQUEsR0FBQTtBQUNuRCxVQUFBLHlCQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQUEsQ0FBVCxDQUFBO0FBQ0EsTUFBQSxJQUFjLGNBQWQ7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUFBLE1BR0EsTUFBQSxHQUFTLFFBQVMsQ0FBQSxPQUFBLENBSGxCLENBQUE7QUFBQSxNQUlBLFNBQUEsR0FBWSxVQUFXLENBQUEsTUFBQSxDQUp2QixDQUFBO2FBTUEsaUJBQUEsQ0FBa0IsTUFBbEIsRUFBMEIsU0FBQyxJQUFELEdBQUE7ZUFDeEIsU0FBQSxDQUFVLElBQVYsRUFEd0I7TUFBQSxDQUExQixFQVBtRDtJQUFBLENBQXJELEVBRFk7RUFBQSxDQWZkLENBQUE7O0FBQUEsRUEwQkEsaUJBQUEsR0FBb0IsU0FBQyxNQUFELEVBQVMsUUFBVCxHQUFBO0FBQ2xCLFFBQUEsd0JBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxNQUFNLENBQUMsWUFBUCxDQUFBLENBQVosQ0FBQTtBQUFBLElBRUEsSUFBQSxHQUFPLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FGUCxDQUFBO0FBS0EsSUFBQSxJQUFHLElBQUg7QUFDRSxNQUFBLE9BQUEsR0FBVSxRQUFBLENBQVMsSUFBVCxDQUFWLENBQUE7YUFDQSxTQUFTLENBQUMsVUFBVixDQUFxQixPQUFyQixFQUZGO0tBTmtCO0VBQUEsQ0ExQnBCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/change-case/lib/change-case.coffee