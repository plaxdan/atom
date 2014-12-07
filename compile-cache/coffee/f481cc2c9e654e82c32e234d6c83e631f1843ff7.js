(function() {
  var CurrentBranchView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  CurrentBranchView = (function(_super) {
    __extends(CurrentBranchView, _super);

    function CurrentBranchView() {
      this.repaint = __bind(this.repaint, this);
      this.beforeRemove = __bind(this.beforeRemove, this);
      return CurrentBranchView.__super__.constructor.apply(this, arguments);
    }

    CurrentBranchView.content = function() {
      return this.div({
        "class": 'current-branch-view'
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

    CurrentBranchView.prototype.initialize = function(model) {
      this.model = model;
      this.model.on('repaint', this.repaint);
      return this.repaint();
    };

    CurrentBranchView.prototype.beforeRemove = function() {
      return this.model.off('repaint', this.repaint);
    };

    CurrentBranchView.prototype.repaint = function() {
      var _base, _base1;
      this.name.html("" + this.model.name);
      this.commit.html("(" + (typeof (_base = this.model.commit).shortID === "function" ? _base.shortID() : void 0) + ": " + (typeof (_base1 = this.model.commit).shortMessage === "function" ? _base1.shortMessage() : void 0) + ")");
      this.commit.removeClass('unpushed');
      if (this.model.unpushed()) {
        return this.commit.addClass('unpushed');
      }
    };

    return CurrentBranchView;

  })(View);

  module.exports = CurrentBranchView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUdNO0FBQ0osd0NBQUEsQ0FBQTs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxpQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8scUJBQVA7T0FBTCxFQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2pDLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE1BQVA7QUFBQSxZQUFlLE1BQUEsRUFBUSxNQUF2QjtXQUFMLENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLFlBQWlCLE1BQUEsRUFBUSxRQUF6QjtXQUFMLEVBRmlDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSxnQ0FNQSxVQUFBLEdBQVksU0FBRSxLQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxRQUFBLEtBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixJQUFDLENBQUEsT0FBdEIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQUZVO0lBQUEsQ0FOWixDQUFBOztBQUFBLGdDQVdBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QixFQURZO0lBQUEsQ0FYZCxDQUFBOztBQUFBLGdDQWVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGFBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEVBQUEsR0FBRSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQXBCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWMsR0FBQSxHQUFFLGtFQUFhLENBQUMsa0JBQWQsQ0FBRixHQUE0QixJQUE1QixHQUErQix5RUFBYSxDQUFDLHVCQUFkLENBQS9CLEdBQThELEdBQTVFLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLFVBQXBCLENBSEEsQ0FBQTtBQUlBLE1BQUEsSUFBK0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLENBQUEsQ0FBL0I7ZUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsVUFBakIsRUFBQTtPQUxPO0lBQUEsQ0FmVCxDQUFBOzs2QkFBQTs7S0FEOEIsS0FIaEMsQ0FBQTs7QUFBQSxFQTBCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixpQkExQmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/branches/current-branch-view.coffee