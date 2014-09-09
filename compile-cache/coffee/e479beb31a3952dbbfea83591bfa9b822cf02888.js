(function() {
  var Branch, LocalBranch, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Branch = require('./branch');

  git = require('../../git').git;

  module.exports = LocalBranch = (function(_super) {
    __extends(LocalBranch, _super);

    function LocalBranch() {
      return LocalBranch.__super__.constructor.apply(this, arguments);
    }

    LocalBranch.prototype.remote = false;

    LocalBranch.prototype.local = true;

    LocalBranch.prototype.unpushed = function() {
      return this.get("unpushed");
    };

    LocalBranch.prototype["delete"] = function() {
      return git.git("branch -D " + (this.name()));
    };

    LocalBranch.prototype.remoteName = function() {
      return "";
    };

    LocalBranch.prototype.checkout = function(callback) {
      return git.git("checkout " + (this.localName()));
    };

    LocalBranch.prototype.push = function(remote) {
      remote || (remote = "origin " + (this.name()));
      return git.remotePush(remote);
    };

    return LocalBranch;

  })(Branch);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBRUMsTUFBTyxPQUFBLENBQVEsV0FBUixFQUFQLEdBRkQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMEJBQUEsTUFBQSxHQUFRLEtBQVIsQ0FBQTs7QUFBQSwwQkFFQSxLQUFBLEdBQU8sSUFGUCxDQUFBOztBQUFBLDBCQUlBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFEUTtJQUFBLENBSlYsQ0FBQTs7QUFBQSwwQkFPQSxTQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sR0FBRyxDQUFDLEdBQUosQ0FBUyxZQUFBLEdBQVcsQ0FBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBcEIsRUFETTtJQUFBLENBUFIsQ0FBQTs7QUFBQSwwQkFXQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQUcsR0FBSDtJQUFBLENBWFosQ0FBQTs7QUFBQSwwQkFhQSxRQUFBLEdBQVUsU0FBQyxRQUFELEdBQUE7YUFDUixHQUFHLENBQUMsR0FBSixDQUFTLFdBQUEsR0FBVSxDQUFBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxDQUFuQixFQURRO0lBQUEsQ0FiVixDQUFBOztBQUFBLDBCQWdCQSxJQUFBLEdBQU0sU0FBQyxNQUFELEdBQUE7QUFDSixNQUFBLFdBQUEsU0FBWSxTQUFBLEdBQVEsQ0FBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsRUFBcEIsQ0FBQTthQUNBLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUZJO0lBQUEsQ0FoQk4sQ0FBQTs7dUJBQUE7O0tBRHdCLE9BTDFCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/branches/local-branch.coffee