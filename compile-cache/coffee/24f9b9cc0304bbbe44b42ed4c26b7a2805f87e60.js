(function() {
  var ChangeCase, Commands, makeCommand;

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
      var converter, cursor, editor, method, newText, options, position, range, text, _i, _len, _ref, _results;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      method = Commands[command];
      converter = ChangeCase[method];
      options = {};
      options.wordRegex = /^[\t ]*$|[^\s\/\\\(\)"':,\.;<>~!@#\$%\^&\*\|\+=\[\]\{\}`\?]+/g;
      _ref = editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cursor = _ref[_i];
        position = cursor.getBufferPosition();
        range = cursor.getCurrentWordBufferRange(options);
        text = editor.getTextInBufferRange(range);
        newText = converter(text);
        _results.push(editor.setTextInBufferRange(range, newText));
      }
      return _results;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FDRTtBQUFBLElBQUEsS0FBQSxFQUFPLFdBQVA7QUFBQSxJQUNBLFFBQUEsRUFBVSxjQURWO0FBQUEsSUFFQSxHQUFBLEVBQUssU0FGTDtBQUFBLElBR0EsS0FBQSxFQUFPLFdBSFA7QUFBQSxJQUlBLFVBQUEsRUFBWSxnQkFKWjtBQUFBLElBS0EsS0FBQSxFQUFPLFdBTFA7QUFBQSxJQU1BLE1BQUEsRUFBUSxZQU5SO0FBQUEsSUFPQSxJQUFBLEVBQU0sVUFQTjtBQUFBLElBUUEsUUFBQSxFQUFVLGNBUlY7QUFBQSxJQVNBLEtBQUEsRUFBTyxXQVRQO0FBQUEsSUFVQSxRQUFBLEVBQVEsWUFWUjtBQUFBLElBV0EsS0FBQSxFQUFPLFdBWFA7QUFBQSxJQVlBLEtBQUEsRUFBTyxXQVpQO0FBQUEsSUFhQSxVQUFBLEVBQVksZ0JBYlo7R0FIRixDQUFBOztBQUFBLEVBa0JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsaUJBQUE7QUFBQTtXQUFBLG1CQUFBLEdBQUE7QUFDRSxzQkFBQSxXQUFBLENBQVksT0FBWixFQUFBLENBREY7QUFBQTtzQkFEUTtJQUFBLENBQVY7R0FuQkYsQ0FBQTs7QUFBQSxFQXVCQSxXQUFBLEdBQWMsU0FBQyxPQUFELEdBQUE7V0FDWixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTRCLGNBQUEsR0FBYSxPQUF6QyxFQUFxRCxTQUFBLEdBQUE7QUFDbkQsVUFBQSxvR0FBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBYyxjQUFkO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUdBLE1BQUEsR0FBUyxRQUFTLENBQUEsT0FBQSxDQUhsQixDQUFBO0FBQUEsTUFJQSxTQUFBLEdBQVksVUFBVyxDQUFBLE1BQUEsQ0FKdkIsQ0FBQTtBQUFBLE1BTUEsT0FBQSxHQUFVLEVBTlYsQ0FBQTtBQUFBLE1BT0EsT0FBTyxDQUFDLFNBQVIsR0FBb0IsK0RBUHBCLENBQUE7QUFRQTtBQUFBO1dBQUEsMkNBQUE7MEJBQUE7QUFDRSxRQUFBLFFBQUEsR0FBVyxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFYLENBQUE7QUFBQSxRQUVBLEtBQUEsR0FBUSxNQUFNLENBQUMseUJBQVAsQ0FBaUMsT0FBakMsQ0FGUixDQUFBO0FBQUEsUUFHQSxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCLENBSFAsQ0FBQTtBQUFBLFFBSUEsT0FBQSxHQUFVLFNBQUEsQ0FBVSxJQUFWLENBSlYsQ0FBQTtBQUFBLHNCQUtBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUE1QixFQUFtQyxPQUFuQyxFQUxBLENBREY7QUFBQTtzQkFUbUQ7SUFBQSxDQUFyRCxFQURZO0VBQUEsQ0F2QmQsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/change-case/lib/change-case.coffee