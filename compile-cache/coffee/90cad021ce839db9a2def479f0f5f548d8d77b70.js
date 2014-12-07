(function() {
  var DiffChunkView, DiffLineView, View, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  View = require('atom').View;

  DiffLineView = require('./diff-line-view');

  DiffChunkView = (function(_super) {
    __extends(DiffChunkView, _super);

    function DiffChunkView() {
      this.showSelection = __bind(this.showSelection, this);
      this.clicked = __bind(this.clicked, this);
      this.beforeRemove = __bind(this.beforeRemove, this);
      return DiffChunkView.__super__.constructor.apply(this, arguments);
    }

    DiffChunkView.content = function() {
      return this.div({
        "class": 'diff-chunk',
        click: 'clicked'
      });
    };

    DiffChunkView.prototype.initialize = function(model) {
      this.model = model;
      this.model.on('change:selected', this.showSelection);
      return _.each(this.model.lines, (function(_this) {
        return function(line) {
          return _this.append(new DiffLineView(line));
        };
      })(this));
    };

    DiffChunkView.prototype.beforeRemove = function() {
      return this.model.off('change:selected', this.showSelection);
    };

    DiffChunkView.prototype.clicked = function() {
      return this.model.selfSelect();
    };

    DiffChunkView.prototype.showSelection = function() {
      this.removeClass('selected');
      if (this.model.isSelected()) {
        return this.addClass('selected');
      }
    };

    return DiffChunkView;

  })(View);

  module.exports = DiffChunkView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFlLE9BQUEsQ0FBUSxRQUFSLENBQWYsQ0FBQTs7QUFBQSxFQUNDLE9BQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxJQURELENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBRmYsQ0FBQTs7QUFBQSxFQUtNO0FBQ0osb0NBQUEsQ0FBQTs7Ozs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sWUFBUDtBQUFBLFFBQXFCLEtBQUEsRUFBTyxTQUE1QjtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsNEJBSUEsVUFBQSxHQUFZLFNBQUUsS0FBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsUUFBQSxLQUNaLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLGlCQUFWLEVBQTZCLElBQUMsQ0FBQSxhQUE5QixDQUFBLENBQUE7YUFDQSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBZCxFQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7aUJBQVUsS0FBQyxDQUFBLE1BQUQsQ0FBWSxJQUFBLFlBQUEsQ0FBYSxJQUFiLENBQVosRUFBVjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLEVBRlU7SUFBQSxDQUpaLENBQUE7O0FBQUEsNEJBU0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNaLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGlCQUFYLEVBQThCLElBQUMsQ0FBQSxhQUEvQixFQURZO0lBQUEsQ0FUZCxDQUFBOztBQUFBLDRCQWFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBQSxFQURPO0lBQUEsQ0FiVCxDQUFBOztBQUFBLDRCQWlCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLFVBQWIsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBQSxDQUF6QjtlQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsVUFBVixFQUFBO09BRmE7SUFBQSxDQWpCZixDQUFBOzt5QkFBQTs7S0FEMEIsS0FMNUIsQ0FBQTs7QUFBQSxFQTJCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixhQTNCakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/diffs/diff-chunk-view.coffee