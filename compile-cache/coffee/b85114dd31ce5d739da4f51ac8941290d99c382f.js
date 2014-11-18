(function() {
  var GitCommit, StatusView, git, gitCommitAmend;

  git = require('../git');

  StatusView = require('../views/status-view');

  GitCommit = require('./git-commit');

  gitCommitAmend = function() {
    return git.cmd({
      args: ['log', '-1', '--format=%B'],
      stdout: function(amend) {
        return git.cmd({
          args: ['reset', '--soft', 'HEAD^'],
          exit: function() {
            return new GitCommit("" + (amend != null ? amend.trim() : void 0) + "\n");
          }
        });
      }
    });
  };

  module.exports = gitCommitAmend;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBDQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FEYixDQUFBOztBQUFBLEVBRUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBRlosQ0FBQTs7QUFBQSxFQUlBLGNBQUEsR0FBaUIsU0FBQSxHQUFBO1dBQ2YsR0FBRyxDQUFDLEdBQUosQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLENBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxhQUFkLENBQU47QUFBQSxNQUNBLE1BQUEsRUFBUSxTQUFDLEtBQUQsR0FBQTtlQUNOLEdBQUcsQ0FBQyxHQUFKLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxRQUFWLEVBQW9CLE9BQXBCLENBQU47QUFBQSxVQUNBLElBQUEsRUFBTSxTQUFBLEdBQUE7bUJBQU8sSUFBQSxTQUFBLENBQVUsRUFBQSxHQUFFLGlCQUFBLEtBQUssQ0FBRSxJQUFQLENBQUEsVUFBQSxDQUFGLEdBQWlCLElBQTNCLEVBQVA7VUFBQSxDQUROO1NBREYsRUFETTtNQUFBLENBRFI7S0FERixFQURlO0VBQUEsQ0FKakIsQ0FBQTs7QUFBQSxFQVlBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGNBWmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-commit-amend.coffee