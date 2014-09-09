(function() {
  var CurrentBranch, LocalBranch, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LocalBranch = require('./local-branch');

  git = require('../../git').git;

  module.exports = CurrentBranch = (function(_super) {
    __extends(CurrentBranch, _super);

    function CurrentBranch() {
      return CurrentBranch.__super__.constructor.apply(this, arguments);
    }

    CurrentBranch.prototype.initialize = function(branchExisting) {
      if (branchExisting) {
        return this.reload();
      }
    };

    CurrentBranch.prototype.reload = function() {
      return git.branch((function(_this) {
        return function(head) {
          return _this.set(head);
        };
      })(this));
    };

    CurrentBranch.prototype.head = function() {
      return "HEAD";
    };

    CurrentBranch.prototype["delete"] = function() {
      return null;
    };

    CurrentBranch.prototype.checkout = function() {
      return null;
    };

    return CurrentBranch;

  })(LocalBranch);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBQWQsQ0FBQTs7QUFBQSxFQUVDLE1BQU8sT0FBQSxDQUFRLFdBQVIsRUFBUCxHQUZELENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDRCQUFBLFVBQUEsR0FBWSxTQUFDLGNBQUQsR0FBQTtBQUNWLE1BQUEsSUFBRyxjQUFIO2VBQXVCLElBQUMsQ0FBQSxNQUFELENBQUEsRUFBdkI7T0FEVTtJQUFBLENBQVosQ0FBQTs7QUFBQSw0QkFHQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sR0FBRyxDQUFDLE1BQUosQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7aUJBQ1QsS0FBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLEVBRFM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRE07SUFBQSxDQUhSLENBQUE7O0FBQUEsNEJBVUEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLE9BREk7SUFBQSxDQVZOLENBQUE7O0FBQUEsNEJBYUEsU0FBQSxHQUFRLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQWJSLENBQUE7O0FBQUEsNEJBZUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQWZWLENBQUE7O3lCQUFBOztLQUQwQixZQUw1QixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/branches/current-branch.coffee