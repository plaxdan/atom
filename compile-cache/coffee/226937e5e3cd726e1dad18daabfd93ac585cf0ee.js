(function() {
  var Conflict, GitBridge, MergeConflictsView, NavigationView, SideView, handleErr;

  MergeConflictsView = require('./merge-conflicts-view');

  SideView = require('./side-view');

  NavigationView = require('./navigation-view');

  Conflict = require('./conflict');

  GitBridge = require('./git-bridge').GitBridge;

  handleErr = require('./error-view');

  module.exports = {
    activate: function(state) {
      return atom.workspaceView.command("merge-conflicts:detect", function() {
        return GitBridge.locateGitAnd(function(err) {
          if (err != null) {
            return handleErr(err);
          }
          return MergeConflictsView.detect();
        });
      });
    },
    deactivate: function() {},
    config: {
      gitPath: {
        type: 'string',
        "default": '',
        description: 'Absolute path to your git executable.'
      }
    },
    serialize: function() {}
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRFQUFBOztBQUFBLEVBQUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSLENBQXJCLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FGakIsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUhYLENBQUE7O0FBQUEsRUFJQyxZQUFhLE9BQUEsQ0FBUSxjQUFSLEVBQWIsU0FKRCxDQUFBOztBQUFBLEVBS0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBTFosQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsd0JBQTNCLEVBQXFELFNBQUEsR0FBQTtlQUNuRCxTQUFTLENBQUMsWUFBVixDQUF1QixTQUFDLEdBQUQsR0FBQTtBQUNyQixVQUFBLElBQXlCLFdBQXpCO0FBQUEsbUJBQU8sU0FBQSxDQUFVLEdBQVYsQ0FBUCxDQUFBO1dBQUE7aUJBQ0Esa0JBQWtCLENBQUMsTUFBbkIsQ0FBQSxFQUZxQjtRQUFBLENBQXZCLEVBRG1EO01BQUEsQ0FBckQsRUFEUTtJQUFBLENBQVY7QUFBQSxJQU1BLFVBQUEsRUFBWSxTQUFBLEdBQUEsQ0FOWjtBQUFBLElBUUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHVDQUZiO09BREY7S0FURjtBQUFBLElBY0EsU0FBQSxFQUFXLFNBQUEsR0FBQSxDQWRYO0dBVEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/merge-conflicts.coffee