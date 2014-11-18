(function() {
  var TextEditor, clipboard;

  clipboard = require('clipboard');

  TextEditor = require('../src/text-editor');

  describe("TextEditor", function() {
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
      it("restores selections and folds based on markers in the buffer", function() {
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
        expect(editor2.getSelections()[1].isReversed()).toBeTruthy();
        expect(editor2.isFoldedAtBufferRow(4)).toBeTruthy();
        return editor2.destroy();
      });
      it("preserves the invisibles setting", function() {
        var editor2, previousInvisibles;
        atom.config.set('editor.showInvisibles', true);
        previousInvisibles = editor.displayBuffer.invisibles;
        editor2 = editor.testSerialization();
        expect(editor2.displayBuffer.invisibles).toEqual(previousInvisibles);
        return expect(editor2.displayBuffer.tokenizedBuffer.invisibles).toEqual(previousInvisibles);
      });
      return it("updates invisibles if the settings have changed between serialization and deserialization", function() {
        var editor2, previousInvisibles, state;
        atom.config.set('editor.showInvisibles', true);
        previousInvisibles = editor.displayBuffer.invisibles;
        state = editor.serialize();
        atom.config.set('editor.invisibles', {
          eol: '?'
        });
        editor2 = TextEditor.deserialize(state);
        expect(editor2.displayBuffer.invisibles.eol).toBe('?');
        return expect(editor2.displayBuffer.tokenizedBuffer.invisibles.eol).toBe('?');
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
          expect(editor.getLastCursor().getBufferPosition().row).toEqual(5);
          return expect(editor.getLastCursor().getBufferPosition().column).toEqual(0);
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
          expect(editor.getLastCursor().getBufferPosition().row).toEqual(0);
          return expect(editor.getLastCursor().getBufferPosition().column).toEqual(8);
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
        expect(editor2.getSelections()[1].isReversed()).toBeTruthy();
        expect(editor2.isFoldedAtBufferRow(4)).toBeTruthy();
        editor2.getLastSelection().setBufferRange([[2, 1], [4, 3]]);
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
          expect(editor1.isSoftWrapped()).toBe(true);
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
          expect(editor2.isSoftWrapped()).toBe(false);
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
      return it("notifies ::onDidChangeTitle observers when the underlying buffer path changes", function() {
        var observed;
        observed = [];
        editor.onDidChangeTitle(function(title) {
          return observed.push(title);
        });
        buffer.setPath('/foo/bar/baz.txt');
        buffer.setPath(void 0);
        return expect(observed).toEqual(['baz.txt', 'untitled']);
      });
    });
    describe("path", function() {
      return it("notifies ::onDidChangePath observers when the underlying buffer path changes", function() {
        var observed;
        observed = [];
        editor.onDidChangePath(function(filePath) {
          return observed.push(filePath);
        });
        buffer.setPath(__filename);
        buffer.setPath(void 0);
        return expect(observed).toEqual([__filename, void 0]);
      });
    });
    describe("cursor", function() {
      describe(".getLastCursor()", function() {
        return it("returns the most recently created cursor", function() {
          var lastCursor;
          editor.addCursorAtScreenPosition([1, 0]);
          lastCursor = editor.addCursorAtScreenPosition([2, 0]);
          return expect(editor.getLastCursor()).toBe(lastCursor);
        });
      });
      describe("when the cursor moves", function() {
        it("clears a goal column established by vertical movement", function() {
          editor.setText('b');
          editor.setCursorBufferPosition([0, 0]);
          editor.insertNewline();
          editor.moveUp();
          editor.insertText('a');
          editor.moveDown();
          return expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
        });
        return it("emits an event with the old position, new position, and the cursor that moved", function() {
          var eventObject, positionChangedHandler;
          editor.onDidChangeCursorPosition(positionChangedHandler = jasmine.createSpy());
          editor.setCursorBufferPosition([2, 4]);
          expect(positionChangedHandler).toHaveBeenCalled();
          eventObject = positionChangedHandler.mostRecentCall.args[0];
          expect(eventObject.oldBufferPosition).toEqual([0, 0]);
          expect(eventObject.oldScreenPosition).toEqual([0, 0]);
          expect(eventObject.newBufferPosition).toEqual([2, 4]);
          expect(eventObject.newScreenPosition).toEqual([2, 4]);
          return expect(eventObject.cursor).toBe(editor.getLastCursor());
        });
      });
      describe(".setCursorScreenPosition(screenPosition)", function() {
        it("clears a goal column established by vertical movement", function() {
          editor.setCursorScreenPosition({
            row: 3,
            column: lineLengths[3]
          });
          editor.moveDown();
          expect(editor.getCursorScreenPosition().column).not.toBe(6);
          editor.setCursorScreenPosition([4, 6]);
          expect(editor.getCursorScreenPosition().column).toBe(6);
          editor.moveDown();
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
            editor.setSoftWrapped(true);
            editor.setEditorWidthInChars(50);
            return editor.createFold(2, 3);
          });
          return it("positions the cursor at the buffer position that corresponds to the given screen position", function() {
            editor.setCursorScreenPosition([9, 0]);
            return expect(editor.getCursorBufferPosition()).toEqual([8, 11]);
          });
        });
      });
      describe(".moveUp()", function() {
        it("moves the cursor up", function() {
          editor.setCursorScreenPosition([2, 2]);
          editor.moveUp();
          return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
        });
        it("retains the goal column across lines of differing length", function() {
          expect(lineLengths[6]).toBeGreaterThan(32);
          editor.setCursorScreenPosition({
            row: 6,
            column: 32
          });
          editor.moveUp();
          expect(editor.getCursorScreenPosition().column).toBe(lineLengths[5]);
          editor.moveUp();
          expect(editor.getCursorScreenPosition().column).toBe(lineLengths[4]);
          editor.moveUp();
          return expect(editor.getCursorScreenPosition().column).toBe(32);
        });
        describe("when the cursor is on the first line", function() {
          return it("moves the cursor to the beginning of the line, but retains the goal column", function() {
            editor.setCursorScreenPosition([0, 4]);
            editor.moveUp();
            expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
            editor.moveDown();
            return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
          });
        });
        describe("when there is a selection", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[4, 9], [5, 10]]);
          });
          return it("moves above the selection", function() {
            var cursor;
            cursor = editor.getLastCursor();
            editor.moveUp();
            return expect(cursor.getBufferPosition()).toEqual([3, 9]);
          });
        });
        return it("merges cursors when they overlap", function() {
          var cursor1, cursor2, _ref1;
          editor.addCursorAtScreenPosition([1, 0]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.moveUp();
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(cursor1.getBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveDown()", function() {
        it("moves the cursor down", function() {
          editor.setCursorScreenPosition([2, 2]);
          editor.moveDown();
          return expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
        });
        it("retains the goal column across lines of differing length", function() {
          editor.setCursorScreenPosition({
            row: 3,
            column: lineLengths[3]
          });
          editor.moveDown();
          expect(editor.getCursorScreenPosition().column).toBe(lineLengths[4]);
          editor.moveDown();
          expect(editor.getCursorScreenPosition().column).toBe(lineLengths[5]);
          editor.moveDown();
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
            editor.moveDown();
            expect(editor.getCursorScreenPosition()).toEqual({
              row: lastLineIndex,
              column: lastLine.length
            });
            editor.moveUp();
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
            editor.moveDown();
            editor.moveUp();
            return expect(editor.getCursorScreenPosition().column).toBe(0);
          });
        });
        describe("when there is a selection", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[4, 9], [5, 10]]);
          });
          return it("moves below the selection", function() {
            var cursor;
            cursor = editor.getLastCursor();
            editor.moveDown();
            return expect(cursor.getBufferPosition()).toEqual([6, 10]);
          });
        });
        return it("merges cursors when they overlap", function() {
          var cursor1, cursor2, _ref1;
          editor.setCursorScreenPosition([12, 2]);
          editor.addCursorAtScreenPosition([11, 2]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.moveDown();
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(cursor1.getBufferPosition()).toEqual([12, 2]);
        });
      });
      describe(".moveLeft()", function() {
        it("moves the cursor by one column to the left", function() {
          editor.setCursorScreenPosition([1, 8]);
          editor.moveLeft();
          return expect(editor.getCursorScreenPosition()).toEqual([1, 7]);
        });
        it("moves the cursor by n columns to the left", function() {
          editor.setCursorScreenPosition([1, 8]);
          editor.moveLeft(4);
          return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
        });
        it("moves the cursor by two rows up when the columnCount is longer than an entire line", function() {
          editor.setCursorScreenPosition([2, 2]);
          editor.moveLeft(34);
          return expect(editor.getCursorScreenPosition()).toEqual([0, 29]);
        });
        it("moves the cursor to the beginning columnCount is longer than the position in the buffer", function() {
          editor.setCursorScreenPosition([1, 0]);
          editor.moveLeft(100);
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
        describe("when the cursor is in the first column", function() {
          describe("when there is a previous line", function() {
            it("wraps to the end of the previous line", function() {
              editor.setCursorScreenPosition({
                row: 1,
                column: 0
              });
              editor.moveLeft();
              return expect(editor.getCursorScreenPosition()).toEqual({
                row: 0,
                column: buffer.lineForRow(0).length
              });
            });
            return it("moves the cursor by one row up and n columns to the left", function() {
              editor.setCursorScreenPosition([1, 0]);
              editor.moveLeft(4);
              return expect(editor.getCursorScreenPosition()).toEqual([0, 26]);
            });
          });
          describe("when the next line is empty", function() {
            return it("wraps to the beginning of the previous line", function() {
              editor.setCursorScreenPosition([11, 0]);
              editor.moveLeft();
              return expect(editor.getCursorScreenPosition()).toEqual([10, 0]);
            });
          });
          return describe("when the cursor is on the first line", function() {
            it("remains in the same position (0,0)", function() {
              editor.setCursorScreenPosition({
                row: 0,
                column: 0
              });
              editor.moveLeft();
              return expect(editor.getCursorScreenPosition()).toEqual({
                row: 0,
                column: 0
              });
            });
            return it("remains in the same position (0,0) when columnCount is specified", function() {
              editor.setCursorScreenPosition([0, 0]);
              editor.moveLeft(4);
              return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
            });
          });
        });
        describe("when softTabs is enabled and the cursor is preceded by leading whitespace", function() {
          return it("skips tabLength worth of whitespace at a time", function() {
            editor.setCursorBufferPosition([5, 6]);
            editor.moveLeft();
            return expect(editor.getCursorBufferPosition()).toEqual([5, 4]);
          });
        });
        describe("when there is a selection", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[5, 22], [5, 27]]);
          });
          return it("moves to the left of the selection", function() {
            var cursor;
            cursor = editor.getLastCursor();
            editor.moveLeft();
            expect(cursor.getBufferPosition()).toEqual([5, 22]);
            editor.moveLeft();
            return expect(cursor.getBufferPosition()).toEqual([5, 21]);
          });
        });
        return it("merges cursors when they overlap", function() {
          var cursor1, cursor2, _ref1;
          editor.setCursorScreenPosition([0, 0]);
          editor.addCursorAtScreenPosition([0, 1]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.moveLeft();
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(cursor1.getBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveRight()", function() {
        it("moves the cursor by one column to the right", function() {
          editor.setCursorScreenPosition([3, 3]);
          editor.moveRight();
          return expect(editor.getCursorScreenPosition()).toEqual([3, 4]);
        });
        it("moves the cursor by n columns to the right", function() {
          editor.setCursorScreenPosition([3, 7]);
          editor.moveRight(4);
          return expect(editor.getCursorScreenPosition()).toEqual([3, 11]);
        });
        it("moves the cursor by two rows down when the columnCount is longer than an entire line", function() {
          editor.setCursorScreenPosition([0, 29]);
          editor.moveRight(34);
          return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
        });
        it("moves the cursor to the end of the buffer when columnCount is longer than the number of characters following the cursor position", function() {
          editor.setCursorScreenPosition([11, 5]);
          editor.moveRight(100);
          return expect(editor.getCursorScreenPosition()).toEqual([12, 2]);
        });
        describe("when the cursor is on the last column of a line", function() {
          describe("when there is a subsequent line", function() {
            it("wraps to the beginning of the next line", function() {
              editor.setCursorScreenPosition([0, buffer.lineForRow(0).length]);
              editor.moveRight();
              return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
            });
            return it("moves the cursor by one row down and n columns to the right", function() {
              editor.setCursorScreenPosition([0, buffer.lineForRow(0).length]);
              editor.moveRight(4);
              return expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
            });
          });
          describe("when the next line is empty", function() {
            return it("wraps to the beginning of the next line", function() {
              editor.setCursorScreenPosition([9, 4]);
              editor.moveRight();
              return expect(editor.getCursorScreenPosition()).toEqual([10, 0]);
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
              editor.moveRight();
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
            cursor = editor.getLastCursor();
            editor.moveRight();
            expect(cursor.getBufferPosition()).toEqual([5, 27]);
            editor.moveRight();
            return expect(cursor.getBufferPosition()).toEqual([5, 28]);
          });
        });
        return it("merges cursors when they overlap", function() {
          var cursor1, cursor2, _ref1;
          editor.setCursorScreenPosition([12, 2]);
          editor.addCursorAtScreenPosition([12, 1]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
          editor.moveRight();
          expect(editor.getCursors()).toEqual([cursor1]);
          return expect(cursor1.getBufferPosition()).toEqual([12, 2]);
        });
      });
      describe(".moveToTop()", function() {
        return it("moves the cursor to the top of the buffer", function() {
          editor.setCursorScreenPosition([11, 1]);
          editor.addCursorAtScreenPosition([12, 0]);
          editor.moveToTop();
          expect(editor.getCursors().length).toBe(1);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveToBottom()", function() {
        return it("moves the cusor to the bottom of the buffer", function() {
          editor.setCursorScreenPosition([0, 0]);
          editor.addCursorAtScreenPosition([1, 0]);
          editor.moveToBottom();
          expect(editor.getCursors().length).toBe(1);
          return expect(editor.getCursorBufferPosition()).toEqual([12, 2]);
        });
      });
      describe(".moveToBeginningOfScreenLine()", function() {
        describe("when soft wrap is on", function() {
          return it("moves cursor to the beginning of the screen line", function() {
            var cursor;
            editor.setSoftWrapped(true);
            editor.setEditorWidthInChars(10);
            editor.setCursorScreenPosition([1, 2]);
            editor.moveToBeginningOfScreenLine();
            cursor = editor.getLastCursor();
            return expect(cursor.getScreenPosition()).toEqual([1, 0]);
          });
        });
        return describe("when soft wrap is off", function() {
          return it("moves cursor to the beginning of then line", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorScreenPosition([0, 5]);
            editor.addCursorAtScreenPosition([1, 7]);
            editor.moveToBeginningOfScreenLine();
            expect(editor.getCursors().length).toBe(2);
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            expect(cursor1.getBufferPosition()).toEqual([0, 0]);
            return expect(cursor2.getBufferPosition()).toEqual([1, 0]);
          });
        });
      });
      describe(".moveToEndOfScreenLine()", function() {
        describe("when soft wrap is on", function() {
          return it("moves cursor to the beginning of the screen line", function() {
            var cursor;
            editor.setSoftWrapped(true);
            editor.setEditorWidthInChars(10);
            editor.setCursorScreenPosition([1, 2]);
            editor.moveToEndOfScreenLine();
            cursor = editor.getLastCursor();
            return expect(cursor.getScreenPosition()).toEqual([1, 9]);
          });
        });
        return describe("when soft wrap is off", function() {
          return it("moves cursor to the end of line", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorScreenPosition([0, 0]);
            editor.addCursorAtScreenPosition([1, 0]);
            editor.moveToEndOfScreenLine();
            expect(editor.getCursors().length).toBe(2);
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            expect(cursor1.getBufferPosition()).toEqual([0, 29]);
            return expect(cursor2.getBufferPosition()).toEqual([1, 30]);
          });
        });
      });
      describe(".moveToBeginningOfLine()", function() {
        return it("moves cursor to the beginning of the buffer line", function() {
          var cursor;
          editor.setSoftWrapped(true);
          editor.setEditorWidthInChars(10);
          editor.setCursorScreenPosition([1, 2]);
          editor.moveToBeginningOfLine();
          cursor = editor.getLastCursor();
          return expect(cursor.getScreenPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveToEndOfLine()", function() {
        return it("moves cursor to the end of the buffer line", function() {
          var cursor;
          editor.setSoftWrapped(true);
          editor.setEditorWidthInChars(10);
          editor.setCursorScreenPosition([0, 2]);
          editor.moveToEndOfLine();
          cursor = editor.getLastCursor();
          return expect(cursor.getScreenPosition()).toEqual([3, 4]);
        });
      });
      describe(".moveToFirstCharacterOfLine()", function() {
        describe("when soft wrap is on", function() {
          return it("moves to the first character of the current screen line or the beginning of the screen line if it's already on the first character", function() {
            var cursor1, cursor2, _ref1;
            editor.setSoftWrapped(true);
            editor.setEditorWidthInChars(10);
            editor.setCursorScreenPosition([2, 5]);
            editor.addCursorAtScreenPosition([8, 7]);
            editor.moveToFirstCharacterOfLine();
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            expect(cursor1.getScreenPosition()).toEqual([2, 0]);
            expect(cursor2.getScreenPosition()).toEqual([8, 4]);
            editor.moveToFirstCharacterOfLine();
            expect(cursor1.getScreenPosition()).toEqual([2, 0]);
            return expect(cursor2.getScreenPosition()).toEqual([8, 0]);
          });
        });
        return describe("when soft wrap is off", function() {
          it("moves to the first character of the current line or the beginning of the line if it's already on the first character", function() {
            var cursor1, cursor2, _ref1;
            editor.setCursorScreenPosition([0, 5]);
            editor.addCursorAtScreenPosition([1, 7]);
            editor.moveToFirstCharacterOfLine();
            _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1];
            expect(cursor1.getBufferPosition()).toEqual([0, 0]);
            expect(cursor2.getBufferPosition()).toEqual([1, 2]);
            editor.moveToFirstCharacterOfLine();
            expect(cursor1.getBufferPosition()).toEqual([0, 0]);
            return expect(cursor2.getBufferPosition()).toEqual([1, 0]);
          });
          it("moves to the beginning of the line if it only contains whitespace ", function() {
            var cursor;
            editor.setText("first\n    \nthird");
            editor.setCursorScreenPosition([1, 2]);
            editor.moveToFirstCharacterOfLine();
            cursor = editor.getLastCursor();
            return expect(cursor.getBufferPosition()).toEqual([1, 0]);
          });
          describe("when invisible characters are enabled with soft tabs", function() {
            return it("moves to the first character of the current line without being confused by the invisible characters", function() {
              atom.config.set('editor.showInvisibles', true);
              editor.setCursorScreenPosition([1, 7]);
              editor.moveToFirstCharacterOfLine();
              expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
              editor.moveToFirstCharacterOfLine();
              return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            });
          });
          return describe("when invisible characters are enabled with hard tabs", function() {
            return it("moves to the first character of the current line without being confused by the invisible characters", function() {
              atom.config.set('editor.showInvisibles', true);
              buffer.setTextInRange([[1, 0], [1, Infinity]], '\t\t\ta', false);
              editor.setCursorScreenPosition([1, 7]);
              editor.moveToFirstCharacterOfLine();
              expect(editor.getCursorBufferPosition()).toEqual([1, 3]);
              editor.moveToFirstCharacterOfLine();
              return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            });
          });
        });
      });
      describe(".moveToBeginningOfWord()", function() {
        it("moves the cursor to the beginning of the word", function() {
          var cursor1, cursor2, cursor3, _ref1;
          editor.setCursorBufferPosition([0, 8]);
          editor.addCursorAtBufferPosition([1, 12]);
          editor.addCursorAtBufferPosition([3, 0]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2];
          editor.moveToBeginningOfWord();
          expect(cursor1.getBufferPosition()).toEqual([0, 4]);
          expect(cursor2.getBufferPosition()).toEqual([1, 11]);
          return expect(cursor3.getBufferPosition()).toEqual([2, 39]);
        });
        it("does not fail at position [0, 0]", function() {
          editor.setCursorBufferPosition([0, 0]);
          return editor.moveToBeginningOfWord();
        });
        it("treats lines with only whitespace as a word", function() {
          editor.setCursorBufferPosition([11, 0]);
          editor.moveToBeginningOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual([10, 0]);
        });
        return it("works when the current line is blank", function() {
          editor.setCursorBufferPosition([10, 0]);
          editor.moveToBeginningOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual([9, 2]);
        });
      });
      describe(".moveToPreviousWordBoundary()", function() {
        return it("moves the cursor to the previous word boundary", function() {
          var cursor1, cursor2, cursor3, cursor4, _ref1;
          editor.setCursorBufferPosition([0, 8]);
          editor.addCursorAtBufferPosition([2, 0]);
          editor.addCursorAtBufferPosition([2, 4]);
          editor.addCursorAtBufferPosition([3, 14]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2], cursor4 = _ref1[3];
          editor.moveToPreviousWordBoundary();
          expect(cursor1.getBufferPosition()).toEqual([0, 4]);
          expect(cursor2.getBufferPosition()).toEqual([1, 30]);
          expect(cursor3.getBufferPosition()).toEqual([2, 0]);
          return expect(cursor4.getBufferPosition()).toEqual([3, 13]);
        });
      });
      describe(".moveToNextWordBoundary()", function() {
        return it("moves the cursor to the previous word boundary", function() {
          var cursor1, cursor2, cursor3, cursor4, _ref1;
          editor.setCursorBufferPosition([0, 8]);
          editor.addCursorAtBufferPosition([2, 40]);
          editor.addCursorAtBufferPosition([3, 0]);
          editor.addCursorAtBufferPosition([3, 30]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2], cursor4 = _ref1[3];
          editor.moveToNextWordBoundary();
          expect(cursor1.getBufferPosition()).toEqual([0, 13]);
          expect(cursor2.getBufferPosition()).toEqual([3, 0]);
          expect(cursor3.getBufferPosition()).toEqual([3, 4]);
          return expect(cursor4.getBufferPosition()).toEqual([3, 31]);
        });
      });
      describe(".moveToEndOfWord()", function() {
        it("moves the cursor to the end of the word", function() {
          var cursor1, cursor2, cursor3, _ref1;
          editor.setCursorBufferPosition([0, 6]);
          editor.addCursorAtBufferPosition([1, 10]);
          editor.addCursorAtBufferPosition([2, 40]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2];
          editor.moveToEndOfWord();
          expect(cursor1.getBufferPosition()).toEqual([0, 13]);
          expect(cursor2.getBufferPosition()).toEqual([1, 12]);
          return expect(cursor3.getBufferPosition()).toEqual([3, 7]);
        });
        it("does not blow up when there is no next word", function() {
          var endPosition;
          editor.setCursorBufferPosition([Infinity, Infinity]);
          endPosition = editor.getCursorBufferPosition();
          editor.moveToEndOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual(endPosition);
        });
        it("treats lines with only whitespace as a word", function() {
          editor.setCursorBufferPosition([9, 4]);
          editor.moveToEndOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual([10, 0]);
        });
        return it("works when the current line is blank", function() {
          editor.setCursorBufferPosition([10, 0]);
          editor.moveToEndOfWord();
          return expect(editor.getCursorBufferPosition()).toEqual([11, 8]);
        });
      });
      describe(".moveToBeginningOfNextWord()", function() {
        it("moves the cursor before the first character of the next word", function() {
          var cursor, cursor1, cursor2, cursor3, _ref1;
          editor.setCursorBufferPosition([0, 6]);
          editor.addCursorAtBufferPosition([1, 11]);
          editor.addCursorAtBufferPosition([2, 0]);
          _ref1 = editor.getCursors(), cursor1 = _ref1[0], cursor2 = _ref1[1], cursor3 = _ref1[2];
          editor.moveToBeginningOfNextWord();
          expect(cursor1.getBufferPosition()).toEqual([0, 14]);
          expect(cursor2.getBufferPosition()).toEqual([1, 13]);
          expect(cursor3.getBufferPosition()).toEqual([2, 4]);
          editor.setText("ab cde- ");
          editor.setCursorBufferPosition([0, 2]);
          cursor = editor.getLastCursor();
          editor.moveToBeginningOfNextWord();
          return expect(cursor.getBufferPosition()).toEqual([0, 3]);
        });
        it("does not blow up when there is no next word", function() {
          var endPosition;
          editor.setCursorBufferPosition([Infinity, Infinity]);
          endPosition = editor.getCursorBufferPosition();
          editor.moveToBeginningOfNextWord();
          return expect(editor.getCursorBufferPosition()).toEqual(endPosition);
        });
        it("treats lines with only whitespace as a word", function() {
          editor.setCursorBufferPosition([9, 4]);
          editor.moveToBeginningOfNextWord();
          return expect(editor.getCursorBufferPosition()).toEqual([10, 0]);
        });
        return it("works when the current line is blank", function() {
          editor.setCursorBufferPosition([10, 0]);
          editor.moveToBeginningOfNextWord();
          return expect(editor.getCursorBufferPosition()).toEqual([11, 9]);
        });
      });
      describe(".moveToBeginningOfNextParagraph()", function() {
        return it("moves the cursor before the first line of the next paragraph", function() {
          var cursor;
          editor.setCursorBufferPosition([0, 6]);
          cursor = editor.getLastCursor();
          editor.moveToBeginningOfNextParagraph();
          expect(cursor.getBufferPosition()).toEqual({
            row: 10,
            column: 0
          });
          editor.setText("");
          editor.setCursorBufferPosition([0, 0]);
          cursor = editor.getLastCursor();
          editor.moveToBeginningOfNextParagraph();
          return expect(cursor.getBufferPosition()).toEqual([0, 0]);
        });
      });
      describe(".moveToBeginningOfPreviousParagraph()", function() {
        return it("moves the cursor before the first line of the pevious paragraph", function() {
          var cursor;
          editor.setCursorBufferPosition([10, 0]);
          cursor = editor.getLastCursor();
          editor.moveToBeginningOfPreviousParagraph();
          expect(cursor.getBufferPosition()).toEqual({
            row: 0,
            column: 0
          });
          editor.setText("");
          editor.setCursorBufferPosition([0, 0]);
          cursor = editor.getLastCursor();
          editor.moveToBeginningOfPreviousParagraph();
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
      describe("::getCursorScreenPositions()", function() {
        return it("returns the cursor positions in the order they were added", function() {
          var cursor1, cursor2;
          editor.foldBufferRow(4);
          cursor1 = editor.addCursorAtBufferPosition([8, 5]);
          cursor2 = editor.addCursorAtBufferPosition([3, 5]);
          return expect(editor.getCursorScreenPositions()).toEqual([[0, 0], [5, 5], [3, 5]]);
        });
      });
      describe("::getCursorsOrderedByBufferPosition()", function() {
        return it("returns all cursors ordered by buffer positions", function() {
          var cursor1, cursor2, originalCursor;
          originalCursor = editor.getLastCursor();
          cursor1 = editor.addCursorAtBufferPosition([8, 5]);
          cursor2 = editor.addCursorAtBufferPosition([4, 5]);
          return expect(editor.getCursorsOrderedByBufferPosition()).toEqual([originalCursor, cursor2, cursor1]);
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
          editor.moveDown();
          expect(editor.getScrollBottom()).toBe(6 * 10);
          editor.moveDown();
          return expect(editor.getScrollBottom()).toBe(7 * 10);
        });
        it("scrolls up when the last cursor gets closer than ::verticalScrollMargin to the top of the editor", function() {
          editor.setCursorScreenPosition([11, 0]);
          editor.setScrollBottom(editor.getScrollHeight());
          editor.moveUp();
          expect(editor.getScrollBottom()).toBe(editor.getScrollHeight());
          editor.moveUp();
          expect(editor.getScrollTop()).toBe(7 * 10);
          editor.moveUp();
          return expect(editor.getScrollTop()).toBe(6 * 10);
        });
        it("scrolls right when the last cursor gets closer than ::horizontalScrollMargin to the right of the editor", function() {
          expect(editor.getScrollLeft()).toBe(0);
          expect(editor.getScrollRight()).toBe(5.5 * 10);
          editor.setCursorScreenPosition([0, 2]);
          expect(editor.getScrollRight()).toBe(5.5 * 10);
          editor.moveRight();
          expect(editor.getScrollRight()).toBe(6 * 10);
          editor.moveRight();
          return expect(editor.getScrollRight()).toBe(7 * 10);
        });
        it("scrolls left when the last cursor gets closer than ::horizontalScrollMargin to the left of the editor", function() {
          editor.setScrollRight(editor.getScrollWidth());
          editor.setCursorScreenPosition([6, 62]);
          expect(editor.getScrollRight()).toBe(editor.getScrollWidth());
          editor.moveLeft();
          expect(editor.getScrollLeft()).toBe(59 * 10);
          editor.moveLeft();
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
        return selection = editor.getLastSelection();
      });
      describe("when the selection range changes", function() {
        return it("emits an event with the old range, new range, and the selection that moved", function() {
          var eventObject, rangeChangedHandler;
          editor.setSelectedBufferRange([[3, 0], [4, 5]]);
          editor.onDidChangeSelectionRange(rangeChangedHandler = jasmine.createSpy());
          editor.selectToBufferPosition([6, 2]);
          expect(rangeChangedHandler).toHaveBeenCalled();
          eventObject = rangeChangedHandler.mostRecentCall.args[0];
          expect(eventObject.oldBufferRange).toEqual([[3, 0], [4, 5]]);
          expect(eventObject.oldScreenRange).toEqual([[3, 0], [4, 5]]);
          expect(eventObject.newBufferRange).toEqual([[3, 0], [6, 2]]);
          expect(eventObject.newScreenRange).toEqual([[3, 0], [6, 2]]);
          return expect(eventObject.selection).toBe(selection);
        });
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
          editor.setSelectedBufferRanges([[[0, 9], [0, 13]], [[0, 13], [1, 20]]], {
            reversed: true
          });
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
          editor.selectLeft();
          expect(editor.getSelections()).toEqual([selection1]);
          expect(selection1.getScreenRange()).toEqual([[0, 8], [1, 20]]);
          return expect(selection1.isReversed()).toBeTruthy();
        });
        it("merges selections when they intersect when moving right", function() {
          var selection1, selection2, _ref1;
          editor.setSelectedBufferRanges([[[0, 9], [0, 14]], [[0, 14], [1, 20]]]);
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
          editor.selectRight();
          expect(editor.getSelections()).toEqual([selection1]);
          expect(selection1.getScreenRange()).toEqual([[0, 9], [1, 21]]);
          return expect(selection1.isReversed()).toBeFalsy();
        });
        return describe("when counts are passed into the selection functions", function() {
          return it("expands each selection to its cursor's new location", function() {
            var selection1, selection2, _ref1;
            editor.setSelectedBufferRanges([[[0, 9], [0, 13]], [[3, 16], [3, 21]]]);
            _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
            editor.selectRight(2);
            expect(selection1.getBufferRange()).toEqual([[0, 9], [0, 15]]);
            expect(selection2.getBufferRange()).toEqual([[3, 16], [3, 23]]);
            editor.selectLeft(3);
            expect(selection1.getBufferRange()).toEqual([[0, 9], [0, 12]]);
            expect(selection2.getBufferRange()).toEqual([[3, 16], [3, 20]]);
            editor.selectDown(3);
            expect(selection1.getBufferRange()).toEqual([[0, 9], [3, 12]]);
            expect(selection2.getBufferRange()).toEqual([[3, 16], [6, 20]]);
            editor.selectUp(2);
            expect(selection1.getBufferRange()).toEqual([[0, 9], [1, 12]]);
            return expect(selection2.getBufferRange()).toEqual([[3, 16], [4, 20]]);
          });
        });
      });
      describe(".selectToBufferPosition(bufferPosition)", function() {
        return it("expands the last selection to the given position", function() {
          var selection1, selection2, selections;
          editor.setSelectedBufferRange([[3, 0], [4, 5]]);
          editor.addCursorAtBufferPosition([5, 6]);
          editor.selectToBufferPosition([6, 2]);
          selections = editor.getSelections();
          expect(selections.length).toBe(2);
          selection1 = selections[0], selection2 = selections[1];
          expect(selection1.getBufferRange()).toEqual([[3, 0], [4, 5]]);
          return expect(selection2.getBufferRange()).toEqual([[5, 6], [6, 2]]);
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
          expect(editor.getLastSelection().getBufferRange()).toEqual([[0, 0], [11, 2]]);
          return expect(editor.getLastSelection().isReversed()).toBeTruthy();
        });
      });
      describe(".selectToBottom()", function() {
        return it("selects text from cusor position to the bottom of the buffer", function() {
          editor.setCursorScreenPosition([10, 0]);
          editor.addCursorAtScreenPosition([9, 3]);
          editor.selectToBottom();
          expect(editor.getCursors().length).toBe(1);
          expect(editor.getCursorBufferPosition()).toEqual([12, 2]);
          expect(editor.getLastSelection().getBufferRange()).toEqual([[9, 3], [12, 2]]);
          return expect(editor.getLastSelection().isReversed()).toBeFalsy();
        });
      });
      describe(".selectAll()", function() {
        return it("selects the entire buffer", function() {
          editor.selectAll();
          return expect(editor.getLastSelection().getBufferRange()).toEqual(buffer.getRange());
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
      describe(".selectLinesContainingCursors()", function() {
        return it("selects the entire line (including newlines) at given row", function() {
          editor.setCursorScreenPosition([1, 2]);
          editor.selectLinesContainingCursors();
          expect(editor.getSelectedBufferRange()).toEqual([[1, 0], [2, 0]]);
          expect(editor.getSelectedText()).toBe("  var sort = function(items) {\n");
          editor.setCursorScreenPosition([12, 2]);
          editor.selectLinesContainingCursors();
          expect(editor.getSelectedBufferRange()).toEqual([[12, 0], [12, 2]]);
          editor.setCursorBufferPosition([0, 2]);
          editor.selectLinesContainingCursors();
          editor.selectLinesContainingCursors();
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
      describe(".selectWordsContainingCursors()", function() {
        describe("when the cursor is inside a word", function() {
          return it("selects the entire word", function() {
            editor.setCursorScreenPosition([0, 8]);
            editor.selectWordsContainingCursors();
            return expect(editor.getSelectedText()).toBe('quicksort');
          });
        });
        describe("when the cursor is between two words", function() {
          return it("selects the word the cursor is on", function() {
            editor.setCursorScreenPosition([0, 4]);
            editor.selectWordsContainingCursors();
            expect(editor.getSelectedText()).toBe('quicksort');
            editor.setCursorScreenPosition([0, 3]);
            editor.selectWordsContainingCursors();
            return expect(editor.getSelectedText()).toBe('var');
          });
        });
        describe("when the cursor is inside a region of whitespace", function() {
          return it("selects the whitespace region", function() {
            editor.setCursorScreenPosition([5, 2]);
            editor.selectWordsContainingCursors();
            expect(editor.getSelectedBufferRange()).toEqual([[5, 0], [5, 6]]);
            editor.setCursorScreenPosition([5, 0]);
            editor.selectWordsContainingCursors();
            return expect(editor.getSelectedBufferRange()).toEqual([[5, 0], [5, 6]]);
          });
        });
        return describe("when the cursor is at the end of the text", function() {
          return it("select the previous word", function() {
            editor.buffer.append('word');
            editor.moveToBottom();
            editor.selectWordsContainingCursors();
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
        it("does not merge non-empty adjacent selections", function() {
          editor.setSelectedBufferRanges([[[2, 2], [3, 3]], [[3, 3], [5, 5]]]);
          return expect(editor.getSelectedBufferRanges()).toEqual([[[2, 2], [3, 3]], [[3, 3], [5, 5]]]);
        });
        it("recyles existing selection instances", function() {
          var selection1, selection2, _ref1;
          selection = editor.getLastSelection();
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
            expect(editor.tokenizedLineForScreenRow(1).fold).toBeUndefined();
            expect(editor.tokenizedLineForScreenRow(2).fold).toBeUndefined();
            expect(editor.tokenizedLineForScreenRow(6).fold).toBeUndefined();
            return expect(editor.tokenizedLineForScreenRow(10).fold).toBeDefined();
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
      describe(".setSelectedScreenRanges(ranges)", function() {
        beforeEach(function() {
          return editor.foldBufferRow(4);
        });
        it("clears existing selections and creates selections for each of the given ranges", function() {
          editor.setSelectedScreenRanges([[[3, 4], [3, 7]], [[5, 4], [5, 7]]]);
          expect(editor.getSelectedBufferRanges()).toEqual([[[3, 4], [3, 7]], [[8, 4], [8, 7]]]);
          editor.setSelectedScreenRanges([[[6, 2], [6, 4]]]);
          return expect(editor.getSelectedScreenRanges()).toEqual([[[6, 2], [6, 4]]]);
        });
        it("merges intersecting selections and unfolds the fold", function() {
          editor.setSelectedScreenRanges([[[2, 2], [3, 3]], [[3, 0], [5, 5]]]);
          return expect(editor.getSelectedScreenRanges()).toEqual([[[2, 2], [8, 5]]]);
        });
        return it("recyles existing selection instances", function() {
          var selection1, selection2, _ref1;
          selection = editor.getLastSelection();
          editor.setSelectedScreenRanges([[[2, 2], [3, 4]], [[4, 4], [5, 5]]]);
          _ref1 = editor.getSelections(), selection1 = _ref1[0], selection2 = _ref1[1];
          expect(selection1).toBe(selection);
          return expect(selection1.getScreenRange()).toEqual([[2, 2], [3, 4]]);
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
            expect(editor.getSelectedBufferRanges()).toEqual([[[3, 16], [3, 21]], [[3, 37], [3, 44]], [[2, 16], [2, 21]], [[2, 37], [2, 40]]]);
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
            return expect(editor.getSelectedBufferRanges()).toEqual([[[6, 31], [6, 38]], [[3, 31], [3, 38]]]);
          });
          return it("honors the original selection's range (goal range) when adding across shorter lines", function() {
            editor.setSelectedBufferRange([[6, 22], [6, 38]]);
            editor.addSelectionAbove();
            editor.addSelectionAbove();
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[6, 22], [6, 38]], [[5, 22], [5, 30]], [[4, 22], [4, 29]], [[3, 22], [3, 38]]]);
          });
        });
        return describe("when the selection is empty", function() {
          it("does not skip lines that are shorter than the current column", function() {
            editor.setCursorBufferPosition([6, 36]);
            editor.addSelectionAbove();
            editor.addSelectionAbove();
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[6, 36], [6, 36]], [[5, 30], [5, 30]], [[4, 29], [4, 29]], [[3, 36], [3, 36]]]);
          });
          it("skips empty lines when the column is non-zero", function() {
            editor.setCursorBufferPosition([11, 4]);
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[11, 4], [11, 4]], [[9, 4], [9, 4]]]);
          });
          return it("does not skip empty lines when the column is zero", function() {
            editor.setCursorBufferPosition([10, 0]);
            editor.addSelectionAbove();
            return expect(editor.getSelectedBufferRanges()).toEqual([[[10, 0], [10, 0]], [[9, 0], [9, 0]]]);
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
          selection1 = editor.getLastSelection();
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
          editor.moveDown();
          expect(selection.isEmpty()).toBeTruthy();
          makeSelection();
          editor.moveUp();
          expect(selection.isEmpty()).toBeTruthy();
          makeSelection();
          editor.moveLeft();
          expect(selection.isEmpty()).toBeTruthy();
          makeSelection();
          editor.moveRight();
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
        describe("when there is a single selection", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[1, 0], [1, 2]]);
          });
          return it("replaces the selection with the given text", function() {
            var range;
            range = editor.insertText('xxx');
            expect(range).toEqual([[[1, 0], [1, 3]]]);
            return expect(buffer.lineForRow(1)).toBe('xxxvar sort = function(items) {');
          });
        });
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
              return expect(editor.lineTextForBufferRow(0)).toBe("var x = functix () {");
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
        describe("when there is a selection that ends on a folded line", function() {
          return it("destroys the selection", function() {
            editor.createFold(2, 4);
            editor.setSelectedBufferRange([[1, 0], [2, 0]]);
            editor.insertText('holy cow');
            return expect(editor.tokenizedLineForScreenRow(2).fold).toBeUndefined();
          });
        });
        return describe("when there are ::onWillInsertText and ::onDidInsertText observers", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[1, 0], [1, 2]]);
          });
          it("notifies the observers when inserting text", function() {
            var didInsertSpy, options, willInsertSpy;
            willInsertSpy = jasmine.createSpy().andCallFake(function() {
              return expect(buffer.lineForRow(1)).toBe('  var sort = function(items) {');
            });
            didInsertSpy = jasmine.createSpy().andCallFake(function() {
              return expect(buffer.lineForRow(1)).toBe('xxxvar sort = function(items) {');
            });
            editor.onWillInsertText(willInsertSpy);
            editor.onDidInsertText(didInsertSpy);
            expect(editor.insertText('xxx')).toBeTruthy();
            expect(buffer.lineForRow(1)).toBe('xxxvar sort = function(items) {');
            expect(willInsertSpy).toHaveBeenCalled();
            expect(didInsertSpy).toHaveBeenCalled();
            options = willInsertSpy.mostRecentCall.args[0];
            expect(options.text).toBe('xxx');
            expect(options.cancel).toBeDefined();
            options = didInsertSpy.mostRecentCall.args[0];
            return expect(options.text).toBe('xxx');
          });
          return it("cancels text insertion when an ::onWillInsertText observer calls cancel on an event", function() {
            var didInsertSpy, willInsertSpy;
            willInsertSpy = jasmine.createSpy().andCallFake(function(_arg) {
              var cancel;
              cancel = _arg.cancel;
              return cancel();
            });
            didInsertSpy = jasmine.createSpy();
            editor.onWillInsertText(willInsertSpy);
            editor.onDidInsertText(didInsertSpy);
            expect(editor.insertText('xxx')).toBe(false);
            expect(buffer.lineForRow(1)).toBe('  var sort = function(items) {');
            expect(willInsertSpy).toHaveBeenCalled();
            return expect(didInsertSpy).not.toHaveBeenCalled();
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
              expect(editor.lineTextForBufferRow(3)).toBe("    var pivot");
              expect(editor.lineTextForBufferRow(4)).toBe(" = items.shift(), current");
              expect(editor.lineTextForBufferRow(5)).toBe(", left = [], right = [];");
              expect(editor.lineTextForBufferRow(6)).toBe("    while(items.length > 0) {");
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
              expect(editor.lineTextForBufferRow(3)).toBe("");
              expect(editor.lineTextForBufferRow(4)).toBe("    var pivot = items.shift(), current, left = [], right = [];");
              expect(editor.lineTextForBufferRow(5)).toBe("    while(items.length > 0) {");
              expect(editor.lineTextForBufferRow(6)).toBe("      current = items.shift();");
              expect(editor.lineTextForBufferRow(7)).toBe("");
              expect(editor.lineTextForBufferRow(8)).toBe("      current < pivot ? left.push(current) : right.push(current);");
              expect(editor.lineTextForBufferRow(9)).toBe("    }");
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
            expect(editor.lineTextForBufferRow(0)).toBe('');
            expect(editor.lineTextForBufferRow(1)).toBe('var quicksort = function () {');
            return expect(editor.buffer.getLineCount()).toBe(14);
          });
        });
        describe("when the cursor is not on the first line", function() {
          return it("inserts a newline above the current line and moves the cursor to the inserted line", function() {
            editor.setCursorBufferPosition([3, 4]);
            editor.insertNewlineAbove();
            expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
            expect(editor.lineTextForBufferRow(3)).toBe('');
            expect(editor.lineTextForBufferRow(4)).toBe('    var pivot = items.shift(), current, left = [], right = [];');
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
          expect(editor.lineTextForBufferRow(0)).toBe('  ');
          expect(editor.lineTextForBufferRow(1)).toBe('  var test');
          editor.setText('\n  var test');
          editor.setCursorBufferPosition([1, 2]);
          editor.insertNewlineAbove();
          expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
          expect(editor.lineTextForBufferRow(0)).toBe('');
          expect(editor.lineTextForBufferRow(1)).toBe('  ');
          expect(editor.lineTextForBufferRow(2)).toBe('  var test');
          editor.setText('function() {\n}');
          editor.setCursorBufferPosition([1, 1]);
          editor.insertNewlineAbove();
          expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
          expect(editor.lineTextForBufferRow(0)).toBe('function() {');
          expect(editor.lineTextForBufferRow(1)).toBe('  ');
          return expect(editor.lineTextForBufferRow(2)).toBe('}');
        });
      });
      describe("when a new line is appended before a closing tag (e.g. by pressing enter before a selection)", function() {
        return it("moves the line down and keeps the indentation level the same when editor.autoIndent is true", function() {
          atom.config.set('editor.autoIndent', true);
          editor.setCursorBufferPosition([9, 2]);
          editor.insertNewline();
          return expect(editor.lineTextForBufferRow(10)).toBe('  };');
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
            return selection.onDidChangeRange(changeScreenRangeHandler);
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
              return expect(editor.getLastCursor().isVisible()).toBeTruthy();
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
              expect(editor.lineTextForBufferRow(3)).toBe("    var pivo = items.shift(), curren, left = [], right = [];");
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
                expect(editor.lineTextForBufferRow(3)).toBe("    var pivo = items.shift(), current, left = [], right = [];");
                expect(editor.lineTextForBufferRow(4)).toBe("    whileitems.length > 0) {");
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
                expect(editor.lineTextForBufferRow(2)).toBe("    if (items.length <= 1) return items;    var pivot = items.shift(), current, left = [], right = [];");
                expect(editor.lineTextForBufferRow(3)).toBe("    while(items.length > 0) {");
                expect(editor.lineTextForBufferRow(4)).toBe("      current = items.shift();      current < pivot ? left.push(current) : right.push(current);");
                expect(editor.lineTextForBufferRow(5)).toBe("    }");
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
              return expect(editor.tokenizedLineForScreenRow(3).fold).toBeDefined();
            });
          });
        });
        return describe("when there are multiple selections", function() {
          return it("removes all selected text", function() {
            editor.setSelectedBufferRanges([[[0, 4], [0, 13]], [[0, 16], [0, 24]]]);
            editor.backspace();
            return expect(editor.lineTextForBufferRow(0)).toBe('var  =  () {');
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
              expect(editor.tokenizedLineForScreenRow(4).fold).toBeDefined();
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
              expect(editor.tokenizedLineForScreenRow(2).text).toBe(oldLine7);
              return expect(editor.tokenizedLineForScreenRow(3).text).toBe(oldLine8);
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
              expect(editor.lineTextForBufferRow(3)).toBe("    var pivot= items.shift(), current left = [], right = [];");
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
                expect(editor.lineTextForBufferRow(3)).toBe("    var pivot= items.shift(), current, left = [], right = [];");
                expect(editor.lineTextForBufferRow(4)).toBe("    while(tems.length > 0) {");
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
                expect(editor.lineTextForBufferRow(0)).toBe("var quicksort = function () {  var sort = function(items) {    if (items.length <= 1) return items;");
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
            return expect(editor.getLastSelection().isEmpty()).toBeTruthy();
          });
        });
        return describe("when there are multiple selections", function() {
          return describe("when selections are on the same line", function() {
            return it("removes all selected text", function() {
              editor.setSelectedBufferRanges([[[0, 4], [0, 13]], [[0, 16], [0, 24]]]);
              editor["delete"]();
              return expect(editor.lineTextForBufferRow(0)).toBe('var  =  () {');
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
                it("moves the cursor to the end of the leading whitespace and inserts enough tabs to bring the line to the suggested level of indentaion", function() {
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
                return describe("when the difference between the suggested level of indentation and the current level of indentation is greater than 0 but less than 1", function() {
                  return it("inserts one tab", function() {
                    editor.setSoftTabs(false);
                    buffer.setText(" \ntest");
                    editor.setCursorBufferPosition([1, 0]);
                    editor.indent({
                      autoIndent: true
                    });
                    expect(buffer.lineForRow(1)).toBe('\ttest');
                    return expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
                  });
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
            selection = editor.getLastSelection();
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
              editor.setSoftWrapped(true);
              editor.setEditorWidthInChars(10);
              editor.setCursorScreenPosition([2, 2]);
              editor.cutToEndOfLine();
              return expect(editor.tokenizedLineForScreenRow(2).text).toBe('=  () {');
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
            expect(editor.lineTextForBufferRow(0)).toBe("var first = function () {");
            return expect(editor.lineTextForBufferRow(1)).toBe("  var first = function(items) {");
          });
          return describe('when the clipboard has many selections', function() {
            it("pastes each selection separately into the buffer", function() {
              atom.clipboard.write('first\nsecond', {
                selections: ['first', 'second']
              });
              editor.pasteText();
              expect(editor.lineTextForBufferRow(0)).toBe("var first = function () {");
              return expect(editor.lineTextForBufferRow(1)).toBe("  var second = function(items) {");
            });
            return describe('and the selections count does not match', function() {
              return it("pastes the whole text into the buffer", function() {
                atom.clipboard.write('first\nsecond\nthird', {
                  selections: ['first', 'second', 'third']
                });
                editor.pasteText();
                expect(editor.lineTextForBufferRow(0)).toBe("var first");
                expect(editor.lineTextForBufferRow(1)).toBe("second");
                expect(editor.lineTextForBufferRow(2)).toBe("third = function () {");
                expect(editor.lineTextForBufferRow(3)).toBe("  var first");
                expect(editor.lineTextForBufferRow(4)).toBe("second");
                return expect(editor.lineTextForBufferRow(5)).toBe("third = function(items) {");
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
          return expect(editor.getLastSelection().isEmpty()).toBeTruthy();
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
          editor.moveToBeginningOfLine();
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
          editor.moveToEndOfLine();
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
          cursor = editor.getLastCursor();
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
    describe('reading text', function() {
      return it('.lineTextForScreenRow(row)', function() {
        editor.foldBufferRow(4);
        expect(editor.lineTextForScreenRow(5)).toEqual('    return sort(left).concat(pivot).concat(sort(right));');
        return expect(editor.lineTextForScreenRow(100)).not.toBeDefined();
      });
    });
    describe(".deleteLine()", function() {
      it("deletes the first line when the cursor is there", function() {
        var count, line1;
        editor.getLastCursor().moveToTop();
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
        editor.getLastCursor().moveToBottom();
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
        editor.getLastCursor().moveToTop();
        editor.getLastCursor().moveDown();
        expect(buffer.getLineCount()).toBe(13);
        editor.deleteLine();
        return expect(buffer.getLineCount()).toBe(4);
      });
      it("deletes the entire file from the bottom up", function() {
        var count, line, _i;
        count = buffer.getLineCount();
        expect(count).toBeGreaterThan(0);
        for (line = _i = 0; 0 <= count ? _i < count : _i > count; line = 0 <= count ? ++_i : --_i) {
          editor.getLastCursor().moveToBottom();
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
          editor.getLastCursor().moveToTop();
          editor.deleteLine();
        }
        expect(buffer.getLineCount()).toBe(1);
        return expect(buffer.getText()).toBe('');
      });
      describe("when soft wrap is enabled", function() {
        return it("deletes the entire line that the cursor is on", function() {
          var count, line7;
          editor.setSoftWrapped(true);
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
        return expect(editor.lineTextForBufferRow(0)).toBe('bac');
      });
      return it("reverses a selection", function() {
        editor.buffer.setText("xabcz");
        editor.setSelectedBufferRange([[0, 1], [0, 4]]);
        editor.transpose();
        return expect(editor.lineTextForBufferRow(0)).toBe('xcbaz');
      });
    });
    describe(".upperCase()", function() {
      describe("when there is no selection", function() {
        return it("upper cases the current word", function() {
          editor.buffer.setText("aBc");
          editor.setCursorScreenPosition([0, 1]);
          editor.upperCase();
          expect(editor.lineTextForBufferRow(0)).toBe('ABC');
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [0, 1]]);
        });
      });
      return describe("when there is a selection", function() {
        return it("upper cases the current selection", function() {
          editor.buffer.setText("abc");
          editor.setSelectedBufferRange([[0, 0], [0, 2]]);
          editor.upperCase();
          expect(editor.lineTextForBufferRow(0)).toBe('ABc');
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
          expect(editor.lineTextForBufferRow(0)).toBe('abc');
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [0, 1]]);
        });
      });
      return describe("when there is a selection", function() {
        return it("lower cases the current selection", function() {
          editor.buffer.setText("ABC");
          editor.setSelectedBufferRange([[0, 0], [0, 2]]);
          editor.lowerCase();
          expect(editor.lineTextForBufferRow(0)).toBe('abC');
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
          expect(editor.tokenizedLineForScreenRow(0).tokens.length).toBe(1);
          atom.syntax.addGrammar(jsGrammar);
          expect(editor.getGrammar()).toBe(jsGrammar);
          return expect(editor.tokenizedLineForScreenRow(0).tokens.length).toBeGreaterThan(1);
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
        editor.getLastSelection().setBufferRange([[0, startColumn], [numberOfNewlines, endColumn]]);
        return editor.cutSelectedText();
      };
      describe("editor.autoIndent", function() {
        describe("when editor.autoIndent is false (default)", function() {
          return describe("when `indent` is triggered", function() {
            return it("does not auto-indent the line", function() {
              editor.setCursorBufferPosition([1, 30]);
              editor.insertText("\n ");
              expect(editor.lineTextForBufferRow(2)).toBe(" ");
              atom.config.set("editor.autoIndent", false);
              editor.indent();
              return expect(editor.lineTextForBufferRow(2)).toBe("  ");
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
              expect(editor.lineTextForBufferRow(2)).toBe(" ");
              atom.config.set("editor.autoIndent", true);
              editor.indent();
              return expect(editor.lineTextForBufferRow(2)).toBe("    ");
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
                return expect(editor.lineTextForBufferRow(13)).toBe("}; # too many closing brackets!");
              });
            });
          });
          describe("when inserted text does not match a decrease indent pattern", function() {
            return it("does not decrease the indentation", function() {
              editor.setCursorBufferPosition([12, 0]);
              editor.insertText('  ');
              expect(editor.lineTextForBufferRow(12)).toBe('  };');
              editor.insertText('\t\t');
              return expect(editor.lineTextForBufferRow(12)).toBe('  \t\t};');
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
          expect(editor.lineTextForBufferRow(5)).toBe("     function() {");
          expect(editor.lineTextForBufferRow(6)).toBe("var cool = 1;");
          return expect(editor.lineTextForBufferRow(7)).toBe("  }");
        });
        describe("when the inserted text contains no newlines", function() {
          it("does not adjust the indentation level of the text", function() {
            editor.setCursorBufferPosition([5, 2]);
            editor.insertText("foo", {
              indentBasis: 5
            });
            return expect(editor.lineTextForBufferRow(5)).toBe("  foo    current = items.shift();");
          });
          return it("does not adjust the whitespace if there are preceding characters", function() {
            copyText(" foo");
            editor.setCursorBufferPosition([5, 30]);
            editor.pasteText();
            return expect(editor.lineTextForBufferRow(5)).toBe("      current = items.shift(); foo");
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
              expect(editor.lineTextForBufferRow(3)).toBe("    while (true) {");
              expect(editor.lineTextForBufferRow(4)).toBe("      foo();");
              expect(editor.lineTextForBufferRow(5)).toBe("    }");
              return expect(editor.lineTextForBufferRow(6)).toBe("var pivot = items.shift(), current, left = [], right = [];");
            });
          });
          return describe("when the cursor is preceded by non-whitespace characters", function() {
            return it("normalizes the indentation level of all lines based on the level of the existing first line", function() {
              copyText("    while (true) {\n      foo();\n    }\n", {
                startColumn: 0
              });
              editor.setCursorBufferPosition([1, Infinity]);
              editor.pasteText();
              expect(editor.lineTextForBufferRow(1)).toBe("  var sort = function(items) {while (true) {");
              expect(editor.lineTextForBufferRow(2)).toBe("    foo();");
              expect(editor.lineTextForBufferRow(3)).toBe("  }");
              return expect(editor.lineTextForBufferRow(4)).toBe("");
            });
          });
        });
      });
      return it("autoIndentSelectedRows auto-indents the selection", function() {
        editor.setCursorBufferPosition([2, 0]);
        editor.insertText("function() {\ninside=true\n}\n  i=1\n");
        editor.getLastSelection().setBufferRange([[2, 0], [6, 0]]);
        editor.autoIndentSelectedRows();
        expect(editor.lineTextForBufferRow(2)).toBe("    function() {");
        expect(editor.lineTextForBufferRow(3)).toBe("      inside=true");
        expect(editor.lineTextForBufferRow(4)).toBe("    }");
        return expect(editor.lineTextForBufferRow(5)).toBe("    i=1");
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
          expect(editor.softTabs).toBe(false);
          atom.packages.deactivatePackage('language-coffee-script');
          return atom.packages.unloadPackage('language-coffee-script');
        });
      });
    });
    describe(".destroy()", function() {
      it("destroys all markers associated with the edit session", function() {
        expect(buffer.getMarkerCount()).toBeGreaterThan(0);
        editor.destroy();
        return expect(buffer.getMarkerCount()).toBe(0);
      });
      return it("notifies ::onDidDestroy observers when the editor is destroyed", function() {
        var destroyObserverCalled;
        destroyObserverCalled = false;
        editor.onDidDestroy(function() {
          return destroyObserverCalled = true;
        });
        editor.destroy();
        return expect(destroyObserverCalled).toBe(true);
      });
    });
    describe(".joinLines()", function() {
      describe("when no text is selected", function() {
        describe("when the line below isn't empty", function() {
          return it("joins the line below with the current line separated by a space and moves the cursor to the start of line that was moved up", function() {
            editor.joinLines();
            expect(editor.lineTextForBufferRow(0)).toBe('var quicksort = function () { var sort = function(items) {');
            return expect(editor.getCursorBufferPosition()).toEqual([0, 30]);
          });
        });
        describe("when the line below is empty", function() {
          return it("deletes the line below and moves the cursor to the end of the line", function() {
            editor.setCursorBufferPosition([9]);
            editor.joinLines();
            expect(editor.lineTextForBufferRow(9)).toBe('  };');
            expect(editor.lineTextForBufferRow(10)).toBe('  return sort(Array.apply(this, arguments));');
            return expect(editor.getCursorBufferPosition()).toEqual([9, 4]);
          });
        });
        return describe("when the cursor is on the last row", function() {
          return it("does nothing", function() {
            editor.setCursorBufferPosition([Infinity, Infinity]);
            editor.joinLines();
            return expect(editor.lineTextForBufferRow(12)).toBe('};');
          });
        });
      });
      return describe("when text is selected", function() {
        describe("when the selection does not span multiple lines", function() {
          return it("joins the line below with the current line separated by a space and retains the selected text", function() {
            editor.setSelectedBufferRange([[0, 1], [0, 3]]);
            editor.joinLines();
            expect(editor.lineTextForBufferRow(0)).toBe('var quicksort = function () { var sort = function(items) {');
            return expect(editor.getSelectedBufferRange()).toEqual([[0, 1], [0, 3]]);
          });
        });
        return describe("when the selection spans multiple lines", function() {
          return it("joins all selected lines separated by a space and retains the selected text", function() {
            editor.setSelectedBufferRange([[9, 3], [12, 1]]);
            editor.joinLines();
            expect(editor.lineTextForBufferRow(9)).toBe('  }; return sort(Array.apply(this, arguments)); };');
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
        expect(editor.tokenizedLineForScreenRow(5).fold).toBeDefined();
        expect(editor.tokenizedLineForScreenRow(7).fold).toBeDefined();
        expect(editor.tokenizedLineForScreenRow(7).text).toBe("    while(items.length > 0) {");
        return expect(editor.tokenizedLineForScreenRow(8).text).toBe("    return sort(left).concat(pivot).concat(sort(right));");
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
    describe("when the editor contains surrogate pair characters", function() {
      it("correctly backspaces over them", function() {
        editor.setText('\uD835\uDF97\uD835\uDF97\uD835\uDF97');
        editor.moveToBottom();
        editor.backspace();
        expect(editor.getText()).toBe('\uD835\uDF97\uD835\uDF97');
        editor.backspace();
        expect(editor.getText()).toBe('\uD835\uDF97');
        editor.backspace();
        return expect(editor.getText()).toBe('');
      });
      it("correctly deletes over them", function() {
        editor.setText('\uD835\uDF97\uD835\uDF97\uD835\uDF97');
        editor.moveToTop();
        editor["delete"]();
        expect(editor.getText()).toBe('\uD835\uDF97\uD835\uDF97');
        editor["delete"]();
        expect(editor.getText()).toBe('\uD835\uDF97');
        editor["delete"]();
        return expect(editor.getText()).toBe('');
      });
      return it("correctly moves over them", function() {
        editor.setText('\uD835\uDF97\uD835\uDF97\uD835\uDF97\n');
        editor.moveToTop();
        editor.moveRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
        editor.moveRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        editor.moveRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 6]);
        editor.moveRight();
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.moveLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 6]);
        editor.moveLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        editor.moveLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
        editor.moveLeft();
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
    });
    describe("when the editor contains variation sequence character pairs", function() {
      it("correctly backspaces over them", function() {
        editor.setText('\u2714\uFE0E\u2714\uFE0E\u2714\uFE0E');
        editor.moveToBottom();
        editor.backspace();
        expect(editor.getText()).toBe('\u2714\uFE0E\u2714\uFE0E');
        editor.backspace();
        expect(editor.getText()).toBe('\u2714\uFE0E');
        editor.backspace();
        return expect(editor.getText()).toBe('');
      });
      it("correctly deletes over them", function() {
        editor.setText('\u2714\uFE0E\u2714\uFE0E\u2714\uFE0E');
        editor.moveToTop();
        editor["delete"]();
        expect(editor.getText()).toBe('\u2714\uFE0E\u2714\uFE0E');
        editor["delete"]();
        expect(editor.getText()).toBe('\u2714\uFE0E');
        editor["delete"]();
        return expect(editor.getText()).toBe('');
      });
      return it("correctly moves over them", function() {
        editor.setText('\u2714\uFE0E\u2714\uFE0E\u2714\uFE0E\n');
        editor.moveToTop();
        editor.moveRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
        editor.moveRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        editor.moveRight();
        expect(editor.getCursorBufferPosition()).toEqual([0, 6]);
        editor.moveRight();
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.moveLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 6]);
        editor.moveLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        editor.moveLeft();
        expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
        editor.moveLeft();
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
    });
    describe(".setIndentationForBufferRow", function() {
      describe("when the editor uses soft tabs but the row has hard tabs", function() {
        return it("only replaces whitespace characters", function() {
          editor.setSoftWrapped(true);
          editor.setText("\t1\n\t2");
          editor.setCursorBufferPosition([0, 0]);
          editor.setIndentationForBufferRow(0, 2);
          return expect(editor.getText()).toBe("    1\n\t2");
        });
      });
      return describe("when the indentation level is a non-integer", function() {
        return it("does not throw an exception", function() {
          editor.setSoftWrapped(true);
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
            tokens = editor.tokenizedLineForScreenRow(0).tokens;
            expect(tokens[1].value).toBe(" http://github.com");
            return expect(tokens[1].scopes).toEqual(["source.js", "comment.line.double-slash.js"]);
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-hyperlink');
          });
          return runs(function() {
            var tokens;
            tokens = editor.tokenizedLineForScreenRow(0).tokens;
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
              tokens = editor.tokenizedLineForScreenRow(0).tokens;
              expect(tokens[1].value).toBe(" SELECT * FROM OCTOCATS");
              return expect(tokens[1].scopes).toEqual(["source.js", "comment.line.double-slash.js"]);
            });
            waitsForPromise(function() {
              return atom.packages.activatePackage('package-with-injection-selector');
            });
            runs(function() {
              var tokens;
              tokens = editor.tokenizedLineForScreenRow(0).tokens;
              expect(tokens[1].value).toBe(" SELECT * FROM OCTOCATS");
              return expect(tokens[1].scopes).toEqual(["source.js", "comment.line.double-slash.js"]);
            });
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-sql');
            });
            return runs(function() {
              var tokens;
              tokens = editor.tokenizedLineForScreenRow(0).tokens;
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
      return it("scrolls the last cursor into view, centering around the cursor if possible and the 'center' option isn't false", function() {
        editor.setCursorScreenPosition([8, 8]);
        editor.setLineHeightInPixels(10);
        editor.setDefaultCharWidth(10);
        editor.setHeight(60);
        editor.setWidth(50);
        editor.setHorizontalScrollbarHeight(0);
        expect(editor.getScrollTop()).toBe(0);
        expect(editor.getScrollLeft()).toBe(0);
        editor.scrollToCursorPosition();
        expect(editor.getScrollTop()).toBe((8.5 * 10) - 30);
        expect(editor.getScrollBottom()).toBe((8.5 * 10) + 30);
        expect(editor.getScrollRight()).toBe((9 + editor.getHorizontalScrollMargin()) * 10);
        editor.setScrollTop(0);
        editor.scrollToCursorPosition({
          center: false
        });
        return expect(editor.getScrollBottom()).toBe((9 + editor.getVerticalScrollMargin()) * 10);
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
    describe(".selectPageUp/Down()", function() {
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
        editor.moveToBottom();
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
    return describe('.get/setPlaceholderText()', function() {
      it('can be created with placeholderText', function() {
        var TextBuffer, newEditor;
        TextBuffer = require('text-buffer');
        newEditor = new TextEditor({
          buffer: new TextBuffer,
          mini: true,
          placeholderText: 'yep'
        });
        return expect(newEditor.getPlaceholderText()).toBe('yep');
      });
      return it('models placeholderText and emits an event when changed', function() {
        var handler;
        editor.onDidChangePlaceholderText(handler = jasmine.createSpy());
        expect(editor.getPlaceholderText()).toBeUndefined();
        editor.setPlaceholderText('OK');
        expect(handler).toHaveBeenCalledWith('OK');
        return expect(editor.getPlaceholderText()).toBe('OK');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBOztBQUFBLEVBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsb0JBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFFBQUEsb0RBQUE7QUFBQSxJQUFBLE9BQWdDLEVBQWhDLEVBQUMsZ0JBQUQsRUFBUyxnQkFBVCxFQUFpQixxQkFBakIsQ0FBQTtBQUFBLElBRUEsaUJBQUEsR0FBb0IsU0FBQyxNQUFELEdBQUE7YUFDbEIsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWdCLENBQUMsT0FBakIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBZixFQURrQjtJQUFBLENBRnBCLENBQUE7QUFBQSxJQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFiLENBQWtCLFdBQWxCLEVBQStCO0FBQUEsVUFBQSxVQUFBLEVBQVksS0FBWjtTQUEvQixDQUFpRCxDQUFDLElBQWxELENBQXVELFNBQUMsQ0FBRCxHQUFBO2lCQUFPLE1BQUEsR0FBUyxFQUFoQjtRQUFBLENBQXZELEVBRGM7TUFBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxNQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsTUFBaEIsQ0FBQTtlQUNBLFdBQUEsR0FBYyxNQUFNLENBQUMsUUFBUCxDQUFBLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsU0FBQyxJQUFELEdBQUE7aUJBQVUsSUFBSSxDQUFDLE9BQWY7UUFB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/text-editor-spec.coffee