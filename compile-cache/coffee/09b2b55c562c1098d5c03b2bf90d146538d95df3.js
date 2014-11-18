(function() {
  var StatusView, git, gitInit;

  git = require('../git');

  StatusView = require('../views/status-view');

  gitInit = function() {
    return git.cmd({
      args: ['init'],
      stdout: function(data) {
        new StatusView({
          type: 'success',
          message: data
        });
        return atom.project.setPath(atom.project.getPath());
      }
    });
  };

  module.exports = gitInit;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLFNBQUEsR0FBQTtXQUNSLEdBQUcsQ0FBQyxHQUFKLENBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxDQUFDLE1BQUQsQ0FBTjtBQUFBLE1BQ0EsTUFBQSxFQUFRLFNBQUMsSUFBRCxHQUFBO0FBQ04sUUFBSSxJQUFBLFVBQUEsQ0FBVztBQUFBLFVBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxVQUFpQixPQUFBLEVBQVMsSUFBMUI7U0FBWCxDQUFKLENBQUE7ZUFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBcUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FBckIsRUFGTTtNQUFBLENBRFI7S0FERixFQURRO0VBQUEsQ0FIVixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsT0FWakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-init.coffee