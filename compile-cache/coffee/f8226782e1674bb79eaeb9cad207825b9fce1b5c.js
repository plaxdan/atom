(function() {
  var $, DotMarkerView, MarkerMixin, Subscriber, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  MarkerMixin = require('./marker-mixin');

  module.exports = DotMarkerView = (function() {
    Subscriber.includeInto(DotMarkerView);

    MarkerMixin.includeInto(DotMarkerView);

    function DotMarkerView(_arg) {
      this.editorView = _arg.editorView, this.marker = _arg.marker, this.markersByRows = _arg.markersByRows;
      this.updateDisplay = __bind(this.updateDisplay, this);
      this.editor = this.editorView.editor;
      this.element = document.createElement('div');
      this.element.innerHTML = '<div class="selector"/>';
      this.element.className = 'dot-marker color-highlight';
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.buffer = this.editor.buffer;
      this.clearPosition = true;
      this.subscribeToMarker();
      this.updateDisplay();
    }

    DotMarkerView.prototype.updateDisplay = function() {
      var color, colorText, left, line, lineLength, position, range, size, spacing, top, _base, _name, _ref1;
      if (!this.isUpdateNeeded()) {
        return;
      }
      this.updateNeeded = false;
      range = this.getScreenRange();
      if (range.isEmpty()) {
        return;
      }
      if (this.hidden()) {
        this.hide();
      }
      size = this.getSize();
      spacing = this.getSpacing();
      if ((_base = this.markersByRows)[_name = range.start.row] == null) {
        _base[_name] = 0;
      }
      if (this.clearPosition) {
        this.position = this.markersByRows[range.start.row];
        this.clearPosition = false;
      }
      this.markersByRows[range.start.row]++;
      color = this.getColor();
      colorText = this.getColorTextColor();
      line = this.editor.lineTextForScreenRow(range.start.row);
      lineLength = line.length;
      position = {
        row: range.start.row,
        column: lineLength
      };
      _ref1 = this.editorView.pixelPositionForScreenPosition(position), top = _ref1.top, left = _ref1.left;
      this.element.style.top = top + 'px';
      this.element.style.width = size + 'px';
      this.element.style.height = size + 'px';
      this.element.style.left = (left + spacing + this.position * (size + spacing)) + 'px';
      this.element.style.backgroundColor = color;
      return this.element.style.color = colorText;
    };

    DotMarkerView.prototype.getSize = function() {
      return atom.config.get('atom-color-highlight.dotMarkersSize');
    };

    DotMarkerView.prototype.getSpacing = function() {
      return atom.config.get('atom-color-highlight.dotMarkersSpacing');
    };

    return DotMarkerView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLGFBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLGFBQXhCLENBREEsQ0FBQTs7QUFHYSxJQUFBLHVCQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLGtCQUFBLFlBQVksSUFBQyxDQUFBLGNBQUEsUUFBUSxJQUFDLENBQUEscUJBQUEsYUFDcEMsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUF0QixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBRFgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLHlCQUZyQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsNEJBSHJCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBSmhCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUMsQ0FBQSxj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
//# sourceURL=/Users/daniel/.atom/packages/atom-color-highlight/lib/dot-marker-view.coffee