(function() {
  var BranchList, List, LocalBranch, RemoteBranch, git, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  List = require('../list');

  LocalBranch = require('./local-branch');

  RemoteBranch = require('./remote-branch');

  git = require('../../git').git;

  module.exports = BranchList = (function(_super) {
    __extends(BranchList, _super);

    function BranchList() {
      this.addRemotes = __bind(this.addRemotes, this);
      this.addLocals = __bind(this.addLocals, this);
      return BranchList.__super__.constructor.apply(this, arguments);
    }

    BranchList.prototype.reload = function() {
      return git.branches(this.addLocals);
    };

    BranchList.prototype.addLocals = function(locals) {
      _.each(this.local(), (function(_this) {
        return function(branch) {
          return _this.remove(branch);
        };
      })(this));
      _.each(locals, (function(_this) {
        return function(branch) {
          return _this.add(new LocalBranch(branch));
        };
      })(this));
      return git.remotes(this.addRemotes);
    };

    BranchList.prototype.addRemotes = function(remotes) {
      _.each(this.remote(), (function(_this) {
        return function(branch) {
          return _this.remove(branch);
        };
      })(this));
      _.each(remotes, (function(_this) {
        return function(branch) {
          return _this.add(new RemoteBranch(branch));
        };
      })(this));
      return this.select(this.selected_index);
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1EQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBSGQsQ0FBQTs7QUFBQSxFQUlBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FKZixDQUFBOztBQUFBLEVBTUMsTUFBTyxPQUFBLENBQVEsV0FBUixFQUFQLEdBTkQsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixpQ0FBQSxDQUFBOzs7Ozs7S0FBQTs7QUFBQSx5QkFBQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sR0FBRyxDQUFDLFFBQUosQ0FBYSxJQUFDLENBQUEsU0FBZCxFQURNO0lBQUEsQ0FBUixDQUFBOztBQUFBLHlCQUdBLFNBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTtBQUNULE1BQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsS0FBRCxDQUFBLENBQVAsRUFBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUFZLEtBQUMsQ0FBQSxNQUFELENBQVEsTUFBUixFQUFaO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQVAsRUFBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQ2IsS0FBQyxDQUFBLEdBQUQsQ0FBUyxJQUFBLFdBQUEsQ0FBWSxNQUFaLENBQVQsRUFEYTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWYsQ0FEQSxDQUFBO2FBSUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxJQUFDLENBQUEsVUFBYixFQUxTO0lBQUEsQ0FIWCxDQUFBOztBQUFBLHlCQVVBLFVBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUNWLE1BQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVAsRUFBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUFZLEtBQUMsQ0FBQSxNQUFELENBQVEsTUFBUixFQUFaO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQVAsRUFBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNkLEtBQUMsQ0FBQSxHQUFELENBQVMsSUFBQSxZQUFBLENBQWEsTUFBYixDQUFULEVBRGM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQixDQURBLENBQUE7YUFJQSxJQUFDLENBQUEsTUFBRCxDQUFRLElBQUMsQ0FBQSxjQUFULEVBTFU7SUFBQSxDQVZaLENBQUE7O0FBQUEseUJBaUJBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsTUFBRCxDQUFRLFNBQUMsTUFBRCxHQUFBO2VBQVksTUFBTSxDQUFDLE1BQW5CO01BQUEsQ0FBUixFQURLO0lBQUEsQ0FqQlAsQ0FBQTs7QUFBQSx5QkFvQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxNQUFELENBQVEsU0FBQyxNQUFELEdBQUE7ZUFBWSxNQUFNLENBQUMsT0FBbkI7TUFBQSxDQUFSLEVBRE07SUFBQSxDQXBCUixDQUFBOztzQkFBQTs7S0FEdUIsS0FUekIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/branches/branch-list.coffee