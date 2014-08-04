(function() {
  var HighlightView, ReferenceView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  HighlightView = require('./HighlightView');

  module.exports = ReferenceView = (function(_super) {
    __extends(ReferenceView, _super);

    function ReferenceView() {
      return ReferenceView.__super__.constructor.apply(this, arguments);
    }

    ReferenceView.className = 'refactor-reference';

    ReferenceView.prototype.configProperty = 'refactor.highlightReference';

    return ReferenceView;

  })(HighlightView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxpQkFBUixDQUFoQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGFBQUMsQ0FBQSxTQUFELEdBQVksb0JBQVosQ0FBQTs7QUFBQSw0QkFDQSxjQUFBLEdBQWdCLDZCQURoQixDQUFBOzt5QkFBQTs7S0FGMEIsY0FINUIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/background/ReferenceView.coffee