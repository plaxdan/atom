(function() {
  var clipboard;

  clipboard = require('clipboard');

  describe("Editor", function() {
    var buffer, convertToHardTabs, editor, lineLengths, _ref;
    _ref = [], buffer = _ref[0], editor = _ref[1], lineLengths = _ref[2];
    convertToHardTabs = function(buffer) {
      return buffer.setText(buffer.getText().replace(/[ ]{2}/g, "\t"));
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.project.open('sample.js', {
          autoIndent: false
        }).then(function(o) {
          return editor = o;
        });
      });
      runs(function() {
        buffer = editor.buffer;
        return lineLengths = buffer.getLines().map(function(line) {
          return line.length;
        });
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
    });
    describe("when the editor is deserialized", function() {
      return it("restores selections and folds based on markers in the buffer", function() {
        var editor2;
        editor.setSelectedBufferRange([[1, 2], [3, 4]]);
        editor.addSelectionForBufferRange([[5, 6], [7, 5]], {
          reversed: true
        });
        editor.foldBufferRow(4);
        expect(editor.isFoldedAtBufferRow(4)).toBeTruthy();
        editor2 = editor.testSerialization();
        expect(editor2.id).toBe(editor.id);
        expect(editor2.getBuffer().getPath()).toBe(editor.getBuffer().getPath());
        expect(editor2.getSelectedBufferRanges()).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 5]]]);
        expect(editor2.getSelection(1).isReversed()).toBeTruthy();
        expect(editor2.isFoldedAtBufferRow(4)).toBeTruthy();
        return editor2.destroy();
      });
    });
    describe("when the editor is constructed with an initialLine option", function() {
      return it("positions the cursor on the specified line", function() {
        editor = null;
        waitsForPromise(function() {
          return atom.workspace.open('sample.less', {
            initialLine: 5
          }).then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          buffer = editor.buffer;
          expect(editor.getCursor().getBufferPosition().row).toEqual(5);
          return expect(editor.getCursor().getBufferPosition().column).toEqual(0);
        });
      });
    });
    describe("when the editor is constructed with an initialColumn option", function() {
      return it("positions the cursor on the specified column", function() {
        editor = null;
        waitsForPromise(function() {
          return atom.workspace.open('sample.less', {
            initialColumn: 8
          }).then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          buffer = editor.buffer;
          expect(editor.getCursor().getBufferPosition().row).toEqual(0);
          return expect(editor.getCursor().getBufferPosition().column).toEqual(8);
        });
      });
    });
    describe(".copy()", function() {
      return it("returns a different edit session with the same initial state", function() {
        var editor2;
        editor.setSelectedBufferRange([[1, 2], [3, 4]]);
        editor.addSelectionForBufferRange([[5, 6], [7, 8]], {
          reversed: true
        });
        editor.foldBufferRow(4);
        expect(editor.isFoldedAtBufferRow(4)).toBeTruthy();
        editor2 = editor.copy();
        expect(editor2.id).not.toBe(editor.id);
        expect(editor2.getSelectedBufferRanges()).toEqual(editor.getSelectedBufferRanges());
        expect(editor2.getSelection(1).isReversed()).toBeTruthy();
        expect(editor2.isFoldedAtBufferRow(4)).toBeTruthy();
        editor2.getSelection().setBufferRange([[2, 1], [4, 3]]);
        expect(editor2.getSelectedBufferRanges()).not.toEqual(editor.getSelectedBufferRanges());
        editor2.unfoldBufferRow(4);
        return expect(editor2.isFoldedAtBufferRow(4)).not.toBe(editor.isFoldedAtBufferRow(4));
      });
    });
    describe("config defaults", function() {
      return it("uses the `editor.tabLength`, `editor.softWrap`, and `editor.softTabs` config values", function() {
        var editor1, editor2;
        editor1 = null;
        editor2 = null;
        atom.config.set('editor.tabLength', 4);
        atom.config.set('editor.softWrap', true);
        atom.config.set('editor.softTabs', false);
        waitsForPromise(function() {
          return atom.workspace.open('a').then(function(o) {
            return editor1 = o;
          });
        });
        runs(function() {
          expect(editor1.getTabLength()).toBe(4);
          expect(editor1.getSoftWrap()).toBe(true);
          expect(editor1.getSoftTabs()).toBe(false);
          atom.config.set('editor.tabLength', 100);
          atom.config.set('editor.softWrap', false);
          return atom.config.set('editor.softTabs', true);
        });
        waitsForPromise(function() {
          return atom.workspace.open('b').then(function(o) {
            return editor2 = o;
          });
        });
        return runs(function() {
          expect(editor2.getTabLength()).toBe(100);
          expect(editor2.getSoftWrap()).toBe(false);
          return expect(editor2.getSoftTabs()).toBe(true);
        });
      });
    });
    describe("title", function() {
      describe(".getTitle()", function() {
        return it("uses the basename of the buffer's path as its title, or 'untitled' if the path is undefined", function() {
          expect(editor.getTitle()).toBe('sample.js');
          buffer.setPath(void 0);
          return expect(editor.getTitle()).toBe('untitled');
        });
      });
      describe(".getLongTitle()", function() {
        return it("appends the name of the containing directory to the basename of the file", function() {
          expect(editor.getLongTitle()).toBe('sample.js - fixtures');
          buffer.setPath(void 0);
          return expect(editor.getLongTitle()).toBe('untitled');
        });
      });
      return it("emits 'title-changed' events when the underlying buffer path", function() {
        var titleChangedHandler;
        titleChangedHandler = jasmine.createSpy("titleChangedHandler");
        editor.on('title-changed', titleChangedHandler);
        buffer.setPath('/foo/bar/baz.txt');
        buffer.setPath(void 0);
        return expect(titleChangedHandler.callCount).toBe(2);
      });
    });
    describe("cursor", function() {
      describe(".getCursor()", function() {
        return it("returns the most recently created cursor", function() {
          var lastCursor;
          editor.addCursorAtScreenPosition([1, 0]);
          lastCursor = editor.addCursorAtScreenPosition([2, 0]);
          return expect(editor.getCursor()).toBe(lastCursor);
        });
      });
      describe("when the cursor moves", function() {
        it("clears a goal column established by vertical movement", function() {
          editor.setText('b');
          editor.setCursorBufferPosition([0, 0]);
          editor.insertNewline();
          editor.moveCursorUp();
          editor.insertText('a');
          editor.moveCursorDown();
          return expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
        });
        return it("emits a single 'cursors-moved' event for all moved cursors", function() {
          var cursorsMovedHandler;
          editor.on('cursors-moved', cursorsMovedHandler = jasmine.createSpy("cursorsMovedHandler"));
          editor.moveCursorDown();
          expect(cursorsMovedHandler.callCount).toBe(1);
          cursorsMovedHandler.reset();
          editor.addCursorAtScreenPosition([3, 0]);
          editor.moveCursorDown();
          expect(cursorsMovedHandler.callCount).toBe(1);
          cursorsMovedHandler.reset();
          editor.getCursor().moveDown();
          return expect(cursorsMovedHandler.callCount).toBe(1);
        });
      });
      describe(".setCursorScreenPosition(screenPosition)", function() {
        it("clears a goal column established by vertical movement", function() {
          editor.setCursorScreenPosition({
            row: 3,
            column: lineLengths[3]
          });
          editor.moveCursorDown();
          expect(editor.getCursorScreenPosition().column).not.toBe(6);
          editor.setCursorScreenPosition([4, 6]);
          expect(editor.getCursorScreenPosition().column).toBe(6);
          editor.moveCursorDown();
          return expect(editor.getCursorScreenPosition().column).toBe(6);
        });
        it("merges multiple cursors", function() {
          var cursor1, cursor2, _ref1;
          editor.setCursorScreenPosition([0, 0]);
          editor.addCursorAtScreenPosition([0, 1]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.setCursorScreenPosition([4, 7]);
          expect(editor.getCursors().length).toBe(1);
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(editor.getCursorScreenPosition()).toEqual([4, 7]);
        });
        return describe("when soft-wrap is enabled and code is folded", function() {
          beforeEach(function() {
            editor.setSoftWrap(true);
            editor.setEditorWidthInChars(50);
            return editor.createFold(2, 3);
          });
          return it("positions the cursor at the buffer position that corresponds to the given screen position", function() {
            editor.setCursorScreenPosition([9, 0]);
            return expect(editor.getCursorBufferPosition()).toEqual([8, 11]);
          });
        });
      });
      describe(".moveCursorUp()", function() {
        it("moves the cursor up", function() {
          editor.setCursorScreenPosition([2, 2]);
          editor.moveCursorUp();
          return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
        });
        it("retains the goal column across lines of differing length", function() {
          expect(lineLengths[6]).toBeGreaterThan(32);
          editor.setCursorScreenPosition({
            row: 6,
            column: 32
          });
          editor.moveCursorUp();
          expect(editor.getCursorScreenPosition().column).toBe(lineLengths[5]);
          editor.moveCursorUp();
          expect(editor.getCursorScreenPosition().column).toBe(lineLengths[4]);
          editor.moveCursorUp();
          return expect(editor.getCursorScreenPosition().column).toBe(32);
        });
        describe("when the cursor is on the first line", function() {
          return it("moves the cursor to the beginning of the line, but retains the goal column", function() {
            editor.setCursorScreenPosition([0, 4]);
            editor.moveCursorUp();
            expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
            editor.moveCursorDown();
            return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
          });
        });
        describe("when there is a selection", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[4, 9], [5, 10]]);
          });
          return it("moves above the selection", function() {
            var cursor;
            cursor = editor.getCursor();
            editor.moveCursorUp();
            return expect(cursor.getBufferPosition()).toEqual([3, 9]);
          });
        });
        return it("merges cursors when they overlap", function() {
          var cursor1, cursor2, _ref1;
          editor.addCursorAtScreenPosition([1, 0]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.moveCursorUp();
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(cursor1.getBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveCursorDown()", function() {
        it("moves the cursor down", function() {
          editor.setCursorScreenPosition([2, 2]);
          editor.moveCursorDown();
          return expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
        });
        it("retains the goal column across lines of differing length", function() {
          editor.setCursorScreenPosition({
            row: 3,
            column: lineLengths[3]
          });
          editor.moveCursorDown();
          expect(editor.getCursorScreenPosition().column).toBe(lineLengths[4]);
          editor.moveCursorDown();
          expect(editor.getCursorScreenPosition().column).toBe(lineLengths[5]);
          editor.moveCursorDown();
          return expect(editor.getCursorScreenPosition().column).toBe(lineLengths[3]);
        });
        describe("when the cursor is on the last line", function() {
          it("moves the cursor to the end of line, but retains the goal column when moving back up", function() {
            var lastLine, lastLineIndex;
            lastLineIndex = buffer.getLines().length - 1;
            lastLine = buffer.lineForRow(lastLineIndex);
            expect(lastLine.length).toBeGreaterThan(0);
            editor.setCursorScreenPosition({
              row: lastLineIndex,
              column: editor.getTabLength()
            });
            editor.moveCursorDown();
            expect(editor.getCursorScreenPosition()).toEqual({
              row: lastLineIndex,
              column: lastLine.length
            });
            editor.moveCursorUp();
            return expect(editor.getCursorScreenPosition().column).toBe(editor.getTabLength());
          });
          return it("retains a goal column of 0 when moving back up", function() {
            var lastLine, lastLineIndex;
            lastLineIndex = buffer.getLines().length - 1;
            lastLine = buffer.lineForRow(lastLineIndex);
            expect(lastLine.length).toBeGreaterThan(0);
            editor.setCursorScreenPosition({
              row: lastLineIndex,
              column: 0
            });
            editor.moveCursorDown();
            editor.moveCursorUp();
            return expect(editor.getCursorScreenPosition().column).toBe(0);
          });
        });
        describe("when there is a selection", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[4, 9], [5, 10]]);
          });
          return it("moves below the selection", function() {
            var cursor;
            cursor = editor.getCursor();
            editor.moveCursorDown();
            return expect(cursor.getBufferPosition()).toEqual([6, 10]);
          });
        });
        return it("merges cursors when they overlap", function() {
          var cursor1, cursor2, _ref1;
          editor.setCursorScreenPosition([12, 2]);
          editor.addCursorAtScreenPosition([11, 2]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.moveCursorDown();
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(cursor1.getBufferPosition()).toEqual([12, 2]);
        });
      });
      describe(".moveCursorLeft()", function() {
        it("moves the cursor by one column to the left", function() {
          editor.setCursorScreenPosition([1, 8]);
          editor.moveCursorLeft();
          return expect(editor.getCursorScreenPosition()).toEqual([1, 7]);
        });
        describe("when the cursor is in the first column", function() {
          describe("when there is a previous line", function() {
            return it("wraps to the end of the previous line", function() {
              editor.setCursorScreenPosition({
                row: 1,
                column: 0
              });
              editor.moveCursorLeft();
              return expect(editor.getCursorScreenPosition()).toEqual({
                row: 0,
                column: buffer.lineForRow(0).length
              });
            });
          });
          return describe("when the cursor is on the first line", function() {
            return it("remains in the same position (0,0)", function() {
              editor.setCursorScreenPosition({
                row: 0,
                column: 0
              });
              editor.moveCursorLeft();
              return expect(editor.getCursorScreenPosition()).toEqual({
                row: 0,
                column: 0
              });
            });
          });
        });
        describe("when softTabs is enabled and the cursor is preceded by leading whitespace", function() {
          return it("skips tabLength worth of whitespace at a time", function() {
            editor.setCursorBufferPosition([5, 6]);
            editor.moveCursorLeft();
            return expect(editor.getCursorBufferPosition()).toEqual([5, 4]);
          });
        });
        describe("when there is a selection", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[5, 22], [5, 27]]);
          });
          return it("moves to the left of the selection", function() {
            var cursor;
            cursor = editor.getCursor();
            editor.moveCursorLeft();
            expect(cursor.getBufferPosition()).toEqual([5, 22]);
            editor.moveCursorLeft();
            return expect(cursor.getBufferPosition()).toEqual([5, 21]);
          });
        });
        return it("merges cursors when they overlap", function() {
          var cursor1, cursor2, _ref1;
          editor.setCursorScreenPosition([0, 0]);
          editor.addCursorAtScreenPosition([0, 1]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.moveCursorLeft();
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(cursor1.getBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveCursorRight()", function() {
        it("moves the cursor by one column to the right", function() {
          editor.setCursorScreenPosition([3, 3]);
          editor.moveCursorRight();
          return expect(editor.getCursorScreenPosition()).toEqual([3, 4]);
        });
        describe("when the cursor is on the last column of a line", function() {
          describe("when there is a subsequent line", function() {
            return it("wraps to the beginning of the next line", function() {
              editor.setCursorScreenPosition([0, buffer.lineForRow(0).length]);
              editor.moveCursorRight();
              return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
            });
          });
          return describe("when the cursor is on the last line", function() {
            return it("remains in the same position", function() {
              var lastLine, lastLineIndex, lastPosition;
              lastLineIndex = buffer.getLines().length - 1;
              lastLine = buffer.lineForRow(lastLineIndex);
              expect(lastLine.length).toBeGreaterThan(0);
              lastPosition = {
                row: lastLineIndex,
                column: lastLine.length
              };
              editor.setCursorScreenPosition(lastPosition);
              editor.moveCursorRight();
              return expect(editor.getCursorScreenPosition()).toEqual(lastPosition);
            });
          });
        });
        describe("when there is a selection", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[5, 22], [5, 27]]);
          });
          return it("moves to the left of the selection", function() {
            var cursor;
            cursor = editor.getCursor();
            editor.moveCursorRight();
            expect(cursor.getBufferPosition()).toEqual([5, 27]);
            editor.moveCursorRight();
            return expect(cursor.getBufferPosition()).toEqual([5, 28]);
          });
        });
        return it("merges cursors when they overlap", function() {
          var cursor1, cursor2, _ref1;
          editor.setCursorScreenPosition([12, 2]);
          editor.addCursorAtScreenPosition([12, 1]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.moveCursorRight();
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(cursor1.getBufferPosition()).toEqual([12, 2]);
        });
      });
      describe(".moveCursorToTop()", function() {
        return it("moves the cursor to the top of the buffer", function() {
          editor.setCursorScreenPosition([11, 1]);
          editor.addCursorAtScreenPosition([12, 0]);
          editor.moveCursorToTop();
          expect(editor.getCursors().length).toBe(1);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveCursorToBottom()", function() {
        return it("moves the cusor to the bottom of the buffer", function() {
          editor.setCursorScreenPosition([0, 0]);
          editor.addCursorAtScreenPosition([1, 0]);
          editor.moveCursorToBottom();
          expect(editor.getCursors().length).toBe(1);
          return expect(editor.getCursorBufferPosition()).toEqual([12, 2]);
        });
      });
      describe(".moveCursorToBeginningOfScreenLine()", function() {
        describe("when soft wrap is on", function() {
          return it("moves cursor to the beginning of the screen line", function() {
            var cursor;
            editor.setSoftWrap(true);
            editor.setEditorWidthInChars(10);
            editor.setCursorScreenPosition([1, 2]);
            editor.moveCursorToBeginningOfScreenLine();
            cursor = editor.getCursor();
            return expect(cursor.getScreenPosition()).toEqual([1, 0]);
          });
        });
        return describe("when soft wrap is off", function() {
          return it("moves cursor to the beginning of then line", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorScreenPosition([0, 5]);
            editor.addCursorAtScreenPosition([1, 7]);
            editor.moveCursorToBeginningOfScreenLine();
            expect(editor.getCursors().length).toBe(2);
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            expect(cursor1.getBufferPosition()).toEqual([0, 0]);
            return expect(cursor2.getBufferPosition()).toEqual([1, 0]);
          });
        });
      });
      describe(".moveCursorToEndOfScreenLine()", function() {
        describe("when soft wrap is on", function() {
          return it("moves cursor to the beginning of the screen line", function() {
            var cursor;
            editor.setSoftWrap(true);
            editor.setEditorWidthInChars(10);
            editor.setCursorScreenPosition([1, 2]);
            editor.moveCursorToEndOfScreenLine();
            cursor = editor.getCursor();
            return expect(cursor.getScreenPosition()).toEqual([1, 9]);
          });
        });
        return describe("when soft wrap is off", function() {
          return it("moves cursor to the end of line", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorScreenPosition([0, 0]);
            editor.addCursorAtScreenPosition([1, 0]);
            editor.moveCursorToEndOfScreenLine();
            expect(editor.getCursors().length).toBe(2);
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            expect(cursor1.getBufferPosition()).toEqual([0, 29]);
            return expect(cursor2.getBufferPosition()).toEqual([1, 30]);
          });
        });
      });
      describe(".moveCursorToBeginningOfLine()", function() {
        return it("moves cursor to the beginning of the buffer line", function() {
          var cursor;
          editor.setSoftWrap(true);
          editor.setEditorWidthInChars(10);
          editor.setCursorScreenPosition([1, 2]);
          editor.moveCursorToBeginningOfLine();
          cursor = editor.getCursor();
          return expect(cursor.getScreenPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveCursorToEndOfLine()", function() {
        return it("moves cursor to the end of the buffer line", function() {
          var cursor;
          editor.setSoftWrap(true);
          editor.setEditorWidthInChars(10);
          editor.setCursorScreenPosition([0, 2]);
          editor.moveCursorToEndOfLine();
          cursor = editor.getCursor();
          return expect(cursor.getScreenPosition()).toEqual([3, 4]);
        });
      });
      describe(".moveCursorToFirstCharacterOfLine()", function() {
        describe("when soft wrap is on", function() {
          return it("moves to the first character of the current screen line or the beginning of the screen line if it's already on the first character", function() {
            var cursor1, cursor2, _ref1;
            editor.setSoftWrap(true);
            editor.setEditorWidthInChars(10);
            editor.setCursorScreenPosition([2, 5]);
            editor.addCursorAtScreenPosition([8, 7]);
            editor.moveCursorToFirstCharacterOfLine();
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            expect(cursor1.getScreenPosition()).toEqual([2, 0]);
            expect(cursor2.getScreenPosition()).toEqual([8, 4]);
            editor.moveCursorToFirstCharacterOfLine();
            expect(cursor1.getScreenPosition()).toEqual([2, 0]);
            return expect(cursor2.getScreenPosition()).toEqual([8, 0]);
          });
        });
        return describe("when soft wrap is off", function() {
          it("moves to the first character of the current line or the beginning of the line if it's already on the first character", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorScreenPosition([0, 5]);
            editor.addCursorAtScreenPosition([1, 7]);
            editor.moveCursorToFirstCharacterOfLine();
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            expect(cursor1.getBufferPosition()).toEqual([0, 0]);
            expect(cursor2.getBufferPosition()).toEqual([1, 2]);
            editor.moveCursorToFirstCharacterOfLine();
            expect(cursor1.getBufferPosition()).toEqual([0, 0]);
            return expect(cursor2.getBufferPosition()).toEqual([1, 0]);
          });
          return it("moves to the beginning of the line if it only contains whitespace ", function() {
            var cursor;
            editor.setText("first\n    \nthird");
            editor.setCursorScreenPosition([1, 2]);
            editor.moveCursorToFirstCharacterOfLine();
            cursor = editor.getCursor();
            return expect(cursor.getBufferPosition()).toEqual([1, 0]);
          });
        });
      });
      describe(".moveCursorToBeginningOfWord()", function() {
        it("moves the cursor to the beginning of the word", function() {
          var cursor1, cursor2, cursor3, _ref1;
          editor.setCursorBufferPosition([0, 8]);
          editor.addCursorAtBufferPosition([1, 12]);
          editor.addCursorAtBufferPosition([3, 0]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2];
          editor.moveCursorToBeginningOfWord();
          expect(cursor1.getBufferPosition()).toEqual([0, 4]);
          expect(cursor2.getBufferPosition()).toEqual([1, 11]);
          return expect(cursor3.getBufferPosition()).toEqual([2, 39]);
        });
        it("does not fail at position [0, 0]", function() {
          editor.setCursorBufferPosition([0, 0]);
          return editor.moveCursorToBeginningOfWord();
        });
        it("treats lines with only whitespace as a word", function() {
          editor.setCursorBufferPosition([11, 0]);
          editor.moveCursorToBeginningOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual([10, 0]);
        });
        return it("works when the current line is blank", function() {
          editor.setCursorBufferPosition([10, 0]);
          editor.moveCursorToBeginningOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual([9, 2]);
        });
      });
      describe(".moveCursorToPreviousWordBoundary()", function() {
        return it("moves the cursor to the previous word boundary", function() {
          var cursor1, cursor2, cursor3, cursor4, _ref1;
          editor.setCursorBufferPosition([0, 8]);
          editor.addCursorAtBufferPosition([2, 0]);
          editor.addCursorAtBufferPosition([2, 4]);
          editor.addCursorAtBufferPosition([3, 14]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2], cursor4 = _ref1[3];
          editor.moveCursorToPreviousWordBoundary();
          expect(cursor1.getBufferPosition()).toEqual([0, 4]);
          expect(cursor2.getBufferPosition()).toEqual([1, 30]);
          expect(cursor3.getBufferPosition()).toEqual([2, 0]);
          return expect(cursor4.getBufferPosition()).toEqual([3, 13]);
        });
      });
      describe(".moveCursorToNextWordBoundary()", function() {
        return it("moves the cursor to the previous word boundary", function() {
          var cursor1, cursor2, cursor3, cursor4, _ref1;
          editor.setCursorBufferPosition([0, 8]);
          editor.addCursorAtBufferPosition([2, 40]);
          editor.addCursorAtBufferPosition([3, 0]);
          editor.addCursorAtBufferPosition([3, 30]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2], cursor4 = _ref1[3];
          editor.moveCursorToNextWordBoundary();
          expect(cursor1.getBufferPosition()).toEqual([0, 13]);
          expect(cursor2.getBufferPosition()).toEqual([3, 0]);
          expect(cursor3.getBufferPosition()).toEqual([3, 4]);
          return expect(cursor4.getBufferPosition()).toEqual([3, 31]);
        });
      });
      describe(".moveCursorToEndOfWord()", function() {
        it("moves the cursor to the end of the word", function() {
          var cursor1, cursor2, cursor3, _ref1;
          editor.setCursorBufferPosition([0, 6]);
          editor.addCursorAtBufferPosition([1, 10]);
          editor.addCursorAtBufferPosition([2, 40]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2];
          editor.moveCursorToEndOfWord();
          expect(cursor1.getBufferPosition()).toEqual([0, 13]);
          expect(cursor2.getBufferPosition()).toEqual([1, 12]);
          return expect(cursor3.getBufferPosition()).toEqual([3, 7]);
        });
        it("does not blow up when there is no next word", function() {
          var endPosition;
          editor.setCursorBufferPosition([Infinity, Infinity]);
          endPosition = editor.getCursorBufferPosition();
          editor.moveCursorToEndOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual(endPosition);
        });
        it("treats lines with only whitespace as a word", function() {
          editor.setCursorBufferPosition([9, 4]);
          editor.moveCursorToEndOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual([10, 0]);
        });
        return it("works when the current line is blank", function() {
          editor.setCursorBufferPosition([10, 0]);
          editor.moveCursorToEndOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual([11, 8]);
        });
      });
      describe(".moveCursorToBeginningOfNextWord()", function() {
        it("moves the cursor before the first character of the next word", function() {
          var cursor, cursor1, cursor2, cursor3, _ref1;
          editor.setCursorBufferPosition([0, 6]);
          editor.addCursorAtBufferPosition([1, 11]);
          editor.addCursorAtBufferPosition([2, 0]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2];
          editor.moveCursorToBeginningOfNextWord();
          expect(cursor1.getBufferPosition()).toEqual([0, 14]);
          expect(cursor2.getBufferPosition()).toEqual([1, 13]);
          expect(cursor3.getBufferPosition()).toEqual([2, 4]);
          editor.setText("ab cde- ");
          editor.setCursorBufferPosition([0, 2]);
          cursor = editor.getCursor();
          editor.moveCursorToBeginningOfNextWord();
          return expect(cursor.getBufferPosition()).toEqual([0, 3]);
        });
        it("does not blow up when there is no next word", function() {
          var endPosition;
          editor.setCursorBufferPosition([Infinity, Infinity]);
          endPosition = editor.getCursorBufferPosition();
          editor.moveCursorToBeginningOfNextWord();
          return expect(editor.getCursorBufferPosition()).toEqual(endPosition);
        });
        it("treats lines with only whitespace as a word", function() {
          editor.setCursorBufferPosition([9, 4]);
          editor.moveCursorToBeginningOfNextWord();
          return expect(editor.getCursorBufferPosition()).toEqual([10, 0]);
        });
        return it("works when the current line is blank", function() {
          editor.setCursorBufferPosition([10, 0]);
          editor.moveCursorToBeginningOfNextWord();
          return expect(editor.getCursorBufferPosition()).toEqual([11, 9]);
        });
      });
      describe(".moveCursorToBeginningOfNextParagraph()", function() {
        return it("moves the cursor before the first line of the next paragraph", function() {
          var cursor;
          editor.setCursorBufferPosition([0, 6]);
          cursor = editor.getCursor();
          editor.moveCursorToBeginningOfNextParagraph();
          expect(cursor.getBufferPosition()).toEqual({
            row: 10,
            column: 0
          });
          editor.setText("");
          editor.setCursorBufferPosition([0, 0]);
          cursor = editor.getCursor();
          editor.moveCursorToBeginningOfNextParagraph();
          return expect(cursor.getBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveCursorToBeginningOfPreviousParagraph()", function() {
        return it("moves the cursor before the first line of the pevious paragraph", function() {
          var cursor;
          editor.setCursorBufferPosition([10, 0]);
          cursor = editor.getCursor();
          editor.moveCursorToBeginningOfPreviousParagraph();
          expect(cursor.getBufferPosition()).toEqual({
            row: 0,
            column: 0
          });
          editor.setText("");
          editor.setCursorBufferPosition([0, 0]);
          cursor = editor.getCursor();
          editor.moveCursorToBeginningOfPreviousParagraph();
          return expect(cursor.getBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".getCurrentParagraphBufferRange()", function() {
        return it("returns the buffer range of the current paragraph, delimited by blank lines or the beginning / end of the file", function() {
          buffer.setText("  I am the first paragraph,\nbordered by the beginning of\nthe file\n" + '   ' + "\n\n  I am the second paragraph\nwith blank lines above and below\nme.\n\nI am the last paragraph,\nbordered by the end of the file.");
          editor.setCursorBufferPosition([1, 7]);
          expect(editor.getCurrentParagraphBufferRange()).toEqual([[0, 0], [2, 8]]);
          editor.setCursorBufferPosition([7, 1]);
          expect(editor.getCurrentParagraphBufferRange()).toEqual([[5, 0], [7, 3]]);
          editor.setCursorBufferPosition([9, 10]);
          expect(editor.getCurrentParagraphBufferRange()).toEqual([[9, 0], [10, 32]]);
          editor.setCursorBufferPosition([3, 1]);
          return expect(editor.getCurrentParagraphBufferRange()).toBeUndefined();
        });
      });
      describe("cursor-moved events", function() {
        var cursorMovedHandler;
        cursorMovedHandler = null;
        beforeEach(function() {
          editor.foldBufferRow(4);
          editor.setSelectedBufferRange([[8, 1], [9, 0]]);
          cursorMovedHandler = jasmine.createSpy("cursorMovedHandler");
          return editor.on('cursor-moved', cursorMovedHandler);
        });
        describe("when the position of the cursor changes", function() {
          return it("emits a cursor-moved event", function() {
            buffer.insert([9, 0], '...');
            return expect(cursorMovedHandler).toHaveBeenCalledWith({
              oldBufferPosition: [9, 0],
              oldScreenPosition: [6, 0],
              newBufferPosition: [9, 3],
              newScreenPosition: [6, 3],
              textChanged: true
            });
          });
        });
        return describe("when the position of the associated selection's tail changes, but not the cursor's position", function() {
          return it("does not emit a cursor-moved event", function() {
            buffer.insert([8, 0], '...');
            return expect(cursorMovedHandler).not.toHaveBeenCalled();
          });
        });
      });
      describe("addCursorAtScreenPosition(screenPosition)", function() {
        return describe("when a cursor already exists at the position", function() {
          return it("returns the existing cursor", function() {
            var cursor1, cursor2;
            cursor1 = editor.addCursorAtScreenPosition([0, 2]);
            cursor2 = editor.addCursorAtScreenPosition([0, 2]);
            return expect(cursor2.marker).toBe(cursor1.marker);
          });
        });
      });
      describe("addCursorAtBufferPosition(bufferPosition)", function() {
        return describe("when a cursor already exists at the position", function() {
          return it("returns the existing cursor", function() {
            var cursor1, cursor2;
            cursor1 = editor.addCursorAtBufferPosition([1, 4]);
            cursor2 = editor.addCursorAtBufferPosition([1, 4]);
            return expect(cursor2.marker).toBe(cursor1.marker);
          });
        });
      });
      return describe("autoscroll", function() {
        beforeEach(function() {
          editor.manageScrollPosition = true;
          editor.setVerticalScrollMargin(2);
          editor.setHorizontalScrollMargin(2);
          editor.setLineHeightInPixels(10);
          editor.setDefaultCharWidth(10);
          editor.setHorizontalScrollbarHeight(0);
          editor.setHeight(5.5 * 10);
          return editor.setWidth(5.5 * 10);
        });
        it("scrolls down when the last cursor gets closer than ::verticalScrollMargin to the bottom of the editor", function() {
          expect(editor.getScrollTop()).toBe(0);
          expect(editor.getScrollBottom()).toBe(5.5 * 10);
          editor.setCursorScreenPosition([2, 0]);
          expect(editor.getScrollBottom()).toBe(5.5 * 10);
          editor.moveCursorDown();
          expect(editor.getScrollBottom()).toBe(6 * 10);
          editor.moveCursorDown();
          return expect(editor.getScrollBottom()).toBe(7 * 10);
        });
        it("scrolls up when the last cursor gets closer than ::verticalScrollMargin to the top of the editor", function() {
          editor.setCursorScreenPosition([11, 0]);
          editor.setScrollBottom(editor.getScrollHeight());
          editor.moveCursorUp();
          expect(editor.getScrollBottom()).toBe(editor.getScrollHeight());
          editor.moveCursorUp();
          expect(editor.getScrollTop()).toBe(7 * 10);
          editor.moveCursorUp();
          return expect(editor.getScrollTop()).toBe(6 * 10);
        });
        it("scrolls right when the last cursor gets closer than ::horizontalScrollMargin to the right of the editor", function() {
          expect(editor.getScrollLeft()).toBe(0);
          expect(editor.getScrollRight()).toBe(5.5 * 10);
          editor.setCursorScreenPosition([0, 2]);
          expect(editor.getScrollRight()).toBe(5.5 * 10);
          editor.moveCursorRight();
          expect(editor.getScrollRight()).toBe(6 * 10);
          editor.moveCursorRight();
          return expect(editor.getScrollRight()).toBe(7 * 10);
        });
        it("scrolls left when the last cursor gets closer than ::horizontalScrollMargin to the left of the editor", function() {
          editor.setScrollRight(editor.getScrollWidth());
          editor.setCursorScreenPosition([6, 62]);
          expect(editor.getScrollRight()).toBe(editor.getScrollWidth());
          editor.moveCursorLeft();
          expect(editor.getScrollLeft()).toBe(59 * 10);
          editor.moveCursorLeft();
          return expect(editor.getScrollLeft()).toBe(58 * 10);
        });
        it("scrolls down when inserting lines makes the document longer than the editor's height", function() {
          editor.setCursorScreenPosition([13, Infinity]);
          editor.insertNewline();
          expect(editor.getScrollBottom()).toBe(14 * 10);
          editor.insertNewline();
          return expect(editor.getScrollBottom()).toBe(15 * 10);
        });
        return it("autoscrolls to the cursor when it moves due to undo", function() {
          editor.insertText('abc');
          editor.setScrollTop(Infinity);
          editor.undo();
          return expect(editor.getScrollTop()).toBe(0);
        });
      });
    });
    describe("selection", function() {
      var selection;
      selection = null;
      beforeEach(function() {
        return selection = editor.getSelection();
      });
      describe(".selectUp/Down/Left/Right()", function() {
        it("expands each selection to its cursor's new location", function() {
          var selection1, selection2, _ref1;
          editor.setSelectedBufferRanges([[[0, 9], [0, 13]], [[3, 16], [3, 21]]]);
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
          editor.selectRight();
          expect(selection1.getBufferRange()).toEqual([[0, 9], [0, 14]]);
          expect(selection2.getBufferRange()).toEqual([[3, 16], [3, 22]]);
          editor.selectLeft();
          editor.selectLeft();
          expect(selection1.getBufferRange()).toEqual([[0, 9], [0, 12]]);
          expect(selection2.getBufferRange()).toEqual([[3, 16], [3, 20]]);
          editor.selectDown();
          expect(selection1.getBufferRange()).toEqual([[0, 9], [1, 12]]);
          expect(selection2.getBufferRange()).toEqual([[3, 16], [4, 20]]);
          editor.selectUp();
          expect(selection1.getBufferRange()).toEqual([[0, 9], [0, 12]]);
          return expect(selection2.getBufferRange()).toEqual([[3, 16], [3, 20]]);
        });
        it("merges selections when they intersect when moving down", function() {
          var selection1, selection2, selection3, _ref1;
          editor.setSelectedBufferRanges([[[0, 9], [0, 13]], [[1, 10], [1, 20]], [[2, 15], [3, 25]]]);
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1], selection3 = _ref1[2];
          editor.selectDown();
          expect(editor.getSelections()).toEqual([selection1]);
          expect(selection1.getScreenRange()).toEqual([[0, 9], [4, 25]]);
          return expect(selection1.isReversed()).toBeFalsy();
        });
        it("merges selections when they intersect when moving up", function() {
          var selection1, selection2, _ref1;
          editor.setSelectedBufferRanges([[[0, 9], [0, 13]], [[1, 10], [1, 20]]], {
            reversed: true
          });
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
          editor.selectUp();
          expect(editor.getSelections().length).toBe(1);
          expect(editor.getSelections()).toEqual([selection1]);
          expect(selection1.getScreenRange()).toEqual([[0, 0], [1, 20]]);
          return expect(selection1.isReversed()).toBeTruthy();
        });
        it("merges selections when they intersect when moving left", function() {
          var selection1, selection2, _ref1;
          editor.setSelectedBufferRanges([[[0, 9], [0, 13]], [[0, 14], [1, 20]]], {
            reversed: true
          });
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
          editor.selectLeft();
          expect(editor.getSelections()).toEqual([selection1]);
          expect(selection1.getScreenRange()).toEqual([[0, 8], [1, 20]]);
          return expect(selection1.isReversed()).toBeTruthy();
        });
        return it("merges selections when they intersect when moving right", function() {
          var selection1, selection2, _ref1;
          editor.setSelectedBufferRanges([[[0, 9], [0, 13]], [[0, 14], [1, 20]]]);
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
          editor.selectRight();
          expect(editor.getSelections()).toEqual([selection1]);
          expect(selection1.getScreenRange()).toEqual([[0, 9], [1, 21]]);
          return expect(selection1.isReversed()).toBeFalsy();
        });
      });
      describe(".selectToScreenPosition(screenPosition)", function() {
        return it("expands the last selection to the given position", function() {
          var selection1, selection2, selections;
          editor.setSelectedBufferRange([[3, 0], [4, 5]]);
          editor.addCursorAtScreenPosition([5, 6]);
          editor.selectToScreenPosition([6, 2]);
          selections = editor.getSelections();
          expect(selections.length).toBe(2);
          selection1 = selections[0], selection2 = selections[1];
          expect(selection1.getScreenRange()).toEqual([[3, 0], [4, 5]]);
          return expect(selection2.getScreenRange()).toEqual([[5, 6], [6, 2]]);
        });
      });
      describe(".selectToBeginningOfNextParagraph()", function() {
        return it("selects from the cursor to first line of the next paragraph", function() {
          var selections;
          editor.setSelectedBufferRange([[3, 0], [4, 5]]);
          editor.addCursorAtScreenPosition([5, 6]);
          editor.selectToScreenPosition([6, 2]);
          editor.selectToBeginningOfNextParagraph();
          selections = editor.getSelections();
          expect(selections.length).toBe(1);
          return expect(selections[0].getScreenRange()).toEqual([[3, 0], [10, 0]]);
        });
      });
      describe(".selectToBeginningOfPreviousParagraph()", function() {
        it("selects from the cursor to the first line of the pevious paragraph", function() {
          var selections;
          editor.setSelectedBufferRange([[3, 0], [4, 5]]);
          editor.addCursorAtScreenPosition([5, 6]);
          editor.selectToScreenPosition([6, 2]);
          editor.selectToBeginningOfPreviousParagraph();
          selections = editor.getSelections();
          expect(selections.length).toBe(1);
          return expect(selections[0].getScreenRange()).toEqual([[0, 0], [5, 6]]);
        });
        return it("merges selections if they intersect, maintaining the directionality of the last selection", function() {
          var selection1, selections;
          editor.setCursorScreenPosition([4, 10]);
          editor.selectToScreenPosition([5, 27]);
          editor.addCursorAtScreenPosition([3, 10]);
          editor.selectToScreenPosition([6, 27]);
          selections = editor.getSelections();
          expect(selections.length).toBe(1);
          selection1 = selections[0];
          expect(selection1.getScreenRange()).toEqual([[3, 10], [6, 27]]);
          expect(selection1.isReversed()).toBeFalsy();
          editor.addCursorAtScreenPosition([7, 4]);
          editor.selectToScreenPosition([4, 11]);
          selections = editor.getSelections();
          expect(selections.length).toBe(1);
          selection1 = selections[0];
          expect(selection1.getScreenRange()).toEqual([[3, 10], [7, 4]]);
          return expect(selection1.isReversed()).toBeTruthy();
        });
      });
      describe(".selectToTop()", function() {
        return it("selects text from cusor position to the top of the buffer", function() {
          editor.setCursorScreenPosition([11, 2]);
          editor.addCursorAtScreenPosition([10, 0]);
          editor.selectToTop();
          expect(editor.getCursors().length).toBe(1);
          expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
          expect(editor.getSelection().getBufferRange()).toEqual([[0, 0], [11, 2]]);
          return expect(editor.getSelection().isReversed()).toBeTruthy();
        });
      });
      describe(".selectToBottom()", function() {
        return it("selects text from cusor position to the bottom of the buffer", function() {
          editor.setCursorScreenPosition([10, 0]);
          editor.addCursorAtScreenPosition([9, 3]);
          editor.selectToBottom();
          expect(editor.getCursors().length).toBe(1);
          expect(editor.getCursorBufferPosition()).toEqual([12, 2]);
          expect(editor.getSelection().getBufferRange()).toEqual([[9, 3], [12, 2]]);
          return expect(editor.getSelection().isReversed()).toBeFalsy();
        });
      });
      describe(".selectAll()", function() {
        return it("selects the entire buffer", function() {
          editor.selectAll();
          return expect(editor.getSelection().getBufferRange()).toEqual(buffer.getRange());
        });
      });
      describe(".selectToBeginningOfLine()", function() {
        return it("selects text from cusor position to beginning of line", function() {
          var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
          editor.setCursorScreenPosition([12, 2]);
          editor.addCursorAtScreenPosition([11, 3]);
          editor.selectToBeginningOfLine();
          expect(editor.getCursors().length).toBe(2);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          expect(cursor1.getBufferPosition()).toEqual([12, 0]);
          expect(cursor2.getBufferPosition()).toEqual([11, 0]);
          expect(editor.getSelections().length).toBe(2);
          _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
          expect(selection1.getBufferRange()).toEqual([[12, 0], [12, 2]]);
          expect(selection1.isReversed()).toBeTruthy();
          expect(selection2.getBufferRange()).toEqual([[11, 0], [11, 3]]);
          return expect(selection2.isReversed()).toBeTruthy();
        });
      });
      describe(".selectToEndOfLine()", function() {
        return it("selects text from cusor position to end of line", function() {
          var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
          editor.setCursorScreenPosition([12, 0]);
          editor.addCursorAtScreenPosition([11, 3]);
          editor.selectToEndOfLine();
          expect(editor.getCursors().length).toBe(2);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          expect(cursor1.getBufferPosition()).toEqual([12, 2]);
          expect(cursor2.getBufferPosition()).toEqual([11, 44]);
          expect(editor.getSelections().length).toBe(2);
          _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
          expect(selection1.getBufferRange()).toEqual([[12, 0], [12, 2]]);
          expect(selection1.isReversed()).toBeFalsy();
          expect(selection2.getBufferRange()).toEqual([[11, 3], [11, 44]]);
          return expect(selection2.isReversed()).toBeFalsy();
        });
      });
      describe(".selectLine()", function() {
        return it("selects the entire line (including newlines) at given row", function() {
          editor.setCursorScreenPosition([1, 2]);
          editor.selectLine();
          expect(editor.getSelectedBufferRange()).toEqual([[1, 0], [2, 0]]);
          expect(editor.getSelectedText()).toBe("  var sort = function(items) {\n");
          editor.setCursorScreenPosition([12, 2]);
          editor.selectLine();
          expect(editor.getSelectedBufferRange()).toEqual([[12, 0], [12, 2]]);
          editor.setCursorBufferPosition([0, 2]);
          editor.selectLine();
          editor.selectLine();
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 0], [2, 0]]);
        });
      });
      describe(".selectToBeginningOfWord()", function() {
        return it("selects text from cusor position to beginning of word", function() {
          var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
          editor.setCursorScreenPosition([0, 13]);
          editor.addCursorAtScreenPosition([3, 49]);
          editor.selectToBeginningOfWord();
          expect(editor.getCursors().length).toBe(2);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          expect(cursor1.getBufferPosition()).toEqual([0, 4]);
          expect(cursor2.getBufferPosition()).toEqual([3, 47]);
          expect(editor.getSelections().length).toBe(2);
          _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
          expect(selection1.getBufferRange()).toEqual([[0, 4], [0, 13]]);
          expect(selection1.isReversed()).toBeTruthy();
          expect(selection2.getBufferRange()).toEqual([[3, 47], [3, 49]]);
          return expect(selection2.isReversed()).toBeTruthy();
        });
      });
      describe(".selectToEndOfWord()", function() {
        return it("selects text from cusor position to end of word", function() {
          var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
          editor.setCursorScreenPosition([0, 4]);
          editor.addCursorAtScreenPosition([3, 48]);
          editor.selectToEndOfWord();
          expect(editor.getCursors().length).toBe(2);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          expect(cursor1.getBufferPosition()).toEqual([0, 13]);
          expect(cursor2.getBufferPosition()).toEqual([3, 50]);
          expect(editor.getSelections().length).toBe(2);
          _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
          expect(selection1.getBufferRange()).toEqual([[0, 4], [0, 13]]);
          expect(selection1.isReversed()).toBeFalsy();
          expect(selection2.getBufferRange()).toEqual([[3, 48], [3, 50]]);
          return expect(selection2.isReversed()).toBeFalsy();
        });
      });
      describe(".selectToBeginningOfNextWord()", function() {
        return it("selects text from cusor position to beginning of next word", function() {
          var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
          editor.setCursorScreenPosition([0, 4]);
          editor.addCursorAtScreenPosition([3, 48]);
          editor.selectToBeginningOfNextWord();
          expect(editor.getCursors().length).toBe(2);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          expect(cursor1.getBufferPosition()).toEqual([0, 14]);
          expect(cursor2.getBufferPosition()).toEqual([3, 51]);
          expect(editor.getSelections().length).toBe(2);
          _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
          expect(selection1.getBufferRange()).toEqual([[0, 4], [0, 14]]);
          expect(selection1.isReversed()).toBeFalsy();
          expect(selection2.getBufferRange()).toEqual([[3, 48], [3, 51]]);
          return expect(selection2.isReversed()).toBeFalsy();
        });
      });
      describe(".selectToPreviousWordBoundary()", function() {
        return it("select to the previous word boundary", function() {
          var selection1, selection2, selection3, selection4, _ref1;
          editor.setCursorBufferPosition([0, 8]);
          editor.addCursorAtBufferPosition([2, 0]);
          editor.addCursorAtBufferPosition([3, 4]);
          editor.addCursorAtBufferPosition([3, 14]);
          editor.selectToPreviousWordBoundary();
          expect(editor.getSelections().length).toBe(4);
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1], selection3 = _ref1[2], selection4 = _ref1[3];
          expect(selection1.getBufferRange()).toEqual([[0, 8], [0, 4]]);
          expect(selection1.isReversed()).toBeTruthy();
          expect(selection2.getBufferRange()).toEqual([[2, 0], [1, 30]]);
          expect(selection2.isReversed()).toBeTruthy();
          expect(selection3.getBufferRange()).toEqual([[3, 4], [3, 0]]);
          expect(selection3.isReversed()).toBeTruthy();
          expect(selection4.getBufferRange()).toEqual([[3, 14], [3, 13]]);
          return expect(selection4.isReversed()).toBeTruthy();
        });
      });
      describe(".selectToNextWordBoundary()", function() {
        return it("select to the next word boundary", function() {
          var selection1, selection2, selection3, selection4, _ref1;
          editor.setCursorBufferPosition([0, 8]);
          editor.addCursorAtBufferPosition([2, 40]);
          editor.addCursorAtBufferPosition([4, 0]);
          editor.addCursorAtBufferPosition([3, 30]);
          editor.selectToNextWordBoundary();
          expect(editor.getSelections().length).toBe(4);
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1], selection3 = _ref1[2], selection4 = _ref1[3];
          expect(selection1.getBufferRange()).toEqual([[0, 8], [0, 13]]);
          expect(selection1.isReversed()).toBeFalsy();
          expect(selection2.getBufferRange()).toEqual([[2, 40], [3, 0]]);
          expect(selection2.isReversed()).toBeFalsy();
          expect(selection3.getBufferRange()).toEqual([[4, 0], [4, 4]]);
          expect(selection3.isReversed()).toBeFalsy();
          expect(selection4.getBufferRange()).toEqual([[3, 30], [3, 31]]);
          return expect(selection4.isReversed()).toBeFalsy();
        });
      });
      describe(".selectWord()", function() {
        describe("when the cursor is inside a word", function() {
          return it("selects the entire word", function() {
            editor.setCursorScreenPosition([0, 8]);
            editor.selectWord();
            return expect(editor.getSelectedText()).toBe('quicksort');
          });
        });
        describe("when the cursor is between two words", function() {
          return it("selects the word the cursor is on", function() {
            editor.setCursorScreenPosition([0, 4]);
            editor.selectWord();
            expect(editor.getSelectedText()).toBe('quicksort');
            editor.setCursorScreenPosition([0, 3]);
            editor.selectWord();
            return expect(editor.getSelectedText()).toBe('var');
          });
        });
        describe("when the cursor is inside a region of whitespace", function() {
          return it("selects the whitespace region", function() {
            editor.setCursorScreenPosition([5, 2]);
            editor.selectWord();
            expect(editor.getSelectedBufferRange()).toEqual([[5, 0], [5, 6]]);
            editor.setCursorScreenPosition([5, 0]);
            editor.selectWord();
            return expect(editor.getSelectedBufferRange()).toEqual([[5, 0], [5, 6]]);
          });
        });
        return describe("when the cursor is at the end of the text", function() {
          return it("select the previous word", function() {
            editor.buffer.append('word');
            editor.moveCursorToBottom();
            editor.selectWord();
            return expect(editor.getSelectedBufferRange()).toEqual([[12, 2], [12, 6]]);
          });
        });
      });
      describe(".selectToFirstCharacterOfLine()", function() {
        return it("moves to the first character of the current line or the beginning of the line if it's already on the first character", function() {
          var cursor1, cursor2, selection1, selection2, _ref1, _ref2, _ref3;
          editor.setCursorScreenPosition([0, 5]);
          editor.addCursorAtScreenPosition([1, 7]);
          editor.selectToFirstCharacterOfLine();
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          expect(cursor1.getBufferPosition()).toEqual([0, 0]);
          expect(cursor2.getBufferPosition()).toEqual([1, 2]);
          expect(editor.getSelections().length).toBe(2);
          _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
          expect(selection1.getBufferRange()).toEqual([[0, 0], [0, 5]]);
          expect(selection1.isReversed()).toBeTruthy();
          expect(selection2.getBufferRange()).toEqual([[1, 2], [1, 7]]);
          expect(selection2.isReversed()).toBeTruthy();
          editor.selectToFirstCharacterOfLine();
          _ref3 = editor.getSelections(), selection1 = _ref3[0], selection2 = _ref3[1];
          expect(selection1.getBufferRange()).toEqual([[0, 0], [0, 5]]);
          expect(selection1.isReversed()).toBeTruthy();
          expect(selection2.getBufferRange()).toEqual([[1, 0], [1, 7]]);
          return expect(selection2.isReversed()).toBeTruthy();
        });
      });
      describe(".setSelectedBufferRanges(ranges)", function() {
        it("clears existing selections and creates selections for each of the given ranges", function() {
          editor.setSelectedBufferRanges([[[2, 2], [3, 3]], [[4, 4], [5, 5]]]);
          expect(editor.getSelectedBufferRanges()).toEqual([[[2, 2], [3, 3]], [[4, 4], [5, 5]]]);
          editor.setSelectedBufferRanges([[[5, 5], [6, 6]]]);
          return expect(editor.getSelectedBufferRanges()).toEqual([[[5, 5], [6, 6]]]);
        });
        it("merges intersecting selections", function() {
          editor.setSelectedBufferRanges([[[2, 2], [3, 3]], [[3, 0], [5, 5]]]);
          return expect(editor.getSelectedBufferRanges()).toEqual([[[2, 2], [5, 5]]]);
        });
        it("recyles existing selection instances", function() {
          var selection1, selection2, _ref1;
          selection = editor.getSelection();
          editor.setSelectedBufferRanges([[[2, 2], [3, 3]], [[4, 4], [5, 5]]]);
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
          expect(selection1).toBe(selection);
          return expect(selection1.getBufferRange()).toEqual([[2, 2], [3, 3]]);
        });
        describe("when the 'preserveFolds' option is false (the default)", function() {
          return it("removes folds that contain the selections", function() {
            editor.setSelectedBufferRange([[0, 0], [0, 0]]);
            editor.createFold(1, 4);
            editor.createFold(2, 3);
            editor.createFold(6, 8);
            editor.createFold(10, 11);
            editor.setSelectedBufferRanges([[[2, 2], [3, 3]], [[6, 6], [7, 7]]]);
            expect(editor.lineForScreenRow(1).fold).toBeUndefined();
            expect(editor.lineForScreenRow(2).fold).toBeUndefined();
            expect(editor.lineForScreenRow(6).fold).toBeUndefined();
            return expect(editor.lineForScreenRow(10).fold).toBeDefined();
          });
        });
        return describe("when the 'preserveFolds' option is true", function() {
          return it("does not remove folds that contain the selections", function() {
            editor.setSelectedBufferRange([[0, 0], [0, 0]]);
            editor.createFold(1, 4);
            editor.createFold(6, 8);
            editor.setSelectedBufferRanges([[[2, 2], [3, 3]], [[6, 0], [6, 1]]], {
              preserveFolds: true
            });
            expect(editor.isFoldedAtBufferRow(1)).toBeTruthy();
            return expect(editor.isFoldedAtBufferRow(6)).toBeTruthy();
          });
        });
      });
      describe(".setSelectedBufferRange(range)", function() {
        return describe("when the 'autoscroll' option is true", function() {
          return it("autoscrolls to the selection", function() {
            editor.manageScrollPosition = true;
            editor.setLineHeightInPixels(10);
            editor.setDefaultCharWidth(10);
            editor.setHeight(50);
            editor.setWidth(50);
            editor.setHorizontalScrollbarHeight(0);
            expect(editor.getScrollTop()).toBe(0);
            editor.setSelectedBufferRange([[5, 6], [6, 8]], {
              autoscroll: true
            });
            expect(editor.getScrollBottom()).toBe((7 + editor.getVerticalScrollMargin()) * 10);
            expect(editor.getScrollRight()).toBe(50);
            editor.setSelectedBufferRange([[6, 6], [6, 8]], {
              autoscroll: true
            });
            expect(editor.getScrollBottom()).toBe((7 + editor.getVerticalScrollMargin()) * 10);
            return expect(editor.getScrollRight()).toBe((8 + editor.getHorizontalScrollMargin()) * 10);
          });
        });
      });
      describe(".selectMarker(marker)", function() {
        describe("if the marker is valid", function() {
          return it("selects the marker's range and returns the selected range", function() {
            var marker;
            marker = editor.markBufferRange([[0, 1], [3, 3]]);
            expect(editor.selectMarker(marker)).toEqual([[0, 1], [3, 3]]);
            return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [3, 3]]);
          });
        });
        return describe("if the marker is invalid", function() {
          return it("does not change the selection and returns a falsy value", function() {
            var marker;
            marker = editor.markBufferRange([[0, 1], [3, 3]]);
            marker.destroy();
            expect(editor.selectMarker(marker)).toBeFalsy();
            return expect(editor.getSelectedBufferRange()).toEqual([[0, 0], [0, 0]]);
          });
        });
      });
      describe(".addSelectionForBufferRange(bufferRange)", function() {
        it("adds a selection for the specified buffer range", function() {
          editor.addSelectionForBufferRange([[3, 4], [5, 6]]);
          return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 0]], [[3, 4], [5, 6]]]);
        });
        return it("autoscrolls to the added selection if needed", function() {
          editor.manageScrollPosition = true;
          editor.setLineHeightInPixels(10);
          editor.setDefaultCharWidth(10);
          editor.setHeight(50);
          editor.setWidth(50);
          editor.addSelectionForBufferRange([[8, 10], [8, 15]]);
          expect(editor.getScrollTop()).toBe(75);
          return expect(editor.getScrollLeft()).toBe(160);
        });
      });
      describe(".addSelectionBelow()", function() {
        describe("when the selection is non-empty", function() {
          it("selects the same region of the line below current selections if possible", function() {
            var cursor, _i, _len, _ref1, _results;
            editor.setSelectedBufferRange([[3, 16], [3, 21]]);
            editor.addSelectionForBufferRange([[3, 25], [3, 34]]);
            editor.addSelectionBelow();
            expect(editor.getSelectedBufferRanges()).toEqual([[[3, 16], [3, 21]], [[3, 25], [3, 34]], [[4, 16], [4, 21]], [[4, 25], [4, 29]]]);
            _ref1 = editor.getCursors();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              cursor = _ref1[_i];
              _results.push(expect(cursor.isVisible()).toBeFalsy());
            }
            return _results;
          });
          it("skips lines that are too short to create a non-empty selection", function() {
            editor.setSelectedBufferRange([[3, 31], [3, 38]]);
            editor.addSelectionBelow();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[3, 31], [3, 38]], [[6, 31], [6, 38]]]);
          });
          it("honors the original selection's range (goal range) when adding across shorter lines", function() {
            editor.setSelectedBufferRange([[3, 22], [3, 38]]);
            editor.addSelectionBelow();
            editor.addSelectionBelow();
            editor.addSelectionBelow();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[3, 22], [3, 38]], [[4, 22], [4, 29]], [[5, 22], [5, 30]], [[6, 22], [6, 38]]]);
          });
          return it("clears selection goal ranges when the selection changes", function() {
            editor.setSelectedBufferRange([[3, 22], [3, 38]]);
            editor.addSelectionBelow();
            editor.selectLeft();
            editor.addSelectionBelow();
            expect(editor.getSelectedBufferRanges()).toEqual([[[3, 22], [3, 37]], [[4, 22], [4, 29]], [[5, 22], [5, 28]]]);
            editor.addSelectionBelow();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[3, 22], [3, 37]], [[4, 22], [4, 29]], [[5, 22], [5, 30]], [[6, 22], [6, 28]]]);
          });
        });
        return describe("when the selection is empty", function() {
          it("does not skip lines that are shorter than the current column", function() {
            editor.setCursorBufferPosition([3, 36]);
            editor.addSelectionBelow();
            editor.addSelectionBelow();
            editor.addSelectionBelow();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[3, 36], [3, 36]], [[4, 29], [4, 29]], [[5, 30], [5, 30]], [[6, 36], [6, 36]]]);
          });
          it("skips empty lines when the column is non-zero", function() {
            editor.setCursorBufferPosition([9, 4]);
            editor.addSelectionBelow();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[9, 4], [9, 4]], [[11, 4], [11, 4]]]);
          });
          return it("does not skip empty lines when the column is zero", function() {
            editor.setCursorBufferPosition([9, 0]);
            editor.addSelectionBelow();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[9, 0], [9, 0]], [[10, 0], [10, 0]]]);
          });
        });
      });
      describe(".addSelectionAbove()", function() {
        describe("when the selection is non-empty", function() {
          it("selects the same region of the line above current selections if possible", function() {
            var cursor, _i, _len, _ref1, _results;
            editor.setSelectedBufferRange([[3, 16], [3, 21]]);
            editor.addSelectionForBufferRange([[3, 37], [3, 44]]);
            editor.addSelectionAbove();
            expect(editor.getSelectedBufferRanges()).toEqual([[[2, 16], [2, 21]], [[2, 37], [2, 40]], [[3, 16], [3, 21]], [[3, 37], [3, 44]]]);
            _ref1 = editor.getCursors();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              cursor = _ref1[_i];
              _results.push(expect(cursor.isVisible()).toBeFalsy());
            }
            return _results;
          });
          it("skips lines that are too short to create a non-empty selection", function() {
            editor.setSelectedBufferRange([[6, 31], [6, 38]]);
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[3, 31], [3, 38]], [[6, 31], [6, 38]]]);
          });
          return it("honors the original selection's range (goal range) when adding across shorter lines", function() {
            editor.setSelectedBufferRange([[6, 22], [6, 38]]);
            editor.addSelectionAbove();
            editor.addSelectionAbove();
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[3, 22], [3, 38]], [[4, 22], [4, 29]], [[5, 22], [5, 30]], [[6, 22], [6, 38]]]);
          });
        });
        return describe("when the selection is empty", function() {
          it("does not skip lines that are shorter than the current column", function() {
            editor.setCursorBufferPosition([6, 36]);
            editor.addSelectionAbove();
            editor.addSelectionAbove();
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[3, 36], [3, 36]], [[4, 29], [4, 29]], [[5, 30], [5, 30]], [[6, 36], [6, 36]]]);
          });
          it("skips empty lines when the column is non-zero", function() {
            editor.setCursorBufferPosition([11, 4]);
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[9, 4], [9, 4]], [[11, 4], [11, 4]]]);
          });
          return it("does not skip empty lines when the column is zero", function() {
            editor.setCursorBufferPosition([10, 0]);
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[9, 0], [9, 0]], [[10, 0], [10, 0]]]);
          });
        });
      });
      describe(".splitSelectionsIntoLines()", function() {
        return it("splits all multi-line selections into one selection per line", function() {
          editor.setSelectedBufferRange([[0, 3], [2, 4]]);
          editor.splitSelectionsIntoLines();
          expect(editor.getSelectedBufferRanges()).toEqual([[[0, 3], [0, 29]], [[1, 0], [1, 30]], [[2, 0], [2, 4]]]);
          editor.setSelectedBufferRange([[0, 3], [1, 10]]);
          editor.splitSelectionsIntoLines();
          expect(editor.getSelectedBufferRanges()).toEqual([[[0, 3], [0, 29]], [[1, 0], [1, 10]]]);
          editor.setSelectedBufferRange([[0, 0], [0, 3]]);
          editor.splitSelectionsIntoLines();
          return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 3]]]);
        });
      });
      describe(".consolidateSelections()", function() {
        return it("destroys all selections but the most recent, returning true if any selections were destroyed", function() {
          var selection1, selection2, selection3;
          editor.setSelectedBufferRange([[3, 16], [3, 21]]);
          selection1 = editor.getSelection();
          selection2 = editor.addSelectionForBufferRange([[3, 25], [3, 34]]);
          selection3 = editor.addSelectionForBufferRange([[8, 4], [8, 10]]);
          expect(editor.getSelections()).toEqual([selection1, selection2, selection3]);
          expect(editor.consolidateSelections()).toBeTruthy();
          expect(editor.getSelections()).toEqual([selection3]);
          expect(selection3.isEmpty()).toBeFalsy();
          expect(editor.consolidateSelections()).toBeFalsy();
          return expect(editor.getSelections()).toEqual([selection3]);
        });
      });
      describe("when the cursor is moved while there is a selection", function() {
        var makeSelection;
        makeSelection = function() {
          return selection.setBufferRange([[1, 2], [1, 5]]);
        };
        return it("clears the selection", function() {
          makeSelection();
          editor.moveCursorDown();
          expect(selection.isEmpty()).toBeTruthy();
          makeSelection();
          editor.moveCursorUp();
          expect(selection.isEmpty()).toBeTruthy();
          makeSelection();
          editor.moveCursorLeft();
          expect(selection.isEmpty()).toBeTruthy();
          makeSelection();
          editor.moveCursorRight();
          expect(selection.isEmpty()).toBeTruthy();
          makeSelection();
          editor.setCursorScreenPosition([3, 3]);
          return expect(selection.isEmpty()).toBeTruthy();
        });
      });
      return it("does not share selections between different edit sessions for the same buffer", function() {
        var editor2;
        editor2 = null;
        waitsForPromise(function() {
          return atom.project.open('sample.js').then(function(o) {
            return editor2 = o;
          });
        });
        return runs(function() {
          editor.setSelectedBufferRanges([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
          editor2.setSelectedBufferRanges([[[8, 7], [6, 5]], [[4, 3], [2, 1]]]);
          return expect(editor2.getSelectedBufferRanges()).not.toEqual(editor.getSelectedBufferRanges());
        });
      });
    });
    describe("buffer manipulation", function() {
      describe(".insertText(text)", function() {
        describe("when there are multiple empty selections", function() {
          describe("when the cursors are on the same line", function() {
            return it("inserts the given text at the location of each cursor and moves the cursors to the end of each cursor's inserted text", function() {
              var cursor1, cursor2, _ref1;
              editor.setCursorScreenPosition([1, 2]);
              editor.addCursorAtScreenPosition([1, 5]);
              editor.insertText('xxx');
              expect(buffer.lineForRow(1)).toBe('  xxxvarxxx sort = function(items) {');
              _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
              expect(cursor1.getBufferPosition()).toEqual([1, 5]);
              return expect(cursor2.getBufferPosition()).toEqual([1, 11]);
            });
          });
          return describe("when the cursors are on different lines", function() {
            it("inserts the given text at the location of each cursor and moves the cursors to the end of each cursor's inserted text", function() {
              var cursor1, cursor2, _ref1;
              editor.setCursorScreenPosition([1, 2]);
              editor.addCursorAtScreenPosition([2, 4]);
              editor.insertText('xxx');
              expect(buffer.lineForRow(1)).toBe('  xxxvar sort = function(items) {');
              expect(buffer.lineForRow(2)).toBe('    xxxif (items.length <= 1) return items;');
              _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
              expect(cursor1.getBufferPosition()).toEqual([1, 5]);
              return expect(cursor2.getBufferPosition()).toEqual([2, 7]);
            });
            return it("autoscrolls to the last cursor", function() {
              editor.manageScrollPosition = true;
              editor.setCursorScreenPosition([1, 2]);
              editor.addCursorAtScreenPosition([10, 4]);
              editor.setLineHeightInPixels(10);
              editor.setHeight(50);
              expect(editor.getScrollTop()).toBe(0);
              editor.insertText('a');
              return expect(editor.getScrollTop()).toBe(80);
            });
          });
        });
        describe("when there are multiple non-empty selections", function() {
          describe("when the selections are on the same line", function() {
            return it("replaces each selection range with the inserted characters", function() {
              var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
              editor.setSelectedBufferRanges([[[0, 4], [0, 13]], [[0, 22], [0, 24]]]);
              editor.insertText("x");
              _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
              _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
              expect(cursor1.getScreenPosition()).toEqual([0, 5]);
              expect(cursor2.getScreenPosition()).toEqual([0, 15]);
              expect(selection1.isEmpty()).toBeTruthy();
              expect(selection2.isEmpty()).toBeTruthy();
              return expect(editor.lineForBufferRow(0)).toBe("var x = functix () {");
            });
          });
          return describe("when the selections are on different lines", function() {
            return it("replaces each selection with the given text, clears the selections, and places the cursor at the end of each selection's inserted text", function() {
              var selection1, selection2, _ref1;
              editor.setSelectedBufferRanges([[[1, 0], [1, 2]], [[2, 0], [2, 4]]]);
              editor.insertText('xxx');
              expect(buffer.lineForRow(1)).toBe('xxxvar sort = function(items) {');
              expect(buffer.lineForRow(2)).toBe('xxxif (items.length <= 1) return items;');
              _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
              expect(selection1.isEmpty()).toBeTruthy();
              expect(selection1.cursor.getBufferPosition()).toEqual([1, 3]);
              expect(selection2.isEmpty()).toBeTruthy();
              return expect(selection2.cursor.getBufferPosition()).toEqual([2, 3]);
            });
          });
        });
        return describe("when there is a selection that ends on a folded line", function() {
          return it("destroys the selection", function() {
            editor.createFold(2, 4);
            editor.setSelectedBufferRange([[1, 0], [2, 0]]);
            editor.insertText('holy cow');
            return expect(editor.lineForScreenRow(2).fold).toBeUndefined();
          });
        });
      });
      describe(".insertNewline()", function() {
        describe("when there is a single cursor", function() {
          describe("when the cursor is at the beginning of a line", function() {
            return it("inserts an empty line before it", function() {
              editor.setCursorScreenPosition({
                row: 1,
                column: 0
              });
              editor.insertNewline();
              expect(buffer.lineForRow(1)).toBe('');
              return expect(editor.getCursorScreenPosition()).toEqual({
                row: 2,
                column: 0
              });
            });
          });
          describe("when the cursor is in the middle of a line", function() {
            return it("splits the current line to form a new line", function() {
              var lineBelowOriginalLine, originalLine;
              editor.setCursorScreenPosition({
                row: 1,
                column: 6
              });
              originalLine = buffer.lineForRow(1);
              lineBelowOriginalLine = buffer.lineForRow(2);
              editor.insertNewline();
              expect(buffer.lineForRow(1)).toBe(originalLine.slice(0, 6));
              expect(buffer.lineForRow(2)).toBe(originalLine.slice(6));
              expect(buffer.lineForRow(3)).toBe(lineBelowOriginalLine);
              return expect(editor.getCursorScreenPosition()).toEqual({
                row: 2,
                column: 0
              });
            });
          });
          return describe("when the cursor is on the end of a line", function() {
            return it("inserts an empty line after it", function() {
              editor.setCursorScreenPosition({
                row: 1,
                column: buffer.lineForRow(1).length
              });
              editor.insertNewline();
              expect(buffer.lineForRow(2)).toBe('');
              return expect(editor.getCursorScreenPosition()).toEqual({
                row: 2,
                column: 0
              });
            });
          });
        });
        return describe("when there are multiple cursors", function() {
          describe("when the cursors are on the same line", function() {
            return it("breaks the line at the cursor locations", function() {
              var cursor1, cursor2, _ref1;
              editor.setCursorScreenPosition([3, 13]);
              editor.addCursorAtScreenPosition([3, 38]);
              editor.insertNewline();
              expect(editor.lineForBufferRow(3)).toBe("    var pivot");
              expect(editor.lineForBufferRow(4)).toBe(" = items.shift(), current");
              expect(editor.lineForBufferRow(5)).toBe(", left = [], right = [];");
              expect(editor.lineForBufferRow(6)).toBe("    while(items.length > 0) {");
              _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
              expect(cursor1.getBufferPosition()).toEqual([4, 0]);
              return expect(cursor2.getBufferPosition()).toEqual([5, 0]);
            });
          });
          return describe("when the cursors are on different lines", function() {
            return it("inserts newlines at each cursor location", function() {
              var cursor1, cursor2, _ref1;
              editor.setCursorScreenPosition([3, 0]);
              editor.addCursorAtScreenPosition([6, 0]);
              editor.insertText("\n");
              expect(editor.lineForBufferRow(3)).toBe("");
              expect(editor.lineForBufferRow(4)).toBe("    var pivot = items.shift(), current, left = [], right = [];");
              expect(editor.lineForBufferRow(5)).toBe("    while(items.length > 0) {");
              expect(editor.lineForBufferRow(6)).toBe("      current = items.shift();");
              expect(editor.lineForBufferRow(7)).toBe("");
              expect(editor.lineForBufferRow(8)).toBe("      current < pivot ? left.push(current) : right.push(current);");
              expect(editor.lineForBufferRow(9)).toBe("    }");
              _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
              expect(cursor1.getBufferPosition()).toEqual([4, 0]);
              return expect(cursor2.getBufferPosition()).toEqual([8, 0]);
            });
          });
        });
      });
      describe(".insertNewlineBelow()", function() {
        describe("when the operation is undone", function() {
          return it("places the cursor back at the previous location", function() {
            editor.setCursorBufferPosition([0, 2]);
            editor.insertNewlineBelow();
            expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            editor.undo();
            return expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
          });
        });
        return it("inserts a newline below the cursor's current line, autoindents it, and moves the cursor to the end of the line", function() {
          atom.config.set("editor.autoIndent", true);
          editor.insertNewlineBelow();
          expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
          expect(buffer.lineForRow(1)).toBe("  ");
          return expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
        });
      });
      describe(".insertNewlineAbove()", function() {
        describe("when the cursor is on first line", function() {
          return it("inserts a newline on the first line and moves the cursor to the first line", function() {
            editor.setCursorBufferPosition([0]);
            editor.insertNewlineAbove();
            expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
            expect(editor.lineForBufferRow(0)).toBe('');
            expect(editor.lineForBufferRow(1)).toBe('var quicksort = function () {');
            return expect(editor.buffer.getLineCount()).toBe(14);
          });
        });
        describe("when the cursor is not on the first line", function() {
          return it("inserts a newline above the current line and moves the cursor to the inserted line", function() {
            editor.setCursorBufferPosition([3, 4]);
            editor.insertNewlineAbove();
            expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
            expect(editor.lineForBufferRow(3)).toBe('');
            expect(editor.lineForBufferRow(4)).toBe('    var pivot = items.shift(), current, left = [], right = [];');
            expect(editor.buffer.getLineCount()).toBe(14);
            editor.undo();
            return expect(editor.getCursorBufferPosition()).toEqual([3, 4]);
          });
        });
        return it("indents the new line to the correct level when editor.autoIndent is true", function() {
          atom.config.set('editor.autoIndent', true);
          editor.setText('  var test');
          editor.setCursorBufferPosition([0, 2]);
          editor.insertNewlineAbove();
          expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
          expect(editor.lineForBufferRow(0)).toBe('  ');
          expect(editor.lineForBufferRow(1)).toBe('  var test');
          editor.setText('\n  var test');
          editor.setCursorBufferPosition([1, 2]);
          editor.insertNewlineAbove();
          expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
          expect(editor.lineForBufferRow(0)).toBe('');
          expect(editor.lineForBufferRow(1)).toBe('  ');
          expect(editor.lineForBufferRow(2)).toBe('  var test');
          editor.setText('function() {\n}');
          editor.setCursorBufferPosition([1, 1]);
          editor.insertNewlineAbove();
          expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
          expect(editor.lineForBufferRow(0)).toBe('function() {');
          expect(editor.lineForBufferRow(1)).toBe('  ');
          return expect(editor.lineForBufferRow(2)).toBe('}');
        });
      });
      describe("when a new line is appended before a closing tag (e.g. by pressing enter before a selection)", function() {
        return it("moves the line down and keeps the indentation level the same when editor.autoIndent is true", function() {
          atom.config.set('editor.autoIndent', true);
          editor.setCursorBufferPosition([9, 2]);
          editor.insertNewline();
          return expect(editor.lineForBufferRow(10)).toBe('  };');
        });
      });
      describe(".backspace()", function() {
        describe("when there is a single cursor", function() {
          var changeScreenRangeHandler;
          changeScreenRangeHandler = null;
          beforeEach(function() {
            var selection;
            selection = editor.getLastSelection();
            changeScreenRangeHandler = jasmine.createSpy('changeScreenRangeHandler');
            return selection.on('screen-range-changed', changeScreenRangeHandler);
          });
          describe("when the cursor is on the middle of the line", function() {
            return it("removes the character before the cursor", function() {
              var line;
              editor.setCursorScreenPosition({
                row: 1,
                column: 7
              });
              expect(buffer.lineForRow(1)).toBe("  var sort = function(items) {");
              editor.backspace();
              line = buffer.lineForRow(1);
              expect(line).toBe("  var ort = function(items) {");
              expect(editor.getCursorScreenPosition()).toEqual({
                row: 1,
                column: 6
              });
              expect(changeScreenRangeHandler).toHaveBeenCalled();
              return expect(editor.getCursor().isVisible()).toBeTruthy();
            });
          });
          describe("when the cursor is at the beginning of a line", function() {
            return it("joins it with the line above", function() {
              var line0, line1, originalLine0;
              originalLine0 = buffer.lineForRow(0);
              expect(originalLine0).toBe("var quicksort = function () {");
              expect(buffer.lineForRow(1)).toBe("  var sort = function(items) {");
              editor.setCursorScreenPosition({
                row: 1,
                column: 0
              });
              editor.backspace();
              line0 = buffer.lineForRow(0);
              line1 = buffer.lineForRow(1);
              expect(line0).toBe("var quicksort = function () {  var sort = function(items) {");
              expect(line1).toBe("    if (items.length <= 1) return items;");
              expect(editor.getCursorScreenPosition()).toEqual([0, originalLine0.length]);
              return expect(changeScreenRangeHandler).toHaveBeenCalled();
            });
          });
          describe("when the cursor is at the first column of the first line", function() {
            return it("does nothing, but doesn't raise an error", function() {
              editor.setCursorScreenPosition({
                row: 0,
                column: 0
              });
              return editor.backspace();
            });
          });
          describe("when the cursor is on the first column of a line below a fold", function() {
            return it("deletes the folded lines", function() {
              editor.setCursorScreenPosition([4, 0]);
              editor.foldCurrentRow();
              editor.setCursorScreenPosition([5, 0]);
              editor.backspace();
              expect(buffer.lineForRow(4)).toBe("    return sort(left).concat(pivot).concat(sort(right));");
              return expect(buffer.lineForRow(4).fold).toBeUndefined();
            });
          });
          describe("when the cursor is in the middle of a line below a fold", function() {
            return it("backspaces as normal", function() {
              editor.setCursorScreenPosition([4, 0]);
              editor.foldCurrentRow();
              editor.setCursorScreenPosition([5, 5]);
              editor.backspace();
              expect(buffer.lineForRow(7)).toBe("    }");
              return expect(buffer.lineForRow(8)).toBe("    eturn sort(left).concat(pivot).concat(sort(right));");
            });
          });
          return describe("when the cursor is on a folded screen line", function() {
            return it("deletes all of the folded lines along with the fold", function() {
              editor.setCursorBufferPosition([3, 0]);
              editor.foldCurrentRow();
              editor.backspace();
              expect(buffer.lineForRow(1)).toBe("");
              expect(buffer.lineForRow(2)).toBe("  return sort(Array.apply(this, arguments));");
              return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
            });
          });
        });
        describe("when there are multiple cursors", function() {
          describe("when cursors are on the same line", function() {
            return it("removes the characters preceding each cursor", function() {
              var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
              editor.setCursorScreenPosition([3, 13]);
              editor.addCursorAtScreenPosition([3, 38]);
              editor.backspace();
              expect(editor.lineForBufferRow(3)).toBe("    var pivo = items.shift(), curren, left = [], right = [];");
              _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
              expect(cursor1.getBufferPosition()).toEqual([3, 12]);
              expect(cursor2.getBufferPosition()).toEqual([3, 36]);
              _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
              expect(selection1.isEmpty()).toBeTruthy();
              return expect(selection2.isEmpty()).toBeTruthy();
            });
          });
          return describe("when cursors are on different lines", function() {
            describe("when the cursors are in the middle of their lines", function() {
              return it("removes the characters preceding each cursor", function() {
                var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
                editor.setCursorScreenPosition([3, 13]);
                editor.addCursorAtScreenPosition([4, 10]);
                editor.backspace();
                expect(editor.lineForBufferRow(3)).toBe("    var pivo = items.shift(), current, left = [], right = [];");
                expect(editor.lineForBufferRow(4)).toBe("    whileitems.length > 0) {");
                _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
                expect(cursor1.getBufferPosition()).toEqual([3, 12]);
                expect(cursor2.getBufferPosition()).toEqual([4, 9]);
                _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
                expect(selection1.isEmpty()).toBeTruthy();
                return expect(selection2.isEmpty()).toBeTruthy();
              });
            });
            return describe("when the cursors are on the first column of their lines", function() {
              return it("removes the newlines preceding each cursor", function() {
                var cursor1, cursor2, _ref1;
                editor.setCursorScreenPosition([3, 0]);
                editor.addCursorAtScreenPosition([6, 0]);
                editor.backspace();
                expect(editor.lineForBufferRow(2)).toBe("    if (items.length <= 1) return items;    var pivot = items.shift(), current, left = [], right = [];");
                expect(editor.lineForBufferRow(3)).toBe("    while(items.length > 0) {");
                expect(editor.lineForBufferRow(4)).toBe("      current = items.shift();      current < pivot ? left.push(current) : right.push(current);");
                expect(editor.lineForBufferRow(5)).toBe("    }");
                _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
                expect(cursor1.getBufferPosition()).toEqual([2, 40]);
                return expect(cursor2.getBufferPosition()).toEqual([4, 30]);
              });
            });
          });
        });
        describe("when there is a single selection", function() {
          it("deletes the selection, but not the character before it", function() {
            editor.setSelectedBufferRange([[0, 5], [0, 9]]);
            editor.backspace();
            return expect(editor.buffer.lineForRow(0)).toBe('var qsort = function () {');
          });
          return describe("when the selection ends on a folded line", function() {
            return it("preserves the fold", function() {
              editor.setSelectedBufferRange([[3, 0], [4, 0]]);
              editor.foldBufferRow(4);
              editor.backspace();
              expect(buffer.lineForRow(3)).toBe("    while(items.length > 0) {");
              return expect(editor.lineForScreenRow(3).fold).toBeDefined();
            });
          });
        });
        return describe("when there are multiple selections", function() {
          return it("removes all selected text", function() {
            editor.setSelectedBufferRanges([[[0, 4], [0, 13]], [[0, 16], [0, 24]]]);
            editor.backspace();
            return expect(editor.lineForBufferRow(0)).toBe('var  =  () {');
          });
        });
      });
      describe(".deleteToBeginningOfWord()", function() {
        describe("when no text is selected", function() {
          return it("deletes all text between the cursor and the beginning of the word", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorBufferPosition([1, 24]);
            editor.addCursorAtBufferPosition([3, 5]);
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            editor.deleteToBeginningOfWord();
            expect(buffer.lineForRow(1)).toBe('  var sort = function(ems) {');
            expect(buffer.lineForRow(3)).toBe('    ar pivot = items.shift(), current, left = [], right = [];');
            expect(cursor1.getBufferPosition()).toEqual([1, 22]);
            expect(cursor2.getBufferPosition()).toEqual([3, 4]);
            editor.deleteToBeginningOfWord();
            expect(buffer.lineForRow(1)).toBe('  var sort = functionems) {');
            expect(buffer.lineForRow(2)).toBe('    if (items.length <= 1) return itemsar pivot = items.shift(), current, left = [], right = [];');
            expect(cursor1.getBufferPosition()).toEqual([1, 21]);
            expect(cursor2.getBufferPosition()).toEqual([2, 39]);
            editor.deleteToBeginningOfWord();
            expect(buffer.lineForRow(1)).toBe('  var sort = ems) {');
            expect(buffer.lineForRow(2)).toBe('    if (items.length <= 1) return ar pivot = items.shift(), current, left = [], right = [];');
            expect(cursor1.getBufferPosition()).toEqual([1, 13]);
            expect(cursor2.getBufferPosition()).toEqual([2, 34]);
            editor.setText('  var sort');
            editor.setCursorBufferPosition([0, 2]);
            editor.deleteToBeginningOfWord();
            return expect(buffer.lineForRow(0)).toBe('var sort');
          });
        });
        return describe("when text is selected", function() {
          return it("deletes only selected text", function() {
            editor.setSelectedBufferRanges([[[1, 24], [1, 27]], [[2, 0], [2, 4]]]);
            editor.deleteToBeginningOfWord();
            expect(buffer.lineForRow(1)).toBe('  var sort = function(it) {');
            return expect(buffer.lineForRow(2)).toBe('if (items.length <= 1) return items;');
          });
        });
      });
      describe('.deleteToEndOfLine()', function() {
        describe('when no text is selected', function() {
          it('deletes all text between the cursor and the end of the line', function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorBufferPosition([1, 24]);
            editor.addCursorAtBufferPosition([2, 5]);
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            editor.deleteToEndOfLine();
            expect(buffer.lineForRow(1)).toBe('  var sort = function(it');
            expect(buffer.lineForRow(2)).toBe('    i');
            expect(cursor1.getBufferPosition()).toEqual([1, 24]);
            return expect(cursor2.getBufferPosition()).toEqual([2, 5]);
          });
          return describe('when at the end of the line', function() {
            return it('deletes the next newline', function() {
              editor.setCursorBufferPosition([1, 30]);
              editor.deleteToEndOfLine();
              return expect(buffer.lineForRow(1)).toBe('  var sort = function(items) {    if (items.length <= 1) return items;');
            });
          });
        });
        return describe('when text is selected', function() {
          return it('deletes only the text in the selection', function() {
            editor.setSelectedBufferRanges([[[1, 24], [1, 27]], [[2, 0], [2, 4]]]);
            editor.deleteToEndOfLine();
            expect(buffer.lineForRow(1)).toBe('  var sort = function(it) {');
            return expect(buffer.lineForRow(2)).toBe('if (items.length <= 1) return items;');
          });
        });
      });
      describe(".deleteToBeginningOfLine()", function() {
        describe("when no text is selected", function() {
          it("deletes all text between the cursor and the beginning of the line", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorBufferPosition([1, 24]);
            editor.addCursorAtBufferPosition([2, 5]);
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            editor.deleteToBeginningOfLine();
            expect(buffer.lineForRow(1)).toBe('ems) {');
            expect(buffer.lineForRow(2)).toBe('f (items.length <= 1) return items;');
            expect(cursor1.getBufferPosition()).toEqual([1, 0]);
            return expect(cursor2.getBufferPosition()).toEqual([2, 0]);
          });
          return describe("when at the beginning of the line", function() {
            return it("deletes the newline", function() {
              editor.setCursorBufferPosition([2]);
              editor.deleteToBeginningOfLine();
              return expect(buffer.lineForRow(1)).toBe('  var sort = function(items) {    if (items.length <= 1) return items;');
            });
          });
        });
        return describe("when text is selected", function() {
          return it("still deletes all text to begginning of the line", function() {
            editor.setSelectedBufferRanges([[[1, 24], [1, 27]], [[2, 0], [2, 4]]]);
            editor.deleteToBeginningOfLine();
            expect(buffer.lineForRow(1)).toBe('ems) {');
            return expect(buffer.lineForRow(2)).toBe('    if (items.length <= 1) return items;');
          });
        });
      });
      describe(".delete()", function() {
        describe("when there is a single cursor", function() {
          describe("when the cursor is on the middle of a line", function() {
            return it("deletes the character following the cursor", function() {
              editor.setCursorScreenPosition([1, 6]);
              editor["delete"]();
              return expect(buffer.lineForRow(1)).toBe('  var ort = function(items) {');
            });
          });
          describe("when the cursor is on the end of a line", function() {
            return it("joins the line with the following line", function() {
              editor.setCursorScreenPosition([1, buffer.lineForRow(1).length]);
              editor["delete"]();
              return expect(buffer.lineForRow(1)).toBe('  var sort = function(items) {    if (items.length <= 1) return items;');
            });
          });
          describe("when the cursor is on the last column of the last line", function() {
            return it("does nothing, but doesn't raise an error", function() {
              editor.setCursorScreenPosition([12, buffer.lineForRow(12).length]);
              editor["delete"]();
              return expect(buffer.lineForRow(12)).toBe('};');
            });
          });
          describe("when the cursor is on the end of a line above a fold", function() {
            return it("only deletes the lines inside the fold", function() {
              var cursorPositionBefore;
              editor.foldBufferRow(4);
              editor.setCursorScreenPosition([3, Infinity]);
              cursorPositionBefore = editor.getCursorScreenPosition();
              editor["delete"]();
              expect(buffer.lineForRow(3)).toBe("    var pivot = items.shift(), current, left = [], right = [];");
              expect(buffer.lineForRow(4)).toBe("    return sort(left).concat(pivot).concat(sort(right));");
              return expect(editor.getCursorScreenPosition()).toEqual(cursorPositionBefore);
            });
          });
          describe("when the cursor is in the middle a line above a fold", function() {
            return it("deletes as normal", function() {
              var cursorPositionBefore;
              editor.foldBufferRow(4);
              editor.setCursorScreenPosition([3, 4]);
              cursorPositionBefore = editor.getCursorScreenPosition();
              editor["delete"]();
              expect(buffer.lineForRow(3)).toBe("    ar pivot = items.shift(), current, left = [], right = [];");
              expect(editor.lineForScreenRow(4).fold).toBeDefined();
              return expect(editor.getCursorScreenPosition()).toEqual([3, 4]);
            });
          });
          return describe("when the cursor is on a folded line", function() {
            return it("removes the lines contained by the fold", function() {
              var oldLine7, oldLine8;
              editor.setSelectedBufferRange([[2, 0], [2, 0]]);
              editor.createFold(2, 4);
              editor.createFold(2, 6);
              oldLine7 = buffer.lineForRow(7);
              oldLine8 = buffer.lineForRow(8);
              editor["delete"]();
              expect(editor.lineForScreenRow(2).text).toBe(oldLine7);
              return expect(editor.lineForScreenRow(3).text).toBe(oldLine8);
            });
          });
        });
        describe("when there are multiple cursors", function() {
          describe("when cursors are on the same line", function() {
            return it("removes the characters following each cursor", function() {
              var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
              editor.setCursorScreenPosition([3, 13]);
              editor.addCursorAtScreenPosition([3, 38]);
              editor["delete"]();
              expect(editor.lineForBufferRow(3)).toBe("    var pivot= items.shift(), current left = [], right = [];");
              _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
              expect(cursor1.getBufferPosition()).toEqual([3, 13]);
              expect(cursor2.getBufferPosition()).toEqual([3, 37]);
              _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
              expect(selection1.isEmpty()).toBeTruthy();
              return expect(selection2.isEmpty()).toBeTruthy();
            });
          });
          return describe("when cursors are on different lines", function() {
            describe("when the cursors are in the middle of the lines", function() {
              return it("removes the characters following each cursor", function() {
                var cursor1, cursor2, selection1, selection2, _ref1, _ref2;
                editor.setCursorScreenPosition([3, 13]);
                editor.addCursorAtScreenPosition([4, 10]);
                editor["delete"]();
                expect(editor.lineForBufferRow(3)).toBe("    var pivot= items.shift(), current, left = [], right = [];");
                expect(editor.lineForBufferRow(4)).toBe("    while(tems.length > 0) {");
                _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
                expect(cursor1.getBufferPosition()).toEqual([3, 13]);
                expect(cursor2.getBufferPosition()).toEqual([4, 10]);
                _ref2 = editor.getSelections(), selection1 = _ref2[0], selection2 = _ref2[1];
                expect(selection1.isEmpty()).toBeTruthy();
                return expect(selection2.isEmpty()).toBeTruthy();
              });
            });
            return describe("when the cursors are at the end of their lines", function() {
              return it("removes the newlines following each cursor", function() {
                var cursor1, cursor2, _ref1;
                editor.setCursorScreenPosition([0, 29]);
                editor.addCursorAtScreenPosition([1, 30]);
                editor["delete"]();
                expect(editor.lineForBufferRow(0)).toBe("var quicksort = function () {  var sort = function(items) {    if (items.length <= 1) return items;");
                _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
                expect(cursor1.getBufferPosition()).toEqual([0, 29]);
                return expect(cursor2.getBufferPosition()).toEqual([0, 59]);
              });
            });
          });
        });
        describe("when there is a single selection", function() {
          return it("deletes the selection, but not the character following it", function() {
            editor.setSelectedBufferRanges([[[1, 24], [1, 27]], [[2, 0], [2, 4]]]);
            editor["delete"]();
            expect(buffer.lineForRow(1)).toBe('  var sort = function(it) {');
            expect(buffer.lineForRow(2)).toBe('if (items.length <= 1) return items;');
            return expect(editor.getSelection().isEmpty()).toBeTruthy();
          });
        });
        return describe("when there are multiple selections", function() {
          return describe("when selections are on the same line", function() {
            return it("removes all selected text", function() {
              editor.setSelectedBufferRanges([[[0, 4], [0, 13]], [[0, 16], [0, 24]]]);
              editor["delete"]();
              return expect(editor.lineForBufferRow(0)).toBe('var  =  () {');
            });
          });
        });
      });
      describe(".deleteToEndOfWord()", function() {
        describe("when no text is selected", function() {
          return it("deletes to the end of the word", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorBufferPosition([1, 24]);
            editor.addCursorAtBufferPosition([2, 5]);
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            editor.deleteToEndOfWord();
            expect(buffer.lineForRow(1)).toBe('  var sort = function(it) {');
            expect(buffer.lineForRow(2)).toBe('    i (items.length <= 1) return items;');
            expect(cursor1.getBufferPosition()).toEqual([1, 24]);
            expect(cursor2.getBufferPosition()).toEqual([2, 5]);
            editor.deleteToEndOfWord();
            expect(buffer.lineForRow(1)).toBe('  var sort = function(it {');
            expect(buffer.lineForRow(2)).toBe('    iitems.length <= 1) return items;');
            expect(cursor1.getBufferPosition()).toEqual([1, 24]);
            return expect(cursor2.getBufferPosition()).toEqual([2, 5]);
          });
        });
        return describe("when text is selected", function() {
          return it("deletes only selected text", function() {
            editor.setSelectedBufferRange([[1, 24], [1, 27]]);
            editor.deleteToEndOfWord();
            return expect(buffer.lineForRow(1)).toBe('  var sort = function(it) {');
          });
        });
      });
      describe(".indent()", function() {
        describe("when the selection is empty", function() {
          describe("when autoIndent is disabled", function() {
            describe("if 'softTabs' is true (the default)", function() {
              it("inserts 'tabLength' spaces into the buffer", function() {
                var tabRegex;
                tabRegex = new RegExp("^[ ]{" + (editor.getTabLength()) + "}");
                expect(buffer.lineForRow(0)).not.toMatch(tabRegex);
                editor.indent();
                return expect(buffer.lineForRow(0)).toMatch(tabRegex);
              });
              return it("respects the tab stops when cursor is in the middle of a tab", function() {
                editor.setTabLength(4);
                buffer.insert([12, 2], "\n ");
                editor.setCursorBufferPosition([13, 1]);
                editor.indent();
                expect(buffer.lineForRow(13)).toMatch(/^\s+$/);
                expect(buffer.lineForRow(13).length).toBe(4);
                expect(editor.getCursorBufferPosition()).toEqual([13, 4]);
                buffer.insert([13, 0], "  ");
                editor.setCursorBufferPosition([13, 6]);
                editor.indent();
                return expect(buffer.lineForRow(13).length).toBe(8);
              });
            });
            return describe("if 'softTabs' is false", function() {
              return it("insert a \t into the buffer", function() {
                editor.setSoftTabs(false);
                expect(buffer.lineForRow(0)).not.toMatch(/^\t/);
                editor.indent();
                return expect(buffer.lineForRow(0)).toMatch(/^\t/);
              });
            });
          });
          return describe("when autoIndent is enabled", function() {
            describe("when the cursor's column is less than the suggested level of indentation", function() {
              describe("when 'softTabs' is true (the default)", function() {
                it("moves the cursor to the end of the leading whitespace and inserts enough whitespace to bring the line to the suggested level of indentaion", function() {
                  buffer.insert([5, 0], "  \n");
                  editor.setCursorBufferPosition([5, 0]);
                  editor.indent({
                    autoIndent: true
                  });
                  expect(buffer.lineForRow(5)).toMatch(/^\s+$/);
                  expect(buffer.lineForRow(5).length).toBe(6);
                  return expect(editor.getCursorBufferPosition()).toEqual([5, 6]);
                });
                return it("respects the tab stops when cursor is in the middle of a tab", function() {
                  editor.setTabLength(4);
                  buffer.insert([12, 2], "\n ");
                  editor.setCursorBufferPosition([13, 1]);
                  editor.indent({
                    autoIndent: true
                  });
                  expect(buffer.lineForRow(13)).toMatch(/^\s+$/);
                  expect(buffer.lineForRow(13).length).toBe(4);
                  expect(editor.getCursorBufferPosition()).toEqual([13, 4]);
                  buffer.insert([13, 0], "  ");
                  editor.setCursorBufferPosition([13, 6]);
                  editor.indent({
                    autoIndent: true
                  });
                  return expect(buffer.lineForRow(13).length).toBe(8);
                });
              });
              return describe("when 'softTabs' is false", function() {
                return it("moves the cursor to the end of the leading whitespace and inserts enough tabs to bring the line to the suggested level of indentaion", function() {
                  convertToHardTabs(buffer);
                  editor.setSoftTabs(false);
                  buffer.insert([5, 0], "\t\n");
                  editor.setCursorBufferPosition([5, 0]);
                  editor.indent({
                    autoIndent: true
                  });
                  expect(buffer.lineForRow(5)).toMatch(/^\t\t\t$/);
                  return expect(editor.getCursorBufferPosition()).toEqual([5, 3]);
                });
              });
            });
            return describe("when the line's indent level is greater than the suggested level of indentation", function() {
              describe("when 'softTabs' is true (the default)", function() {
                return it("moves the cursor to the end of the leading whitespace and inserts 'tabLength' spaces into the buffer", function() {
                  buffer.insert([7, 0], "      \n");
                  editor.setCursorBufferPosition([7, 2]);
                  editor.indent({
                    autoIndent: true
                  });
                  expect(buffer.lineForRow(7)).toMatch(/^\s+$/);
                  expect(buffer.lineForRow(7).length).toBe(8);
                  return expect(editor.getCursorBufferPosition()).toEqual([7, 8]);
                });
              });
              return describe("when 'softTabs' is false", function() {
                return it("moves the cursor to the end of the leading whitespace and inserts \t into the buffer", function() {
                  convertToHardTabs(buffer);
                  editor.setSoftTabs(false);
                  buffer.insert([7, 0], "\t\t\t\n");
                  editor.setCursorBufferPosition([7, 1]);
                  editor.indent({
                    autoIndent: true
                  });
                  expect(buffer.lineForRow(7)).toMatch(/^\t\t\t\t$/);
                  return expect(editor.getCursorBufferPosition()).toEqual([7, 4]);
                });
              });
            });
          });
        });
        describe("when the selection is not empty", function() {
          return it("indents the selected lines", function() {
            var selection;
            editor.setSelectedBufferRange([[0, 0], [10, 0]]);
            selection = editor.getSelection();
            spyOn(selection, "indentSelectedRows");
            editor.indent();
            return expect(selection.indentSelectedRows).toHaveBeenCalled();
          });
        });
        return describe("if editor.softTabs is false", function() {
          return it("inserts a tab character into the buffer", function() {
            editor.setSoftTabs(false);
            expect(buffer.lineForRow(0)).not.toMatch(/^\t/);
            editor.indent();
            expect(buffer.lineForRow(0)).toMatch(/^\t/);
            expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
            expect(editor.getCursorScreenPosition()).toEqual([0, editor.getTabLength()]);
            editor.indent();
            expect(buffer.lineForRow(0)).toMatch(/^\t\t/);
            expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
            return expect(editor.getCursorScreenPosition()).toEqual([0, editor.getTabLength() * 2]);
          });
        });
      });
      describe("clipboard operations", function() {
        beforeEach(function() {
          return editor.setSelectedBufferRanges([[[0, 4], [0, 13]], [[1, 6], [1, 10]]]);
        });
        describe(".cutSelectedText()", function() {
          return it("removes the selected text from the buffer and places it on the clipboard", function() {
            editor.cutSelectedText();
            expect(buffer.lineForRow(0)).toBe("var  = function () {");
            expect(buffer.lineForRow(1)).toBe("  var  = function(items) {");
            return expect(clipboard.readText()).toBe('quicksort\nsort');
          });
        });
        describe(".cutToEndOfLine()", function() {
          describe("when soft wrap is on", function() {
            return it("cuts up to the end of the line", function() {
              editor.setSoftWrap(true);
              editor.setEditorWidthInChars(10);
              editor.setCursorScreenPosition([2, 2]);
              editor.cutToEndOfLine();
              return expect(editor.lineForScreenRow(2).text).toBe('=  () {');
            });
          });
          return describe("when soft wrap is off", function() {
            describe("when nothing is selected", function() {
              return it("cuts up to the end of the line", function() {
                editor.setCursorBufferPosition([2, 20]);
                editor.addCursorAtBufferPosition([3, 20]);
                editor.cutToEndOfLine();
                expect(buffer.lineForRow(2)).toBe('    if (items.length');
                expect(buffer.lineForRow(3)).toBe('    var pivot = item');
                return expect(atom.clipboard.read()).toBe(' <= 1) return items;\ns.shift(), current, left = [], right = [];');
              });
            });
            return describe("when text is selected", function() {
              return it("only cuts the selected text, not to the end of the line", function() {
                editor.setSelectedBufferRanges([[[2, 20], [2, 30]], [[3, 20], [3, 20]]]);
                editor.cutToEndOfLine();
                expect(buffer.lineForRow(2)).toBe('    if (items.lengthurn items;');
                expect(buffer.lineForRow(3)).toBe('    var pivot = item');
                return expect(atom.clipboard.read()).toBe(' <= 1) ret\ns.shift(), current, left = [], right = [];');
              });
            });
          });
        });
        describe(".copySelectedText()", function() {
          return it("copies selected text onto the clipboard", function() {
            editor.setSelectedBufferRanges([[[0, 4], [0, 13]], [[1, 6], [1, 10]], [[2, 8], [2, 13]]]);
            editor.copySelectedText();
            expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
            expect(buffer.lineForRow(1)).toBe("  var sort = function(items) {");
            expect(buffer.lineForRow(2)).toBe("    if (items.length <= 1) return items;");
            expect(clipboard.readText()).toBe('quicksort\nsort\nitems');
            return expect(atom.clipboard.readWithMetadata().metadata.selections).toEqual(['quicksort', 'sort', 'items']);
          });
        });
        return describe(".pasteText()", function() {
          it("pastes text into the buffer", function() {
            atom.clipboard.write('first');
            editor.pasteText();
            expect(editor.lineForBufferRow(0)).toBe("var first = function () {");
            return expect(editor.lineForBufferRow(1)).toBe("  var first = function(items) {");
          });
          return describe('when the clipboard has many selections', function() {
            it("pastes each selection separately into the buffer", function() {
              atom.clipboard.write('first\nsecond', {
                selections: ['first', 'second']
              });
              editor.pasteText();
              expect(editor.lineForBufferRow(0)).toBe("var first = function () {");
              return expect(editor.lineForBufferRow(1)).toBe("  var second = function(items) {");
            });
            return describe('and the selections count does not match', function() {
              return it("pastes the whole text into the buffer", function() {
                atom.clipboard.write('first\nsecond\nthird', {
                  selections: ['first', 'second', 'third']
                });
                editor.pasteText();
                expect(editor.lineForBufferRow(0)).toBe("var first");
                expect(editor.lineForBufferRow(1)).toBe("second");
                expect(editor.lineForBufferRow(2)).toBe("third = function () {");
                expect(editor.lineForBufferRow(3)).toBe("  var first");
                expect(editor.lineForBufferRow(4)).toBe("second");
                return expect(editor.lineForBufferRow(5)).toBe("third = function(items) {");
              });
            });
          });
        });
      });
      describe(".indentSelectedRows()", function() {
        describe("when nothing is selected", function() {
          describe("when softTabs is enabled", function() {
            return it("indents line and retains selection", function() {
              editor.setSelectedBufferRange([[0, 3], [0, 3]]);
              editor.indentSelectedRows();
              expect(buffer.lineForRow(0)).toBe("  var quicksort = function () {");
              return expect(editor.getSelectedBufferRange()).toEqual([[0, 3 + editor.getTabLength()], [0, 3 + editor.getTabLength()]]);
            });
          });
          return describe("when softTabs is disabled", function() {
            return it("indents line and retains selection", function() {
              convertToHardTabs(buffer);
              editor.setSoftTabs(false);
              editor.setSelectedBufferRange([[0, 3], [0, 3]]);
              editor.indentSelectedRows();
              expect(buffer.lineForRow(0)).toBe("\tvar quicksort = function () {");
              return expect(editor.getSelectedBufferRange()).toEqual([[0, 3 + 1], [0, 3 + 1]]);
            });
          });
        });
        describe("when one line is selected", function() {
          describe("when softTabs is enabled", function() {
            return it("indents line and retains selection", function() {
              editor.setSelectedBufferRange([[0, 4], [0, 14]]);
              editor.indentSelectedRows();
              expect(buffer.lineForRow(0)).toBe("" + (editor.getTabText()) + "var quicksort = function () {");
              return expect(editor.getSelectedBufferRange()).toEqual([[0, 4 + editor.getTabLength()], [0, 14 + editor.getTabLength()]]);
            });
          });
          return describe("when softTabs is disabled", function() {
            return it("indents line and retains selection", function() {
              convertToHardTabs(buffer);
              editor.setSoftTabs(false);
              editor.setSelectedBufferRange([[0, 4], [0, 14]]);
              editor.indentSelectedRows();
              expect(buffer.lineForRow(0)).toBe("\tvar quicksort = function () {");
              return expect(editor.getSelectedBufferRange()).toEqual([[0, 4 + 1], [0, 14 + 1]]);
            });
          });
        });
        return describe("when multiple lines are selected", function() {
          describe("when softTabs is enabled", function() {
            it("indents selected lines (that are not empty) and retains selection", function() {
              editor.setSelectedBufferRange([[9, 1], [11, 15]]);
              editor.indentSelectedRows();
              expect(buffer.lineForRow(9)).toBe("    };");
              expect(buffer.lineForRow(10)).toBe("");
              expect(buffer.lineForRow(11)).toBe("    return sort(Array.apply(this, arguments));");
              return expect(editor.getSelectedBufferRange()).toEqual([[9, 1 + editor.getTabLength()], [11, 15 + editor.getTabLength()]]);
            });
            return it("does not indent the last row if the selection ends at column 0", function() {
              editor.setSelectedBufferRange([[9, 1], [11, 0]]);
              editor.indentSelectedRows();
              expect(buffer.lineForRow(9)).toBe("    };");
              expect(buffer.lineForRow(10)).toBe("");
              expect(buffer.lineForRow(11)).toBe("  return sort(Array.apply(this, arguments));");
              return expect(editor.getSelectedBufferRange()).toEqual([[9, 1 + editor.getTabLength()], [11, 0]]);
            });
          });
          return describe("when softTabs is disabled", function() {
            return it("indents selected lines (that are not empty) and retains selection", function() {
              convertToHardTabs(buffer);
              editor.setSoftTabs(false);
              editor.setSelectedBufferRange([[9, 1], [11, 15]]);
              editor.indentSelectedRows();
              expect(buffer.lineForRow(9)).toBe("\t\t};");
              expect(buffer.lineForRow(10)).toBe("");
              expect(buffer.lineForRow(11)).toBe("\t\treturn sort(Array.apply(this, arguments));");
              return expect(editor.getSelectedBufferRange()).toEqual([[9, 1 + 1], [11, 15 + 1]]);
            });
          });
        });
      });
      describe(".outdentSelectedRows()", function() {
        describe("when nothing is selected", function() {
          it("outdents line and retains selection", function() {
            editor.setSelectedBufferRange([[1, 3], [1, 3]]);
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(1)).toBe("var sort = function(items) {");
            return expect(editor.getSelectedBufferRange()).toEqual([[1, 3 - editor.getTabLength()], [1, 3 - editor.getTabLength()]]);
          });
          it("outdents when indent is less than a tab length", function() {
            editor.insertText(' ');
            editor.outdentSelectedRows();
            return expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
          });
          it("outdents a single hard tab when indent is multiple hard tabs and and the session is using soft tabs", function() {
            editor.insertText('\t\t');
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(0)).toBe("\tvar quicksort = function () {");
            editor.outdentSelectedRows();
            return expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
          });
          it("outdents when a mix of hard tabs and soft tabs are used", function() {
            editor.insertText('\t   ');
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(0)).toBe("   var quicksort = function () {");
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(0)).toBe(" var quicksort = function () {");
            editor.outdentSelectedRows();
            return expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
          });
          return it("outdents only up to the first non-space non-tab character", function() {
            editor.insertText(' \tfoo\t ');
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(0)).toBe("\tfoo\t var quicksort = function () {");
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(0)).toBe("foo\t var quicksort = function () {");
            editor.outdentSelectedRows();
            return expect(buffer.lineForRow(0)).toBe("foo\t var quicksort = function () {");
          });
        });
        describe("when one line is selected", function() {
          return it("outdents line and retains editor", function() {
            editor.setSelectedBufferRange([[1, 4], [1, 14]]);
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(1)).toBe("var sort = function(items) {");
            return expect(editor.getSelectedBufferRange()).toEqual([[1, 4 - editor.getTabLength()], [1, 14 - editor.getTabLength()]]);
          });
        });
        return describe("when multiple lines are selected", function() {
          it("outdents selected lines and retains editor", function() {
            editor.setSelectedBufferRange([[0, 1], [3, 15]]);
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
            expect(buffer.lineForRow(1)).toBe("var sort = function(items) {");
            expect(buffer.lineForRow(2)).toBe("  if (items.length <= 1) return items;");
            expect(buffer.lineForRow(3)).toBe("  var pivot = items.shift(), current, left = [], right = [];");
            return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [3, 15 - editor.getTabLength()]]);
          });
          return it("does not outdent the last line of the selection if it ends at column 0", function() {
            editor.setSelectedBufferRange([[0, 1], [3, 0]]);
            editor.outdentSelectedRows();
            expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
            expect(buffer.lineForRow(1)).toBe("var sort = function(items) {");
            expect(buffer.lineForRow(2)).toBe("  if (items.length <= 1) return items;");
            expect(buffer.lineForRow(3)).toBe("    var pivot = items.shift(), current, left = [], right = [];");
            return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [3, 0]]);
          });
        });
      });
      describe(".toggleLineCommentsInSelection()", function() {
        it("toggles comments on the selected lines", function() {
          editor.setSelectedBufferRange([[4, 5], [7, 5]]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(4)).toBe("    // while(items.length > 0) {");
          expect(buffer.lineForRow(5)).toBe("    //   current = items.shift();");
          expect(buffer.lineForRow(6)).toBe("    //   current < pivot ? left.push(current) : right.push(current);");
          expect(buffer.lineForRow(7)).toBe("    // }");
          expect(editor.getSelectedBufferRange()).toEqual([[4, 8], [7, 8]]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(4)).toBe("    while(items.length > 0) {");
          expect(buffer.lineForRow(5)).toBe("      current = items.shift();");
          expect(buffer.lineForRow(6)).toBe("      current < pivot ? left.push(current) : right.push(current);");
          return expect(buffer.lineForRow(7)).toBe("    }");
        });
        it("does not comment the last line of a non-empty selection if it ends at column 0", function() {
          editor.setSelectedBufferRange([[4, 5], [7, 0]]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(4)).toBe("    // while(items.length > 0) {");
          expect(buffer.lineForRow(5)).toBe("    //   current = items.shift();");
          expect(buffer.lineForRow(6)).toBe("    //   current < pivot ? left.push(current) : right.push(current);");
          return expect(buffer.lineForRow(7)).toBe("    }");
        });
        it("uncomments lines if all lines match the comment regex", function() {
          editor.setSelectedBufferRange([[0, 0], [0, 1]]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(0)).toBe("// var quicksort = function () {");
          editor.setSelectedBufferRange([[0, 0], [2, Infinity]]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(0)).toBe("// // var quicksort = function () {");
          expect(buffer.lineForRow(1)).toBe("//   var sort = function(items) {");
          expect(buffer.lineForRow(2)).toBe("//     if (items.length <= 1) return items;");
          editor.setSelectedBufferRange([[0, 0], [2, Infinity]]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(0)).toBe("// var quicksort = function () {");
          expect(buffer.lineForRow(1)).toBe("  var sort = function(items) {");
          expect(buffer.lineForRow(2)).toBe("    if (items.length <= 1) return items;");
          editor.setSelectedBufferRange([[0, 0], [0, Infinity]]);
          editor.toggleLineCommentsInSelection();
          return expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
        });
        it("uncomments commented lines separated by an empty line", function() {
          editor.setSelectedBufferRange([[0, 0], [1, Infinity]]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(0)).toBe("// var quicksort = function () {");
          expect(buffer.lineForRow(1)).toBe("//   var sort = function(items) {");
          buffer.insert([0, Infinity], '\n');
          editor.setSelectedBufferRange([[0, 0], [2, Infinity]]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(0)).toBe("var quicksort = function () {");
          expect(buffer.lineForRow(1)).toBe("");
          return expect(buffer.lineForRow(2)).toBe("  var sort = function(items) {");
        });
        it("preserves selection emptiness", function() {
          editor.setCursorBufferPosition([4, 0]);
          editor.toggleLineCommentsInSelection();
          return expect(editor.getSelection().isEmpty()).toBeTruthy();
        });
        it("does not explode if the current language mode has no comment regex", function() {
          editor.destroy();
          waitsForPromise(function() {
            return atom.workspace.open(null, {
              autoIndent: false
            }).then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            editor.setSelectedBufferRange([[4, 5], [4, 5]]);
            editor.toggleLineCommentsInSelection();
            return expect(buffer.lineForRow(4)).toBe("    while(items.length > 0) {");
          });
        });
        it("uncomments when the line lacks the trailing whitespace in the comment regex", function() {
          editor.setCursorBufferPosition([10, 0]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(10)).toBe("// ");
          expect(editor.getSelectedBufferRange()).toEqual([[10, 3], [10, 3]]);
          editor.backspace();
          expect(buffer.lineForRow(10)).toBe("//");
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(10)).toBe("");
          return expect(editor.getSelectedBufferRange()).toEqual([[10, 0], [10, 0]]);
        });
        return it("uncomments when the line has leading whitespace", function() {
          editor.setCursorBufferPosition([10, 0]);
          editor.toggleLineCommentsInSelection();
          expect(buffer.lineForRow(10)).toBe("// ");
          editor.moveCursorToBeginningOfLine();
          editor.insertText("  ");
          editor.setSelectedBufferRange([[10, 0], [10, 0]]);
          editor.toggleLineCommentsInSelection();
          return expect(buffer.lineForRow(10)).toBe("  ");
        });
      });
      describe(".undo() and .redo()", function() {
        it("undoes/redoes the last change", function() {
          editor.insertText("foo");
          editor.undo();
          expect(buffer.lineForRow(0)).not.toContain("foo");
          editor.redo();
          return expect(buffer.lineForRow(0)).toContain("foo");
        });
        it("batches the undo / redo of changes caused by multiple cursors", function() {
          editor.setCursorScreenPosition([0, 0]);
          editor.addCursorAtScreenPosition([1, 0]);
          editor.insertText("foo");
          editor.backspace();
          expect(buffer.lineForRow(0)).toContain("fovar");
          expect(buffer.lineForRow(1)).toContain("fo ");
          editor.undo();
          expect(buffer.lineForRow(0)).toContain("foo");
          expect(buffer.lineForRow(1)).toContain("foo");
          editor.redo();
          expect(buffer.lineForRow(0)).not.toContain("foo");
          return expect(buffer.lineForRow(0)).toContain("fovar");
        });
        it("restores the selected ranges after undo and redo", function() {
          var selections;
          editor.setSelectedBufferRanges([[[1, 6], [1, 10]], [[1, 22], [1, 27]]]);
          editor["delete"]();
          editor["delete"]();
          selections = editor.getSelections();
          expect(buffer.lineForRow(1)).toBe('  var = function( {');
          expect(editor.getSelectedBufferRanges()).toEqual([[[1, 6], [1, 6]], [[1, 17], [1, 17]]]);
          editor.undo();
          expect(editor.getSelectedBufferRanges()).toEqual([[[1, 6], [1, 6]], [[1, 18], [1, 18]]]);
          editor.undo();
          expect(editor.getSelectedBufferRanges()).toEqual([[[1, 6], [1, 10]], [[1, 22], [1, 27]]]);
          editor.redo();
          return expect(editor.getSelectedBufferRanges()).toEqual([[[1, 6], [1, 6]], [[1, 18], [1, 18]]]);
        });
        return xit("restores folds after undo and redo", function() {
          editor.foldBufferRow(1);
          editor.setSelectedBufferRange([[1, 0], [10, Infinity]], {
            preserveFolds: true
          });
          expect(editor.isFoldedAtBufferRow(1)).toBeTruthy();
          editor.insertText("\  // testing\n  function foo() {\n    return 1 + 2;\n  }");
          expect(editor.isFoldedAtBufferRow(1)).toBeFalsy();
          editor.foldBufferRow(2);
          editor.undo();
          expect(editor.isFoldedAtBufferRow(1)).toBeTruthy();
          expect(editor.isFoldedAtBufferRow(9)).toBeTruthy();
          expect(editor.isFoldedAtBufferRow(10)).toBeFalsy();
          editor.redo();
          expect(editor.isFoldedAtBufferRow(1)).toBeFalsy();
          return expect(editor.isFoldedAtBufferRow(2)).toBeTruthy();
        });
      });
      describe("begin/commitTransaction()", function() {
        return it("restores the selection when the transaction is undone/redone", function() {
          buffer.setText('1234');
          editor.setSelectedBufferRange([[0, 1], [0, 3]]);
          editor.beginTransaction();
          editor["delete"]();
          editor.moveCursorToEndOfLine();
          editor.insertText('5');
          expect(buffer.getText()).toBe('145');
          editor.commitTransaction();
          editor.undo();
          expect(buffer.getText()).toBe('1234');
          expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [0, 3]]);
          editor.redo();
          expect(buffer.getText()).toBe('145');
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 3], [0, 3]]);
        });
      });
      return describe("when the buffer is changed (via its direct api, rather than via than edit session)", function() {
        it("moves the cursor so it is in the same relative position of the buffer", function() {
          var cursor1, cursor2, cursor3, _ref1;
          expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
          editor.addCursorAtScreenPosition([0, 5]);
          editor.addCursorAtScreenPosition([1, 0]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2];
          buffer.insert([0, 1], 'abc');
          expect(cursor1.getScreenPosition()).toEqual([0, 0]);
          expect(cursor2.getScreenPosition()).toEqual([0, 8]);
          return expect(cursor3.getScreenPosition()).toEqual([1, 0]);
        });
        it("does not destroy cursors or selections when a change encompasses them", function() {
          var cursor, selection;
          cursor = editor.getCursor();
          cursor.setBufferPosition([3, 3]);
          editor.buffer["delete"]([[3, 1], [3, 5]]);
          expect(cursor.getBufferPosition()).toEqual([3, 1]);
          expect(editor.getCursors().indexOf(cursor)).not.toBe(-1);
          selection = editor.getLastSelection();
          selection.setBufferRange([[3, 5], [3, 10]]);
          editor.buffer["delete"]([[3, 3], [3, 8]]);
          expect(selection.getBufferRange()).toEqual([[3, 3], [3, 5]]);
          return expect(editor.getSelections().indexOf(selection)).not.toBe(-1);
        });
        return it("merges cursors when the change causes them to overlap", function() {
          var cursor1, cursor2, cursor3, _ref1;
          editor.setCursorScreenPosition([0, 0]);
          editor.addCursorAtScreenPosition([0, 2]);
          editor.addCursorAtScreenPosition([1, 2]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2];
          expect(editor.getCursors().length).toBe(3);
          buffer["delete"]([[0, 0], [0, 2]]);
          expect(editor.getCursors().length).toBe(2);
          expect(editor.getCursors()).toEqual([cursor1, cursor3]);
          expect(cursor1.getBufferPosition()).toEqual([0, 0]);
          return expect(cursor3.getBufferPosition()).toEqual([1, 2]);
        });
      });
    });
    describe(".deleteLine()", function() {
      it("deletes the first line when the cursor is there", function() {
        var count, line1;
        editor.getCursor().moveToTop();
        line1 = buffer.lineForRow(1);
        count = buffer.getLineCount();
        expect(buffer.lineForRow(0)).not.toBe(line1);
        editor.deleteLine();
        expect(buffer.lineForRow(0)).toBe(line1);
        return expect(buffer.getLineCount()).toBe(count - 1);
      });
      it("deletes the last line when the cursor is there", function() {
        var count, newCount, secondToLastLine;
        count = buffer.getLineCount();
        secondToLastLine = buffer.lineForRow(count - 2);
        expect(buffer.lineForRow(count - 1)).not.toBe(secondToLastLine);
        editor.getCursor().moveToBottom();
        editor.deleteLine();
        newCount = buffer.getLineCount();
        expect(buffer.lineForRow(newCount - 1)).toBe(secondToLastLine);
        return expect(newCount).toBe(count - 1);
      });
      it("deletes whole lines when partial lines are selected", function() {
        var count, line2;
        editor.setSelectedBufferRange([[0, 2], [1, 2]]);
        line2 = buffer.lineForRow(2);
        count = buffer.getLineCount();
        expect(buffer.lineForRow(0)).not.toBe(line2);
        expect(buffer.lineForRow(1)).not.toBe(line2);
        editor.deleteLine();
        expect(buffer.lineForRow(0)).toBe(line2);
        return expect(buffer.getLineCount()).toBe(count - 2);
      });
      it("only deletes first line if only newline is selected on second line", function() {
        var count, line1;
        editor.setSelectedBufferRange([[0, 2], [1, 0]]);
        line1 = buffer.lineForRow(1);
        count = buffer.getLineCount();
        expect(buffer.lineForRow(0)).not.toBe(line1);
        editor.deleteLine();
        expect(buffer.lineForRow(0)).toBe(line1);
        return expect(buffer.getLineCount()).toBe(count - 1);
      });
      it("deletes the entire region when invoke on a folded region", function() {
        editor.foldBufferRow(1);
        editor.getCursor().moveToTop();
        editor.getCursor().moveDown();
        expect(buffer.getLineCount()).toBe(13);
        editor.deleteLine();
        return expect(buffer.getLineCount()).toBe(4);
      });
      it("deletes the entire file from the bottom up", function() {
        var count, line, _i;
        count = buffer.getLineCount();
        expect(count).toBeGreaterThan(0);
        for (line = _i = 0; 0 <= count ? _i < count : _i > count; line = 0 <= count ? ++_i : --_i) {
          editor.getCursor().moveToBottom();
          editor.deleteLine();
        }
        expect(buffer.getLineCount()).toBe(1);
        return expect(buffer.getText()).toBe('');
      });
      it("deletes the entire file from the top down", function() {
        var count, line, _i;
        count = buffer.getLineCount();
        expect(count).toBeGreaterThan(0);
        for (line = _i = 0; 0 <= count ? _i < count : _i > count; line = 0 <= count ? ++_i : --_i) {
          editor.getCursor().moveToTop();
          editor.deleteLine();
        }
        expect(buffer.getLineCount()).toBe(1);
        return expect(buffer.getText()).toBe('');
      });
      describe("when soft wrap is enabled", function() {
        return it("deletes the entire line that the cursor is on", function() {
          var count, line7;
          editor.setSoftWrap(true);
          editor.setEditorWidthInChars(10);
          editor.setCursorBufferPosition([6]);
          line7 = buffer.lineForRow(7);
          count = buffer.getLineCount();
          expect(buffer.lineForRow(6)).not.toBe(line7);
          editor.deleteLine();
          expect(buffer.lineForRow(6)).toBe(line7);
          return expect(buffer.getLineCount()).toBe(count - 1);
        });
      });
      return describe("when the line being deleted preceeds a fold, and the command is undone", function() {
        return it("restores the line and preserves the fold", function() {
          editor.setCursorBufferPosition([4]);
          editor.foldCurrentRow();
          expect(editor.isFoldedAtScreenRow(4)).toBeTruthy();
          editor.setCursorBufferPosition([3]);
          editor.deleteLine();
          expect(editor.isFoldedAtScreenRow(3)).toBeTruthy();
          expect(buffer.lineForRow(3)).toBe('    while(items.length > 0) {');
          editor.undo();
          expect(editor.isFoldedAtScreenRow(4)).toBeTruthy();
          return expect(buffer.lineForRow(3)).toBe('    var pivot = items.shift(), current, left = [], right = [];');
        });
      });
    });
    describe(".replaceSelectedText(options, fn)", function() {
      describe("when no text is selected", function() {
        return it("inserts the text returned from the function at the cursor position", function() {
          editor.replaceSelectedText({}, function() {
            return '123';
          });
          expect(buffer.lineForRow(0)).toBe('123var quicksort = function () {');
          editor.replaceSelectedText({
            selectWordIfEmpty: true
          }, function() {
            return 'var';
          });
          editor.setCursorBufferPosition([0]);
          expect(buffer.lineForRow(0)).toBe('var quicksort = function () {');
          editor.setCursorBufferPosition([10]);
          editor.replaceSelectedText(null, function() {
            return '';
          });
          return expect(buffer.lineForRow(10)).toBe('');
        });
      });
      return describe("when text is selected", function() {
        return it("replaces the selected text with the text returned from the function", function() {
          editor.setSelectedBufferRange([[0, 1], [0, 3]]);
          editor.replaceSelectedText({}, function() {
            return 'ia';
          });
          return expect(buffer.lineForRow(0)).toBe('via quicksort = function () {');
        });
      });
    });
    describe(".transpose()", function() {
      it("swaps two characters", function() {
        editor.buffer.setText("abc");
        editor.setCursorScreenPosition([0, 1]);
        editor.transpose();
        return expect(editor.lineForBufferRow(0)).toBe('bac');
      });
      return it("reverses a selection", function() {
        editor.buffer.setText("xabcz");
        editor.setSelectedBufferRange([[0, 1], [0, 4]]);
        editor.transpose();
        return expect(editor.lineForBufferRow(0)).toBe('xcbaz');
      });
    });
    describe(".upperCase()", function() {
      describe("when there is no selection", function() {
        return it("upper cases the current word", function() {
          editor.buffer.setText("aBc");
          editor.setCursorScreenPosition([0, 1]);
          editor.upperCase();
          expect(editor.lineForBufferRow(0)).toBe('ABC');
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [0, 1]]);
        });
      });
      return describe("when there is a selection", function() {
        return it("upper cases the current selection", function() {
          editor.buffer.setText("abc");
          editor.setSelectedBufferRange([[0, 0], [0, 2]]);
          editor.upperCase();
          expect(editor.lineForBufferRow(0)).toBe('ABc');
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 0], [0, 2]]);
        });
      });
    });
    describe(".lowerCase()", function() {
      describe("when there is no selection", function() {
        return it("lower cases the current word", function() {
          editor.buffer.setText("aBC");
          editor.setCursorScreenPosition([0, 1]);
          editor.lowerCase();
          expect(editor.lineForBufferRow(0)).toBe('abc');
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [0, 1]]);
        });
      });
      return describe("when there is a selection", function() {
        return it("lower cases the current selection", function() {
          editor.buffer.setText("ABC");
          editor.setSelectedBufferRange([[0, 0], [0, 2]]);
          editor.lowerCase();
          expect(editor.lineForBufferRow(0)).toBe('abC');
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 0], [0, 2]]);
        });
      });
    });
    describe("soft-tabs detection", function() {
      return it("assigns soft / hard tabs based on the contents of the buffer, or uses the default if unknown", function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.js', {
            softTabs: false
          }).then(function(editor) {
            return expect(editor.getSoftTabs()).toBeTruthy();
          });
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample-with-tabs.coffee', {
            softTabs: true
          }).then(function(editor) {
            return expect(editor.getSoftTabs()).toBeFalsy();
          });
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample-with-tabs-and-initial-comment.js', {
            softTabs: true
          }).then(function(editor) {
            return expect(editor.getSoftTabs()).toBeFalsy();
          });
        });
        return waitsForPromise(function() {
          return atom.workspace.open(null, {
            softTabs: false
          }).then(function(editor) {
            return expect(editor.getSoftTabs()).toBeFalsy();
          });
        });
      });
    });
    describe(".indentLevelForLine(line)", function() {
      it("returns the indent level when the line has only leading whitespace", function() {
        expect(editor.indentLevelForLine("    hello")).toBe(2);
        return expect(editor.indentLevelForLine("   hello")).toBe(1.5);
      });
      it("returns the indent level when the line has only leading tabs", function() {
        return expect(editor.indentLevelForLine("\t\thello")).toBe(2);
      });
      return it("returns the indent level when the line has mixed leading whitespace and tabs", function() {
        expect(editor.indentLevelForLine("\t  hello")).toBe(2);
        expect(editor.indentLevelForLine("  \thello")).toBe(2);
        expect(editor.indentLevelForLine("  \t hello")).toBe(2.5);
        return expect(editor.indentLevelForLine("  \t \thello")).toBe(3.5);
      });
    });
    describe("when the buffer is reloaded", function() {
      return it("preserves the current cursor position", function() {
        editor.setCursorScreenPosition([0, 1]);
        editor.buffer.reload();
        return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
      });
    });
    describe("when a better-matched grammar is added to syntax", function() {
      return it("switches to the better-matched grammar and re-tokenizes the buffer", function() {
        var jsGrammar;
        editor.destroy();
        jsGrammar = atom.syntax.selectGrammar('a.js');
        atom.syntax.removeGrammar(jsGrammar);
        waitsForPromise(function() {
          return atom.workspace.open('sample.js', {
            autoIndent: false
          }).then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          expect(editor.getGrammar()).toBe(atom.syntax.nullGrammar);
          expect(editor.lineForScreenRow(0).tokens.length).toBe(1);
          atom.syntax.addGrammar(jsGrammar);
          expect(editor.getGrammar()).toBe(jsGrammar);
          return expect(editor.lineForScreenRow(0).tokens.length).toBeGreaterThan(1);
        });
      });
    });
    describe("auto-indent", function() {
      var copyText;
      copyText = function(text, _arg) {
        var endColumn, numberOfNewlines, startColumn, _ref1, _ref2;
        startColumn = (_arg != null ? _arg : {}).startColumn;
        if (startColumn == null) {
          startColumn = 0;
        }
        editor.setCursorBufferPosition([0, 0]);
        editor.insertText(text);
        numberOfNewlines = (_ref1 = text.match(/\n/g)) != null ? _ref1.length : void 0;
        endColumn = (_ref2 = text.match(/[^\n]*$/)[0]) != null ? _ref2.length : void 0;
        editor.getSelection().setBufferRange([[0, startColumn], [numberOfNewlines, endColumn]]);
        return editor.cutSelectedText();
      };
      describe("editor.autoIndent", function() {
        describe("when editor.autoIndent is false (default)", function() {
          return describe("when `indent` is triggered", function() {
            return it("does not auto-indent the line", function() {
              editor.setCursorBufferPosition([1, 30]);
              editor.insertText("\n ");
              expect(editor.lineForBufferRow(2)).toBe(" ");
              atom.config.set("editor.autoIndent", false);
              editor.indent();
              return expect(editor.lineForBufferRow(2)).toBe("  ");
            });
          });
        });
        return describe("when editor.autoIndent is true", function() {
          beforeEach(function() {
            return atom.config.set("editor.autoIndent", true);
          });
          describe("when `indent` is triggered", function() {
            return it("auto-indents the line", function() {
              editor.setCursorBufferPosition([1, 30]);
              editor.insertText("\n ");
              expect(editor.lineForBufferRow(2)).toBe(" ");
              atom.config.set("editor.autoIndent", true);
              editor.indent();
              return expect(editor.lineForBufferRow(2)).toBe("    ");
            });
          });
          describe("when a newline is added", function() {
            describe("when the line preceding the newline adds a new level of indentation", function() {
              return it("indents the newline to one additional level of indentation beyond the preceding line", function() {
                editor.setCursorBufferPosition([1, Infinity]);
                editor.insertText('\n');
                return expect(editor.indentationForBufferRow(2)).toBe(editor.indentationForBufferRow(1) + 1);
              });
            });
            describe("when the line preceding the newline does't add a level of indentation", function() {
              return it("indents the new line to the same level a as the preceding line", function() {
                editor.setCursorBufferPosition([5, 14]);
                editor.insertText('\n');
                return expect(editor.indentationForBufferRow(6)).toBe(editor.indentationForBufferRow(5));
              });
            });
            describe("when the line preceding the newline is a comment", function() {
              return it("maintains the indent of the commented line", function() {
                editor.setCursorBufferPosition([0, 0]);
                editor.insertText('    //');
                editor.setCursorBufferPosition([0, Infinity]);
                editor.insertText('\n');
                return expect(editor.indentationForBufferRow(1)).toBe(2);
              });
            });
            it("does not indent the line preceding the newline", function() {
              editor.setCursorBufferPosition([2, 0]);
              editor.insertText('  var this-line-should-be-indented-more\n');
              expect(editor.indentationForBufferRow(1)).toBe(1);
              atom.config.set("editor.autoIndent", true);
              editor.setCursorBufferPosition([2, Infinity]);
              editor.insertText('\n');
              expect(editor.indentationForBufferRow(1)).toBe(1);
              return expect(editor.indentationForBufferRow(2)).toBe(1);
            });
            return describe("when the cursor is before whitespace", function() {
              return it("retains the whitespace following the cursor on the new line", function() {
                editor.setText("  var sort = function() {}");
                editor.setCursorScreenPosition([0, 23]);
                editor.insertNewline();
                expect(buffer.lineForRow(0)).toBe('  var sort = function()');
                expect(buffer.lineForRow(1)).toBe('   {}');
                return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
              });
            });
          });
          describe("when inserted text matches a decrease indent pattern", function() {
            describe("when the preceding line matches an increase indent pattern", function() {
              return it("decreases the indentation to match that of the preceding line", function() {
                editor.setCursorBufferPosition([1, Infinity]);
                editor.insertText('\n');
                expect(editor.indentationForBufferRow(2)).toBe(editor.indentationForBufferRow(1) + 1);
                editor.insertText('}');
                return expect(editor.indentationForBufferRow(2)).toBe(editor.indentationForBufferRow(1));
              });
            });
            return describe("when the preceding line doesn't match an increase indent pattern", function() {
              it("decreases the indentation to be one level below that of the preceding line", function() {
                editor.setCursorBufferPosition([3, Infinity]);
                editor.insertText('\n    ');
                expect(editor.indentationForBufferRow(4)).toBe(editor.indentationForBufferRow(3));
                editor.insertText('}');
                return expect(editor.indentationForBufferRow(4)).toBe(editor.indentationForBufferRow(3) - 1);
              });
              return it("doesn't break when decreasing the indentation on a row that has no indentation", function() {
                editor.setCursorBufferPosition([12, Infinity]);
                editor.insertText("\n}; # too many closing brackets!");
                return expect(editor.lineForBufferRow(13)).toBe("}; # too many closing brackets!");
              });
            });
          });
          describe("when inserted text does not match a decrease indent pattern", function() {
            return it("does not decrease the indentation", function() {
              editor.setCursorBufferPosition([12, 0]);
              editor.insertText('  ');
              expect(editor.lineForBufferRow(12)).toBe('  };');
              editor.insertText('\t\t');
              return expect(editor.lineForBufferRow(12)).toBe('  \t\t};');
            });
          });
          return describe("when the current line does not match a decrease indent pattern", function() {
            return it("leaves the line unchanged", function() {
              editor.setCursorBufferPosition([2, 4]);
              expect(editor.indentationForBufferRow(2)).toBe(editor.indentationForBufferRow(1) + 1);
              editor.insertText('foo');
              return expect(editor.indentationForBufferRow(2)).toBe(editor.indentationForBufferRow(1) + 1);
            });
          });
        });
      });
      describe("editor.normalizeIndentOnPaste", function() {
        beforeEach(function() {
          return atom.config.set('editor.normalizeIndentOnPaste', true);
        });
        it("does not normalize the indentation level of the text when editor.normalizeIndentOnPaste is false", function() {
          copyText("   function() {\nvar cool = 1;\n  }\n");
          atom.config.set('editor.normalizeIndentOnPaste', false);
          editor.setCursorBufferPosition([5, 2]);
          editor.pasteText();
          expect(editor.lineForBufferRow(5)).toBe("     function() {");
          expect(editor.lineForBufferRow(6)).toBe("var cool = 1;");
          return expect(editor.lineForBufferRow(7)).toBe("  }");
        });
        describe("when the inserted text contains no newlines", function() {
          it("does not adjust the indentation level of the text", function() {
            editor.setCursorBufferPosition([5, 2]);
            editor.insertText("foo", {
              indentBasis: 5
            });
            return expect(editor.lineForBufferRow(5)).toBe("  foo    current = items.shift();");
          });
          return it("does not adjust the whitespace if there are preceding characters", function() {
            copyText(" foo");
            editor.setCursorBufferPosition([5, 30]);
            editor.pasteText();
            return expect(editor.lineForBufferRow(5)).toBe("      current = items.shift(); foo");
          });
        });
        return describe("when the inserted text contains newlines", function() {
          describe("when the cursor is preceded only by whitespace characters", function() {
            return it("normalizes indented lines to the cursor's current indentation level", function() {
              copyText("    while (true) {\n      foo();\n    }\n", {
                startColumn: 2
              });
              editor.setCursorBufferPosition([3, 4]);
              editor.pasteText();
              expect(editor.lineForBufferRow(3)).toBe("    while (true) {");
              expect(editor.lineForBufferRow(4)).toBe("      foo();");
              expect(editor.lineForBufferRow(5)).toBe("    }");
              return expect(editor.lineForBufferRow(6)).toBe("var pivot = items.shift(), current, left = [], right = [];");
            });
          });
          return describe("when the cursor is preceded by non-whitespace characters", function() {
            return it("normalizes the indentation level of all lines based on the level of the existing first line", function() {
              copyText("    while (true) {\n      foo();\n    }\n", {
                startColumn: 0
              });
              editor.setCursorBufferPosition([1, Infinity]);
              editor.pasteText();
              expect(editor.lineForBufferRow(1)).toBe("  var sort = function(items) {while (true) {");
              expect(editor.lineForBufferRow(2)).toBe("    foo();");
              expect(editor.lineForBufferRow(3)).toBe("  }");
              return expect(editor.lineForBufferRow(4)).toBe("");
            });
          });
        });
      });
      return it("autoIndentSelectedRows auto-indents the selection", function() {
        editor.setCursorBufferPosition([2, 0]);
        editor.insertText("function() {\ninside=true\n}\n  i=1\n");
        editor.getSelection().setBufferRange([[2, 0], [6, 0]]);
        editor.autoIndentSelectedRows();
        expect(editor.lineForBufferRow(2)).toBe("    function() {");
        expect(editor.lineForBufferRow(3)).toBe("      inside=true");
        expect(editor.lineForBufferRow(4)).toBe("    }");
        return expect(editor.lineForBufferRow(5)).toBe("    i=1");
      });
    });
    describe("soft and hard tabs", function() {
      return it("resets the tab style when tokenization is complete", function() {
        editor.destroy();
        atom.project.open('sample-with-tabs-and-leading-comment.coffee').then(function(o) {
          return editor = o;
        });
        expect(editor.softTabs).toBe(true);
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          return expect(editor.softTabs).toBe(false);
        });
      });
    });
    describe(".destroy()", function() {
      return it("destroys all markers associated with the edit session", function() {
        expect(buffer.getMarkerCount()).toBeGreaterThan(0);
        editor.destroy();
        return expect(buffer.getMarkerCount()).toBe(0);
      });
    });
    describe(".joinLines()", function() {
      describe("when no text is selected", function() {
        describe("when the line below isn't empty", function() {
          return it("joins the line below with the current line separated by a space and moves the cursor to the start of line that was moved up", function() {
            editor.joinLines();
            expect(editor.lineForBufferRow(0)).toBe('var quicksort = function () { var sort = function(items) {');
            return expect(editor.getCursorBufferPosition()).toEqual([0, 30]);
          });
        });
        describe("when the line below is empty", function() {
          return it("deletes the line below and moves the cursor to the end of the line", function() {
            editor.setCursorBufferPosition([9]);
            editor.joinLines();
            expect(editor.lineForBufferRow(9)).toBe('  };');
            expect(editor.lineForBufferRow(10)).toBe('  return sort(Array.apply(this, arguments));');
            return expect(editor.getCursorBufferPosition()).toEqual([9, 4]);
          });
        });
        return describe("when the cursor is on the last row", function() {
          return it("does nothing", function() {
            editor.setCursorBufferPosition([Infinity, Infinity]);
            editor.joinLines();
            return expect(editor.lineForBufferRow(12)).toBe('};');
          });
        });
      });
      return describe("when text is selected", function() {
        describe("when the selection does not span multiple lines", function() {
          return it("joins the line below with the current line separated by a space and retains the selected text", function() {
            editor.setSelectedBufferRange([[0, 1], [0, 3]]);
            editor.joinLines();
            expect(editor.lineForBufferRow(0)).toBe('var quicksort = function () { var sort = function(items) {');
            return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [0, 3]]);
          });
        });
        return describe("when the selection spans multiple lines", function() {
          return it("joins all selected lines separated by a space and retains the selected text", function() {
            editor.setSelectedBufferRange([[9, 3], [12, 1]]);
            editor.joinLines();
            expect(editor.lineForBufferRow(9)).toBe('  }; return sort(Array.apply(this, arguments)); };');
            return expect(editor.getSelectedBufferRange()).toEqual([[9, 3], [9, 49]]);
          });
        });
      });
    });
    describe(".duplicateLines()", function() {
      it("for each selection, duplicates all buffer lines intersected by the selection", function() {
        editor.foldBufferRow(4);
        editor.setCursorBufferPosition([2, 5]);
        editor.addSelectionForBufferRange([[3, 0], [8, 0]], {
          preserveFolds: true
        });
        editor.duplicateLines();
        expect(editor.getTextInBufferRange([[2, 0], [13, 5]])).toBe("\    if (items.length <= 1) return items;\n    if (items.length <= 1) return items;\n    var pivot = items.shift(), current, left = [], right = [];\n    while(items.length > 0) {\n      current = items.shift();\n      current < pivot ? left.push(current) : right.push(current);\n    }\n    var pivot = items.shift(), current, left = [], right = [];\n    while(items.length > 0) {\n      current = items.shift();\n      current < pivot ? left.push(current) : right.push(current);\n    }");
        expect(editor.getSelectedBufferRanges()).toEqual([[[3, 5], [3, 5]], [[9, 0], [14, 0]]]);
        expect(editor.lineForScreenRow(5).fold).toBeDefined();
        expect(editor.lineForScreenRow(7).fold).toBeDefined();
        expect(editor.lineForScreenRow(7).text).toBe("    while(items.length > 0) {");
        return expect(editor.lineForScreenRow(8).text).toBe("    return sort(left).concat(pivot).concat(sort(right));");
      });
      it("duplicates all folded lines for empty selections on folded lines", function() {
        editor.foldBufferRow(4);
        editor.setCursorBufferPosition([4, 0]);
        editor.duplicateLines();
        expect(editor.getTextInBufferRange([[2, 0], [11, 5]])).toBe("\    if (items.length <= 1) return items;\n    var pivot = items.shift(), current, left = [], right = [];\n    while(items.length > 0) {\n      current = items.shift();\n      current < pivot ? left.push(current) : right.push(current);\n    }\n    while(items.length > 0) {\n      current = items.shift();\n      current < pivot ? left.push(current) : right.push(current);\n    }");
        return expect(editor.getSelectedBufferRange()).toEqual([[8, 0], [8, 0]]);
      });
      return it("can duplicate the last line of the buffer", function() {
        editor.setSelectedBufferRange([[11, 0], [12, 2]]);
        editor.duplicateLines();
        expect(editor.getTextInBufferRange([[11, 0], [14, 2]])).toBe("\  return sort(Array.apply(this, arguments));\n};\n  return sort(Array.apply(this, arguments));\n};");
        return expect(editor.getSelectedBufferRange()).toEqual([[13, 0], [14, 2]]);
      });
    });
    describe(".shouldPromptToSave()", function() {
      return it("returns false when an edit session's buffer is in use by more than one session", function() {
        var editor2;
        jasmine.unspy(editor, 'shouldPromptToSave');
        expect(editor.shouldPromptToSave()).toBeFalsy();
        buffer.setText('changed');
        expect(editor.shouldPromptToSave()).toBeTruthy();
        editor2 = null;
        waitsForPromise(function() {
          return atom.project.open('sample.js', {
            autoIndent: false
          }).then(function(o) {
            return editor2 = o;
          });
        });
        return runs(function() {
          expect(editor.shouldPromptToSave()).toBeFalsy();
          editor2.destroy();
          return expect(editor.shouldPromptToSave()).toBeTruthy();
        });
      });
    });
    describe("when the edit session contains surrogate pair characters", function() {
      it("correctly backspaces over them", function() {
        editor.setText('\uD835\uDF97\uD835\uDF97\uD835\uDF97');
        editor.moveCursorToBottom();
        editor.backspace();
        expect(editor.getText()).toBe('\uD835\uDF97\uD835\uDF97');
        editor.backspace();
        expect(editor.getText()).toBe('\uD835\uDF97');
        editor.backspace();
        return expect(editor.getText()).toBe('');
      });
      it("correctly deletes over them", function() {
        editor.setText('\uD835\uDF97\uD835\uDF97\uD835\uDF97');
        editor.moveCursorToTop();
        editor["delete"]();
        expect(editor.getText()).toBe('\uD835\uDF97\uD835\uDF97');
        editor["delete"]();
        expect(editor.getText()).toBe('\uD835\uDF97');
        editor["delete"]();
        return expect(editor.getText()).toBe('');
      });
      return it("correctly moves over them", function() {
        editor.setText('\uD835\uDF97\uD835\uDF97\uD835\uDF97\n');
        editor.moveCursorToTop();
        editor.moveCursorRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
        editor.moveCursorRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        editor.moveCursorRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 6]);
        editor.moveCursorRight();
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.moveCursorLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 6]);
        editor.moveCursorLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        editor.moveCursorLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
        editor.moveCursorLeft();
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
    });
    describe(".setIndentationForBufferRow", function() {
      describe("when the editor uses soft tabs but the row has hard tabs", function() {
        return it("only replaces whitespace charachters", function() {
          editor.setSoftWrap(true);
          editor.setText("\t1\n\t2");
          editor.setCursorBufferPosition([0, 0]);
          editor.setIndentationForBufferRow(0, 2);
          return expect(editor.getText()).toBe("    1\n\t2");
        });
      });
      return describe("when the indentation level is a non-integer", function() {
        return it("does not throw an exception", function() {
          editor.setSoftWrap(true);
          editor.setText("\t1\n\t2");
          editor.setCursorBufferPosition([0, 0]);
          editor.setIndentationForBufferRow(0, 2.1);
          return expect(editor.getText()).toBe("    1\n\t2");
        });
      });
    });
    describe(".reloadGrammar()", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
      });
      return it("updates the grammar based on grammar overrides", function() {
        expect(editor.getGrammar().name).toBe('JavaScript');
        atom.syntax.setGrammarOverrideForPath(editor.getPath(), 'source.coffee');
        editor.reloadGrammar();
        return expect(editor.getGrammar().name).toBe('CoffeeScript');
      });
    });
    describe("when the editor's grammar has an injection selector", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-text');
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
      });
      it("includes the grammar's patterns when the selector matches the current scope in other grammars", function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-hyperlink');
        });
        return runs(function() {
          var grammar, tokens;
          grammar = atom.syntax.selectGrammar("text.js");
          tokens = grammar.tokenizeLine("var i; // http://github.com").tokens;
          expect(tokens[0].value).toBe("var");
          expect(tokens[0].scopes).toEqual(["source.js", "storage.modifier.js"]);
          expect(tokens[6].value).toBe("http://github.com");
          return expect(tokens[6].scopes).toEqual(["source.js", "comment.line.double-slash.js", "markup.underline.link.http.hyperlink"]);
        });
      });
      return describe("when the grammar is added", function() {
        it("retokenizes existing buffers that contain tokens that match the injection selector", function() {
          waitsForPromise(function() {
            return atom.workspace.open('sample.js').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            var tokens;
            editor.setText("// http://github.com");
            tokens = editor.lineForScreenRow(0).tokens;
            expect(tokens[1].value).toBe(" http://github.com");
            return expect(tokens[1].scopes).toEqual(["source.js", "comment.line.double-slash.js"]);
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-hyperlink');
          });
          return runs(function() {
            var tokens;
            tokens = editor.lineForScreenRow(0).tokens;
            expect(tokens[2].value).toBe("http://github.com");
            return expect(tokens[2].scopes).toEqual(["source.js", "comment.line.double-slash.js", "markup.underline.link.http.hyperlink"]);
          });
        });
        return describe("when the grammar is updated", function() {
          return it("retokenizes existing buffers that contain tokens that match the injection selector", function() {
            waitsForPromise(function() {
              return atom.workspace.open('sample.js').then(function(o) {
                return editor = o;
              });
            });
            runs(function() {
              var tokens;
              editor.setText("// SELECT * FROM OCTOCATS");
              tokens = editor.lineForScreenRow(0).tokens;
              expect(tokens[1].value).toBe(" SELECT * FROM OCTOCATS");
              return expect(tokens[1].scopes).toEqual(["source.js", "comment.line.double-slash.js"]);
            });
            waitsForPromise(function() {
              return atom.packages.activatePackage('package-with-injection-selector');
            });
            runs(function() {
              var tokens;
              tokens = editor.lineForScreenRow(0).tokens;
              expect(tokens[1].value).toBe(" SELECT * FROM OCTOCATS");
              return expect(tokens[1].scopes).toEqual(["source.js", "comment.line.double-slash.js"]);
            });
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-sql');
            });
            return runs(function() {
              var tokens;
              tokens = editor.lineForScreenRow(0).tokens;
              expect(tokens[2].value).toBe("SELECT");
              return expect(tokens[2].scopes).toEqual(["source.js", "comment.line.double-slash.js", "keyword.other.DML.sql"]);
            });
          });
        });
      });
    });
    describe(".normalizeTabsInBufferRange()", function() {
      return it("normalizes tabs depending on the editor's soft tab/tab length settings", function() {
        editor.setTabLength(1);
        editor.setSoftTabs(true);
        editor.setText('\t\t\t');
        editor.normalizeTabsInBufferRange([[0, 0], [0, 1]]);
        expect(editor.getText()).toBe(' \t\t');
        editor.setTabLength(2);
        editor.normalizeTabsInBufferRange([[0, 0], [Infinity, Infinity]]);
        expect(editor.getText()).toBe('     ');
        editor.setSoftTabs(false);
        editor.normalizeTabsInBufferRange([[0, 0], [Infinity, Infinity]]);
        return expect(editor.getText()).toBe('     ');
      });
    });
    describe(".scrollToCursorPosition()", function() {
      return it("scrolls the last cursor into view", function() {
        editor.setCursorScreenPosition([8, 8]);
        editor.setLineHeightInPixels(10);
        editor.setDefaultCharWidth(10);
        editor.setHeight(50);
        editor.setWidth(50);
        editor.setHorizontalScrollbarHeight(0);
        expect(editor.getScrollTop()).toBe(0);
        expect(editor.getScrollLeft()).toBe(0);
        editor.scrollToCursorPosition();
        expect(editor.getScrollBottom()).toBe((9 + editor.getVerticalScrollMargin()) * 10);
        return expect(editor.getScrollRight()).toBe((9 + editor.getHorizontalScrollMargin()) * 10);
      });
    });
    describe(".pageUp/Down()", function() {
      return it("scrolls one screen height up or down and moves the cursor one page length", function() {
        editor.manageScrollPosition = true;
        editor.setLineHeightInPixels(10);
        editor.setHeight(50);
        expect(editor.getScrollHeight()).toBe(130);
        expect(editor.getCursorBufferPosition().row).toBe(0);
        editor.pageDown();
        expect(editor.getScrollTop()).toBe(50);
        expect(editor.getCursorBufferPosition().row).toBe(5);
        editor.pageDown();
        expect(editor.getScrollTop()).toBe(80);
        expect(editor.getCursorBufferPosition().row).toBe(10);
        editor.pageUp();
        expect(editor.getScrollTop()).toBe(30);
        expect(editor.getCursorBufferPosition().row).toBe(5);
        editor.pageUp();
        expect(editor.getScrollTop()).toBe(0);
        return expect(editor.getCursorBufferPosition().row).toBe(0);
      });
    });
    return describe(".selectPageUp/Down()", function() {
      return it("selects one screen height of text up or down", function() {
        editor.manageScrollPosition = true;
        editor.setLineHeightInPixels(10);
        editor.setHeight(50);
        expect(editor.getScrollHeight()).toBe(130);
        expect(editor.getCursorBufferPosition().row).toBe(0);
        editor.selectPageDown();
        expect(editor.getScrollTop()).toBe(30);
        expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [5, 0]]]);
        editor.selectPageDown();
        expect(editor.getScrollTop()).toBe(80);
        expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [10, 0]]]);
        editor.selectPageDown();
        expect(editor.getScrollTop()).toBe(80);
        expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [12, 2]]]);
        editor.moveCursorToBottom();
        editor.selectPageUp();
        expect(editor.getScrollTop()).toBe(50);
        expect(editor.getSelectedBufferRanges()).toEqual([[[7, 0], [12, 2]]]);
        editor.selectPageUp();
        expect(editor.getScrollTop()).toBe(0);
        expect(editor.getSelectedBufferRanges()).toEqual([[[2, 0], [12, 2]]]);
        editor.selectPageUp();
        expect(editor.getScrollTop()).toBe(0);
        return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [12, 2]]]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFNBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLFdBQVIsQ0FBWixDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsb0RBQUE7QUFBQSxJQUFBLE9BQWdDLEVBQWhDLEVBQUMsZ0JBQUQsRUFBUyxnQkFBVCxFQUFpQixxQkFBakIsQ0FBQTtBQUFBLElBRUEsaUJBQUEsR0FBb0IsU0FBQyxNQUFELEdBQUE7YUFDbEIsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWdCLENBQUMsT0FBakIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBZixFQURrQjtJQUFBLENBRnBCLENBQUE7QUFBQSxJQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFiLENBQWtCLFdBQWxCLEVBQStCO0FBQUEsVUFBQSxVQUFBLEVBQVksS0FBWjtTQUEvQixDQUFpRCxDQUFDLElBQWxELENBQXVELFNBQUMsQ0FBRCxHQUFBO2lCQUFPLE1BQUEsR0FBUyxFQUFoQjtRQUFBLENBQXZELEVBRGM7TUFBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxNQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsTUFBaEIsQ0FBQTtlQUNBLFdBQUEsR0FBYyxNQUFNLENBQUMsUUFBUCxDQUFBLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsU0FBQyxJQUFELEdBQUE7aUJBQVUsSUFBSSxDQUFDLE9BQWY7UUFBQSxDQUF0QixFQUZYO01BQUEsQ0FBTCxDQUhBLENBQUE7YUFPQSxlQUFBLENBQWdC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Q0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLFVBQVUsQ0FBQyxjQUFYLENBQUEsQ0FBUCxDQUFtQyxDQUFDLE9BQXBDLENBQTRDLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFSLENBQTVDLENBSkEsQ0FBQTtBQUFBLFVBS0EsTUFBQSxDQUFPLFVBQVUsQ0FBQyxjQUFYLENBQUEsQ0FBUCxDQUFtQyxDQUFDLE9BQXBDLENBQTRDLENBQUMsQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFULENBQTVDLENBTEEsQ0FBQTtBQUFBLFVBT0EsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQVBBLENBQUE7QUFBQSxVQVFBLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FSQSxDQUFBO0FBQUEsVUFTQSxNQUFBLENBQU8sVUFBVSxDQUFDLGNBQVgsQ0FBQSxDQUFQLENBQW1DLENBQUMsT0FBcEMsQ0FBNEMsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBUSxDQUFDLENBQUQsRUFBRyxFQUFILENBQVIsQ0FBNUMsQ0FUQSxDQUFBO0FBQUEsVUFVQSxNQUFBLENBQU8sVUFBVSxDQUFDLGNBQVgsQ0FBQSxDQUFQLENBQW1DLENBQUMsT0FBcEMsQ0FBNEMsQ0FBQyxDQUFDLENBQUQsRUFBRyxFQUFILENBQUQsRUFBUyxDQUFDLENBQUQsRUFBRyxFQUFILENBQVQsQ0FBNUMsQ0FWQSxDQUFBO0FBQUEsVUFZQSxNQUFNLENBQUMsVUFBUCxDQUFBLENBWkEsQ0FBQTtBQUFBLFVBYUEsTUFBQSxDQUFPLFVBQVUsQ0FBQyxjQUFYLENBQUEsQ0FBUCxDQUFtQyxDQUFDLE9BQXBDLENBQTRDLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFSLENBQTVDLENBYkEsQ0FBQTtBQUFBLFVBY0EsTUFBQSxDQUFPLFVBQVUsQ0FBQyxjQUFYLENBQUEsQ0FBUCxDQUFtQyxDQUFD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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/editor-spec.coffee