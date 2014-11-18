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
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
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
      describe(".rowRangeForCommentAtBufferRow(bufferRow)", function() {
        return it("returns the start/end rows of the foldable comment starting at the given row", function() {
          buffer.setText("//this is a multi line comment\n//another line");
          expect(languageMode.rowRangeForCommentAtBufferRow(0)).toEqual([0, 1]);
          expect(languageMode.rowRangeForCommentAtBufferRow(1)).toEqual([0, 1]);
          buffer.setText("//this is a multi line comment\n//another line\n//and one more");
          expect(languageMode.rowRangeForCommentAtBufferRow(0)).toEqual([0, 2]);
          expect(languageMode.rowRangeForCommentAtBufferRow(1)).toEqual([0, 2]);
          buffer.setText("//this is a multi line comment\n\n//with an empty line");
          expect(languageMode.rowRangeForCommentAtBufferRow(0)).toBeUndefined();
          expect(languageMode.rowRangeForCommentAtBufferRow(1)).toBeUndefined();
          expect(languageMode.rowRangeForCommentAtBufferRow(2)).toBeUndefined();
          buffer.setText("//this is a single line comment\n");
          expect(languageMode.rowRangeForCommentAtBufferRow(0)).toBeUndefined();
          expect(languageMode.rowRangeForCommentAtBufferRow(1)).toBeUndefined();
          buffer.setText("//this is a single line comment");
          return expect(languageMode.rowRangeForCommentAtBufferRow(0)).toBeUndefined();
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
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
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
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
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
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
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
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
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
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
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
          fold1 = editor.tokenizedLineForScreenRow(0).fold;
          expect([fold1.getStartRow(), fold1.getEndRow()]).toEqual([0, 12]);
          fold1.destroy();
          fold2 = editor.tokenizedLineForScreenRow(1).fold;
          expect([fold2.getStartRow(), fold2.getEndRow()]).toEqual([1, 9]);
          fold2.destroy();
          fold3 = editor.tokenizedLineForScreenRow(4).fold;
          return expect([fold3.getStartRow(), fold3.getEndRow()]).toEqual([4, 7]);
        });
      });
      describe(".foldBufferRow(bufferRow)", function() {
        describe("when bufferRow can be folded", function() {
          return it("creates a fold based on the syntactic region starting at the given row", function() {
            var fold;
            languageMode.foldBufferRow(1);
            fold = editor.tokenizedLineForScreenRow(1).fold;
            expect(fold.getStartRow()).toBe(1);
            return expect(fold.getEndRow()).toBe(9);
          });
        });
        describe("when bufferRow can't be folded", function() {
          return it("searches upward for the first row that begins a syntatic region containing the given buffer row (and folds it)", function() {
            var fold;
            languageMode.foldBufferRow(8);
            fold = editor.tokenizedLineForScreenRow(1).fold;
            expect(fold.getStartRow()).toBe(1);
            return expect(fold.getEndRow()).toBe(9);
          });
        });
        describe("when the bufferRow is already folded", function() {
          return it("searches upward for the first row that begins a syntatic region containing the folded row (and folds it)", function() {
            languageMode.foldBufferRow(2);
            expect(editor.tokenizedLineForScreenRow(1).fold).toBeDefined();
            expect(editor.tokenizedLineForScreenRow(0).fold).not.toBeDefined();
            languageMode.foldBufferRow(1);
            return expect(editor.tokenizedLineForScreenRow(0).fold).toBeDefined();
          });
        });
        describe("when the bufferRow is in a multi-line comment", function() {
          return it("searches upward and downward for surrounding comment lines and folds them as a single fold", function() {
            var fold;
            buffer.insert([1, 0], "  //this is a comment\n  // and\n  //more docs\n\n//second comment");
            languageMode.foldBufferRow(1);
            fold = editor.tokenizedLineForScreenRow(1).fold;
            expect(fold.getStartRow()).toBe(1);
            return expect(fold.getEndRow()).toBe(3);
          });
        });
        return describe("when the bufferRow is a single-line comment", function() {
          return it("searches upward for the first row that begins a syntatic region containing the folded row (and folds it)", function() {
            var fold;
            buffer.insert([1, 0], "  //this is a single line comment\n");
            languageMode.foldBufferRow(1);
            fold = editor.tokenizedLineForScreenRow(0).fold;
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
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
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
          fold1 = editor.tokenizedLineForScreenRow(0).fold;
          expect([fold1.getStartRow(), fold1.getEndRow()]).toEqual([0, 19]);
          fold1.destroy();
          fold2 = editor.tokenizedLineForScreenRow(1).fold;
          expect([fold2.getStartRow(), fold2.getEndRow()]).toEqual([1, 4]);
          fold3 = editor.tokenizedLineForScreenRow(2).fold.destroy();
          fold4 = editor.tokenizedLineForScreenRow(3).fold;
          return expect([fold4.getStartRow(), fold4.getEndRow()]).toEqual([6, 8]);
        });
      });
      describe(".foldAllAtIndentLevel()", function() {
        it("folds every foldable range at a given indentLevel", function() {
          var fold1, fold2;
          languageMode.foldAllAtIndentLevel(2);
          fold1 = editor.tokenizedLineForScreenRow(6).fold;
          expect([fold1.getStartRow(), fold1.getEndRow()]).toEqual([6, 8]);
          fold1.destroy();
          fold2 = editor.tokenizedLineForScreenRow(11).fold;
          expect([fold2.getStartRow(), fold2.getEndRow()]).toEqual([11, 14]);
          return fold2.destroy();
        });
        return it("does not fold anything but the indentLevel", function() {
          var fold1, fold2;
          languageMode.foldAllAtIndentLevel(0);
          fold1 = editor.tokenizedLineForScreenRow(0).fold;
          expect([fold1.getStartRow(), fold1.getEndRow()]).toEqual([0, 19]);
          fold1.destroy();
          fold2 = editor.tokenizedLineForScreenRow(5).fold;
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
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLGtDQUFBO0FBQUEsSUFBQSxPQUFpQyxFQUFqQyxFQUFDLGdCQUFELEVBQVMsZ0JBQVQsRUFBaUIsc0JBQWpCLENBQUE7QUFBQSxJQUVBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixNQUFNLENBQUMsT0FBUCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBRkEsQ0FBQTtBQUFBLElBS0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFdBQXBCLEVBQWlDO0FBQUEsWUFBQSxVQUFBLEVBQVksS0FBWjtXQUFqQyxDQUFtRCxDQUFDLElBQXBELENBQXlELFNBQUMsQ0FBRCxHQUFBO0FBQ3ZELFlBQUEsTUFBQSxHQUFTLENBQVQsQ0FBQTttQkFDQyxnQkFBQSxNQUFELEVBQVMsc0JBQUEsWUFBVCxFQUF5QixPQUY4QjtVQUFBLENBQXpELEVBRGM7UUFBQSxDQUFoQixDQUFBLENBQUE7ZUFLQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7UUFBQSxDQUFoQixFQU5TO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQVNBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7QUFDUixRQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWQsQ0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWQsQ0FBQSxFQUZRO01BQUEsQ0FBVixDQVRBLENBQUE7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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/language-mode-spec.coffee