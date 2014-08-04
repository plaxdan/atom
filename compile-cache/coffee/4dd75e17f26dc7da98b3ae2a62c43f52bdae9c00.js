(function() {
  var View, atom,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  atom = require('atom');

  module.exports = View = (function(_super) {
    __extends(View, _super);

    function View() {
      View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.destruct = function() {
      return this.remove();
    };

    return View;

  })(atom.View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosMkJBQUEsQ0FBQTs7QUFBYSxJQUFBLGNBQUEsR0FBQTtBQUNYLE1BQUEsdUNBQUEsU0FBQSxDQUFBLENBRFc7SUFBQSxDQUFiOztBQUFBLG1CQUdBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsTUFBRCxDQUFBLEVBRFE7SUFBQSxDQUhWLENBQUE7O2dCQUFBOztLQUZpQixJQUFJLENBQUMsS0FIeEIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/View.coffee