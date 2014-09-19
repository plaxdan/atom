(function() {
  var $, MarkerView, Subscriber;

  $ = require('atom').$;

  Subscriber = require('emissary').Subscriber;

  module.exports = MarkerView = (function() {
    Subscriber.includeInto(MarkerView);

    function MarkerView(_arg) {
      var _ref;
      _ref = _arg != null ? _arg : {}, this.editor = _ref.editor, this.marker = _ref.marker;
      this.regions = [];
      this.editSession = this.editor.editor;
      this.element = document.createElement('div');
      this.element.className = 'marker';
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.subscribe(this.marker, 'changed', (function(_this) {
        return function(event) {
          return _this.onMarkerChanged(event);
        };
      })(this));
      this.subscribe(this.marker, 'attributes-changed', (function(_this) {
        return function(_arg1) {
          var isCurrent;
          isCurrent = _arg1.isCurrent;
          return _this.updateCurrentClass(isCurrent);
        };
      })(this));
      this.subscribe(this.marker, 'destroyed', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
      this.subscribe(this.editor, 'editor:display-updated', (function(_this) {
        return function() {
          return _this.updateDisplay();
        };
      })(this));
    }

    MarkerView.prototype.remove = function() {
      this.unsubscribe();
      this.marker = null;
      this.editor = null;
      return this.element.remove();
    };

    MarkerView.prototype.show = function() {
      return this.element.style.display = "";
    };

    MarkerView.prototype.hide = function() {
      return this.element.style.display = "none";
    };

    MarkerView.prototype.onMarkerChanged = function(_arg) {
      var isValid;
      isValid = _arg.isValid;
      this.updateNeeded = isValid;
      if (isValid) {
        return this.show();
      } else {
        return this.hide();
      }
    };

    MarkerView.prototype.isUpdateNeeded = function() {
      var newScreenRange, oldScreenRange;
      if (!(this.updateNeeded && this.editSession === this.editor.editor)) {
        return false;
      }
      oldScreenRange = this.oldScreenRange;
      newScreenRange = this.getScreenRange();
      this.oldScreenRange = newScreenRange;
      return this.intersectsRenderedScreenRows(oldScreenRange) || this.intersectsRenderedScreenRows(newScreenRange);
    };

    MarkerView.prototype.intersectsRenderedScreenRows = function(range) {
      return range.intersectsRowRange(this.editor.firstRenderedScreenRow, this.editor.lastRenderedScreenRow);
    };

    MarkerView.prototype.updateCurrentClass = function(isCurrent) {
      if (isCurrent) {
        return $(this.element).addClass('current-result');
      } else {
        return $(this.element).removeClass('current-result');
      }
    };

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
      rowSpan = range.end.row - range.start.row;
      if (rowSpan === 0) {
        return this.appendRegion(1, range.start, range.end);
      } else {
        this.appendRegion(1, range.start, null);
        if (rowSpan > 1) {
          this.appendRegion(rowSpan - 1, {
            row: range.start.row + 1,
            column: 0
          }, null);
        }
        return this.appendRegion(1, {
          row: range.end.row,
          column: 0
        }, range.end);
      }
    };

    MarkerView.prototype.appendRegion = function(rows, start, end) {
      var charWidth, css, lineHeight, name, region, value, _ref;
      _ref = this.editor, lineHeight = _ref.lineHeight, charWidth = _ref.charWidth;
      css = this.editor.pixelPositionForScreenPosition(start);
      css.height = lineHeight * rows;
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
      this.element.appendChild(region);
      return this.regions.push(region);
    };

    MarkerView.prototype.clearRegions = function() {
      var region, _i, _len, _ref;
      _ref = this.regions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        region = _ref[_i];
        region.remove();
      }
      return this.regions = [];
    };

    MarkerView.prototype.getScreenRange = function() {
      return this.marker.getScreenRange();
    };

    MarkerView.prototype.getBufferRange = function() {
      return this.marker.getBufferRange();
    };

    return MarkerView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlCQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsTUFBUixFQUFMLENBQUQsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixVQUF2QixDQUFBLENBQUE7O0FBRWEsSUFBQSxvQkFBQyxJQUFELEdBQUE7QUFDWCxVQUFBLElBQUE7QUFBQSw0QkFEWSxPQUFxQixJQUFwQixJQUFDLENBQUEsY0FBQSxRQUFRLElBQUMsQ0FBQSxjQUFBLE1BQ3ZCLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFEdkIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUZYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixRQUhyQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUpoQixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFDLENBQUEsY0FBRCxDQUFBLENBTGxCLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE1BQVosRUFBb0IsU0FBcEIsRUFBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO2lCQUFXLEtBQUMsQ0FBQSxlQUFELENBQWlCLEtBQWpC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
//# sourceURL=/Users/daniel/.atom/packages/minimap-find-and-replace/lib/marker-view.coffee