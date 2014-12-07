(function() {
  var CommitView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  CommitView = (function(_super) {
    __extends(CommitView, _super);

    function CommitView() {
      this.showSelection = __bind(this.showSelection, this);
      this.clicked = __bind(this.clicked, this);
      this.beforeRemove = __bind(this.beforeRemove, this);
      return CommitView.__super__.constructor.apply(this, arguments);
    }

    CommitView.content = function(commit) {
      return this.div({
        "class": 'commit',
        click: 'clicked'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'id'
          }, "" + (commit.shortID()));
          _this.div({
            "class": 'author-name'
          }, "(" + (commit.authorName()) + ")");
          return _this.div({
            "class": 'message text-subtle'
          }, "" + (commit.shortMessage()));
        };
      })(this));
    };

    CommitView.prototype.initialize = function(model) {
      this.model = model;
      return this.model.on('change:selected', this.showSelection);
    };

    CommitView.prototype.beforeRemove = function() {
      return this.model.off('change:selected', this.showSelection);
    };

    CommitView.prototype.clicked = function() {
      return this.model.selfSelect();
    };

    CommitView.prototype.showSelection = function() {
      this.removeClass('selected');
      if (this.model.isSelected()) {
        return this.addClass('selected');
      }
    };

    return CommitView;

  })(View);

  module.exports = CommitView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUdNO0FBQ0osaUNBQUEsQ0FBQTs7Ozs7OztLQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxRQUFQO0FBQUEsUUFBaUIsS0FBQSxFQUFPLFNBQXhCO09BQUwsRUFBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN0QyxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxJQUFQO1dBQUwsRUFBa0IsRUFBQSxHQUFFLENBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLENBQXBCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGFBQVA7V0FBTCxFQUE0QixHQUFBLEdBQUUsQ0FBQSxNQUFNLENBQUMsVUFBUCxDQUFBLENBQUEsQ0FBRixHQUF1QixHQUFuRCxDQURBLENBQUE7aUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLHFCQUFQO1dBQUwsRUFBbUMsRUFBQSxHQUFFLENBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLENBQXJDLEVBSHNDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEMsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSx5QkFPQSxVQUFBLEdBQVksU0FBRSxLQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxRQUFBLEtBQ1osQ0FBQTthQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLGlCQUFWLEVBQTZCLElBQUMsQ0FBQSxhQUE5QixFQURVO0lBQUEsQ0FQWixDQUFBOztBQUFBLHlCQVdBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxpQkFBWCxFQUE4QixJQUFDLENBQUEsYUFBL0IsRUFEWTtJQUFBLENBWGQsQ0FBQTs7QUFBQSx5QkFlQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLENBQUEsRUFETztJQUFBLENBZlQsQ0FBQTs7QUFBQSx5QkFtQkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBeUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLENBQUEsQ0FBekI7ZUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFBQTtPQUZhO0lBQUEsQ0FuQmYsQ0FBQTs7c0JBQUE7O0tBRHVCLEtBSHpCLENBQUE7O0FBQUEsRUEyQkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUEzQmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/commits/commit-view.coffee