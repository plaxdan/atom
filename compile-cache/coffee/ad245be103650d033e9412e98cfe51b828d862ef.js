(function() {
  var $, CoveringView, View, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  _ = require('underscore-plus');

  module.exports = CoveringView = (function(_super) {
    __extends(CoveringView, _super);

    function CoveringView() {
      return CoveringView.__super__.constructor.apply(this, arguments);
    }

    CoveringView.prototype.initialize = function(editorView) {
      this.editorView = editorView;
      this.appendTo(this.editorView.overlayer);
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
      anchor = this.editorView.renderedLines.offset();
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwyQkFBQSxVQUFBLEdBQVksU0FBRSxVQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxhQUFBLFVBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQXRCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQURBLENBQUE7YUFHQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQVEsQ0FBQyxFQUFULENBQVksU0FBWixFQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLEVBSlU7SUFBQSxDQUFaLENBQUE7O0FBQUEsMkJBT0EsS0FBQSxHQUFPLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQVBQLENBQUE7O0FBQUEsMkJBVUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQVZWLENBQUE7O0FBQUEsMkJBWUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUFHLE1BQUg7SUFBQSxDQVpULENBQUE7O0FBQUEsMkJBY0EsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQWRWLENB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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/covering-view.coffee