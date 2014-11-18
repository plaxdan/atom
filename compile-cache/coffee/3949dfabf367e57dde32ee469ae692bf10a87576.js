(function() {
  var TextBuffer, TextEditor, random, randomWords, times, _ref;

  _ref = require('underscore-plus'), times = _ref.times, random = _ref.random;

  randomWords = require('random-words');

  TextBuffer = require('text-buffer');

  TextEditor = require('../src/text-editor');

  describe("TextEditor", function() {
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
        editor = new TextEditor({
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
        actualScreenLine = editor.tokenizedLineForScreenRow(screenRow);
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
      var range, softWrapped, text;
      if (Math.random() < .2) {
        softWrapped = !editor.isSoftWrapped();
        steps.push(['setSoftWrapped', softWrapped]);
        return editor.setSoftWrapped(softWrapped);
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
      if (editor.isSoftWrapped()) {
        screenLines = [];
        bufferRows = [];
        for (bufferRow = _i = 0, _ref2 = tokenizedBuffer.getLastRow(); 0 <= _ref2 ? _i <= _ref2 : _i >= _ref2; bufferRow = 0 <= _ref2 ? ++_i : --_i) {
          _ref3 = softWrapLine(tokenizedBuffer.tokenizedLineForRow(bufferRow));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdEQUFBOztBQUFBLEVBQUEsT0FBa0IsT0FBQSxDQUFRLGlCQUFSLENBQWxCLEVBQUMsYUFBQSxLQUFELEVBQVEsY0FBQSxNQUFSLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGNBQVIsQ0FEZCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxPQUFBLENBQVEsb0JBQVIsQ0FIYixDQUFBOztBQUFBLEVBS0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFFBQUEsK01BQUE7QUFBQSxJQUFBLFFBQTBELEVBQTFELEVBQUMsaUJBQUQsRUFBUywwQkFBVCxFQUEwQixpQkFBMUIsRUFBa0MsZ0JBQWxDLEVBQXlDLHdCQUF6QyxDQUFBO0FBQUEsSUFFQSxjQUFBLEdBQWlCLEVBRmpCLENBQUE7QUFBQSxJQUlBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEIsRUFBd0QsSUFBeEQsQ0FBQSxDQUFBO2FBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxjQUE5QyxFQUZTO0lBQUEsQ0FBWCxDQUpBLENBQUE7QUFBQSxJQVFBLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBLEdBQUE7QUFDOUQsVUFBQSxLQUFBO0FBQUEsTUFBQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFMLGdEQUFnQyxJQUFoQyxDQUFoQixDQUFBO2FBRUEsS0FBQSxDQUFNLEVBQU4sRUFBVSxTQUFDLENBQUQsR0FBQTtBQUNSLFFBQUEsTUFBQSxHQUFTLEdBQUEsQ0FBQSxVQUFULENBQUE7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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/random-editor-spec.coffee