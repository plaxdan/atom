(function() {
  var BranchBriefView, BranchListView, View, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  View = require('atom').View;

  BranchBriefView = require('./branch-brief-view');

  BranchListView = (function(_super) {
    __extends(BranchListView, _super);

    function BranchListView() {
      this.repaint = __bind(this.repaint, this);
      this.emptyLists = __bind(this.emptyLists, this);
      this.beforeRemove = __bind(this.beforeRemove, this);
      return BranchListView.__super__.constructor.apply(this, arguments);
    }

    BranchListView.content = function() {
      return this.div({
        "class": 'branch-list-view list-view',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.h2('local:');
          _this.div({
            outlet: 'localDom'
          });
          _this.h2('remote:');
          return _this.div({
            outlet: 'remoteDom'
          });
        };
      })(this));
    };

    BranchListView.prototype.initialize = function(model) {
      this.model = model;
      return this.model.on('repaint', this.repaint);
    };

    BranchListView.prototype.beforeRemove = function() {
      return this.model.off('repaint', this.repaint);
    };

    BranchListView.prototype.emptyLists = function() {
      this.localDom.empty();
      return this.remoteDom.empty();
    };

    BranchListView.prototype.repaint = function() {
      this.emptyLists();
      _.each(this.model.local(), (function(_this) {
        return function(branch) {
          return _this.localDom.append(new BranchBriefView(branch));
        };
      })(this));
      return _.each(this.model.remote(), (function(_this) {
        return function(branch) {
          return _this.remoteDom.append(new BranchBriefView(branch));
        };
      })(this));
    };

    return BranchListView;

  })(View);

  module.exports = BranchListView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLE1BQVIsRUFBUixJQURELENBQUE7O0FBQUEsRUFHQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUixDQUhsQixDQUFBOztBQUFBLEVBTU07QUFDSixxQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyw0QkFBUDtBQUFBLFFBQXFDLFFBQUEsRUFBVSxDQUFBLENBQS9DO09BQUwsRUFBd0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN0RCxVQUFBLEtBQUMsQ0FBQSxFQUFELENBQUksUUFBSixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE1BQUEsRUFBUSxVQUFSO1dBQUwsQ0FEQSxDQUFBO0FBQUEsVUFFQSxLQUFDLENBQUEsRUFBRCxDQUFJLFNBQUosQ0FGQSxDQUFBO2lCQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE1BQUEsRUFBUSxXQUFSO1dBQUwsRUFKc0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDZCQVFBLFVBQUEsR0FBWSxTQUFFLEtBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLFFBQUEsS0FDWixDQUFBO2FBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixJQUFDLENBQUEsT0FBdEIsRUFEVTtJQUFBLENBUlosQ0FBQTs7QUFBQSw2QkFZQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1osSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsU0FBWCxFQUFzQixJQUFDLENBQUEsT0FBdkIsRUFEWTtJQUFBLENBWmQsQ0FBQTs7QUFBQSw2QkFnQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsRUFGVTtJQUFBLENBaEJaLENBQUE7O0FBQUEsNkJBcUJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQVAsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUFZLEtBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFxQixJQUFBLGVBQUEsQ0FBZ0IsTUFBaEIsQ0FBckIsRUFBWjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLENBREEsQ0FBQTthQUVBLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBUCxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQVksS0FBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQXNCLElBQUEsZUFBQSxDQUFnQixNQUFoQixDQUF0QixFQUFaO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsRUFITztJQUFBLENBckJULENBQUE7OzBCQUFBOztLQUQyQixLQU43QixDQUFBOztBQUFBLEVBaUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGNBakNqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/branches/branch-list-view.coffee