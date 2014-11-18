(function() {
  var StatusView, git, gitCheckoutCurrentFile;

  git = require('../git');

  StatusView = require('../views/status-view');

  gitCheckoutCurrentFile = function() {
    var currentFile, _ref;
    currentFile = atom.project.relativize((_ref = atom.workspace.getActiveEditor()) != null ? _ref.getPath() : void 0);
    return git.cmd({
      args: ['checkout', '--', currentFile],
      stdout: function(data) {
        var _ref1;
        new StatusView({
          type: 'success',
          message: data.toString()
        });
        return (_ref1 = atom.project.getRepo()) != null ? _ref1.refreshStatus() : void 0;
      }
    });
  };

  module.exports = gitCheckoutCurrentFile;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0Esc0JBQUEsR0FBeUIsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEsaUJBQUE7QUFBQSxJQUFBLFdBQUEsR0FBYyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIseURBQXdELENBQUUsT0FBbEMsQ0FBQSxVQUF4QixDQUFkLENBQUE7V0FDQSxHQUFHLENBQUMsR0FBSixDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixXQUFuQixDQUFOO0FBQUEsTUFDQSxNQUFBLEVBQVEsU0FBQyxJQUFELEdBQUE7QUFDTixZQUFBLEtBQUE7QUFBQSxRQUFJLElBQUEsVUFBQSxDQUFXO0FBQUEsVUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFVBQWlCLE9BQUEsRUFBUyxJQUFJLENBQUMsUUFBTCxDQUFBLENBQTFCO1NBQVgsQ0FBSixDQUFBOytEQUNzQixDQUFFLGFBQXhCLENBQUEsV0FGTTtNQUFBLENBRFI7S0FERixFQUZ1QjtFQUFBLENBSHpCLENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsT0FBUCxHQUFpQixzQkFYakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-checkout-current-file.coffee