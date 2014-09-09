(function() {
  var Commit, CommitList, List, git,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  List = require('../list');

  Commit = require('./commit');

  git = require('../../git').git;

  module.exports = CommitList = (function(_super) {
    __extends(CommitList, _super);

    function CommitList() {
      this.repopulate = __bind(this.repopulate, this);
      return CommitList.__super__.constructor.apply(this, arguments);
    }

    CommitList.prototype.model = Commit;

    CommitList.prototype.reload = function(branch) {
      this.branch = branch;
      return git.commits(this.branch.head(), this.repopulate);
    };

    CommitList.prototype.repopulate = function(commit_hashes) {
      this.reset(commit_hashes);
      this.trigger("repopulate");
      return this.select(this.selected_index);
    };

    return CommitList;

  })(List);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQURULENBQUE7O0FBQUEsRUFFQyxNQUFPLE9BQUEsQ0FBUSxXQUFSLEVBQVAsR0FGRCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEseUJBQUEsS0FBQSxHQUFPLE1BQVAsQ0FBQTs7QUFBQSx5QkFFQSxNQUFBLEdBQVEsU0FBQyxNQUFELEdBQUE7QUFDTixNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFBVixDQUFBO2FBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQSxDQUFaLEVBQTRCLElBQUMsQ0FBQSxVQUE3QixFQUZNO0lBQUEsQ0FGUixDQUFBOztBQUFBLHlCQU1BLFVBQUEsR0FBWSxTQUFDLGFBQUQsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxhQUFQLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLGNBQVQsRUFIVTtJQUFBLENBTlosQ0FBQTs7c0JBQUE7O0tBRHVCLEtBTHpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/commits/commit-list.coffee