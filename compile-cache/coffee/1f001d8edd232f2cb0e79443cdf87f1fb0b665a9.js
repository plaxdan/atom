(function() {
  var ErrorView, HighlightView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  HighlightView = require('./HighlightView');

  module.exports = ErrorView = (function(_super) {
    __extends(ErrorView, _super);

    function ErrorView() {
      return ErrorView.__super__.constructor.apply(this, arguments);
    }

    ErrorView.className = 'refactor-error';

    ErrorView.prototype.configProperty = 'refactor.highlightError';

    return ErrorView;

  })(HighlightView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxpQkFBUixDQUFoQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxTQUFELEdBQVksZ0JBQVosQ0FBQTs7QUFBQSx3QkFDQSxjQUFBLEdBQWdCLHlCQURoQixDQUFBOztxQkFBQTs7S0FGc0IsY0FIeEIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/background/ErrorView.coffee