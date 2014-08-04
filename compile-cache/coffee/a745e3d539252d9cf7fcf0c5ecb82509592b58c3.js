(function() {
  var EditorView, HighlightedAreaView, MarkerView, Range, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MarkerView = require('./marker-view');

  _ref = require('atom'), EditorView = _ref.EditorView, View = _ref.View, Range = _ref.Range;

  _ = require('underscore-plus');

  module.exports = HighlightedAreaView = (function(_super) {
    __extends(HighlightedAreaView, _super);

    function HighlightedAreaView() {
      this.removeMarkers = __bind(this.removeMarkers, this);
      this.handleSelection = __bind(this.handleSelection, this);
      this.destroy = __bind(this.destroy, this);
      this.attach = __bind(this.attach, this);
      return HighlightedAreaView.__super__.constructor.apply(this, arguments);
    }

    HighlightedAreaView.content = function() {
      return this.div({
        "class": 'highlight-selected'
      });
    };

    HighlightedAreaView.prototype.initialize = function(editorView) {
      this.views = [];
      return this.editorView = editorView;
    };

    HighlightedAreaView.prototype.attach = function() {
      this.editorView.underlayer.append(this);
      this.subscribe(this.editorView, "selection:changed", this.handleSelection);
      return atom.workspaceView.on('pane:item-removed', this.destroy);
    };

    HighlightedAreaView.prototype.destroy = function() {
      var editor, found, _i, _len, _ref1;
      found = false;
      _ref1 = atom.workspaceView.getEditorViews();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        if (editor.id === this.editorView.id) {
          found = true;
        }
      }
      if (found) {
        return;
      }
      atom.workspaceView.off('pane:item-removed', this.destroy);
      this.unsubscribe();
      this.remove();
      return this.detach();
    };

    HighlightedAreaView.prototype.getActiveEditor = function() {
      return atom.workspace.getActiveEditor();
    };

    HighlightedAreaView.prototype.handleSelection = function() {
      var editor, range, regex, regexSearch, result, text, view, _i, _len, _ref1, _results;
      this.removeMarkers();
      if (!(editor = this.getActiveEditor())) {
        return;
      }
      if (editor.getSelection().isEmpty()) {
        return;
      }
      if (!this.isWordSelected(editor.getSelection())) {
        return;
      }
      text = _.escapeRegExp(editor.getSelectedText());
      regex = new RegExp("\\W*\\w*\\b", 'gi');
      result = regex.exec(text);
      if (result == null) {
        return;
      }
      if (result.length === 0 || result.index !== 0 || result[0] !== result.input) {
        return;
      }
      range = [[0, 0], editor.getEofBufferPosition()];
      this.ranges = [];
      regexSearch = result[0];
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        regexSearch = "\\b" + regexSearch + "\\b";
      }
      editor.scanInBufferRange(new RegExp(regexSearch, 'g'), range, (function(_this) {
        return function(result) {
          var prefix;
          if (prefix = result.match[1]) {
            result.range = result.range.translate([0, prefix.length], [0, 0]);
          }
          return _this.ranges.push(editor.markBufferRange(result.range).getScreenRange());
        };
      })(this));
      _ref1 = this.ranges;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        range = _ref1[_i];
        view = new MarkerView(range, this, this.editorView);
        this.append(view.element);
        _results.push(this.views.push(view));
      }
      return _results;
    };

    HighlightedAreaView.prototype.removeMarkers = function() {
      var view, _i, _len, _ref1;
      if (this.views == null) {
        return;
      }
      if (this.views.length === 0) {
        return;
      }
      _ref1 = this.views;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        view.element.remove();
        view = null;
      }
      return this.views = [];
    };

    HighlightedAreaView.prototype.isWordSelected = function(selection) {
      var lineRange, nonWordCharacterToTheLeft, nonWordCharacterToTheRight, selectionRange;
      if (selection.getBufferRange().isSingleLine()) {
        selectionRange = selection.getBufferRange();
        lineRange = this.getActiveEditor().bufferRangeForBufferRow(selectionRange.start.row);
        nonWordCharacterToTheLeft = _.isEqual(selectionRange.start, lineRange.start) || this.isNonWordCharacterToTheLeft(selection);
        nonWordCharacterToTheRight = _.isEqual(selectionRange.end, lineRange.end) || this.isNonWordCharacterToTheRight(selection);
        return nonWordCharacterToTheLeft && nonWordCharacterToTheRight;
      } else {
        return false;
      }
    };

    HighlightedAreaView.prototype.isNonWordCharacter = function(character) {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp("[ \t" + (_.escapeRegExp(nonWordCharacters)) + "]").test(character);
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheLeft = function(selection) {
      var range, selectionStart;
      selectionStart = selection.getBufferRange().start;
      range = Range.fromPointWithDelta(selectionStart, 0, -1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheRight = function(selection) {
      var range, selectionEnd;
      selectionEnd = selection.getBufferRange().end;
      range = Range.fromPointWithDelta(selectionEnd, 0, 1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    return HighlightedAreaView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUNBLE9BQTRCLE9BQUEsQ0FBUSxNQUFSLENBQTVCLEVBQUMsa0JBQUEsVUFBRCxFQUFhLFlBQUEsSUFBYixFQUFtQixhQUFBLEtBRG5CLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwwQ0FBQSxDQUFBOzs7Ozs7OztLQUFBOztBQUFBLElBQUEsbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLG9CQUFQO09BQUwsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSxrQ0FHQSxVQUFBLEdBQVksU0FBQyxVQUFELEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFBVCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxXQUZKO0lBQUEsQ0FIWixDQUFBOztBQUFBLGtDQU9BLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQXZCLENBQThCLElBQTlCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3QixtQkFBeEIsRUFBNkMsSUFBQyxDQUFBLGVBQTlDLENBREEsQ0FBQTthQUVBLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBbkIsQ0FBc0IsbUJBQXRCLEVBQTJDLElBQUMsQ0FBQSxPQUE1QyxFQUhNO0lBQUEsQ0FQUixDQUFB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
//# sourceURL=/Users/daniel/.atom/packages/highlight-selected/lib/highlighted-area-view.coffee