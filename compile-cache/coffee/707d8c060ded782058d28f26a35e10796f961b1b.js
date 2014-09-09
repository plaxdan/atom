(function() {
  var BranchBriefView, BranchListView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  BranchBriefView = require('./branch-brief-view');

  module.exports = BranchListView = (function(_super) {
    __extends(BranchListView, _super);

    function BranchListView() {
      this.repaint = __bind(this.repaint, this);
      return BranchListView.__super__.constructor.apply(this, arguments);
    }

    BranchListView.content = function() {
      return this.div({
        "class": "branch-list-view list-view",
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.h2("local:");
          _this.div({
            outlet: "local_dom"
          });
          _this.h2("remote:");
          return _this.div({
            outlet: "remote_dom"
          });
        };
      })(this));
    };

    BranchListView.prototype.initialize = function(branch_list) {
      this.model = branch_list;
      return this.model.on("change", this.repaint);
    };

    BranchListView.prototype.beforeRemove = function() {
      return this.model.off("change", this.repaint);
    };

    BranchListView.prototype.empty_lists = function() {
      this.local_dom.empty();
      return this.remote_dom.empty();
    };

    BranchListView.prototype.repaint = function() {
      var branch, _i, _j, _len, _len1, _ref, _ref1, _results;
      this.empty_lists();
      _ref = this.model.local();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        branch = _ref[_i];
        this.local_dom.append(new BranchBriefView(branch));
      }
      _ref1 = this.model.remote();
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        branch = _ref1[_j];
        _results.push(this.remote_dom.append(new BranchBriefView(branch)));
      }
      return _results;
    };

    return BranchListView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSLENBRGxCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oscUNBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDRCQUFQO0FBQUEsUUFBcUMsUUFBQSxFQUFVLENBQUEsQ0FBL0M7T0FBTCxFQUF3RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3RELFVBQUEsS0FBQyxDQUFBLEVBQUQsQ0FBSSxRQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsTUFBQSxFQUFRLFdBQVI7V0FBTCxDQURBLENBQUE7QUFBQSxVQUVBLEtBQUMsQ0FBQSxFQUFELENBQUksU0FBSixDQUZBLENBQUE7aUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsTUFBQSxFQUFRLFlBQVI7V0FBTCxFQUpzRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhELEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsNkJBT0EsVUFBQSxHQUFZLFNBQUMsV0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLFdBQVQsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFFBQVYsRUFBb0IsSUFBQyxDQUFBLE9BQXJCLEVBRlU7SUFBQSxDQVBaLENBQUE7O0FBQUEsNkJBV0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNaLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsRUFBcUIsSUFBQyxDQUFBLE9BQXRCLEVBRFk7SUFBQSxDQVhkLENBQUE7O0FBQUEsNkJBY0EsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUEsRUFGVztJQUFBLENBZGIsQ0FBQTs7QUFBQSw2QkFrQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsa0RBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUFBO0FBRUE7QUFBQSxXQUFBLDJDQUFBOzBCQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBc0IsSUFBQSxlQUFBLENBQWdCLE1BQWhCLENBQXRCLENBQUEsQ0FERjtBQUFBLE9BRkE7QUFLQTtBQUFBO1dBQUEsOENBQUE7MkJBQUE7QUFDRSxzQkFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBdUIsSUFBQSxlQUFBLENBQWdCLE1BQWhCLENBQXZCLEVBQUEsQ0FERjtBQUFBO3NCQU5PO0lBQUEsQ0FsQlQsQ0FBQTs7MEJBQUE7O0tBRDJCLEtBSjdCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/branches/branch-list-view.coffee