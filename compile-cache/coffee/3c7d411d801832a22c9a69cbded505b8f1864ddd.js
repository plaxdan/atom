(function() {
  var BufferedProcess, OutputView, git, gitPull;

  BufferedProcess = require('atom').BufferedProcess;

  OutputView = require('../views/output-view');

  git = require('../git');

  gitPull = function() {
    var view;
    view = new OutputView();
    return git.cmd({
      args: ['pull'],
      stdout: function(data) {
        return view.addLine(data.toString());
      },
      stderr: function(data) {
        return view.addLine(data.toString());
      },
      exit: function(code) {
        return view.finish();
      }
    });
  };

  module.exports = gitPull;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBOztBQUFBLEVBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSLEVBQW5CLGVBQUQsQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FEYixDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUlBLE9BQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLFVBQUEsQ0FBQSxDQUFYLENBQUE7V0FDQSxHQUFHLENBQUMsR0FBSixDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sQ0FBQyxNQUFELENBQU47QUFBQSxNQUNBLE1BQUEsRUFBUSxTQUFDLElBQUQsR0FBQTtlQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFiLEVBQVY7TUFBQSxDQURSO0FBQUEsTUFFQSxNQUFBLEVBQVEsU0FBQyxJQUFELEdBQUE7ZUFBVSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBYixFQUFWO01BQUEsQ0FGUjtBQUFBLE1BR0EsSUFBQSxFQUFNLFNBQUMsSUFBRCxHQUFBO2VBQVUsSUFBSSxDQUFDLE1BQUwsQ0FBQSxFQUFWO01BQUEsQ0FITjtLQURGLEVBRlE7RUFBQSxDQUpWLENBQUE7O0FBQUEsRUFZQSxNQUFNLENBQUMsT0FBUCxHQUFpQixPQVpqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-pull.coffee