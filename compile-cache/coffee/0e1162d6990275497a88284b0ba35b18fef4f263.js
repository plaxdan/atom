(function() {
  var BranchBriefView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = BranchBriefView = (function(_super) {
    __extends(BranchBriefView, _super);

    function BranchBriefView() {
      this.showSelection = __bind(this.showSelection, this);
      this.repaint = __bind(this.repaint, this);
      this.clicked = __bind(this.clicked, this);
      return BranchBriefView.__super__.constructor.apply(this, arguments);
    }

    BranchBriefView.content = function() {
      return this.div({
        "class": "branch-brief-view",
        mousedown: "clicked"
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

    BranchBriefView.prototype.initialize = function(branch) {
      this.model = branch;
      this.model.on("change:selected", this.showSelection);
      this.model.on("change", this.repaint);
      return this.repaint();
    };

    BranchBriefView.prototype.beforeRemove = function() {
      this.model.off("change:selected", this.showSelection);
      return this.model.off("change", this.repaint);
    };

    BranchBriefView.prototype.clicked = function() {
      return this.model.selfSelect();
    };

    BranchBriefView.prototype.repaint = function() {
      this.name.html("" + (this.model.name()));
      this.commit.html("(" + (this.model.commit().shortID()) + ": " + (this.model.commit().shortMessage()) + ")");
      this.commit.removeClass("unpushed");
      if (this.model.unpushed()) {
        this.commit.addClass("unpushed");
      }
      return this.showSelection();
    };

    BranchBriefView.prototype.showSelection = function() {
      this.removeClass("selected");
      if (this.model.selectedP()) {
        return this.addClass("selected");
      }
    };

    return BranchBriefView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixzQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxtQkFBUDtBQUFBLFFBQTRCLFNBQUEsRUFBVyxTQUF2QztPQUFMLEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDckQsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sTUFBUDtBQUFBLFlBQWUsTUFBQSxFQUFRLE1BQXZCO1dBQUwsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxRQUFQO0FBQUEsWUFBaUIsTUFBQSxFQUFRLFFBQXpCO1dBQUwsRUFGcUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDhCQUtBLFVBQUEsR0FBWSxTQUFDLE1BQUQsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxNQUFULENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLGlCQUFWLEVBQTZCLElBQUMsQ0FBQSxhQUE5QixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFFBQVYsRUFBb0IsSUFBQyxDQUFBLE9BQXJCLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxPQUFELENBQUEsRUFKVTtJQUFBLENBTFosQ0FBQTs7QUFBQSw4QkFXQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osTUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxpQkFBWCxFQUE4QixJQUFDLENBQUEsYUFBL0IsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxFQUFxQixJQUFDLENBQUEsT0FBdEIsRUFGWTtJQUFBLENBWGQsQ0FBQTs7QUFBQSw4QkFlQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLENBQUEsRUFETztJQUFBLENBZlQsQ0FBQTs7QUFBQSw4QkFrQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsRUFBQSxHQUFFLENBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FBQSxDQUFiLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWMsR0FBQSxHQUFFLENBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBZSxDQUFDLE9BQWhCLENBQUEsQ0FBQSxDQUFGLEdBQTZCLElBQTdCLEdBQWdDLENBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBZSxDQUFDLFlBQWhCLENBQUEsQ0FBQSxDQUFoQyxHQUFnRSxHQUE5RSxDQURBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixVQUFwQixDQUhBLENBQUE7QUFJQSxNQUFBLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLENBQUEsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLFVBQWpCLENBQUEsQ0FERjtPQUpBO2FBT0EsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQVJPO0lBQUEsQ0FsQlQsQ0FBQTs7QUFBQSw4QkE0QkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBeUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBekI7ZUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFBQTtPQUZhO0lBQUEsQ0E1QmYsQ0FBQTs7MkJBQUE7O0tBRDRCLEtBSDlCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/branches/branch-brief-view.coffee