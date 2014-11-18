(function() {
  var ChangeCase, Commands, makeCommand, updateCurrentWord;

  ChangeCase = require('change-case');

  Commands = {
    camel: 'camelCase',
    constant: 'constantCase',
    dot: 'dotCase',
    lower: 'lowerCase',
    lowerFirst: 'lowerCaseFirst',
    param: 'paramCase',
    pascal: 'pascalCase',
    path: 'pathCase',
    sentence: 'sentenceCase',
    snake: 'snakeCase',
    "switch": 'switchCase',
    title: 'titleCase',
    upper: 'upperCase',
    upperFirst: 'upperCaseFirst'
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9EQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FDRTtBQUFBLElBQUEsS0FBQSxFQUFPLFdBQVA7QUFBQSxJQUNBLFFBQUEsRUFBVSxjQURWO0FBQUEsSUFFQSxHQUFBLEVBQUssU0FGTDtBQUFBLElBR0EsS0FBQSxFQUFPLFdBSFA7QUFBQSxJQUlBLFVBQUEsRUFBWSxnQkFKWjtBQUFBLElBS0EsS0FBQSxFQUFPLFdBTFA7QUFBQSxJQU1BLE1BQUEsRUFBUSxZQU5SO0FBQUEsSUFPQSxJQUFBLEVBQU0sVUFQTjtBQUFBLElBUUEsUUFBQSxFQUFVLGNBUlY7QUFBQSxJQVNBLEtBQUEsRUFBTyxXQVRQO0FBQUEsSUFVQSxRQUFBLEVBQVEsWUFWUjtBQUFBLElBV0EsS0FBQSxFQUFPLFdBWFA7QUFBQSxJQVlBLEtBQUEsRUFBTyxXQVpQO0FBQUEsSUFhQSxVQUFBLEVBQVksZ0JBYlo7R0FIRixDQUFBOztBQUFBLEVBa0JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsaUJBQUE7QUFBQTtXQUFBLG1CQUFBLEdBQUE7QUFDRSxzQkFBQSxXQUFBLENBQVksT0FBWixFQUFBLENBREY7QUFBQTtzQkFEUTtJQUFBLENBQVY7R0FuQkYsQ0FBQTs7QUFBQSxFQXVCQSxXQUFBLEdBQWMsU0FBQyxPQUFELEdBQUE7V0FDWixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTRCLGNBQUEsR0FBYSxPQUF6QyxFQUFxRCxTQUFBLEdBQUE7QUFDbkQsVUFBQSx5QkFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBYyxjQUFkO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUdBLE1BQUEsR0FBUyxRQUFTLENBQUEsT0FBQSxDQUhsQixDQUFBO0FBQUEsTUFJQSxTQUFBLEdBQVksVUFBVyxDQUFBLE1BQUEsQ0FKdkIsQ0FBQTthQU1BLGlCQUFBLENBQWtCLE1BQWxCLEVBQTBCLFNBQUMsSUFBRCxHQUFBO2VBQ3hCLFNBQUEsQ0FBVSxJQUFWLEVBRHdCO01BQUEsQ0FBMUIsRUFQbUQ7SUFBQSxDQUFyRCxFQURZO0VBQUEsQ0F2QmQsQ0FBQTs7QUFBQSxFQWtDQSxpQkFBQSxHQUFvQixTQUFDLE1BQUQsRUFBUyxRQUFULEdBQUE7QUFDbEIsUUFBQSx3QkFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBWixDQUFBO0FBQUEsSUFFQSxJQUFBLEdBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUZQLENBQUE7QUFLQSxJQUFBLElBQUcsSUFBSDtBQUNFLE1BQUEsT0FBQSxHQUFVLFFBQUEsQ0FBUyxJQUFULENBQVYsQ0FBQTthQUNBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLE9BQXJCLEVBRkY7S0FOa0I7RUFBQSxDQWxDcEIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/change-case/lib/change-case.coffee