(function() {
  var CommitListView, CommitView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  CommitView = require('./commit-view');

  module.exports = CommitListView = (function(_super) {
    __extends(CommitListView, _super);

    function CommitListView() {
      this.repaint = __bind(this.repaint, this);
      return CommitListView.__super__.constructor.apply(this, arguments);
    }

    CommitListView.content = function() {
      return this.div({
        "class": "commit-list-view list-view",
        tabindex: -1
      });
    };

    CommitListView.prototype.initialize = function(commit_list) {
      this.model = commit_list;
      return this.model.on("repopulate", this.repaint);
    };

    CommitListView.prototype.beforeRemove = function() {
      return this.model.off("repopulate", this.repaint);
    };

    CommitListView.prototype.repaint = function() {
      var commit, _i, _len, _ref, _results;
      this.empty();
      _ref = this.model.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        commit = _ref[_i];
        _results.push(this.append(new CommitView(commit)));
      }
      return _results;
    };

    return CommitListView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQURiLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oscUNBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDRCQUFQO0FBQUEsUUFBcUMsUUFBQSxFQUFVLENBQUEsQ0FBL0M7T0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDZCQUdBLFVBQUEsR0FBWSxTQUFDLFdBQUQsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxXQUFULENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxZQUFWLEVBQXdCLElBQUMsQ0FBQSxPQUF6QixFQUZVO0lBQUEsQ0FIWixDQUFBOztBQUFBLDZCQU9BLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLEVBQXlCLElBQUMsQ0FBQSxPQUExQixFQURZO0lBQUEsQ0FQZCxDQUFBOztBQUFBLDZCQVVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGdDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQUE7V0FBQSwyQ0FBQTswQkFBQTtBQUNFLHNCQUFBLElBQUMsQ0FBQSxNQUFELENBQVksSUFBQSxVQUFBLENBQVcsTUFBWCxDQUFaLEVBQUEsQ0FERjtBQUFBO3NCQUZPO0lBQUEsQ0FWVCxDQUFBOzswQkFBQTs7S0FEMkIsS0FKN0IsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/commits/commit-list-view.coffee