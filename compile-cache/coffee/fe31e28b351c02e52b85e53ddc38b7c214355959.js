(function() {
  var MarkerView, RegionView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../View');

  RegionView = require('./RegionView');

  module.exports = MarkerView = (function(_super) {
    __extends(MarkerView, _super);

    MarkerView.content = function() {
      return this.div({
        "class": 'marker'
      });
    };

    function MarkerView(rows) {
      var i, max, min, row, _i, _len;
      MarkerView.__super__.constructor.call(this);
      min = 0;
      max = rows.length - 1;
      for (i = _i = 0, _len = rows.length; _i < _len; i = ++_i) {
        row = rows[i];
        this.append(new RegionView(row, i === min, i === max));
      }
    }

    return MarkerView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixpQ0FBQSxDQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBSWEsSUFBQSxvQkFBQyxJQUFELEdBQUE7QUFDWCxVQUFBLDBCQUFBO0FBQUEsTUFBQSwwQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLEdBQUEsR0FBTSxDQUROLENBQUE7QUFBQSxNQUVBLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTCxHQUFjLENBRnBCLENBQUE7QUFHQSxXQUFBLG1EQUFBO3NCQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsTUFBRCxDQUFZLElBQUEsVUFBQSxDQUFXLEdBQVgsRUFBZ0IsQ0FBQSxLQUFLLEdBQXJCLEVBQTBCLENBQUEsS0FBSyxHQUEvQixDQUFaLENBQUEsQ0FERjtBQUFBLE9BSlc7SUFBQSxDQUpiOztzQkFBQTs7S0FGdUIsS0FKekIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/background/MarkerView.coffee