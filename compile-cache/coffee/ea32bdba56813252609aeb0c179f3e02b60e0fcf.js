(function() {
  var createCommand, nameToCommand;

  module.exports = {
    activate: function() {
      atom.syntax.getGrammars().map(function(grammar) {
        return createCommand(grammar);
      });
      return atom.syntax.on('grammar-added', function(grammar) {
        return createCommand(grammar);
      });
    }
  };

  createCommand = function(grammar) {
    if ((grammar != null ? grammar.name : void 0) != null) {
      return atom.workspaceView.command("set-syntax:" + (nameToCommand(grammar.name)), function() {
        var _ref;
        return (_ref = atom.workspace.getActiveEditor()) != null ? _ref.setGrammar(grammar) : void 0;
      });
    }
  };

  nameToCommand = function(name) {
    return name != null ? name.toLowerCase().replace(/\s/g, '-') : void 0;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBSUE7QUFBQSxNQUFBLDRCQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQUEsQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixTQUFDLE9BQUQsR0FBQTtlQUFhLGFBQUEsQ0FBYyxPQUFkLEVBQWI7TUFBQSxDQUE5QixDQUFBLENBQUE7YUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQVosQ0FBZSxlQUFmLEVBQWdDLFNBQUMsT0FBRCxHQUFBO2VBQWEsYUFBQSxDQUFjLE9BQWQsRUFBYjtNQUFBLENBQWhDLEVBRlE7SUFBQSxDQUFWO0dBRkYsQ0FBQTs7QUFBQSxFQVNBLGFBQUEsR0FBZ0IsU0FBQyxPQUFELEdBQUE7QUFDZCxJQUFBLElBQUcsaURBQUg7YUFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTRCLGFBQUEsR0FBWSxDQUFBLGFBQUEsQ0FBYyxPQUFPLENBQUMsSUFBdEIsQ0FBQSxDQUF4QyxFQUF3RSxTQUFBLEdBQUE7QUFDdEUsWUFBQSxJQUFBO3VFQUFnQyxDQUFFLFVBQWxDLENBQTZDLE9BQTdDLFdBRHNFO01BQUEsQ0FBeEUsRUFERjtLQURjO0VBQUEsQ0FUaEIsQ0FBQTs7QUFBQSxFQW1CQSxhQUFBLEdBQWdCLFNBQUMsSUFBRCxHQUFBOzBCQUNkLElBQUksQ0FBRSxXQUFOLENBQUEsQ0FBbUIsQ0FBQyxPQUFwQixDQUE0QixLQUE1QixFQUFtQyxHQUFuQyxXQURjO0VBQUEsQ0FuQmhCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/set-syntax/lib/main.coffee