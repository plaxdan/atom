(function() {
  var Branch, RemoteBranch, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Branch = require('./branch');

  git = require('../../git').git;

  module.exports = RemoteBranch = (function(_super) {
    __extends(RemoteBranch, _super);

    function RemoteBranch() {
      return RemoteBranch.__super__.constructor.apply(this, arguments);
    }

    RemoteBranch.prototype.remote = true;

    RemoteBranch.prototype.local = false;

    RemoteBranch.prototype["delete"] = function() {
      return git.git("push -f " + (this.remoteName()) + " :" + (this.localName()));
    };

    RemoteBranch.prototype.localName = function() {
      return this.name().replace(/.*?\//, "");
    };

    RemoteBranch.prototype.remoteName = function() {
      return this.name().replace(/\/.*/, "");
    };

    return RemoteBranch;

  })(Branch);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBQ0MsTUFBTyxPQUFBLENBQVEsV0FBUixFQUFQLEdBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMkJBQUEsTUFBQSxHQUFRLElBQVIsQ0FBQTs7QUFBQSwyQkFFQSxLQUFBLEdBQU8sS0FGUCxDQUFBOztBQUFBLDJCQUlBLFNBQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixHQUFHLENBQUMsR0FBSixDQUFTLFVBQUEsR0FBUyxDQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFULEdBQXdCLElBQXhCLEdBQTJCLENBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLENBQXBDLEVBRE07SUFBQSxDQUpSLENBQUE7O0FBQUEsMkJBT0EsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNULElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBTyxDQUFDLE9BQVIsQ0FBZ0IsT0FBaEIsRUFBeUIsRUFBekIsRUFEUztJQUFBLENBUFgsQ0FBQTs7QUFBQSwyQkFVQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFPLENBQUMsT0FBUixDQUFnQixNQUFoQixFQUF3QixFQUF4QixFQURVO0lBQUEsQ0FWWixDQUFBOzt3QkFBQTs7S0FEeUIsT0FKM0IsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/branches/remote-branch.coffee