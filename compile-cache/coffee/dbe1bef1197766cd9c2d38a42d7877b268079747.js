(function() {
  var BranchList, ErrorView, List, LocalBranch, RemoteBranch, git, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  git = require('../../git');

  List = require('../list');

  LocalBranch = require('./local-branch');

  RemoteBranch = require('./remote-branch');

  ErrorView = require('../../views/error-view');

  BranchList = (function(_super) {
    __extends(BranchList, _super);

    function BranchList() {
      this.remote = __bind(this.remote, this);
      this.local = __bind(this.local, this);
      this.reload = __bind(this.reload, this);
      return BranchList.__super__.constructor.apply(this, arguments);
    }

    BranchList.prototype.reload = function(_arg) {
      var silent;
      silent = (_arg != null ? _arg : {}).silent;
      return git.branches().then((function(_this) {
        return function(branches) {
          _this.reset();
          _.each(branches, function(branch) {
            return _this.add(new LocalBranch(branch));
          });
          return git.remoteBranches().then(function(branches) {
            _.each(branches, function(branch) {
              return _this.add(new RemoteBranch(branch));
            });
            _this.select(_this.selectedIndex);
            if (!silent) {
              return _this.trigger('repaint');
            }
          });
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    BranchList.prototype.local = function() {
      return this.filter(function(branch) {
        return branch.local;
      });
    };

    BranchList.prototype.remote = function() {
      return this.filter(function(branch) {
        return branch.remote;
      });
    };

    return BranchList;

  })(List);

  module.exports = BranchList;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBZSxPQUFBLENBQVEsV0FBUixDQUZmLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQWUsT0FBQSxDQUFRLFNBQVIsQ0FIZixDQUFBOztBQUFBLEVBSUEsV0FBQSxHQUFlLE9BQUEsQ0FBUSxnQkFBUixDQUpmLENBQUE7O0FBQUEsRUFLQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBTGYsQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBZSxPQUFBLENBQVEsd0JBQVIsQ0FOZixDQUFBOztBQUFBLEVBU007QUFFSixpQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEseUJBQUEsTUFBQSxHQUFRLFNBQUMsSUFBRCxHQUFBO0FBQ04sVUFBQSxNQUFBO0FBQUEsTUFEUSx5QkFBRCxPQUFTLElBQVIsTUFDUixDQUFBO2FBQUEsR0FBRyxDQUFDLFFBQUosQ0FBQSxDQUFjLENBQUMsSUFBZixDQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7QUFDbEIsVUFBQSxLQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFQLEVBQWlCLFNBQUMsTUFBRCxHQUFBO21CQUFZLEtBQUMsQ0FBQSxHQUFELENBQVMsSUFBQSxXQUFBLENBQVksTUFBWixDQUFULEVBQVo7VUFBQSxDQUFqQixDQURBLENBQUE7aUJBRUEsR0FBRyxDQUFDLGNBQUosQ0FBQSxDQUFvQixDQUFDLElBQXJCLENBQTBCLFNBQUMsUUFBRCxHQUFBO0FBQ3hCLFlBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFQLEVBQWlCLFNBQUMsTUFBRCxHQUFBO3FCQUFZLEtBQUMsQ0FBQSxHQUFELENBQVMsSUFBQSxZQUFBLENBQWEsTUFBYixDQUFULEVBQVo7WUFBQSxDQUFqQixDQUFBLENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsS0FBQyxDQUFBLGFBQVQsQ0FEQSxDQUFBO0FBRUEsWUFBQSxJQUFBLENBQUEsTUFBQTtxQkFBQSxLQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBQTthQUh3QjtVQUFBLENBQTFCLEVBSGtCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FPQSxDQUFDLE9BQUQsQ0FQQSxDQU9PLFNBQUMsS0FBRCxHQUFBO2VBQWUsSUFBQSxTQUFBLENBQVUsS0FBVixFQUFmO01BQUEsQ0FQUCxFQURNO0lBQUEsQ0FBUixDQUFBOztBQUFBLHlCQWFBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsTUFBRCxDQUFRLFNBQUMsTUFBRCxHQUFBO2VBQVksTUFBTSxDQUFDLE1BQW5CO01BQUEsQ0FBUixFQURLO0lBQUEsQ0FiUCxDQUFBOztBQUFBLHlCQW1CQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLE1BQUQsQ0FBUSxTQUFDLE1BQUQsR0FBQTtlQUFZLE1BQU0sQ0FBQyxPQUFuQjtNQUFBLENBQVIsRUFETTtJQUFBLENBbkJSLENBQUE7O3NCQUFBOztLQUZ1QixLQVR6QixDQUFBOztBQUFBLEVBaUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBakNqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/branches/branch-list.coffee