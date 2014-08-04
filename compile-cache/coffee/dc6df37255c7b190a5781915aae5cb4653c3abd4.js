(function() {
  var StatusView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../View');

  module.exports = StatusView = (function(_super) {
    __extends(StatusView, _super);

    function StatusView() {
      return StatusView.__super__.constructor.apply(this, arguments);
    }

    StatusView.content = function() {
      return this.div({
        "class": 'refactor-status inline-block'
      }, (function(_this) {
        return function() {
          _this.span({
            "class": 'lint-name'
          });
          return _this.span({
            "class": 'lint-summary'
          });
        };
      })(this));
    };

    return StatusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDhCQUFQO09BQUwsRUFBNEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUMxQyxVQUFBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE9BQUEsRUFBTyxXQUFQO1dBQU4sQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE9BQUEsRUFBTyxjQUFQO1dBQU4sRUFGMEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxFQURRO0lBQUEsQ0FBVixDQUFBOztzQkFBQTs7S0FGdUIsS0FIekIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/status/StatusView.coffee