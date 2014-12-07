(function() {
  var Git, getPath;

  Git = require('promised-git');

  getPath = function() {
    var _ref;
    if ((_ref = atom.project) != null ? _ref.getRepo() : void 0) {
      return atom.project.getRepo().getWorkingDirectory();
    } else if (atom.project) {
      return atom.project.getPath();
    } else {
      return __dirname;
    }
  };

  module.exports = new Git(getPath());

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFlBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGNBQVIsQ0FBTixDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFFBQUEsSUFBQTtBQUFBLElBQUEsd0NBQWUsQ0FBRSxPQUFkLENBQUEsVUFBSDthQUNFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQXNCLENBQUMsbUJBQXZCLENBQUEsRUFERjtLQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsT0FBUjthQUNILElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLEVBREc7S0FBQSxNQUFBO2FBR0gsVUFIRztLQUhHO0VBQUEsQ0FGVixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxHQUFBLENBQUksT0FBQSxDQUFBLENBQUosQ0FWckIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/git.coffee