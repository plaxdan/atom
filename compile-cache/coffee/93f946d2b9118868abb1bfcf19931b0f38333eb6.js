(function() {
  var Editor, TextBuffer, random, randomWords, times, _ref;

  _ref = require('underscore-plus'), times = _ref.times, random = _ref.random;

  randomWords = require('random-words');

  TextBuffer = require('text-buffer');

  Editor = require('../src/editor');

  describe("Editor", function() {
    var buffer, editor, findWrapColumn, getRandomRange, getRandomText, getReferenceScreenLines, logLines, previousSteps, randomlyMutateEditor, softWrapColumn, softWrapLine, steps, tokenizedBuffer, verifyLines, _ref1;
    _ref1 = [], editor = _ref1[0], tokenizedBuffer = _ref1[1], buffer = _ref1[2], steps = _ref1[3], previousSteps = _ref1[4];
    softWrapColumn = 80;
    beforeEach(function() {
      atom.config.set('editor.softWrapAtPreferredLineLength', true);
      return atom.config.set('editor.preferredLineLength', softWrapColumn);
    });
    it("properly renders soft-wrapped lines when randomly mutated", function() {
      var _ref2;
      previousSteps = JSON.parse((_ref2 = localStorage.steps) != null ? _ref2 : '[]');
      return times(10, function(i) {
        buffer = new TextBuffer;
        editor = new Editor({
          buffer: buffer
        });
        editor.setEditorWidthInChars(80);
        tokenizedBuffer = editor.displayBuffer.tokenizedBuffer;
        steps = [];
        return times(30, function() {
          randomlyMutateEditor();
          return verifyLines();
        });
      });
    });
    verifyLines = function() {
      var actualBufferRow, actualScreenLine, bufferRows, referenceBufferRow, referenceScreenLine, screenLines, screenRow, _i, _len, _ref2, _results;
      _ref2 = getReferenceScreenLines(), bufferRows = _ref2.bufferRows, screenLines = _ref2.screenLines;
      _results = [];
      for (screenRow = _i = 0, _len = bufferRows.length; _i < _len; screenRow = ++_i) {
        referenceBufferRow = bufferRows[screenRow];
        referenceScreenLine = screenLines[screenRow];
        actualBufferRow = editor.bufferRowForScreenRow(screenRow);
        if (actualBufferRow !== referenceBufferRow) {
          logLines();
          throw new Error("Invalid buffer row " + actualBufferRow + " for screen row " + screenRow);
        }
        actualScreenLine = editor.lineForScreenRow(screenRow);
        if (actualScreenLine.text !== referenceScreenLine.text) {
          logLines();
          throw new Error("Invalid line text at screen row " + screenRow);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    logLines = function() {
      var bufferRow, bufferRows, screenLines, screenRow, _i, _len, _ref2, _results;
      console.log("==== screen lines ====");
      editor.logScreenLines();
      console.log("==== reference lines ====");
      _ref2 = getReferenceScreenLines(), bufferRows = _ref2.bufferRows, screenLines = _ref2.screenLines;
      _results = [];
      for (screenRow = _i = 0, _len = bufferRows.length; _i < _len; screenRow = ++_i) {
        bufferRow = bufferRows[screenRow];
        _results.push(console.log(screenRow, bufferRow, screenLines[screenRow].text));
      }
      return _results;
    };
    randomlyMutateEditor = function() {
      var range, softWrap, text;
      if (Math.random() < .2) {
        softWrap = !editor.getSoftWrap();
        steps.push(['setSoftWrap', softWrap]);
        return editor.setSoftWrap(softWrap);
      } else {
        range = getRandomRange();
        text = getRandomText();
        steps.push(['setTextInBufferRange', range, text]);
        return editor.setTextInBufferRange(range, text);
      }
    };
    getRandomRange = function() {
      var endColumn, endRow, startColumn, startRow;
      startRow = random(0, buffer.getLastRow());
      startColumn = random(0, buffer.lineForRow(startRow).length);
      endRow = random(startRow, buffer.getLastRow());
      endColumn = random(0, buffer.lineForRow(endRow).length);
      return [[startRow, startColumn], [endRow, endColumn]];
    };
    getRandomText = function() {
      var max, text;
      text = [];
      max = buffer.getText().split(/\s/).length * 0.75;
      times(random(5, max), function() {
        if (Math.random() < .1) {
          return text += '\n';
        } else {
          if (/\w$/.test(text)) {
            text += " ";
          }
          return text += randomWords({
            exactly: 1
          });
        }
      });
      return text;
    };
    getReferenceScreenLines = function() {
      var bufferRow, bufferRows, screenLine, screenLines, _i, _j, _k, _len, _ref2, _ref3, _ref4, _results;
      if (editor.getSoftWrap()) {
        screenLines = [];
        bufferRows = [];
        for (bufferRow = _i = 0, _ref2 = tokenizedBuffer.getLastRow(); 0 <= _ref2 ? _i <= _ref2 : _i >= _ref2; bufferRow = 0 <= _ref2 ? ++_i : --_i) {
          _ref3 = softWrapLine(tokenizedBuffer.lineForScreenRow(bufferRow));
          for (_j = 0, _len = _ref3.length; _j < _len; _j++) {
            screenLine = _ref3[_j];
            screenLines.push(screenLine);
            bufferRows.push(bufferRow);
          }
        }
      } else {
        screenLines = tokenizedBuffer.tokenizedLines.slice();
        bufferRows = (function() {
          _results = [];
          for (var _k = 0, _ref4 = tokenizedBuffer.getLastRow(); 0 <= _ref4 ? _k <= _ref4 : _k >= _ref4; 0 <= _ref4 ? _k++ : _k--){ _results.push(_k); }
          return _results;
        }).apply(this);
      }
      return {
        screenLines: screenLines,
        bufferRows: bufferRows
      };
    };
    softWrapLine = function(tokenizedLine) {
      var wrapScreenColumn, wrappedLine, wrappedLines, _ref2;
      wrappedLines = [];
      while (tokenizedLine.text.length > softWrapColumn && (wrapScreenColumn = findWrapColumn(tokenizedLine.text))) {
        _ref2 = tokenizedLine.softWrapAt(wrapScreenColumn), wrappedLine = _ref2[0], tokenizedLine = _ref2[1];
        wrappedLines.push(wrappedLine);
      }
      wrappedLines.push(tokenizedLine);
      return wrappedLines;
    };
    return findWrapColumn = function(line) {
      var column, _i, _j, _ref2;
      if (/\s/.test(line[softWrapColumn])) {
        for (column = _i = softWrapColumn, _ref2 = line.length; softWrapColumn <= _ref2 ? _i <= _ref2 : _i >= _ref2; column = softWrapColumn <= _ref2 ? ++_i : --_i) {
          if (/\S/.test(line[column])) {
            return column;
          }
        }
        return line.length;
      } else {
        for (column = _j = softWrapColumn; softWrapColumn <= 0 ? _j <= 0 : _j >= 0; column = softWrapColumn <= 0 ? ++_j : --_j) {
          if (/\s/.test(line[column])) {
            return column + 1;
          }
        }
        return softWrapColumn;
      }
    };
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9EQUFBOztBQUFBLEVBQUEsT0FBa0IsT0FBQSxDQUFRLGlCQUFSLENBQWxCLEVBQUMsYUFBQSxLQUFELEVBQVEsY0FBQSxNQUFSLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGNBQVIsQ0FEZCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUixDQUhULENBQUE7O0FBQUEsRUFLQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsUUFBQSwrTUFBQTtBQUFBLElBQUEsUUFBMEQsRUFBMUQsRUFBQyxpQkFBRCxFQUFTLDBCQUFULEVBQTBCLGlCQUExQixFQUFrQyxnQkFBbEMsRUFBeUMsd0JBQXpDLENBQUE7QUFBQSxJQUVBLGNBQUEsR0FBaUIsRUFGakIsQ0FBQTtBQUFBLElBSUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixFQUF3RCxJQUF4RCxDQUFBLENBQUE7YUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBQThDLGNBQTlDLEVBRlM7SUFBQSxDQUFYLENBSkEsQ0FBQTtBQUFBLElBUUEsRUFBQSxDQUFHLDJEQUFILEVBQWdFLFNBQUEsR0FBQTtBQUM5RCxVQUFBLEtBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsZ0RBQWdDLElBQWhDLENBQWhCLENBQUE7YUFFQSxLQUFBLENBQU0sRUFBTixFQUFVLFNBQUMsQ0FBRCxHQUFBO0FBQ1IsUUFBQSxNQUFBLEdBQVMsR0FBQSxDQUFBLFVBQVQsQ0FBQTtB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/random-editor-spec.coffee