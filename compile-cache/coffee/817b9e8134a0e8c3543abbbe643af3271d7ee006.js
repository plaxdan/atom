(function() {
  var MergeListView, git;

  git = require('../git');

  MergeListView = require('../views/merge-list-view');

  module.exports = function() {
    return git.cmd({
      args: ['branch'],
      stdout: function(data) {
        return new MergeListView(data);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDBCQUFSLENBRGhCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBLEdBQUE7V0FDZixHQUFHLENBQUMsR0FBSixDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sQ0FBQyxRQUFELENBQU47QUFBQSxNQUNBLE1BQUEsRUFBUSxTQUFDLElBQUQsR0FBQTtlQUNGLElBQUEsYUFBQSxDQUFjLElBQWQsRUFERTtNQUFBLENBRFI7S0FERixFQURlO0VBQUEsQ0FIakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-merge.coffee