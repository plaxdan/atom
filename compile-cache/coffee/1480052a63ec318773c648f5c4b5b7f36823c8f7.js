(function() {
  var DiffLineView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  DiffLineView = (function(_super) {
    __extends(DiffLineView, _super);

    function DiffLineView() {
      return DiffLineView.__super__.constructor.apply(this, arguments);
    }

    DiffLineView.content = function(line) {
      return this.div({
        "class": "diff-line " + (line.type())
      }, (function(_this) {
        return function() {
          return _this.raw(line.markup());
        };
      })(this));
    };

    DiffLineView.prototype.initialize = function(model) {
      this.model = model;
    };

    return DiffLineView;

  })(View);

  module.exports = DiffLineView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBR007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFRLFlBQUEsR0FBVyxDQUFBLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxDQUFuQjtPQUFMLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3RDLEtBQUMsQ0FBQSxHQUFELENBQUssSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFMLEVBRHNDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEMsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSwyQkFLQSxVQUFBLEdBQVksU0FBRSxLQUFGLEdBQUE7QUFBWSxNQUFYLElBQUMsQ0FBQSxRQUFBLEtBQVUsQ0FBWjtJQUFBLENBTFosQ0FBQTs7d0JBQUE7O0tBRHlCLEtBSDNCLENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsT0FBUCxHQUFpQixZQVhqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/diffs/diff-line-view.coffee