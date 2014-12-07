(function() {
  var BranchBriefView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  BranchBriefView = (function(_super) {
    __extends(BranchBriefView, _super);

    function BranchBriefView() {
      this.showSelection = __bind(this.showSelection, this);
      this.repaint = __bind(this.repaint, this);
      this.clicked = __bind(this.clicked, this);
      this.beforeRemove = __bind(this.beforeRemove, this);
      return BranchBriefView.__super__.constructor.apply(this, arguments);
    }

    BranchBriefView.content = function() {
      return this.div({
        "class": 'branch-brief-view',
        mousedown: 'clicked'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'name',
            outlet: 'name'
          });
          return _this.div({
            "class": 'commit',
            outlet: 'commit'
          });
        };
      })(this));
    };

    BranchBriefView.prototype.initialize = function(model) {
      this.model = model;
      this.model.on('change:selected', this.showSelection);
      return this.repaint();
    };

    BranchBriefView.prototype.beforeRemove = function() {
      return this.model.off('change:selected', this.showSelection);
    };

    BranchBriefView.prototype.clicked = function() {
      return this.model.selfSelect();
    };

    BranchBriefView.prototype.repaint = function() {
      this.name.html("" + (this.model.getName()));
      this.commit.html("(" + (this.model.commit().shortID()) + ": " + (this.model.commit().shortMessage()) + ")");
      this.commit.removeClass('unpushed');
      if (this.model.unpushed()) {
        this.commit.addClass('unpushed');
      }
      return this.showSelection();
    };

    BranchBriefView.prototype.showSelection = function() {
      this.removeClass('selected');
      if (this.model.isSelected()) {
        return this.addClass('selected');
      }
    };

    return BranchBriefView;

  })(View);

  module.exports = BranchBriefView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUdNO0FBQ0osc0NBQUEsQ0FBQTs7Ozs7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLG1CQUFQO0FBQUEsUUFBNEIsU0FBQSxFQUFXLFNBQXZDO09BQUwsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNyRCxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxNQUFQO0FBQUEsWUFBZSxNQUFBLEVBQVEsTUFBdkI7V0FBTCxDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFFBQVA7QUFBQSxZQUFpQixNQUFBLEVBQVEsUUFBekI7V0FBTCxFQUZxRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZELEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsOEJBTUEsVUFBQSxHQUFZLFNBQUUsS0FBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsUUFBQSxLQUNaLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLGlCQUFWLEVBQTZCLElBQUMsQ0FBQSxhQUE5QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBRlU7SUFBQSxDQU5aLENBQUE7O0FBQUEsOEJBV0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNaLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGlCQUFYLEVBQThCLElBQUMsQ0FBQSxhQUEvQixFQURZO0lBQUEsQ0FYZCxDQUFBOztBQUFBLDhCQWVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBQSxFQURPO0lBQUEsQ0FmVCxDQUFBOztBQUFBLDhCQW1CQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxFQUFBLEdBQUUsQ0FBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQSxDQUFBLENBQWIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYyxHQUFBLEdBQUUsQ0FBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFlLENBQUMsT0FBaEIsQ0FBQSxDQUFBLENBQUYsR0FBNkIsSUFBN0IsR0FBZ0MsQ0FBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFlLENBQUMsWUFBaEIsQ0FBQSxDQUFBLENBQWhDLEdBQWdFLEdBQTlFLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLFVBQXBCLENBSEEsQ0FBQTtBQUlBLE1BQUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBQSxDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsVUFBakIsQ0FBQSxDQURGO09BSkE7YUFPQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBUk87SUFBQSxDQW5CVCxDQUFBOztBQUFBLDhCQThCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLFVBQWIsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBQSxDQUF6QjtlQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsVUFBVixFQUFBO09BRmE7SUFBQSxDQTlCZixDQUFBOzsyQkFBQTs7S0FENEIsS0FIOUIsQ0FBQTs7QUFBQSxFQXNDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixlQXRDakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/branches/branch-brief-view.coffee