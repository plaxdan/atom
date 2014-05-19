(function() {
  var $el, $selection, Convert, _context, _height, _width;

  Convert = require('./ColorPicker-convert');

  $el = atom.workspaceView.find('#ColorPicker-saturationSelector');

  $selection = atom.workspaceView.find('#ColorPicker-saturationSelection');

  _context = $el[0].getContext('2d');

  _width = $el.width();

  _height = $el.height();

  module.exports = {
    $el: $el,
    $selection: $selection,
    width: _width,
    height: _height,
    render: function(hex) {
      var _gradient, _hsl;
      _hsl = Convert.hexToHsl(hex);
      _context.clearRect(0, 0, _width, _height);
      _gradient = _context.createLinearGradient(0, 0, _width, 1);
      _gradient.addColorStop(.01, '#fff');
      _gradient.addColorStop(.99, "hsl(" + _hsl[0] + ", 100%, 50%)");
      _context.fillStyle = _gradient;
      _context.fillRect(0, 0, _width, _height);
      _gradient = _context.createLinearGradient(0, 0, 1, _height);
      _gradient.addColorStop(.01, 'rgba(0, 0, 0, 0)');
      _gradient.addColorStop(.99, '#000');
      _context.fillStyle = _gradient;
      return _context.fillRect(0, 0, _width, _height);
    },
    getColorAtPosition: function(positionX, positionY) {
      var _data;
      _data = (_context.getImageData(positionX - 1, positionY - 1, 1, 1)).data;
      return {
        color: '#' + Convert.rgbToHex(_data),
        type: 'hex'
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR1E7QUFBQSxNQUFBLG1EQUFBOztBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSx1QkFBUixDQUFWLENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFuQixDQUF3QixpQ0FBeEIsQ0FGTixDQUFBOztBQUFBLEVBR0EsVUFBQSxHQUFhLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0Isa0NBQXhCLENBSGIsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxHQUFJLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBUCxDQUFrQixJQUFsQixDQUpYLENBQUE7O0FBQUEsRUFLQSxNQUFBLEdBQVMsR0FBRyxDQUFDLEtBQUosQ0FBQSxDQUxULENBQUE7O0FBQUEsRUFNQSxPQUFBLEdBQVUsR0FBRyxDQUFDLE1BQUosQ0FBQSxDQU5WLENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsT0FBUCxHQUNJO0FBQUEsSUFBQSxHQUFBLEVBQUssR0FBTDtBQUFBLElBQ0EsVUFBQSxFQUFZLFVBRFo7QUFBQSxJQUVBLEtBQUEsRUFBTyxNQUZQO0FBQUEsSUFHQSxNQUFBLEVBQVEsT0FIUjtBQUFBLElBTUEsTUFBQSxFQUFRLFNBQUMsR0FBRCxHQUFBO0FBQ0osVUFBQSxlQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLFFBQVIsQ0FBaUIsR0FBakIsQ0FBUCxDQUFBO0FBQUEsTUFDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixNQUF6QixFQUFpQyxPQUFqQyxDQURBLENBQUE7QUFBQSxNQUlBLFNBQUEsR0FBWSxRQUFRLENBQUMsb0JBQVQsQ0FBOEIsQ0FBOUIsRUFBaUMsQ0FBakMsRUFBb0MsTUFBcEMsRUFBNEMsQ0FBNUMsQ0FKWixDQUFBO0FBQUEsTUFLQSxTQUFTLENBQUMsWUFBVixDQUF1QixHQUF2QixFQUE0QixNQUE1QixDQUxBLENBQUE7QUFBQSxNQU1BLFNBQVMsQ0FBQyxZQUFWLENBQXVCLEdBQXZCLEVBQTZCLE1BQUEsR0FBNUMsSUFBSyxDQUFBLENBQUEsQ0FBdUMsR0FBZ0IsY0FBN0MsQ0FOQSxDQUFBO0FBQUEsTUFRQSxRQUFRLENBQUMsU0FBVCxHQUFxQixTQVJyQixDQUFBO0FBQUEsTUFTQSxRQUFRLENBQUMsUUFBVCxDQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixNQUF4QixFQUFnQyxPQUFoQyxDQVRBLENBQUE7QUFBQSxNQVlBLFNBQUEsR0FBWSxRQUFRLENBQUMsb0JBQVQsQ0FBOEIsQ0FBOUIsRUFBaUMsQ0FBakMsRUFBb0MsQ0FBcEMsRUFBdUMsT0FBdkMsQ0FaWixDQUFBO0FBQUEsTUFhQSxTQUFTLENBQUMsWUFBVixDQUF1QixHQUF2QixFQUE0QixrQkFBNUIsQ0FiQSxDQUFBO0FBQUEsTUFjQSxTQUFTLENBQUMsWUFBVixDQUF1QixHQUF2QixFQUE0QixNQUE1QixDQWRBLENBQUE7QUFBQSxNQWdCQSxRQUFRLENBQUMsU0FBVCxHQUFxQixTQWhCckIsQ0FBQTthQWlCQSxRQUFRLENBQUMsUUFBVCxDQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixNQUF4QixFQUFnQyxPQUFoQyxFQWxCSTtJQUFBLENBTlI7QUFBQSxJQTJCQSxrQkFBQSxFQUFvQixTQUFDLFNBQUQsRUFBWSxTQUFaLEdBQUE7QUFDaEIsVUFBQSxLQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsQ0FBQyxRQUFRLENBQUMsWUFBVCxDQUF1QixTQUFBLEdBQVksQ0FBbkMsRUFBd0MsU0FBQSxHQUFZLENBQXBELEVBQXdELENBQXhELEVBQTJELENBQTNELENBQUQsQ0FBOEQsQ0FBQyxJQUF2RSxDQUFBO0FBRUEsYUFBTztBQUFBLFFBQ0gsS0FBQSxFQUFRLEdBQUEsR0FBTSxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQURYO0FBQUEsUUFFSCxJQUFBLEVBQU0sS0FGSDtPQUFQLENBSGdCO0lBQUEsQ0EzQnBCO0dBWkosQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/color-picker/lib/ColorPicker-saturationSelector.coffee