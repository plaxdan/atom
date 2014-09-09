(function() {
  var CommitView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = CommitView = (function(_super) {
    __extends(CommitView, _super);

    function CommitView() {
      this.showSelection = __bind(this.showSelection, this);
      this.clicked = __bind(this.clicked, this);
      return CommitView.__super__.constructor.apply(this, arguments);
    }

    CommitView.content = function(commit) {
      return this.div({
        "class": "commit",
        click: "clicked"
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "id"
          }, "" + (commit.shortID()));
          _this.div({
            "class": "author-name"
          }, "(" + (commit.authorName()) + ")");
          return _this.div({
            "class": "message text-subtle"
          }, "" + (commit.shortMessage()));
        };
      })(this));
    };

    CommitView.prototype.initialize = function(commit) {
      this.model = commit;
      return this.model.on("change:selected", this.showSelection);
    };

    CommitView.prototype.beforeRemove = function() {
      return this.model.off("change:selected", this.showSelection);
    };

    CommitView.prototype.clicked = function() {
      return this.model.selfSelect();
    };

    CommitView.prototype.showSelection = function() {
      this.removeClass("selected");
      if (this.model.selectedP()) {
        return this.addClass("selected");
      }
    };

    return CommitView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixpQ0FBQSxDQUFBOzs7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxNQUFELEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLEtBQUEsRUFBTyxTQUF4QjtPQUFMLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdEMsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sSUFBUDtXQUFMLEVBQWtCLEVBQUEsR0FBRSxDQUFBLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxDQUFwQixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxhQUFQO1dBQUwsRUFBNEIsR0FBQSxHQUFFLENBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFBLENBQUYsR0FBdUIsR0FBbkQsQ0FEQSxDQUFBO2lCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxxQkFBUDtXQUFMLEVBQW1DLEVBQUEsR0FBRSxDQUFBLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBQSxDQUFyQyxFQUhzQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhDLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEseUJBTUEsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLE1BQVQsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLGlCQUFWLEVBQTZCLElBQUMsQ0FBQSxhQUE5QixFQUZVO0lBQUEsQ0FOWixDQUFBOztBQUFBLHlCQVVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxpQkFBWCxFQUE4QixJQUFDLENBQUEsYUFBL0IsRUFEWTtJQUFBLENBVmQsQ0FBQTs7QUFBQSx5QkFhQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLENBQUEsRUFETztJQUFBLENBYlQsQ0FBQTs7QUFBQSx5QkFnQkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBeUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBekI7ZUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFBQTtPQUZhO0lBQUEsQ0FoQmYsQ0FBQTs7c0JBQUE7O0tBRHVCLEtBSHpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/commits/commit-view.coffee