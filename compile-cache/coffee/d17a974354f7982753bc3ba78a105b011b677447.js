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
      this.selections = editor.getSelections();
      text = _.escapeRegExp(this.selections[0].getText());
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
        if (!this.showHighlightOnSelectedWord(range, this.selections)) {
          view = new MarkerView(range, this, this.editorView);
          this.append(view.element);
          _results.push(this.views.push(view));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    HighlightedAreaView.prototype.showHighlightOnSelectedWord = function(range, selections) {
      var outcome, selection, selectionRange, _i, _len;
      if (!atom.config.get('highlight-selected.hideHighlightOnSelectedWord')) {
        return false;
      }
      outcome = false;
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        selectionRange = selection.getScreenRange();
        outcome = (range.start.column === selectionRange.start.column) && (range.start.row === selectionRange.start.row) && (range.end.column === selectionRange.end.column) && (range.end.row === selectionRange.end.row);
        if (outcome) {
          break;
        }
      }
      return outcome;
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