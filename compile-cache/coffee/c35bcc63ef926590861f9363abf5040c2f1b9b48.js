(function() {
  var $, MarkerView;

  $ = require('atom').$;

  module.exports = MarkerView = (function() {
    function MarkerView(range, parent, editor) {
      var rowSpan;
      this.range = range;
      this.parent = parent;
      this.editor = editor;
      this.element = document.createElement('div');
      this.element.className = 'marker';
      rowSpan = range.end.row - range.start.row;
      if (rowSpan === 0) {
        this.appendRegion(1, range.start, range.end);
      } else {
        this.appendRegion(1, range.start, null);
        if (rowSpan > 1) {
          this.appendRegion(rowSpan - 1, {
            row: range.start.row + 1,
            column: 0
          }, null);
        }
        this.appendRegion(1, {
          row: range.end.row,
          column: 0
        }, range.end);
      }
    }

    MarkerView.prototype.appendRegion = function(rows, start, end) {
      var css, name, region, value;
      css = this.editor.pixelPositionForScreenPosition(start);
      css.height = atom.config.getSettings().editor.lineHeight * atom.config.getSettings().editor.fontSize * rows;
      if (end) {
        css.width = this.editor.pixelPositionForScreenPosition(end).left - css.left;
      } else {
        css.right = 0;
      }
      region = document.createElement('div');
      region.className = 'region';
      for (name in css) {
        value = css[name];
        region.style[name] = value + 'px';
      }
      return this.element.appendChild(region);
    };

    return MarkerView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxNQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVTLElBQUEsb0JBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsTUFBaEIsR0FBQTtBQUNYLFVBQUEsT0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQUFULENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFEVixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLE1BRlYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUhYLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixRQUpyQixDQUFBO0FBQUEsTUFLQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFWLEdBQWdCLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FMdEMsQ0FBQTtBQU9BLE1BQUEsSUFBRyxPQUFBLEtBQVcsQ0FBZDtBQUNFLFFBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxDQUFkLEVBQWlCLEtBQUssQ0FBQyxLQUF2QixFQUE4QixLQUFLLENBQUMsR0FBcEMsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxDQUFkLEVBQWlCLEtBQUssQ0FBQyxLQUF2QixFQUE4QixJQUE5QixDQUFBLENBQUE7QUFDQSxRQUFBLElBQUcsT0FBQSxHQUFVLENBQWI7QUFDRSxVQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsT0FBQSxHQUFVLENBQXhCLEVBQTJCO0FBQUEsWUFBRSxHQUFBLEVBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFaLEdBQWtCLENBQXpCO0FBQUEsWUFBNEIsTUFBQSxFQUFRLENBQXBDO1dBQTNCLEVBQW1FLElBQW5FLENBQUEsQ0FERjtTQURBO0FBQUEsUUFHQSxJQUFDLENBQUEsWUFBRCxDQUFjLENBQWQsRUFBaUI7QUFBQSxVQUFFLEdBQUEsRUFBSyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQWpCO0FBQUEsVUFBc0IsTUFBQSxFQUFRLENBQTlCO1NBQWpCLEVBQW9ELEtBQUssQ0FBQyxHQUExRCxDQUhBLENBSEY7T0FSVztJQUFBLENBQWI7O0FBQUEseUJBZ0JBLFlBQUEsR0FBYyxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsR0FBZCxHQUFBO0FBQ1osVUFBQSx3QkFBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsOEJBQVIsQ0FBdUMsS0FBdkMsQ0FBTixDQUFBO0FBQUEsTUFDQSxHQUFHLENBQUMsTUFBSixHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUFBLENBQXlCLENBQUMsTUFBTSxDQUFDLFVBQWpDLEdBQThDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUFBLENBQXlCLENBQUMsTUFBTSxDQUFDLFFBQS9FLEdBQTBGLElBRHZHLENBQUE7QUFFQSxNQUFBLElBQUcsR0FBSDtBQUNFLFFBQUEsR0FBRyxDQUFDLEtBQUosR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLDhCQUFSLENBQXVDLEdBQXZDLENBQTJDLENBQUMsSUFBNUMsR0FBbUQsR0FBRyxDQUFDLElBQW5FLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxHQUFHLENBQUMsS0FBSixHQUFZLENBQVosQ0FIRjtPQUZBO0FBQUEsTUFPQSxNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FQVCxDQUFBO0FBQUEsTUFRQSxNQUFNLENBQUMsU0FBUCxHQUFtQixRQVJuQixDQUFBO0FBU0EsV0FBQSxXQUFBOzBCQUFBO0FBQ0UsUUFBQSxNQUFNLENBQUMsS0FBTSxDQUFBLElBQUEsQ0FBYixHQUFxQixLQUFBLEdBQVEsSUFBN0IsQ0FERjtBQUFBLE9BVEE7YUFZQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsTUFBckIsRUFiWTtJQUFBLENBaEJkLENBQUE7O3NCQUFBOztNQUxGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/highlight-selected/lib/marker-view.coffee