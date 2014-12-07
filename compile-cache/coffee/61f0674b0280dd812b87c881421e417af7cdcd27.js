(function() {
  var $, MarkerMixin, MarkerView, Subscriber, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  MarkerMixin = require('./marker-mixin');

  module.exports = MarkerView = (function() {
    Subscriber.includeInto(MarkerView);

    MarkerMixin.includeInto(MarkerView);

    function MarkerView(_arg) {
      this.editorView = _arg.editorView, this.marker = _arg.marker;
      this.updateDisplay = __bind(this.updateDisplay, this);
      this.regions = [];
      this.editor = this.editorView.editor;
      this.element = document.createElement('div');
      this.element.className = 'marker color-highlight';
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.subscribeToMarker();
      this.updateDisplay();
    }

    MarkerView.prototype.updateDisplay = function() {
      var range, rowSpan;
      if (!this.isUpdateNeeded()) {
        return;
      }
      this.updateNeeded = false;
      this.clearRegions();
      range = this.getScreenRange();
      if (range.isEmpty()) {
        return;
      }
      if (this.hidden()) {
        this.hide();
      }
      rowSpan = range.end.row - range.start.row;
      if (rowSpan === 0) {
        return this.appendRegion(1, range.start, range.end);
      } else {
        this.appendRegion(1, range.start, {
          row: range.start.row,
          column: Infinity
        });
        if (rowSpan > 1) {
          this.appendRegion(rowSpan - 1, {
            row: range.start.row + 1,
            column: 0
          }, {
            row: range.start.row + 1,
            column: Infinity
          });
        }
        return this.appendRegion(1, {
          row: range.end.row,
          column: 0
        }, range.end);
      }
    };

    MarkerView.prototype.appendRegion = function(rows, start, end) {
      var bufferRange, charWidth, color, colorText, css, lineHeight, name, region, text, value, _ref1;
      _ref1 = this.editorView, lineHeight = _ref1.lineHeight, charWidth = _ref1.charWidth;
      color = this.getColor();
      colorText = this.getColorTextColor();
      bufferRange = this.editor.bufferRangeForScreenRange({
        start: start,
        end: end
      });
      text = this.editor.getTextInRange(bufferRange);
      css = this.editor.pixelPositionForScreenPosition(start);
      css.height = lineHeight * rows;
      if (end) {
        css.width = this.editor.pixelPositionForScreenPosition(end).left - css.left;
      } else {
        css.right = 0;
      }
      region = document.createElement('div');
      region.className = 'region';
      region.textContent = text;
      for (name in css) {
        value = css[name];
        region.style[name] = value + 'px';
      }
      region.style.backgroundColor = color;
      region.style.color = colorText;
      this.element.appendChild(region);
      return this.regions.push(region);
    };

    MarkerView.prototype.clearRegions = function() {
      var region, _i, _len, _ref1;
      _ref1 = this.regions;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        region = _ref1[_i];
        region.remove();
      }
      return this.regions = [];
    };

    return MarkerView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLFVBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLFVBQXhCLENBREEsQ0FBQTs7QUFHYSxJQUFBLG9CQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLGtCQUFBLFlBQVksSUFBQyxDQUFBLGNBQUEsTUFDM0IsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFEdEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUZYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQix3QkFIckIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FKaEIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUxsQixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQVBBLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FSQSxDQURXO0lBQUEsQ0FIYjs7QUFBQSx5QkFjQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxjQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLGNBQUQsQ0FBQSxDQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxZQUFELEdBQWdCLEtBRmhCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FIQSxDQUFBO0FBQUEsTUFJQSxLQUFBLEdBQVEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUpSLENBQUE7QUFLQSxNQUFBLElBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBQSxDQUFWO0FBQUEsY0FBQSxDQUFBO09BTEE7QUFPQSxNQUFBLElBQVcsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFYO0FBQUEsUUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBQTtPQVBBO0FBQUEsTUFTQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFWLEdBQWdCLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FUdEMsQ0FBQTtBQVdBLE1BQUEsSUFBRyxPQUFBLEtBQVcsQ0FBZDtlQUNFLElBQUMsQ0FBQSxZQUFELENBQWMsQ0FBZCxFQUFpQixLQUFLLENBQUMsS0FBdkIsRUFBOEIsS0FBSyxDQUFDLEdBQXBDLEVBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLENBQWQsRUFBaUIsS0FBSyxDQUFDLEtBQXZCLEVBQThCO0FBQUEsVUFBQyxHQUFBLEVBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFsQjtBQUFBLFVBQXVCLE1BQUEsRUFBUSxRQUEvQjtTQUE5QixDQUFBLENBQUE7QUFDQSxRQUFBLElBQUcsT0FBQSxHQUFVLENBQWI7QUFDRSxVQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsT0FBQSxHQUFVLENBQXhCLEVBQTJCO0FBQUEsWUFBRSxHQUFBLEVBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFaLEdBQWtCLENBQXpCO0FBQUEsWUFBNEIsTUFBQSxFQUFRLENBQXBDO1dBQTNCLEVBQW1FO0FBQUEsWUFBQyxHQUFBLEVBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFaLEdBQWtCLENBQXhCO0FBQUEsWUFBMkIsTUFBQSxFQUFRLFFBQW5DO1dBQW5FLENBQUEsQ0FERjtTQURBO2VBR0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxDQUFkLEVBQWlCO0FBQUEsVUFBRSxHQUFBLEVBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFqQjtBQUFBLFVBQXNCLE1BQUEsRUFBUSxDQUE5QjtTQUFqQixFQUFvRCxLQUFLLENBQUMsR0FBMUQsRUFORjtPQVphO0lBQUEsQ0FkZixDQUFBOztBQUFBLHlCQWtDQSxZQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLEdBQWQsR0FBQTtBQUNaLFVBQUEsMkZBQUE7QUFBQSxNQUFBLFFBQTRCLElBQUMsQ0FBQSxVQUE3QixFQUFFLG1CQUFBLFVBQUYsRUFBYyxrQkFBQSxTQUFkLENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBRCxDQUFBLENBRFIsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBRlosQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0M7QUFBQSxRQUFDLE9BQUEsS0FBRDtBQUFBLFFBQVEsS0FBQSxHQUFSO09BQWxDLENBSGQsQ0FBQTtBQUFBLE1BSUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixXQUF2QixDQUpQLENBQUE7QUFBQSxNQU1BLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLDhCQUFSLENBQXVDLEtBQXZDLENBTk4sQ0FBQTtBQUFBLE1BT0EsR0FBRyxDQUFDLE1BQUosR0FBYSxVQUFBLEdBQWEsSUFQMUIsQ0FBQTtBQVFBLE1BQUEsSUFBRyxHQUFIO0FBQ0UsUUFBQSxHQUFHLENBQUMsS0FBSixHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsOEJBQVIsQ0FBdUMsR0FBdkMsQ0FBMkMsQ0FBQyxJQUE1QyxHQUFtRCxHQUFHLENBQUMsSUFBbkUsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLEdBQUcsQ0FBQyxLQUFKLEdBQVksQ0FBWixDQUhGO09BUkE7QUFBQSxNQWFBLE1BQUEsR0FBUyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQWJULENBQUE7QUFBQSxNQWNBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLFFBZG5CLENBQUE7QUFBQSxNQWVBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLElBZnJCLENBQUE7QUFnQkEsV0FBQSxXQUFBOzBCQUFBO0FBQ0UsUUFBQSxNQUFNLENBQUMsS0FBTSxDQUFBLElBQUEsQ0FBYixHQUFxQixLQUFBLEdBQVEsSUFBN0IsQ0FERjtBQUFBLE9BaEJBO0FBQUEsTUFtQkEsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFiLEdBQStCLEtBbkIvQixDQUFBO0FBQUEsTUFvQkEsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLEdBQXFCLFNBcEJyQixDQUFBO0FBQUEsTUFzQkEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLE1BQXJCLENBdEJBLENBQUE7YUF1QkEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsTUFBZCxFQXhCWTtJQUFBLENBbENkLENBQUE7O0FBQUEseUJBNERBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixVQUFBLHVCQUFBO0FBQUE7QUFBQSxXQUFBLDRDQUFBOzJCQUFBO0FBQUEsUUFBQSxNQUFNLENBQUMsTUFBUCxDQUFBLENBQUEsQ0FBQTtBQUFBLE9BQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBRkM7SUFBQSxDQTVEZCxDQUFBOztzQkFBQTs7TUFORixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atom-color-highlight/lib/marker-view.coffee