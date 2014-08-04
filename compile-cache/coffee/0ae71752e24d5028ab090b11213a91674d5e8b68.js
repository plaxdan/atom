(function() {
  var RegionView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../View');

  module.exports = RegionView = (function(_super) {
    __extends(RegionView, _super);

    RegionView.MIDDLE_ROW = parseInt('00', 2);

    RegionView.FIRST_ROW = parseInt('01', 2);

    RegionView.LAST_ROW = parseInt('10', 2);

    RegionView.SINGLE_ROW = parseInt('11', 2);

    RegionView.content = function() {
      return this.div({
        "class": 'region'
      });
    };

    function RegionView(_arg, isFirstRow, isLastRow) {
      var br, tl, where;
      tl = _arg.tl, br = _arg.br;
      RegionView.__super__.constructor.call(this);
      where = RegionView.MIDDLE_ROW;
      if (isFirstRow) {
        where |= RegionView.FIRST_ROW;
      }
      if (isLastRow) {
        where |= RegionView.LAST_ROW;
      }
      switch (where) {
        case RegionView.FIRST_ROW:
          this.addClass('first');
          break;
        case RegionView.MIDDLE_ROW:
          this.addClass('middle');
          break;
        case RegionView.LAST_ROW:
          this.addClass('last');
      }
      this.css({
        left: tl.left,
        top: tl.top,
        width: br.left - tl.left,
        height: br.top - tl.top
      });
    }

    return RegionView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLGlDQUFBLENBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsVUFBRCxHQUFhLFFBQUEsQ0FBUyxJQUFULEVBQWUsQ0FBZixDQUFiLENBQUE7O0FBQUEsSUFDQSxVQUFDLENBQUEsU0FBRCxHQUFZLFFBQUEsQ0FBUyxJQUFULEVBQWUsQ0FBZixDQURaLENBQUE7O0FBQUEsSUFFQSxVQUFDLENBQUEsUUFBRCxHQUFXLFFBQUEsQ0FBUyxJQUFULEVBQWUsQ0FBZixDQUZYLENBQUE7O0FBQUEsSUFHQSxVQUFDLENBQUEsVUFBRCxHQUFhLFFBQUEsQ0FBUyxJQUFULEVBQWUsQ0FBZixDQUhiLENBQUE7O0FBQUEsSUFLQSxVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxRQUFQO09BQUwsRUFEUTtJQUFBLENBTFYsQ0FBQTs7QUFTYSxJQUFBLG9CQUFDLElBQUQsRUFBYSxVQUFiLEVBQXlCLFNBQXpCLEdBQUE7QUFDWCxVQUFBLGFBQUE7QUFBQSxNQURjLFVBQUEsSUFBSSxVQUFBLEVBQ2xCLENBQUE7QUFBQSxNQUFBLDBDQUFBLENBQUEsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLFVBQVUsQ0FBQyxVQUZuQixDQUFBO0FBR0EsTUFBQSxJQUFHLFVBQUg7QUFDRSxRQUFBLEtBQUEsSUFBUyxVQUFVLENBQUMsU0FBcEIsQ0FERjtPQUhBO0FBS0EsTUFBQSxJQUFHLFNBQUg7QUFDRSxRQUFBLEtBQUEsSUFBUyxVQUFVLENBQUMsUUFBcEIsQ0FERjtPQUxBO0FBT0EsY0FBTyxLQUFQO0FBQUEsYUFDTyxVQUFVLENBQUMsU0FEbEI7QUFFSSxVQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixDQUFBLENBRko7QUFDTztBQURQLGFBR08sVUFBVSxDQUFDLFVBSGxCO0FBSUksVUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsQ0FBQSxDQUpKO0FBR087QUFIUCxhQUtPLFVBQVUsQ0FBQyxRQUxsQjtBQU1JLFVBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLENBQUEsQ0FOSjtBQUFBLE9BUEE7QUFBQSxNQWVBLElBQUMsQ0FBQSxHQUFELENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBUSxFQUFFLENBQUMsSUFBWDtBQUFBLFFBQ0EsR0FBQSxFQUFRLEVBQUUsQ0FBQyxHQURYO0FBQUEsUUFFQSxLQUFBLEVBQVEsRUFBRSxDQUFDLElBQUgsR0FBVSxFQUFFLENBQUMsSUFGckI7QUFBQSxRQUdBLE1BQUEsRUFBUSxFQUFFLENBQUMsR0FBSCxHQUFTLEVBQUUsQ0FBQyxHQUhwQjtPQURGLENBZkEsQ0FEVztJQUFBLENBVGI7O3NCQUFBOztLQUZ1QixLQUh6QixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/background/RegionView.coffee