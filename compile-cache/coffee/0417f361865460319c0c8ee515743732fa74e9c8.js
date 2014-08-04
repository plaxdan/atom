(function() {
  var $, CoveringView, EditorAdapter, EditorView, View, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), EditorView = _ref.EditorView, View = _ref.View, $ = _ref.$;

  _ = require('underscore-plus');

  EditorAdapter = require('./editor-adapter').EditorAdapter;

  CoveringView = (function(_super) {
    __extends(CoveringView, _super);

    function CoveringView() {
      return CoveringView.__super__.constructor.apply(this, arguments);
    }

    CoveringView.prototype.initialize = function(editorView) {
      this.editorView = editorView;
      this.adapter = EditorAdapter.adapt(this.editorView);
      this.adapter.append(this);
      this.reposition();
      return this.cover().on("changed", (function(_this) {
        return function() {
          return _this.reposition();
        };
      })(this));
    };

    CoveringView.prototype.cover = function() {
      return null;
    };

    CoveringView.prototype.conflict = function() {
      return null;
    };

    CoveringView.prototype.isDirty = function() {
      return false;
    };

    CoveringView.prototype.getModel = function() {
      return null;
    };

    CoveringView.prototype.reposition = function() {
      var anchor, marker, ref;
      marker = this.cover();
      anchor = this.adapter.linesElement().offset();
      ref = this.offsetForMarker(marker);
      this.offset({
        top: ref.top + anchor.top
      });
      return this.height(this.editorView.lineHeight);
    };

    CoveringView.prototype.editor = function() {
      return this.editorView.getEditor();
    };

    CoveringView.prototype.buffer = function() {
      return this.editor().getBuffer();
    };

    CoveringView.prototype.offsetForMarker = function(marker) {
      var position;
      position = marker.getTailBufferPosition();
      return this.editorView.pixelPositionForBufferPosition(position);
    };

    CoveringView.prototype.deleteMarker = function(marker) {
      this.buffer()["delete"](marker.getBufferRange());
      return marker.destroy();
    };

    CoveringView.prototype.scrollTo = function(positionOrNull) {
      if (positionOrNull != null) {
        return this.editor().setCursorBufferPosition(positionOrNull);
      }
    };

    CoveringView.prototype.prependKeystroke = function(eventName, element) {
      var bindings, e, original, _i, _len, _results;
      bindings = atom.keymap.keyBindingsMatchingElement(this.editorView);
      _results = [];
      for (_i = 0, _len = bindings.length; _i < _len; _i++) {
        e = bindings[_i];
        if (!(e.command === eventName)) {
          continue;
        }
        original = element.text();
        _results.push(element.text(_.humanizeKeystroke(e.keystroke) + (" " + original)));
      }
      return _results;
    };

    return CoveringView;

  })(View);

  module.exports = {
    CoveringView: CoveringView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF3QixPQUFBLENBQVEsTUFBUixDQUF4QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxZQUFBLElBQWIsRUFBbUIsU0FBQSxDQUFuQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQyxnQkFBaUIsT0FBQSxDQUFRLGtCQUFSLEVBQWpCLGFBRkQsQ0FBQTs7QUFBQSxFQUtNO0FBRUosbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDJCQUFBLFVBQUEsR0FBWSxTQUFFLFVBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLGFBQUEsVUFDWixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLGFBQWEsQ0FBQyxLQUFkLENBQW9CLElBQUMsQ0FBQSxVQUFyQixDQUFYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFoQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FIQSxDQUFBO2FBS0EsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFRLENBQUMsRUFBVCxDQUFZLFNBQVosRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixFQU5VO0lBQUEsQ0FBWixDQUFBOztBQUFBLDJCQVNBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FUUCxDQUFBOztBQUFBLDJCQVlBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0Fa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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/covering-view.coffee