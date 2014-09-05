(function() {
  var EditorView, HighlightedAreaView, Range, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
      var editor, range, regex, regexFlags, regexSearch, result, text;
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
      regexFlags = 'g';
      if (atom.config.get('highlight-selected.ignoreCase')) {
        regexFlags = 'gi';
      }
      range = [[0, 0], editor.getEofBufferPosition()];
      this.ranges = [];
      regexSearch = result[0];
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        regexSearch = "\\b" + regexSearch + "\\b";
      }
      return editor.scanInBufferRange(new RegExp(regexSearch, regexFlags), range, (function(_this) {
        return function(result) {
          var decoration, marker;
          if (!_this.showHighlightOnSelectedWord(result.range, _this.selections)) {
            marker = editor.markBufferRange(result.range);
            decoration = editor.decorateMarker(marker, {
              type: 'highlight',
              "class": 'highlight-selected'
            });
            return _this.views.push(decoration);
          }
        };
      })(this));
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
        view.destroy();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBNEIsT0FBQSxDQUFRLE1BQVIsQ0FBNUIsRUFBQyxrQkFBQSxVQUFELEVBQWEsWUFBQSxJQUFiLEVBQW1CLGFBQUEsS0FBbkIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDBDQUFBLENBQUE7Ozs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sb0JBQVA7T0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLGtDQUdBLFVBQUEsR0FBWSxTQUFDLFVBQUQsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFULENBQUE7YUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLFdBRko7SUFBQSxDQUhaLENBQUE7O0FBQUEsa0NBT0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBdkIsQ0FBOEIsSUFBOUIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxVQUFaLEVBQXdCLG1CQUF4QixFQUE2QyxJQUFDLENBQUEsZUFBOUMsQ0FEQSxDQUFBO2FBRUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFuQixDQUFzQixtQkFBdEIsRUFBMkMsSUFBQyxDQUFBLE9BQTVDLEVBSE07SUFBQSxDQVBSLENBQUE7O0FBQUEsa0NBWUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsOEJB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
//# sourceURL=/Users/daniel/.atom/packages/highlight-selected/lib/highlighted-area-view.coffee