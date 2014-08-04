(function() {
  var $, ClassicAdapter, EditorAdapter, EditorView, ReactAdapter, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), EditorView = _ref.EditorView, $ = _ref.$;

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
      if (view instanceof EditorView) {
        return new ClassicAdapter(view);
      } else {
        return new ReactAdapter(view);
      }
    };

    return EditorAdapter;

  })();

  ClassicAdapter = (function(_super) {
    __extends(ClassicAdapter, _super);

    function ClassicAdapter() {
      return ClassicAdapter.__super__.constructor.apply(this, arguments);
    }

    ClassicAdapter.prototype.append = function(child) {
      return child.appendTo(this.view.overlayer);
    };

    ClassicAdapter.prototype.linesElement = function() {
      return this.view.renderedLines;
    };

    ClassicAdapter.prototype.linesForMarker = function(marker) {
      var fromBuffer, fromScreen, high, low, result, row, toBuffer, toScreen, _i, _len, _ref1;
      fromBuffer = marker.getTailBufferPosition();
      fromScreen = this.editor.screenPositionForBufferPosition(fromBuffer);
      toBuffer = marker.getHeadBufferPosition();
      toScreen = this.editor.screenPositionForBufferPosition(toBuffer);
      low = this.view.getFirstVisibleScreenRow();
      high = this.view.getLastVisibleScreenRow();
      result = $();
      _ref1 = _.range(fromScreen.row, toScreen.row);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (low <= row && row <= high) {
          result = result.add(this.view.lineElementForScreenRow(row));
        }
      }
      return result;
    };

    return ClassicAdapter;

  })(EditorAdapter);

  ReactAdapter = (function(_super) {
    __extends(ReactAdapter, _super);

    function ReactAdapter() {
      return ReactAdapter.__super__.constructor.apply(this, arguments);
    }

    ReactAdapter.prototype.append = function(child) {
      return this.view.appendToLinesView(child);
    };

    ReactAdapter.prototype.linesElement = function() {
      return this.view.find('.lines');
    };

    ReactAdapter.prototype.linesForMarker = function(marker) {
      var fromBuffer, fromScreen, result, row, toBuffer, toScreen, _i, _len, _ref1;
      fromBuffer = marker.getTailBufferPosition();
      fromScreen = this.editor.screenPositionForBufferPosition(fromBuffer);
      toBuffer = marker.getHeadBufferPosition();
      toScreen = this.editor.screenPositionForBufferPosition(toBuffer);
      result = $();
      _ref1 = _.range(fromScreen.row, toScreen.row);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1FQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFrQixPQUFBLENBQVEsTUFBUixDQUFsQixFQUFDLGtCQUFBLFVBQUQsRUFBYSxTQUFBLENBQWIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR007QUFFUyxJQUFBLHVCQUFFLElBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLE9BQUEsSUFDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFBLENBQVYsQ0FEVztJQUFBLENBQWI7O0FBQUEsNEJBR0EsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBLENBSFIsQ0FBQTs7QUFBQSw0QkFLQSxZQUFBLEdBQWMsU0FBQSxHQUFBLENBTGQsQ0FBQTs7QUFBQSw0QkFPQSxjQUFBLEdBQWdCLFNBQUMsTUFBRCxHQUFBLENBUGhCLENBQUE7O0FBQUEsSUFTQSxhQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsSUFBRCxHQUFBO0FBQ04sTUFBQSxJQUFHLElBQUEsWUFBZ0IsVUFBbkI7ZUFDTSxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBRE47T0FBQSxNQUFBO2VBR00sSUFBQSxZQUFBLENBQWEsSUFBYixFQUhOO09BRE07SUFBQSxDQVRSLENBQUE7O3lCQUFBOztNQUxGLENBQUE7O0FBQUEsRUFxQk07QUFFSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNkJBQUEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO2FBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQXJCLEVBQVg7SUFBQSxDQUFSLENBQUE7O0FBQUEsNkJBRUEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsY0FBVDtJQUFBLENBRmQsQ0FBQTs7QUFBQSw2QkFJQSxjQUFBLEdBQWdCLFNBQUMsTUFBRCxHQUFBO0FBQ2QsVUFBQSxtRkFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLE1BQU0sQ0FBQyxxQkFBUCxDQUFBLENBQWIsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsK0JBQVIsQ0FBd0MsVUFBeEMsQ0FEYixDQUFBO0FBQUEsTUFFQSxRQUFBLEdBQVcsTUFBTSxDQUFDLHFCQUFQLENBQUEsQ0FGWCxDQUFBO0FBQUEsTUFHQSxRQUFBLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQywrQkFBUixDQUF3QyxRQUF4QyxDQUhYLENBQUE7QUFBQSxNQUtBLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBSSxDQUFDLHdCQUFOLENBQUEsQ0FMTixDQUFBO0FBQUEsTUFNQSxJQUFBLEdBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyx1QkFBTixDQUFBLENBTlAsQ0FBQTtBQUFBLE1BUUEsTUFBQSxHQUFTLENBQUEsQ0FBQSxDQVJULENBQUE7QUFTQTtBQUFBLFdBQUEsNENBQUE7d0JBQUE7QUFDRSxRQUFBLElBQUcsR0FBQSxJQUFPLEdBQVAsSUFBZSxHQUFBLElBQU8sSUFBekI7QUFDRSxVQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsR0FBUCxDQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsdUJBQU4sQ0FBOEIsR0FBOUIsQ0FBWCxDQUFULENBREY7U0FERjtBQUFBLE9BVEE7YUFZQSxPQWJjO0lBQUEsQ0FKaEIsQ0FBQTs7MEJBQUE7O0tBRjJCLGNBckI3QixDQUFBOztBQUFBLEVBMENNO0FBRUosbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDJCQUFBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTthQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsaUJBQU4sQ0FBd0IsS0FBeEIsRUFBWDtJQUFBLENBQVIsQ0FBQTs7QUFBQSwyQkFFQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFIO0lBQUEsQ0FGZCxDQUFBOztBQUFBLDJCQUlBLGNBQUEsR0FBZ0IsU0FBQyxNQUFELEdBQUE7QUFDZCxVQUFBLHdFQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsTUFBTSxDQUFDLHFCQUFQLENBQUEsQ0FBYixDQUFBO0FBQUEsTUFDQSxVQUFBLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQywrQkFBUixDQUF3QyxVQUF4QyxDQURiLENBQUE7QUFBQSxNQUVBLFFBQUEsR0FBVyxNQUFNLENBQUMscUJBQVAsQ0FBQSxDQUZYLENBQUE7QUFBQSxNQUdBLFFBQUEsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLCtCQUFSLENBQXdDLFFBQXhDLENBSFgsQ0FBQTtBQUFBLE1BS0EsTUFBQSxHQUFTLENBQUEsQ0FBQSxDQUxULENBQUE7QUFNQTtBQUFBLFdBQUEsNENBQUE7d0JBQUE7QUFDRSxRQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsR0FBUCxDQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFoQixDQUFxQyxHQUFyQyxDQUFYLENBQVQsQ0FERjtBQUFBLE9BTkE7YUFRQSxPQVRjO0lBQUEsQ0FKaEIsQ0FBQTs7d0JBQUE7O0tBRnlCLGNBMUMzQixDQUFBOztBQUFBLEVBMkRBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGFBQUEsRUFBZSxhQUFmO0dBNURGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/editor-adapter.coffee