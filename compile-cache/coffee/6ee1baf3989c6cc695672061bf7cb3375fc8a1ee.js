(function() {
  var StatusView, git, gitCheckoutAllFiles;

  git = require('../git');

  StatusView = require('../views/status-view');

  gitCheckoutAllFiles = function() {
    return git.cmd({
      args: ['checkout', '-f'],
      stdout: function(data) {
        var _ref;
        new StatusView({
          type: 'success',
          message: data.toString()
        });
        return (_ref = atom.project.getRepo()) != null ? _ref.refreshStatus() : void 0;
      }
    });
  };

  module.exports = gitCheckoutAllFiles;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0EsbUJBQUEsR0FBc0IsU0FBQSxHQUFBO1dBQ3BCLEdBQUcsQ0FBQyxHQUFKLENBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxDQUFDLFVBQUQsRUFBYSxJQUFiLENBQU47QUFBQSxNQUNBLE1BQUEsRUFBUSxTQUFDLElBQUQsR0FBQTtBQUNOLFlBQUEsSUFBQTtBQUFBLFFBQUksSUFBQSxVQUFBLENBQVc7QUFBQSxVQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsVUFBaUIsT0FBQSxFQUFTLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBMUI7U0FBWCxDQUFKLENBQUE7NkRBQ3NCLENBQUUsYUFBeEIsQ0FBQSxXQUZNO01BQUEsQ0FEUjtLQURGLEVBRG9CO0VBQUEsQ0FIdEIsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLG1CQVZqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-checkout-all-files.coffee