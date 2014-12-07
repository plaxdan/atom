(function() {
  var $, EditorAdapter, ReactAdapter, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = require('atom').$;

  _ = require('underscore-plus');

  EditorAdapter = (function() {
    function EditorAdapter(view) {
      this.view = view;
      this.editor = this.view.getEditor();
    }

    EditorAdapter.prototype.append = function(child) {};

    EditorAdapter.prototype.linesElement = function() {};

    EditorAdapter.prototype.linesForMarker = function(marker) {};

    EditorAdapter.adapt = function(view) {
      return new ReactAdapter(view);
    };

    return EditorAdapter;

  })();

  ReactAdapter = (function(_super) {
    __extends(ReactAdapter, _super);

    function ReactAdapter() {
      return ReactAdapter.__super__.constructor.apply(this, arguments);
    }

    ReactAdapter.prototype.append = function(child) {
      this.view.appendToLinesView(child);
      return child.css('z-index', 2);
    };

    ReactAdapter.prototype.linesElement = function() {
      return this.view.find('.lines');
    };

    ReactAdapter.prototype.linesForMarker = function(marker) {
      var fromBuffer, fromScreen, result, row, toBuffer, toScreen, _i, _len, _ref;
      fromBuffer = marker.getTailBufferPosition();
      fromScreen = this.editor.screenPositionForBufferPosition(fromBuffer);
      toBuffer = marker.getHeadBufferPosition();
      toScreen = this.editor.screenPositionForBufferPosition(toBuffer);
      result = $();
      _ref = _.range(fromScreen.row, toScreen.row);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        result = result.add(this.view.component.lineNodeForScreenRow(row));
      }
      return result;
    };

    return ReactAdapter;

  })(EditorAdapter);

  module.exports = {
    EditorAdapter: EditorAdapter
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxNQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFHTTtBQUVTLElBQUEsdUJBQUUsSUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsT0FBQSxJQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLENBQUEsQ0FBVixDQURXO0lBQUEsQ0FBYjs7QUFBQSw0QkFHQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUEsQ0FIUixDQUFBOztBQUFBLDRCQUtBLFlBQUEsR0FBYyxTQUFBLEdBQUEsQ0FMZCxDQUFBOztBQUFBLDRCQU9BLGNBQUEsR0FBZ0IsU0FBQyxNQUFELEdBQUEsQ0FQaEIsQ0FBQTs7QUFBQSxJQVNBLGFBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxJQUFELEdBQUE7YUFBYyxJQUFBLFlBQUEsQ0FBYSxJQUFiLEVBQWQ7SUFBQSxDQVRSLENBQUE7O3lCQUFBOztNQUxGLENBQUE7O0FBQUEsRUFnQk07QUFFSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMkJBQUEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLGlCQUFOLENBQXdCLEtBQXhCLENBQUEsQ0FBQTthQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBVixFQUFxQixDQUFyQixFQUZNO0lBQUEsQ0FBUixDQUFBOztBQUFBLDJCQUlBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQUg7SUFBQSxDQUpkLENBQUE7O0FBQUEsMkJBTUEsY0FBQSxHQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLFVBQUEsdUVBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxNQUFNLENBQUMscUJBQVAsQ0FBQSxDQUFiLENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLCtCQUFSLENBQXdDLFVBQXhDLENBRGIsQ0FBQTtBQUFBLE1BRUEsUUFBQSxHQUFXLE1BQU0sQ0FBQyxxQkFBUCxDQUFBLENBRlgsQ0FBQTtBQUFBLE1BR0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsK0JBQVIsQ0FBd0MsUUFBeEMsQ0FIWCxDQUFBO0FBQUEsTUFLQSxNQUFBLEdBQVMsQ0FBQSxDQUFBLENBTFQsQ0FBQTtBQU1BO0FBQUEsV0FBQSwyQ0FBQTt1QkFBQTtBQUNFLFFBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxHQUFQLENBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQWhCLENBQXFDLEdBQXJDLENBQVgsQ0FBVCxDQURGO0FBQUEsT0FOQTthQVFBLE9BVGM7SUFBQSxDQU5oQixDQUFBOzt3QkFBQTs7S0FGeUIsY0FoQjNCLENBQUE7O0FBQUEsRUFtQ0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsYUFBQSxFQUFlLGFBQWY7R0FwQ0YsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/editor-adapter.coffee