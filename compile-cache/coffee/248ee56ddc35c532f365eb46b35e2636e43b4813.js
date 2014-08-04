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

    CoveringView.prototype.decorate = function() {
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

    CoveringView.prototype.includesCursor = function(cursor) {
      return false;
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