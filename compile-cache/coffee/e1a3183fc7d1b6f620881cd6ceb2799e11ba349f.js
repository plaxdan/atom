(function() {
  var CommitListView, CommitView, View, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  View = require('atom').View;

  CommitView = require('./commit-view');

  CommitListView = (function(_super) {
    __extends(CommitListView, _super);

    function CommitListView() {
      this.repaint = __bind(this.repaint, this);
      this.beforeRemove = __bind(this.beforeRemove, this);
      return CommitListView.__super__.constructor.apply(this, arguments);
    }

    CommitListView.content = function() {
      return this.div({
        "class": 'commit-list-view list-view',
        tabindex: -1
      });
    };

    CommitListView.prototype.initialize = function(model) {
      this.model = model;
      return this.model.on('repaint', this.repaint);
    };

    CommitListView.prototype.beforeRemove = function() {
      return this.model.off('repaint', this.repaint);
    };

    CommitListView.prototype.repaint = function() {
      this.empty();
      return _.each(this.model.models, (function(_this) {
        return function(commit) {
          return _this.append(new CommitView(commit));
        };
      })(this));
    };

    return CommitListView;

  })(View);

  module.exports = CommitListView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLE1BQVIsRUFBUixJQURELENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FIYixDQUFBOztBQUFBLEVBTU07QUFDSixxQ0FBQSxDQUFBOzs7Ozs7S0FBQTs7QUFBQSxJQUFBLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDRCQUFQO0FBQUEsUUFBcUMsUUFBQSxFQUFVLENBQUEsQ0FBL0M7T0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDZCQUlBLFVBQUEsR0FBWSxTQUFFLEtBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLFFBQUEsS0FDWixDQUFBO2FBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixJQUFDLENBQUEsT0FBdEIsRUFEVTtJQUFBLENBSlosQ0FBQTs7QUFBQSw2QkFRQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1osSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsU0FBWCxFQUFzQixJQUFDLENBQUEsT0FBdkIsRUFEWTtJQUFBLENBUmQsQ0FBQTs7QUFBQSw2QkFZQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FBQTthQUNBLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFkLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFBWSxLQUFDLENBQUEsTUFBRCxDQUFZLElBQUEsVUFBQSxDQUFXLE1BQVgsQ0FBWixFQUFaO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsRUFGTztJQUFBLENBWlQsQ0FBQTs7MEJBQUE7O0tBRDJCLEtBTjdCLENBQUE7O0FBQUEsRUF1QkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsY0F2QmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/commits/commit-list-view.coffee