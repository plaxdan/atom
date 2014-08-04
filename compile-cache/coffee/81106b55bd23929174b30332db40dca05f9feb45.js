(function() {
  var HighlightView, MarkerView, View, config,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../View');

  MarkerView = require('./MarkerView');

  config = atom.config;

  module.exports = HighlightView = (function(_super) {
    __extends(HighlightView, _super);

    HighlightView.className = '';

    HighlightView.content = function() {
      return this.div({
        "class": this.className
      });
    };

    HighlightView.prototype.configProperty = '';

    function HighlightView() {
      HighlightView.__super__.constructor.apply(this, arguments);
      config.observe(this.configProperty, (function(_this) {
        return function() {
          return _this.setEnabled(config.get(_this.configProperty));
        };
      })(this));
    }

    HighlightView.prototype.update = function(rowsList) {
      var rows, _i, _len, _results;
      this.empty();
      if (!(rowsList != null ? rowsList.length : void 0)) {
        return;
      }
      _results = [];
      for (_i = 0, _len = rowsList.length; _i < _len; _i++) {
        rows = rowsList[_i];
        _results.push(this.append(new MarkerView(rows)));
      }
      return _results;
    };

    HighlightView.prototype.setEnabled = function(isEnabled) {
      if (isEnabled) {
        return this.removeClass('is-disabled');
      } else {
        return this.addClass('is-disabled');
      }
    };

    return HighlightView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUVFLFNBQVcsS0FBWCxNQUZGLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosb0NBQUEsQ0FBQTs7QUFBQSxJQUFBLGFBQUMsQ0FBQSxTQUFELEdBQVksRUFBWixDQUFBOztBQUFBLElBRUEsYUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sSUFBQyxDQUFBLFNBQVI7T0FBTCxFQURRO0lBQUEsQ0FGVixDQUFBOztBQUFBLDRCQU1BLGNBQUEsR0FBZ0IsRUFOaEIsQ0FBQTs7QUFRYSxJQUFBLHVCQUFBLEdBQUE7QUFDWCxNQUFBLGdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsT0FBUCxDQUFlLElBQUMsQ0FBQSxjQUFoQixFQUFnQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUM5QixLQUFDLENBQUEsVUFBRCxDQUFZLE1BQU0sQ0FBQyxHQUFQLENBQVcsS0FBQyxDQUFBLGNBQVosQ0FBWixFQUQ4QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDLENBREEsQ0FEVztJQUFBLENBUmI7O0FBQUEsNEJBYUEsTUFBQSxHQUFRLFNBQUMsUUFBRCxHQUFBO0FBQ04sVUFBQSx3QkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxvQkFBYyxRQUFRLENBQUUsZ0JBQXhCO0FBQUEsY0FBQSxDQUFBO09BREE7QUFFQTtXQUFBLCtDQUFBOzRCQUFBO0FBQ0Usc0JBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBWSxJQUFBLFVBQUEsQ0FBVyxJQUFYLENBQVosRUFBQSxDQURGO0FBQUE7c0JBSE07SUFBQSxDQWJSLENBQUE7O0FBQUEsNEJBbUJBLFVBQUEsR0FBWSxTQUFDLFNBQUQsR0FBQTtBQUNWLE1BQUEsSUFBRyxTQUFIO2VBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBYSxhQUFiLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxhQUFWLEVBSEY7T0FEVTtJQUFBLENBbkJaLENBQUE7O3lCQUFBOztLQUYwQixLQUw1QixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/background/HighlightView.coffee