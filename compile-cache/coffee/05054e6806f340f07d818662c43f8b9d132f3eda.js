(function() {
  var LocationDataUtil, Range;

  Range = require('atom').Range;

  module.exports = LocationDataUtil = (function() {
    function LocationDataUtil() {}

    LocationDataUtil.locationDataToRange = function(_arg) {
      var first_column, first_line, last_column, last_line;
      first_line = _arg.first_line, first_column = _arg.first_column, last_line = _arg.last_line, last_column = _arg.last_column;
      if (last_line == null) {
        last_line = first_line;
      }
      if (last_column == null) {
        last_column = first_column;
      }
      return new Range([first_line, first_column], [last_line, last_column + 1]);
    };

    LocationDataUtil.rangeToLocationData = function(_arg) {
      var end, start;
      start = _arg.start, end = _arg.end;
      return {
        first_line: start.row,
        first_column: start.column,
        last_line: end.row,
        last_column: end.column - 1
      };
    };

    LocationDataUtil.isEqualsLocationData = function(a, b) {
      return a.first_line === b.first_line && a.first_column === b.first_column && a.last_line === b.last_line && a.last_column === b.last_column;
    };

    return LocationDataUtil;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBOztBQUFBLEVBQUUsUUFBVSxPQUFBLENBQVEsTUFBUixFQUFWLEtBQUYsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007a0NBRUo7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLG1CQUFELEdBQXNCLFNBQUMsSUFBRCxHQUFBO0FBQ3BCLFVBQUEsZ0RBQUE7QUFBQSxNQUR1QixrQkFBQSxZQUFZLG9CQUFBLGNBQWMsaUJBQUEsV0FBVyxtQkFBQSxXQUM1RCxDQUFBOztRQUFBLFlBQWE7T0FBYjs7UUFDQSxjQUFlO09BRGY7YUFFSSxJQUFBLEtBQUEsQ0FBTSxDQUFFLFVBQUYsRUFBYyxZQUFkLENBQU4sRUFBb0MsQ0FBRSxTQUFGLEVBQWEsV0FBQSxHQUFjLENBQTNCLENBQXBDLEVBSGdCO0lBQUEsQ0FBdEIsQ0FBQTs7QUFBQSxJQUtBLGdCQUFDLENBQUEsbUJBQUQsR0FBc0IsU0FBQyxJQUFELEdBQUE7QUFDcEIsVUFBQSxVQUFBO0FBQUEsTUFEdUIsYUFBQSxPQUFPLFdBQUEsR0FDOUIsQ0FBQTthQUFBO0FBQUEsUUFBQSxVQUFBLEVBQWMsS0FBSyxDQUFDLEdBQXBCO0FBQUEsUUFDQSxZQUFBLEVBQWMsS0FBSyxDQUFDLE1BRHBCO0FBQUEsUUFFQSxTQUFBLEVBQWMsR0FBRyxDQUFDLEdBRmxCO0FBQUEsUUFHQSxXQUFBLEVBQWMsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUgzQjtRQURvQjtJQUFBLENBTHRCLENBQUE7O0FBQUEsSUFXQSxnQkFBQyxDQUFBLG9CQUFELEdBQXVCLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTthQUNyQixDQUFDLENBQUMsVUFBRixLQUFrQixDQUFDLENBQUMsVUFBcEIsSUFDQSxDQUFDLENBQUMsWUFBRixLQUFrQixDQUFDLENBQUMsWUFEcEIsSUFFQSxDQUFDLENBQUMsU0FBRixLQUFrQixDQUFDLENBQUMsU0FGcEIsSUFHQSxDQUFDLENBQUMsV0FBRixLQUFrQixDQUFDLENBQUMsWUFKQztJQUFBLENBWHZCLENBQUE7OzRCQUFBOztNQUxGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/coffee-refactor/lib/LocationDataUtil.coffee