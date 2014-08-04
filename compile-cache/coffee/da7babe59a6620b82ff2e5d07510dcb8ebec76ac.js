(function() {
  describe("LanguageMode", function() {
    var buffer, editor, languageMode, _ref;
    _ref = [], editor = _ref[0], buffer = _ref[1], languageMode = _ref[2];
    afterEach(function() {
      return editor.destroy();
    });
    describe("javascript", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.js', {
            autoIndent: false
          }).then(function(o) {
            editor = o;
            return buffer = editor.buffer, languageMode = editor.languageMode, editor;
          });
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
      });
      describe(".minIndentLevelForRowRange(startRow, endRow)", function() {
        return it("returns the minimum indent level for the given row range", function() {
          expect(languageMode.minIndentLevelForRowRange(4, 7)).toBe(2);
          expect(languageMode.minIndentLevelForRowRange(5, 7)).toBe(2);
          expect(languageMode.minIndentLevelForRowRange(5, 6)).toBe(3);
          expect(languageMode.minIndentLevelForRowRange(9, 11)).toBe(1);
          return expect(languageMode.minIndentLevelForRowRange(10, 10)).toBe(0);
        });
      });
      describe(".toggleLineCommentsForBufferRows(start, end)", function() {
        return it("comments/uncomments lines in the given range", function() {
          languageMode.toggleLineCommentsForBufferRows(4, 7);
          expect(buffer.lineForRow(4)).toBe("    // while(items.length > 0) {");
          expect(buffer.lineForRow(5)).toBe("    //   current = items.shift();");
          expect(buffer.lineForRow(6)).toBe("    //   current < pivot ? left.push(current) : right.push(current);");
          expect(buffer.lineForRow(7)).toBe("    // }");
          languageMode.toggleLineCommentsForBufferRows(4, 5);
          expect(buffer.lineForRow(4)).toBe("    while(items.length > 0) {");
          expect(buffer.lineForRow(5)).toBe("      current = items.shift();");
          expect(buffer.lineForRow(6)).toBe("    //   current < pivot ? left.push(current) : right.push(current);");
          expect(buffer.lineForRow(7)).toBe("    // }");
          buffer.setText('\tvar i;');
          languageMode.toggleLineCommentsForBufferRows(0, 0);
          expect(buffer.lineForRow(0)).toBe("\t// var i;");
          buffer.setText('var i;');
          languageMode.toggleLineCommentsForBufferRows(0, 0);
          expect(buffer.lineForRow(0)).toBe("// var i;");
          buffer.setText(' var i;');
          languageMode.toggleLineCommentsForBufferRows(0, 0);
          expect(buffer.lineForRow(0)).toBe(" // var i;");
          buffer.setText('  ');
          languageMode.toggleLineCommentsForBufferRows(0, 0);
          expect(buffer.lineForRow(0)).toBe("  // ");
          buffer.setText('    a\n  \n    b');
          languageMode.toggleLineCommentsForBufferRows(0, 2);
          expect(buffer.lineForRow(0)).toBe("    // a");
          expect(buffer.lineForRow(1)).toBe("    // ");
          expect(buffer.lineForRow(2)).toBe("    // b");
          buffer.setText('    \n    // var i;');
          languageMode.toggleLineCommentsForBufferRows(0, 1);
          expect(buffer.lineForRow(0)).toBe('    ');
          return expect(buffer.lineForRow(1)).toBe('    var i;');
        });
      });
      describe(".rowRangeForCodeFoldAtBufferRow(bufferRow)", function() {
        return it("returns the start/end rows of the foldable region starting at the given row", function() {
          expect(languageMode.rowRangeForCodeFoldAtBufferRow(0)).toEqual([0, 12]);
          expect(languageMode.rowRangeForCodeFoldAtBufferRow(1)).toEqual([1, 9]);
          expect(languageMode.rowRangeForCodeFoldAtBufferRow(2)).toBeNull();
          return expect(languageMode.rowRangeForCodeFoldAtBufferRow(4)).toEqual([4, 7]);
        });
      });
      describe("suggestedIndentForBufferRow", function() {
        return it("returns the suggested indentation based on auto-indent/outdent rules", function() {
          expect(languageMode.suggestedIndentForBufferRow(0)).toBe(0);
          expect(languageMode.suggestedIndentForBufferRow(1)).toBe(1);
          expect(languageMode.suggestedIndentForBufferRow(2)).toBe(2);
          return expect(languageMode.suggestedIndentForBufferRow(9)).toBe(1);
        });
      });
      return describe("rowRangeForParagraphAtBufferRow", function() {
        return describe("with code and comments", function() {
          beforeEach(function() {
            return buffer.setText('var quicksort = function () {\n  /* Single line comment block */\n  var sort = function(items) {};\n\n  /*\n  A multiline\n  comment is here\n  */\n  var sort = function(items) {};\n\n  // A comment\n  //\n  // Multiple comment\n  // lines\n  var sort = function(items) {};\n  // comment line after fn\n};');
          });
          return it("will limit paragraph range to comments", function() {
            var range;
            range = languageMode.rowRangeForParagraphAtBufferRow(0);
            expect(range).toEqual([[0, 0], [0, 29]]);
            range = languageMode.rowRangeForParagraphAtBufferRow(10);
            expect(range).toEqual([[10, 0], [10, 14]]);
            range = languageMode.rowRangeForParagraphAtBufferRow(11);
            expect(range).toBeFalsy();
            range = languageMode.rowRangeForParagraphAtBufferRow(12);
            expect(range).toEqual([[12, 0], [13, 10]]);
            range = languageMode.rowRangeForParagraphAtBufferRow(14);
            expect(range).toEqual([[14, 0], [14, 32]]);
            range = languageMode.rowRangeForParagraphAtBufferRow(15);
            return expect(range).toEqual([[15, 0], [15, 26]]);
          });
        });
      });
    });
    describe("coffeescript", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('coffee.coffee', {
            autoIndent: false
          }).then(function(o) {
            editor = o;
            return buffer = editor.buffer, languageMode = editor.languageMode, editor;
          });
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
      });
      describe(".toggleLineCommentsForBufferRows(start, end)", function() {
        it("comments/uncomments lines in the given range", function() {
          languageMode.toggleLineCommentsForBufferRows(4, 6);
          expect(buffer.lineForRow(4)).toBe("    # pivot = items.shift()");
          expect(buffer.lineForRow(5)).toBe("    # left = []");
          expect(buffer.lineForRow(6)).toBe("    # right = []");
          languageMode.toggleLineCommentsForBufferRows(4, 5);
          expect(buffer.lineForRow(4)).toBe("    pivot = items.shift()");
          expect(buffer.lineForRow(5)).toBe("    left = []");
          return expect(buffer.lineForRow(6)).toBe("    # right = []");
        });
        return it("comments/uncomments lines when empty line", function() {
          languageMode.toggleLineCommentsForBufferRows(4, 7);
          expect(buffer.lineForRow(4)).toBe("    # pivot = items.shift()");
          expect(buffer.lineForRow(5)).toBe("    # left = []");
          expect(buffer.lineForRow(6)).toBe("    # right = []");
          expect(buffer.lineForRow(7)).toBe("    # ");
          languageMode.toggleLineCommentsForBufferRows(4, 5);
          expect(buffer.lineForRow(4)).toBe("    pivot = items.shift()");
          expect(buffer.lineForRow(5)).toBe("    left = []");
          expect(buffer.lineForRow(6)).toBe("    # right = []");
          return expect(buffer.lineForRow(7)).toBe("    # ");
        });
      });
      return describe("fold suggestion", function() {
        describe(".isFoldableAtBufferRow(bufferRow)", function() {
          return it("returns true only when the buffer row starts a foldable region", function() {
            expect(languageMode.isFoldableAtBufferRow(0)).toBeTruthy();
            expect(languageMode.isFoldableAtBufferRow(1)).toBeTruthy();
            expect(languageMode.isFoldableAtBufferRow(2)).toBeFalsy();
            expect(languageMode.isFoldableAtBufferRow(3)).toBeFalsy();
            return expect(languageMode.isFoldableAtBufferRow(19)).toBeTruthy();
          });
        });
        return describe(".rowRangeForCodeFoldAtBufferRow(bufferRow)", function() {
          return it("returns the start/end rows of the foldable region starting at the given row", function() {
            expect(languageMode.rowRangeForCodeFoldAtBufferRow(0)).toEqual([0, 20]);
            expect(languageMode.rowRangeForCodeFoldAtBufferRow(1)).toEqual([1, 17]);
            expect(languageMode.rowRangeForCodeFoldAtBufferRow(2)).toBeNull();
            return expect(languageMode.rowRangeForCodeFoldAtBufferRow(19)).toEqual([19, 20]);
          });
        });
      });
    });
    describe("css", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('css.css', {
            autoIndent: false
          }).then(function(o) {
            editor = o;
            return buffer = editor.buffer, languageMode = editor.languageMode, editor;
          });
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-css');
        });
      });
      return describe(".toggleLineCommentsForBufferRows(start, end)", function() {
        it("comments/uncomments lines in the given range", function() {
          languageMode.toggleLineCommentsForBufferRows(0, 1);
          expect(buffer.lineForRow(0)).toBe("/*body {");
          expect(buffer.lineForRow(1)).toBe("  font-size: 1234px;*/");
          expect(buffer.lineForRow(2)).toBe("  width: 110%;");
          expect(buffer.lineForRow(3)).toBe("  font-weight: bold !important;");
          languageMode.toggleLineCommentsForBufferRows(2, 2);
          expect(buffer.lineForRow(0)).toBe("/*body {");
          expect(buffer.lineForRow(1)).toBe("  font-size: 1234px;*/");
          expect(buffer.lineForRow(2)).toBe("  /*width: 110%;*/");
          expect(buffer.lineForRow(3)).toBe("  font-weight: bold !important;");
          languageMode.toggleLineCommentsForBufferRows(0, 1);
          expect(buffer.lineForRow(0)).toBe("body {");
          expect(buffer.lineForRow(1)).toBe("  font-size: 1234px;");
          expect(buffer.lineForRow(2)).toBe("  /*width: 110%;*/");
          return expect(buffer.lineForRow(3)).toBe("  font-weight: bold !important;");
        });
        it("uncomments lines with leading whitespace", function() {
          buffer.setTextInRange([[2, 0], [2, Infinity]], "  /*width: 110%;*/");
          languageMode.toggleLineCommentsForBufferRows(2, 2);
          return expect(buffer.lineForRow(2)).toBe("  width: 110%;");
        });
        it("uncomments lines with trailing whitespace", function() {
          buffer.setTextInRange([[2, 0], [2, Infinity]], "/*width: 110%;*/  ");
          languageMode.toggleLineCommentsForBufferRows(2, 2);
          return expect(buffer.lineForRow(2)).toBe("width: 110%;  ");
        });
        return it("uncomments lines with leading and trailing whitespace", function() {
          buffer.setTextInRange([[2, 0], [2, Infinity]], "   /*width: 110%;*/ ");
          languageMode.toggleLineCommentsForBufferRows(2, 2);
          return expect(buffer.lineForRow(2)).toBe("   width: 110%; ");
        });
      });
    });
    describe("less", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.less', {
            autoIndent: false
          }).then(function(o) {
            editor = o;
            return buffer = editor.buffer, languageMode = editor.languageMode, editor;
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-less');
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-css');
        });
      });
      return describe("when commenting lines", function() {
        return it("only uses the `commentEnd` pattern if it comes from the same grammar as the `commentStart`", function() {
          languageMode.toggleLineCommentsForBufferRows(0, 0);
          return expect(buffer.lineForRow(0)).toBe("// @color: #4D926F;");
        });
      });
    });
    describe("xml", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.xml', {
            autoIndent: false
          }).then(function(o) {
            editor = o;
            editor.setText("<!-- test -->");
            return buffer = editor.buffer, languageMode = editor.languageMode, editor;
          });
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-xml');
        });
      });
      return describe("when uncommenting lines", function() {
        return it("removes the leading whitespace from the comment end pattern match", function() {
          languageMode.toggleLineCommentsForBufferRows(0, 0);
          return expect(buffer.lineForRow(0)).toBe("test");
        });
      });
    });
    describe("folding", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.js', {
            autoIndent: false
          }).then(function(o) {
            editor = o;
            return buffer = editor.buffer, languageMode = editor.languageMode, editor;
          });
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
      });
      it("maintains cursor buffer position when a folding/unfolding", function() {
        editor.setCursorBufferPosition([5, 5]);
        languageMode.foldAll();
        return expect(editor.getCursorBufferPosition()).toEqual([5, 5]);
      });
      describe(".unfoldAll()", function() {
        return it("unfolds every folded line", function() {
          var initialScreenLineCount;
          initialScreenLineCount = editor.getScreenLineCount();
          languageMode.foldBufferRow(0);
          languageMode.foldBufferRow(1);
          expect(editor.getScreenLineCount()).toBeLessThan(initialScreenLineCount);
          languageMode.unfoldAll();
          return expect(editor.getScreenLineCount()).toBe(initialScreenLineCount);
        });
      });
      describe(".foldAll()", function() {
        return it("folds every foldable line", function() {
          var fold1, fold2, fold3;
          languageMode.foldAll();
          fold1 = editor.lineForScreenRow(0).fold;
          expect([fold1.getStartRow(), fold1.getEndRow()]).toEqual([0, 12]);
          fold1.destroy();
          fold2 = editor.lineForScreenRow(1).fold;
          expect([fold2.getStartRow(), fold2.getEndRow()]).toEqual([1, 9]);
          fold2.destroy();
          fold3 = editor.lineForScreenRow(4).fold;
          return expect([fold3.getStartRow(), fold3.getEndRow()]).toEqual([4, 7]);
        });
      });
      describe(".foldBufferRow(bufferRow)", function() {
        describe("when bufferRow can be folded", function() {
          return it("creates a fold based on the syntactic region starting at the given row", function() {
            var fold;
            languageMode.foldBufferRow(1);
            fold = editor.lineForScreenRow(1).fold;
            expect(fold.getStartRow()).toBe(1);
            return expect(fold.getEndRow()).toBe(9);
          });
        });
        describe("when bufferRow can't be folded", function() {
          return it("searches upward for the first row that begins a syntatic region containing the given buffer row (and folds it)", function() {
            var fold;
            languageMode.foldBufferRow(8);
            fold = editor.lineForScreenRow(1).fold;
            expect(fold.getStartRow()).toBe(1);
            return expect(fold.getEndRow()).toBe(9);
          });
        });
        describe("when the bufferRow is already folded", function() {
          return it("searches upward for the first row that begins a syntatic region containing the folded row (and folds it)", function() {
            languageMode.foldBufferRow(2);
            expect(editor.lineForScreenRow(1).fold).toBeDefined();
            expect(editor.lineForScreenRow(0).fold).not.toBeDefined();
            languageMode.foldBufferRow(1);
            return expect(editor.lineForScreenRow(0).fold).toBeDefined();
          });
        });
        describe("when the bufferRow is in a multi-line comment", function() {
          return it("searches upward and downward for surrounding comment lines and folds them as a single fold", function() {
            var fold;
            buffer.insert([1, 0], "  //this is a comment\n  // and\n  //more docs\n\n//second comment");
            languageMode.foldBufferRow(1);
            fold = editor.lineForScreenRow(1).fold;
            expect(fold.getStartRow()).toBe(1);
            return expect(fold.getEndRow()).toBe(3);
          });
        });
        return describe("when the bufferRow is a single-line comment", function() {
          return it("searches upward for the first row that begins a syntatic region containing the folded row (and folds it)", function() {
            var fold;
            buffer.insert([1, 0], "  //this is a single line comment\n");
            languageMode.foldBufferRow(1);
            fold = editor.lineForScreenRow(0).fold;
            expect(fold.getStartRow()).toBe(0);
            return expect(fold.getEndRow()).toBe(13);
          });
        });
      });
      return describe(".isFoldableAtBufferRow(bufferRow)", function() {
        return it("returns true if the line starts a foldable row range", function() {
          expect(languageMode.isFoldableAtBufferRow(0)).toBe(true);
          expect(languageMode.isFoldableAtBufferRow(1)).toBe(true);
          expect(languageMode.isFoldableAtBufferRow(2)).toBe(false);
          expect(languageMode.isFoldableAtBufferRow(3)).toBe(false);
          return expect(languageMode.isFoldableAtBufferRow(4)).toBe(true);
        });
      });
    });
    describe("folding with comments", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample-with-comments.js', {
            autoIndent: false
          }).then(function(o) {
            editor = o;
            return buffer = editor.buffer, languageMode = editor.languageMode, editor;
          });
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
      });
      describe(".unfoldAll()", function() {
        return it("unfolds every folded line", function() {
          var initialScreenLineCount;
          initialScreenLineCount = editor.getScreenLineCount();
          languageMode.foldBufferRow(0);
          languageMode.foldBufferRow(5);
          expect(editor.getScreenLineCount()).toBeLessThan(initialScreenLineCount);
          languageMode.unfoldAll();
          return expect(editor.getScreenLineCount()).toBe(initialScreenLineCount);
        });
      });
      describe(".foldAll()", function() {
        return it("folds every foldable line", function() {
          var fold1, fold2, fold3, fold4;
          languageMode.foldAll();
          fold1 = editor.lineForScreenRow(0).fold;
          expect([fold1.getStartRow(), fold1.getEndRow()]).toEqual([0, 19]);
          fold1.destroy();
          fold2 = editor.lineForScreenRow(1).fold;
          expect([fold2.getStartRow(), fold2.getEndRow()]).toEqual([1, 4]);
          fold3 = editor.lineForScreenRow(2).fold.destroy();
          fold4 = editor.lineForScreenRow(3).fold;
          return expect([fold4.getStartRow(), fold4.getEndRow()]).toEqual([6, 8]);
        });
      });
      describe(".foldAllAtIndentLevel()", function() {
        it("folds every foldable range at a given indentLevel", function() {
          var fold1, fold2;
          languageMode.foldAllAtIndentLevel(2);
          fold1 = editor.lineForScreenRow(6).fold;
          expect([fold1.getStartRow(), fold1.getEndRow()]).toEqual([6, 8]);
          fold1.destroy();
          fold2 = editor.lineForScreenRow(11).fold;
          expect([fold2.getStartRow(), fold2.getEndRow()]).toEqual([11, 14]);
          return fold2.destroy();
        });
        return it("does not fold anything but the indentLevel", function() {
          var fold1, fold2;
          languageMode.foldAllAtIndentLevel(0);
          fold1 = editor.lineForScreenRow(0).fold;
          expect([fold1.getStartRow(), fold1.getEndRow()]).toEqual([0, 19]);
          fold1.destroy();
          fold2 = editor.lineForScreenRow(5).fold;
          return expect(fold2).toBeFalsy();
        });
      });
      return describe(".isFoldableAtBufferRow(bufferRow)", function() {
        it("returns true if the line starts a multi-line comment", function() {
          expect(languageMode.isFoldableAtBufferRow(1)).toBe(true);
          expect(languageMode.isFoldableAtBufferRow(6)).toBe(true);
          return expect(languageMode.isFoldableAtBufferRow(17)).toBe(false);
        });
        return it("does not return true for a line in the middle of a comment that's followed by an indented line", function() {
          expect(languageMode.isFoldableAtBufferRow(7)).toBe(false);
          editor.buffer.insert([8, 0], '  ');
          return expect(languageMode.isFoldableAtBufferRow(7)).toBe(false);
        });
      });
    });
    return describe("css", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('css.css', {
            autoIndent: true
          }).then(function(o) {
            editor = o;
            return buffer = editor.buffer, languageMode = editor.languageMode, editor;
          });
        });
        return waitsForPromise(function() {
          atom.packages.activatePackage('language-source');
          return atom.packages.activatePackage('language-css');
        });
      });
      return describe("suggestedIndentForBufferRow", function() {
        return it("does not return negative values (regression)", function() {
          editor.setText('.test {\npadding: 0;\n}');
          return expect(editor.suggestedIndentForBufferRow(2)).toBe(0);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLGtDQUFBO0FBQUEsSUFBQSxPQUFpQyxFQUFqQyxFQUFDLGdCQUFELEVBQVMsZ0JBQVQsRUFBaUIsc0JBQWpCLENBQUE7QUFBQSxJQUVBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixNQUFNLENBQUMsT0FBUCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBRkEsQ0FBQTtBQUFBLElBS0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFdBQXBCLEVBQWlDO0FBQUEsWUFBQSxVQUFBLEVBQVksS0FBWjtXQUFqQyxDQUFtRCxDQUFDLElBQXBELENBQXlELFNBQUMsQ0FBRCxHQUFBO0FBQ3ZELFlBQUEsTUFBQSxHQUFTLENBQVQsQ0FBQTttQkFDQyxnQkFBQSxNQUFELEVBQVMsc0JBQUEsWUFBVCxFQUF5QixPQUY4QjtVQUFBLENBQXpELEVBRGM7UUFBQSxDQUFoQixDQUFBLENBQUE7ZUFLQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7UUFBQSxDQUFoQixFQU5TO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQVNBLFFBQUEsQ0FBUyw4Q0FBVCxFQUF5RCxTQUFBLEdBQUE7ZUFDdkQsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUEsR0FBQTtBQUM3RCxVQUFBLE1BQUEsQ0FBTyxZQUFZLENBQUMseUJBQWIsQ0FBdUMsQ0FBdkMsRUFBMEMsQ0FBMUMs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/language-mode-spec.coffee