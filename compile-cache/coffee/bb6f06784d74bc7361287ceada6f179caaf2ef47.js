(function() {
  var $, GutterView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../View');

  $ = require('atom').$;

  module.exports = GutterView = (function(_super) {
    __extends(GutterView, _super);

    GutterView.content = function() {
      return this.div();
    };

    function GutterView(gutter) {
      this.gutter = gutter;
      GutterView.__super__.constructor.call(this);
    }

    GutterView.prototype.empty = function() {
      this.gutter.removeClassFromAllLines('refactor-error');
      return this.gutter.find('.line-number .icon-right').attr('title', '');
    };

    GutterView.prototype.update = function(errors) {
      var message, range, _i, _len, _ref, _results;
      this.empty();
      if (errors == null) {
        return;
      }
      _results = [];
      for (_i = 0, _len = errors.length; _i < _len; _i++) {
        _ref = errors[_i], range = _ref.range, message = _ref.message;
        _results.push($(this.gutter.getLineNumberElement(range.start.row)).addClass('refactor-error').attr('title', message));
      }
      return _results;
    };

    return GutterView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0UsSUFBTSxPQUFBLENBQVEsTUFBUixFQUFOLENBREYsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixpQ0FBQSxDQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBR2EsSUFBQSxvQkFBRSxNQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BQUEsMENBQUEsQ0FBQSxDQURXO0lBQUEsQ0FIYjs7QUFBQSx5QkFNQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLGdCQUFoQyxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFDRCxDQUFDLElBREQsQ0FDTSwwQkFETixDQUVBLENBQUMsSUFGRCxDQUVNLE9BRk4sRUFFZSxFQUZmLEVBRks7SUFBQSxDQU5QLENBQUE7O0FBQUEseUJBWUEsTUFBQSxHQUFRLFNBQUMsTUFBRCxHQUFBO0FBQ04sVUFBQSx3Q0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxNQUFBLElBQWMsY0FBZDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBRUE7V0FBQSw2Q0FBQSxHQUFBO0FBQ0UsMkJBREksYUFBQSxPQUFPLGVBQUEsT0FDWCxDQUFBO0FBQUEsc0JBQUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUF6QyxDQUFGLENBQ0EsQ0FBQyxRQURELENBQ1UsZ0JBRFYsQ0FFQSxDQUFDLElBRkQsQ0FFTSxPQUZOLEVBRWUsT0FGZixFQUFBLENBREY7QUFBQTtzQkFITTtJQUFBLENBWlIsQ0FBQTs7c0JBQUE7O0tBRnVCLEtBSnpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/gutter/GutterView.coffee