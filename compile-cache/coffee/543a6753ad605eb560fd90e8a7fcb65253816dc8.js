(function() {
  var $, CoveringView, EditorAdapter, View, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

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
      return this.cover().onDidChange((function(_this) {
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
      var anchor, marker, ref, scrollTop;
      this.editorView.component.checkForVisibilityChange();
      marker = this.cover();
      anchor = this.editorView.offset();
      ref = this.offsetForMarker(marker);
      scrollTop = this.editor().getScrollTop();
      this.offset({
        top: ref.top + anchor.top - scrollTop
      });
      return this.height(this.editorView.lineHeight);
    };

    CoveringView.prototype.editor = function() {
      return this.editorView.getModel();
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
      return this.editor().pixelPositionForBufferPosition(position);
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
      bindings = atom.keymap.findKeyBindings({
        target: this.editorView[0],
        command: eventName
      });
      _results = [];
      for (_i = 0, _len = bindings.length; _i < _len; _i++) {
        e = bindings[_i];
        original = element.text();
        _results.push(element.text(_.humanizeKeystroke(e.keystrokes) + (" " + original)));
      }
      return _results;
    };

    return CoveringView;

  })(View);

  module.exports = {
    CoveringView: CoveringView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBRUMsZ0JBQWlCLE9BQUEsQ0FBUSxrQkFBUixFQUFqQixhQUZELENBQUE7O0FBQUEsRUFLTTtBQUVKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwyQkFBQSxVQUFBLEdBQVksU0FBRSxVQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxhQUFBLFVBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxhQUFhLENBQUMsS0FBZCxDQUFvQixJQUFDLENBQUEsVUFBckIsQ0FBWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBaEIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBSEEsQ0FBQTthQUtBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBUSxDQUFDLFdBQVQsQ0FBcUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQixFQU5VO0lBQUEsQ0FBWixDQUFBOztBQUFBLDJCQVNBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FUUCxDQUFBOztBQUFBLDJCQVlBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FaVixDQUFBOztBQUFBLDJCQWNBLE9BQUEsR0FBUyxT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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/covering-view.coffee