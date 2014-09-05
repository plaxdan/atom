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
              "class": _this.makeClasses()
            });
            return _this.views.push(decoration);
          }
        };
      })(this));
    };

    HighlightedAreaView.prototype.makeClasses = function() {
      var className;
      className = 'highlight-selected';
      if (atom.config.get('highlight-selected.lightTheme')) {
        className += ' light-theme';
      }
      if (atom.config.get('highlight-selected.highlightBackground')) {
        className += ' background';
      }
      return className;
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