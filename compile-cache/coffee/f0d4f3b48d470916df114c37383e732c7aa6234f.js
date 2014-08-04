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

    CoveringView.prototype.detectDirty = function() {
      return null;
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