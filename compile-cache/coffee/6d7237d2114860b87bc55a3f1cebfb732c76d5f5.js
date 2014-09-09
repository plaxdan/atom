(function() {
  var CurrentBranchView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = CurrentBranchView = (function(_super) {
    __extends(CurrentBranchView, _super);

    function CurrentBranchView() {
      this.repaint = __bind(this.repaint, this);
      return CurrentBranchView.__super__.constructor.apply(this, arguments);
    }

    CurrentBranchView.content = function() {
      return this.div({
        "class": "current-branch-view"
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "name",
            outlet: "name"
          });
          return _this.div({
            "class": "commit",
            outlet: "commit"
          });
        };
      })(this));
    };

    CurrentBranchView.prototype.initialize = function(branch) {
      this.model = branch;
      this.model.on("change", this.repaint);
      return this.repaint();
    };

    CurrentBranchView.prototype.beforeRemove = function() {
      return this.model.off("change", this.repaint);
    };

    CurrentBranchView.prototype.repaint = function() {
      this.name.html("" + (this.model.name()));
      this.commit.html("(" + (this.model.commit().shortID()) + ": " + (this.model.commit().shortMessage()) + ")");
      this.commit.removeClass("unpushed");
      if (this.model.unpushed()) {
        return this.commit.addClass("unpushed");
      }
    };

    return CurrentBranchView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix3Q0FBQSxDQUFBOzs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHFCQUFQO09BQUwsRUFBbUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNqQyxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxNQUFQO0FBQUEsWUFBZSxNQUFBLEVBQVEsTUFBdkI7V0FBTCxDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFFBQVA7QUFBQSxZQUFpQixNQUFBLEVBQVEsUUFBekI7V0FBTCxFQUZpQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5DLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsZ0NBS0EsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLE1BQVQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsUUFBVixFQUFvQixJQUFDLENBQUEsT0FBckIsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQUhVO0lBQUEsQ0FMWixDQUFBOztBQUFBLGdDQVVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLElBQUMsQ0FBQSxPQUF0QixFQURZO0lBQUEsQ0FWZCxDQUFBOztBQUFBLGdDQWFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEVBQUEsR0FBRSxDQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBQUEsQ0FBYixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFjLEdBQUEsR0FBRSxDQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQWUsQ0FBQyxPQUFoQixDQUFBLENBQUEsQ0FBRixHQUE2QixJQUE3QixHQUFnQyxDQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQWUsQ0FBQyxZQUFoQixDQUFBLENBQUEsQ0FBaEMsR0FBZ0UsR0FBOUUsQ0FEQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsVUFBcEIsQ0FIQSxDQUFBO0FBSUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsVUFBakIsRUFERjtPQUxPO0lBQUEsQ0FiVCxDQUFBOzs2QkFBQTs7S0FEOEIsS0FIaEMsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/branches/current-branch-view.coffee