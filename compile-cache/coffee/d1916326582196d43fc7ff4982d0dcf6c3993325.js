(function() {
  var DisplayBuffer, _;

  DisplayBuffer = require('../src/display-buffer');

  _ = require('underscore-plus');

  describe("DisplayBuffer", function() {
    var buffer, changeHandler, displayBuffer, tabLength, _ref;
    _ref = [], displayBuffer = _ref[0], buffer = _ref[1], changeHandler = _ref[2], tabLength = _ref[3];
    beforeEach(function() {
      tabLength = 2;
      buffer = atom.project.bufferForPathSync('sample.js');
      displayBuffer = new DisplayBuffer({
        buffer: buffer,
        tabLength: tabLength
      });
      changeHandler = jasmine.createSpy('changeHandler');
      displayBuffer.onDidChange(changeHandler);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
    });
    afterEach(function() {
      displayBuffer.destroy();
      return buffer.release();
    });
    describe("::copy()", function() {
      return it("creates a new DisplayBuffer with the same initial state", function() {
        var displayBuffer2, marker1, marker2, marker3;
        marker1 = displayBuffer.markBufferRange([[1, 2], [3, 4]], {
          id: 1
        });
        marker2 = displayBuffer.markBufferRange([[2, 3], [4, 5]], {
          reversed: true,
          id: 2
        });
        marker3 = displayBuffer.markBufferPosition([5, 6], {
          id: 3
        });
        displayBuffer.createFold(3, 5);
        displayBuffer2 = displayBuffer.copy();
        expect(displayBuffer2.id).not.toBe(displayBuffer.id);
        expect(displayBuffer2.buffer).toBe(displayBuffer.buffer);
        expect(displayBuffer2.getTabLength()).toBe(displayBuffer.getTabLength());
        expect(displayBuffer2.getMarkerCount()).toEqual(displayBuffer.getMarkerCount());
        expect(displayBuffer2.findMarker({
          id: 1
        })).toEqual(marker1);
        expect(displayBuffer2.findMarker({
          id: 2
        })).toEqual(marker2);
        expect(displayBuffer2.findMarker({
          id: 3
        })).toEqual(marker3);
        expect(displayBuffer2.isFoldedAtBufferRow(3)).toBeTruthy();
        displayBuffer2.unfoldBufferRow(3);
        return expect(displayBuffer2.isFoldedAtBufferRow(3)).not.toBe(displayBuffer.isFoldedAtBufferRow(3));
      });
    });
    describe("when the buffer changes", function() {
      it("renders line numbers correctly", function() {
        var oneHundredLines, originalLineCount, _i, _results;
        originalLineCount = displayBuffer.getLineCount();
        oneHundredLines = (function() {
          _results = [];
          for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
          return _results;
        }).apply(this).join("\n");
        buffer.insert([0, 0], oneHundredLines);
        return expect(displayBuffer.getLineCount()).toBe(100 + originalLineCount);
      });
      return it("reassigns the scrollTop if it exceeds the max possible value after lines are removed", function() {
        displayBuffer.manageScrollPosition = true;
        displayBuffer.setHeight(50);
        displayBuffer.setLineHeightInPixels(10);
        displayBuffer.setScrollTop(80);
        buffer["delete"]([[8, 0], [10, 0]]);
        return expect(displayBuffer.getScrollTop()).toBe(60);
      });
    });
    describe("soft wrapping", function() {
      beforeEach(function() {
        displayBuffer.setSoftWrapped(true);
        displayBuffer.setEditorWidthInChars(50);
        return changeHandler.reset();
      });
      describe("rendering of soft-wrapped lines", function() {
        describe("when editor.softWrapAtPreferredLineLength is set", function() {
          return it("uses the preferred line length as the soft wrap column when it is less than the configured soft wrap column", function() {
            atom.config.set('editor.preferredLineLength', 100);
            atom.config.set('editor.softWrapAtPreferredLineLength', true);
            expect(displayBuffer.tokenizedLineForScreenRow(10).text).toBe('    return ');
            atom.config.set('editor.preferredLineLength', 5);
            expect(displayBuffer.tokenizedLineForScreenRow(10).text).toBe('funct');
            atom.config.set('editor.softWrapAtPreferredLineLength', false);
            return expect(displayBuffer.tokenizedLineForScreenRow(10).text).toBe('    return ');
          });
        });
        describe("when the line is shorter than the max line length", function() {
          return it("renders the line unchanged", function() {
            return expect(displayBuffer.tokenizedLineForScreenRow(0).text).toBe(buffer.lineForRow(0));
          });
        });
        describe("when the line is empty", function() {
          return it("renders the empty line", function() {
            return expect(displayBuffer.tokenizedLineForScreenRow(13).text).toBe('');
          });
        });
        describe("when there is a non-whitespace character at the max length boundary", function() {
          describe("when there is whitespace before the boundary", function() {
            return it("wraps the line at the end of the first whitespace preceding the boundary", function() {
              expect(displayBuffer.tokenizedLineForScreenRow(10).text).toBe('    return ');
              return expect(displayBuffer.tokenizedLineForScreenRow(11).text).toBe('sort(left).concat(pivot).concat(sort(right));');
            });
          });
          return describe("when there is no whitespace before the boundary", function() {
            return it("wraps the line exactly at the boundary since there's no more graceful place to wrap it", function() {
              buffer.setTextInRange([[0, 0], [1, 0]], 'abcdefghijklmnopqrstuvwxyz\n');
              displayBuffer.setEditorWidthInChars(10);
              expect(displayBuffer.tokenizedLineForScreenRow(0).text).toBe('abcdefghij');
              expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe('klmnopqrst');
              return expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe('uvwxyz');
            });
          });
        });
        describe("when there is a whitespace character at the max length boundary", function() {
          return it("wraps the line at the first non-whitespace character following the boundary", function() {
            expect(displayBuffer.tokenizedLineForScreenRow(3).text).toBe('    var pivot = items.shift(), current, left = [], ');
            return expect(displayBuffer.tokenizedLineForScreenRow(4).text).toBe('right = [];');
          });
        });
        return describe("when there are hard tabs", function() {
          beforeEach(function() {
            return buffer.setText(buffer.getText().replace(new RegExp('  ', 'g'), '\t'));
          });
          return it("correctly tokenizes the hard tabs", function() {
            expect(displayBuffer.tokenizedLineForScreenRow(3).tokens[0].isHardTab).toBeTruthy();
            return expect(displayBuffer.tokenizedLineForScreenRow(3).tokens[1].isHardTab).toBeTruthy();
          });
        });
      });
      describe("when the buffer changes", function() {
        describe("when buffer lines are updated", function() {
          describe("when whitespace is added after the max line length", function() {
            return it("adds whitespace to the end of the current line and wraps an empty line", function() {
              var fiftyCharacters;
              fiftyCharacters = _.multiplyString("x", 50);
              buffer.setText(fiftyCharacters);
              return buffer.insert([0, 51], " ");
            });
          });
          describe("when the update makes a soft-wrapped line shorter than the max line length", function() {
            return it("rewraps the line and emits a change event", function() {
              var event;
              buffer["delete"]([[6, 24], [6, 42]]);
              expect(displayBuffer.tokenizedLineForScreenRow(7).text).toBe('      current < pivot ?  : right.push(current);');
              expect(displayBuffer.tokenizedLineForScreenRow(8).text).toBe('    }');
              expect(changeHandler).toHaveBeenCalled();
              event = changeHandler.argsForCall[0][0];
              return expect(event).toEqual({
                start: 7,
                end: 8,
                screenDelta: -1,
                bufferDelta: 0
              });
            });
          });
          return describe("when the update causes a line to soft wrap an additional time", function() {
            return it("rewraps the line and emits a change event", function() {
              buffer.insert([6, 28], '1234567890');
              expect(displayBuffer.tokenizedLineForScreenRow(7).text).toBe('      current < pivot ? ');
              expect(displayBuffer.tokenizedLineForScreenRow(8).text).toBe('left1234567890.push(current) : ');
              expect(displayBuffer.tokenizedLineForScreenRow(9).text).toBe('right.push(current);');
              expect(displayBuffer.tokenizedLineForScreenRow(10).text).toBe('    }');
              return expect(changeHandler).toHaveBeenCalledWith({
                start: 7,
                end: 8,
                screenDelta: 1,
                bufferDelta: 0
              });
            });
          });
        });
        describe("when buffer lines are inserted", function() {
          return it("inserts / updates wrapped lines and emits a change event", function() {
            buffer.insert([6, 21], '1234567890 abcdefghij 1234567890\nabcdefghij');
            expect(displayBuffer.tokenizedLineForScreenRow(7).text).toBe('      current < pivot1234567890 abcdefghij ');
            expect(displayBuffer.tokenizedLineForScreenRow(8).text).toBe('1234567890');
            expect(displayBuffer.tokenizedLineForScreenRow(9).text).toBe('abcdefghij ? left.push(current) : ');
            expect(displayBuffer.tokenizedLineForScreenRow(10).text).toBe('right.push(current);');
            return expect(changeHandler).toHaveBeenCalledWith({
              start: 7,
              end: 8,
              screenDelta: 2,
              bufferDelta: 1
            });
          });
        });
        describe("when buffer lines are removed", function() {
          return it("removes lines and emits a change event", function() {
            buffer.setTextInRange([[3, 21], [7, 5]], ';');
            expect(displayBuffer.tokenizedLineForScreenRow(3).text).toBe('    var pivot = items;');
            expect(displayBuffer.tokenizedLineForScreenRow(4).text).toBe('    return ');
            expect(displayBuffer.tokenizedLineForScreenRow(5).text).toBe('sort(left).concat(pivot).concat(sort(right));');
            expect(displayBuffer.tokenizedLineForScreenRow(6).text).toBe('  };');
            return expect(changeHandler).toHaveBeenCalledWith({
              start: 3,
              end: 9,
              screenDelta: -6,
              bufferDelta: -4
            });
          });
        });
        return describe("when a newline is inserted, deleted, and re-inserted at the end of a wrapped line (regression)", function() {
          return it("correctly renders the original wrapped line", function() {
            buffer = atom.project.buildBufferSync(null, '');
            displayBuffer = new DisplayBuffer({
              buffer: buffer,
              tabLength: tabLength,
              editorWidthInChars: 30,
              softWrapped: true
            });
            buffer.insert([0, 0], "the quick brown fox jumps over the lazy dog.");
            buffer.insert([0, Infinity], '\n');
            buffer["delete"]([[0, Infinity], [1, 0]]);
            buffer.insert([0, Infinity], '\n');
            expect(displayBuffer.tokenizedLineForScreenRow(0).text).toBe("the quick brown fox jumps over ");
            expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe("the lazy dog.");
            return expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe("");
          });
        });
      });
      describe("position translation", function() {
        return it("translates positions accounting for wrapped lines", function() {
          expect(displayBuffer.screenPositionForBufferPosition([0, 5])).toEqual([0, 5]);
          expect(displayBuffer.bufferPositionForScreenPosition([0, 5])).toEqual([0, 5]);
          expect(displayBuffer.screenPositionForBufferPosition([0, 29])).toEqual([0, 29]);
          expect(displayBuffer.bufferPositionForScreenPosition([0, 29])).toEqual([0, 29]);
          expect(displayBuffer.screenPositionForBufferPosition([3, 5])).toEqual([3, 5]);
          expect(displayBuffer.bufferPositionForScreenPosition([3, 5])).toEqual([3, 5]);
          expect(displayBuffer.screenPositionForBufferPosition([3, 50])).toEqual([3, 50]);
          expect(displayBuffer.screenPositionForBufferPosition([3, 51])).toEqual([3, 50]);
          expect(displayBuffer.bufferPositionForScreenPosition([4, 0])).toEqual([3, 51]);
          expect(displayBuffer.bufferPositionForScreenPosition([3, 50])).toEqual([3, 50]);
          expect(displayBuffer.screenPositionForBufferPosition([3, 62])).toEqual([4, 11]);
          expect(displayBuffer.bufferPositionForScreenPosition([4, 11])).toEqual([3, 62]);
          expect(displayBuffer.screenPositionForBufferPosition([4, 5])).toEqual([5, 5]);
          expect(displayBuffer.bufferPositionForScreenPosition([5, 5])).toEqual([4, 5]);
          expect(displayBuffer.bufferPositionForScreenPosition([-5, -5])).toEqual([0, 0]);
          expect(displayBuffer.bufferPositionForScreenPosition([Infinity, Infinity])).toEqual([12, 2]);
          expect(displayBuffer.bufferPositionForScreenPosition([3, -5])).toEqual([3, 0]);
          return expect(displayBuffer.bufferPositionForScreenPosition([3, Infinity])).toEqual([3, 50]);
        });
      });
      describe(".setEditorWidthInChars(length)", function() {
        it("changes the length at which lines are wrapped and emits a change event for all screen lines", function() {
          displayBuffer.setEditorWidthInChars(40);
          expect(tokensText(displayBuffer.tokenizedLineForScreenRow(4).tokens)).toBe('left = [], right = [];');
          expect(tokensText(displayBuffer.tokenizedLineForScreenRow(5).tokens)).toBe('    while(items.length > 0) {');
          expect(tokensText(displayBuffer.tokenizedLineForScreenRow(12).tokens)).toBe('sort(left).concat(pivot).concat(sort(rig');
          return expect(changeHandler).toHaveBeenCalledWith({
            start: 0,
            end: 15,
            screenDelta: 3,
            bufferDelta: 0
          });
        });
        return it("only allows positive widths to be assigned", function() {
          displayBuffer.setEditorWidthInChars(0);
          expect(displayBuffer.editorWidthInChars).not.toBe(0);
          displayBuffer.setEditorWidthInChars(-1);
          return expect(displayBuffer.editorWidthInChars).not.toBe(-1);
        });
      });
      return it("sets ::scrollLeft to 0 and keeps it there when soft wrapping is enabled", function() {
        displayBuffer.setDefaultCharWidth(10);
        displayBuffer.setWidth(50);
        displayBuffer.manageScrollPosition = true;
        displayBuffer.setSoftWrapped(false);
        displayBuffer.setScrollLeft(Infinity);
        expect(displayBuffer.getScrollLeft()).toBeGreaterThan(0);
        displayBuffer.setSoftWrapped(true);
        expect(displayBuffer.getScrollLeft()).toBe(0);
        displayBuffer.setScrollLeft(10);
        return expect(displayBuffer.getScrollLeft()).toBe(0);
      });
    });
    describe("primitive folding", function() {
      beforeEach(function() {
        displayBuffer.destroy();
        buffer.release();
        buffer = atom.project.bufferForPathSync('two-hundred.txt');
        displayBuffer = new DisplayBuffer({
          buffer: buffer,
          tabLength: tabLength
        });
        return displayBuffer.onDidChange(changeHandler);
      });
      describe("when folds are created and destroyed", function() {
        describe("when a fold spans multiple lines", function() {
          return it("replaces the lines spanned by the fold with a placeholder that references the fold object", function() {
            var fold, line4, line5, _ref1, _ref2;
            fold = displayBuffer.createFold(4, 7);
            expect(fold).toBeDefined();
            _ref1 = displayBuffer.tokenizedLinesForScreenRows(4, 5), line4 = _ref1[0], line5 = _ref1[1];
            expect(line4.fold).toBe(fold);
            expect(line4.text).toMatch(/^4-+/);
            expect(line5.text).toBe('8');
            expect(changeHandler).toHaveBeenCalledWith({
              start: 4,
              end: 7,
              screenDelta: -3,
              bufferDelta: 0
            });
            changeHandler.reset();
            fold.destroy();
            _ref2 = displayBuffer.tokenizedLinesForScreenRows(4, 5), line4 = _ref2[0], line5 = _ref2[1];
            expect(line4.fold).toBeUndefined();
            expect(line4.text).toMatch(/^4-+/);
            expect(line5.text).toBe('5');
            return expect(changeHandler).toHaveBeenCalledWith({
              start: 4,
              end: 4,
              screenDelta: 3,
              bufferDelta: 0
            });
          });
        });
        describe("when a fold spans a single line", function() {
          return it("renders a fold placeholder for the folded line but does not skip any lines", function() {
            var fold, line4, line5, _ref1, _ref2;
            fold = displayBuffer.createFold(4, 4);
            _ref1 = displayBuffer.tokenizedLinesForScreenRows(4, 5), line4 = _ref1[0], line5 = _ref1[1];
            expect(line4.fold).toBe(fold);
            expect(line4.text).toMatch(/^4-+/);
            expect(line5.text).toBe('5');
            expect(changeHandler).toHaveBeenCalledWith({
              start: 4,
              end: 4,
              screenDelta: 0,
              bufferDelta: 0
            });
            changeHandler.reset();
            fold.destroy();
            _ref2 = displayBuffer.tokenizedLinesForScreenRows(4, 5), line4 = _ref2[0], line5 = _ref2[1];
            expect(line4.fold).toBeUndefined();
            expect(line4.text).toMatch(/^4-+/);
            expect(line5.text).toBe('5');
            return expect(changeHandler).toHaveBeenCalledWith({
              start: 4,
              end: 4,
              screenDelta: 0,
              bufferDelta: 0
            });
          });
        });
        describe("when a fold is nested within another fold", function() {
          it("does not render the placeholder for the inner fold until the outer fold is destroyed", function() {
            var innerFold, line4, line5, line6, line7, outerFold, _ref1, _ref2;
            innerFold = displayBuffer.createFold(6, 7);
            outerFold = displayBuffer.createFold(4, 8);
            _ref1 = displayBuffer.tokenizedLinesForScreenRows(4, 5), line4 = _ref1[0], line5 = _ref1[1];
            expect(line4.fold).toBe(outerFold);
            expect(line4.text).toMatch(/4-+/);
            expect(line5.text).toMatch(/9-+/);
            outerFold.destroy();
            _ref2 = displayBuffer.tokenizedLinesForScreenRows(4, 7), line4 = _ref2[0], line5 = _ref2[1], line6 = _ref2[2], line7 = _ref2[3];
            expect(line4.fold).toBeUndefined();
            expect(line4.text).toMatch(/^4-+/);
            expect(line5.text).toBe('5');
            expect(line6.fold).toBe(innerFold);
            expect(line6.text).toBe('6');
            return expect(line7.text).toBe('8');
          });
          return it("allows the outer fold to start at the same location as the inner fold", function() {
            var innerFold, line4, line5, outerFold, _ref1;
            innerFold = displayBuffer.createFold(4, 6);
            outerFold = displayBuffer.createFold(4, 8);
            _ref1 = displayBuffer.tokenizedLinesForScreenRows(4, 5), line4 = _ref1[0], line5 = _ref1[1];
            expect(line4.fold).toBe(outerFold);
            expect(line4.text).toMatch(/4-+/);
            return expect(line5.text).toMatch(/9-+/);
          });
        });
        describe("when creating a fold where one already exists", function() {
          return it("returns existing fold and does't create new fold", function() {
            var fold, newFold;
            fold = displayBuffer.createFold(0, 10);
            expect(displayBuffer.findMarkers({
              "class": 'fold'
            }).length).toBe(1);
            newFold = displayBuffer.createFold(0, 10);
            expect(newFold).toBe(fold);
            return expect(displayBuffer.findMarkers({
              "class": 'fold'
            }).length).toBe(1);
          });
        });
        describe("when a fold is created inside an existing folded region", function() {
          return it("creates/destroys the fold, but does not trigger change event", function() {
            var innerFold, line0, line1, outerFold, _ref1, _ref2;
            outerFold = displayBuffer.createFold(0, 10);
            changeHandler.reset();
            innerFold = displayBuffer.createFold(2, 5);
            expect(changeHandler).not.toHaveBeenCalled();
            _ref1 = displayBuffer.tokenizedLinesForScreenRows(0, 1), line0 = _ref1[0], line1 = _ref1[1];
            expect(line0.fold).toBe(outerFold);
            expect(line1.fold).toBeUndefined();
            changeHandler.reset();
            innerFold.destroy();
            expect(changeHandler).not.toHaveBeenCalled();
            _ref2 = displayBuffer.tokenizedLinesForScreenRows(0, 1), line0 = _ref2[0], line1 = _ref2[1];
            expect(line0.fold).toBe(outerFold);
            return expect(line1.fold).toBeUndefined();
          });
        });
        describe("when a fold ends where another fold begins", function() {
          return it("continues to hide the lines inside the second fold", function() {
            var fold1, fold2;
            fold2 = displayBuffer.createFold(4, 9);
            fold1 = displayBuffer.createFold(0, 4);
            expect(displayBuffer.tokenizedLineForScreenRow(0).text).toMatch(/^0/);
            return expect(displayBuffer.tokenizedLineForScreenRow(1).text).toMatch(/^10/);
          });
        });
        return describe("when there is another display buffer pointing to the same buffer", function() {
          return it("does not create folds in the other display buffer", function() {
            var otherDisplayBuffer;
            otherDisplayBuffer = new DisplayBuffer({
              buffer: buffer,
              tabLength: tabLength
            });
            displayBuffer.createFold(2, 4);
            return expect(otherDisplayBuffer.foldsStartingAtBufferRow(2).length).toBe(0);
          });
        });
      });
      describe("when the buffer changes", function() {
        var fold1, fold2, _ref1;
        _ref1 = [], fold1 = _ref1[0], fold2 = _ref1[1];
        beforeEach(function() {
          fold1 = displayBuffer.createFold(2, 4);
          fold2 = displayBuffer.createFold(6, 8);
          return changeHandler.reset();
        });
        describe("when the old range surrounds a fold", function() {
          beforeEach(function() {
            return buffer.setTextInRange([[1, 0], [5, 1]], 'party!');
          });
          it("removes the fold and replaces the selection with the new text", function() {
            expect(displayBuffer.tokenizedLineForScreenRow(0).text).toBe("0");
            expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe("party!");
            expect(displayBuffer.tokenizedLineForScreenRow(2).fold).toBe(fold2);
            expect(displayBuffer.tokenizedLineForScreenRow(3).text).toMatch(/^9-+/);
            return expect(changeHandler).toHaveBeenCalledWith({
              start: 1,
              end: 3,
              screenDelta: -2,
              bufferDelta: -4
            });
          });
          return describe("when the changes is subsequently undone", function() {
            return xit("restores destroyed folds", function() {
              buffer.undo();
              expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe('2');
              expect(displayBuffer.tokenizedLineForScreenRow(2).fold).toBe(fold1);
              return expect(displayBuffer.tokenizedLineForScreenRow(3).text).toBe('5');
            });
          });
        });
        describe("when the old range surrounds two nested folds", function() {
          return it("removes both folds and replaces the selection with the new text", function() {
            displayBuffer.createFold(2, 9);
            changeHandler.reset();
            buffer.setTextInRange([[1, 0], [10, 0]], 'goodbye');
            expect(displayBuffer.tokenizedLineForScreenRow(0).text).toBe("0");
            expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe("goodbye10");
            expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe("11");
            return expect(changeHandler).toHaveBeenCalledWith({
              start: 1,
              end: 3,
              screenDelta: -2,
              bufferDelta: -9
            });
          });
        });
        describe("when multiple changes happen above the fold", function() {
          return it("repositions folds correctly", function() {
            buffer["delete"]([[1, 1], [2, 0]]);
            buffer.insert([0, 1], "\nnew");
            expect(fold1.getStartRow()).toBe(2);
            return expect(fold1.getEndRow()).toBe(4);
          });
        });
        describe("when the old range precedes lines with a fold", function() {
          return describe("when the new range precedes lines with a fold", function() {
            return it("updates the buffer and re-positions subsequent folds", function() {
              buffer.setTextInRange([[0, 0], [1, 1]], 'abc');
              expect(displayBuffer.tokenizedLineForScreenRow(0).text).toBe("abc");
              expect(displayBuffer.tokenizedLineForScreenRow(1).fold).toBe(fold1);
              expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe("5");
              expect(displayBuffer.tokenizedLineForScreenRow(3).fold).toBe(fold2);
              expect(displayBuffer.tokenizedLineForScreenRow(4).text).toMatch(/^9-+/);
              expect(changeHandler).toHaveBeenCalledWith({
                start: 0,
                end: 1,
                screenDelta: -1,
                bufferDelta: -1
              });
              changeHandler.reset();
              fold1.destroy();
              expect(displayBuffer.tokenizedLineForScreenRow(0).text).toBe("abc");
              expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe("2");
              expect(displayBuffer.tokenizedLineForScreenRow(3).text).toMatch(/^4-+/);
              expect(displayBuffer.tokenizedLineForScreenRow(4).text).toBe("5");
              expect(displayBuffer.tokenizedLineForScreenRow(5).fold).toBe(fold2);
              expect(displayBuffer.tokenizedLineForScreenRow(6).text).toMatch(/^9-+/);
              return expect(changeHandler).toHaveBeenCalledWith({
                start: 1,
                end: 1,
                screenDelta: 2,
                bufferDelta: 0
              });
            });
          });
        });
        describe("when the old range straddles the beginning of a fold", function() {
          return it("destroys the fold", function() {
            buffer.setTextInRange([[1, 1], [3, 0]], "a\nb\nc\nd\n");
            expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe('1a');
            expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe('b');
            expect(displayBuffer.tokenizedLineForScreenRow(2).fold).toBeUndefined();
            return expect(displayBuffer.tokenizedLineForScreenRow(3).text).toBe('c');
          });
        });
        describe("when the old range follows a fold", function() {
          return it("re-positions the screen ranges for the change event based on the preceding fold", function() {
            buffer.setTextInRange([[10, 0], [11, 0]], 'abc');
            expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe("1");
            expect(displayBuffer.tokenizedLineForScreenRow(2).fold).toBe(fold1);
            expect(displayBuffer.tokenizedLineForScreenRow(3).text).toBe("5");
            expect(displayBuffer.tokenizedLineForScreenRow(4).fold).toBe(fold2);
            expect(displayBuffer.tokenizedLineForScreenRow(5).text).toMatch(/^9-+/);
            return expect(changeHandler).toHaveBeenCalledWith({
              start: 6,
              end: 7,
              screenDelta: -1,
              bufferDelta: -1
            });
          });
        });
        describe("when the old range is inside a fold", function() {
          describe("when the end of the new range precedes the end of the fold", function() {
            return it("updates the fold and ensures the change is present when the fold is destroyed", function() {
              buffer.insert([3, 0], '\n');
              expect(fold1.getStartRow()).toBe(2);
              expect(fold1.getEndRow()).toBe(5);
              expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe("1");
              expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe("2");
              expect(displayBuffer.tokenizedLineForScreenRow(2).fold).toBe(fold1);
              expect(displayBuffer.tokenizedLineForScreenRow(3).text).toMatch("5");
              expect(displayBuffer.tokenizedLineForScreenRow(4).fold).toBe(fold2);
              expect(displayBuffer.tokenizedLineForScreenRow(5).text).toMatch(/^9-+/);
              return expect(changeHandler).toHaveBeenCalledWith({
                start: 2,
                end: 2,
                screenDelta: 0,
                bufferDelta: 1
              });
            });
          });
          return describe("when the end of the new range exceeds the end of the fold", function() {
            return it("expands the fold to contain all the inserted lines", function() {
              buffer.setTextInRange([[3, 0], [4, 0]], 'a\nb\nc\nd\n');
              expect(fold1.getStartRow()).toBe(2);
              expect(fold1.getEndRow()).toBe(7);
              expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe("1");
              expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe("2");
              expect(displayBuffer.tokenizedLineForScreenRow(2).fold).toBe(fold1);
              expect(displayBuffer.tokenizedLineForScreenRow(3).text).toMatch("5");
              expect(displayBuffer.tokenizedLineForScreenRow(4).fold).toBe(fold2);
              expect(displayBuffer.tokenizedLineForScreenRow(5).text).toMatch(/^9-+/);
              return expect(changeHandler).toHaveBeenCalledWith({
                start: 2,
                end: 2,
                screenDelta: 0,
                bufferDelta: 3
              });
            });
          });
        });
        describe("when the old range straddles the end of the fold", function() {
          return describe("when the end of the new range precedes the end of the fold", function() {
            return it("destroys the fold", function() {
              fold2.destroy();
              buffer.setTextInRange([[3, 0], [6, 0]], 'a\n');
              expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe('2');
              expect(displayBuffer.tokenizedLineForScreenRow(2).fold).toBeUndefined();
              expect(displayBuffer.tokenizedLineForScreenRow(3).text).toBe('a');
              return expect(displayBuffer.tokenizedLineForScreenRow(4).text).toBe('6');
            });
          });
        });
        describe("when the old range is contained to a single line in-between two folds", function() {
          return it("re-renders the line with the placeholder and re-positions the second fold", function() {
            buffer.insert([5, 0], 'abc\n');
            expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe("1");
            expect(displayBuffer.tokenizedLineForScreenRow(2).fold).toBe(fold1);
            expect(displayBuffer.tokenizedLineForScreenRow(3).text).toMatch("abc");
            expect(displayBuffer.tokenizedLineForScreenRow(4).text).toBe("5");
            expect(displayBuffer.tokenizedLineForScreenRow(5).fold).toBe(fold2);
            expect(displayBuffer.tokenizedLineForScreenRow(6).text).toMatch(/^9-+/);
            return expect(changeHandler).toHaveBeenCalledWith({
              start: 3,
              end: 3,
              screenDelta: 1,
              bufferDelta: 1
            });
          });
        });
        return describe("when the change starts at the beginning of a fold but does not extend to the end (regression)", function() {
          return it("preserves a proper mapping between buffer and screen coordinates", function() {
            expect(displayBuffer.screenPositionForBufferPosition([8, 0])).toEqual([4, 0]);
            buffer.setTextInRange([[2, 0], [3, 0]], "\n");
            return expect(displayBuffer.screenPositionForBufferPosition([8, 0])).toEqual([4, 0]);
          });
        });
      });
      describe("position translation", function() {
        return it("translates positions to account for folded lines and characters and the placeholder", function() {
          var fold;
          fold = displayBuffer.createFold(4, 7);
          expect(displayBuffer.screenPositionForBufferPosition([3, 0])).toEqual([3, 0]);
          expect(displayBuffer.screenPositionForBufferPosition([4, 0])).toEqual([4, 0]);
          expect(displayBuffer.bufferPositionForScreenPosition([3, 0])).toEqual([3, 0]);
          expect(displayBuffer.bufferPositionForScreenPosition([4, 0])).toEqual([4, 0]);
          expect(displayBuffer.screenPositionForBufferPosition([4, 35])).toEqual([4, 0]);
          expect(displayBuffer.screenPositionForBufferPosition([5, 5])).toEqual([4, 0]);
          expect(displayBuffer.screenPositionForBufferPosition([8, 0])).toEqual([5, 0]);
          expect(displayBuffer.screenPositionForBufferPosition([11, 2])).toEqual([8, 2]);
          expect(displayBuffer.bufferPositionForScreenPosition([5, 0])).toEqual([8, 0]);
          expect(displayBuffer.bufferPositionForScreenPosition([9, 2])).toEqual([12, 2]);
          expect(displayBuffer.bufferPositionForScreenPosition([-5, -5])).toEqual([0, 0]);
          expect(displayBuffer.bufferPositionForScreenPosition([Infinity, Infinity])).toEqual([200, 0]);
          fold.destroy();
          expect(displayBuffer.screenPositionForBufferPosition([8, 0])).toEqual([8, 0]);
          expect(displayBuffer.screenPositionForBufferPosition([11, 2])).toEqual([11, 2]);
          expect(displayBuffer.bufferPositionForScreenPosition([5, 0])).toEqual([5, 0]);
          return expect(displayBuffer.bufferPositionForScreenPosition([9, 2])).toEqual([9, 2]);
        });
      });
      describe(".unfoldBufferRow(row)", function() {
        return it("destroys all folds containing the given row", function() {
          displayBuffer.createFold(2, 4);
          displayBuffer.createFold(2, 6);
          displayBuffer.createFold(7, 8);
          displayBuffer.createFold(1, 9);
          displayBuffer.createFold(11, 12);
          expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe('1');
          expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe('10');
          displayBuffer.unfoldBufferRow(2);
          expect(displayBuffer.tokenizedLineForScreenRow(1).text).toBe('1');
          expect(displayBuffer.tokenizedLineForScreenRow(2).text).toBe('2');
          expect(displayBuffer.tokenizedLineForScreenRow(7).fold).toBeDefined();
          expect(displayBuffer.tokenizedLineForScreenRow(8).text).toMatch(/^9-+/);
          return expect(displayBuffer.tokenizedLineForScreenRow(10).fold).toBeDefined();
        });
      });
      return describe(".outermostFoldsInBufferRowRange(startRow, endRow)", function() {
        return it("returns the outermost folds entirely contained in the given row range, exclusive of end row", function() {
          var fold1, fold2, fold3, fold4, fold5;
          fold1 = displayBuffer.createFold(4, 7);
          fold2 = displayBuffer.createFold(5, 6);
          fold3 = displayBuffer.createFold(11, 15);
          fold4 = displayBuffer.createFold(12, 13);
          fold5 = displayBuffer.createFold(16, 17);
          expect(displayBuffer.outermostFoldsInBufferRowRange(3, 18)).toEqual([fold1, fold3, fold5]);
          return expect(displayBuffer.outermostFoldsInBufferRowRange(5, 16)).toEqual([fold3]);
        });
      });
    });
    describe("::clipScreenPosition(screenPosition, wrapBeyondNewlines: false, wrapAtSoftNewlines: false, skipAtomicTokens: false)", function() {
      beforeEach(function() {
        displayBuffer.setSoftWrapped(true);
        return displayBuffer.setEditorWidthInChars(50);
      });
      it("allows valid positions", function() {
        expect(displayBuffer.clipScreenPosition([4, 5])).toEqual([4, 5]);
        return expect(displayBuffer.clipScreenPosition([4, 11])).toEqual([4, 11]);
      });
      it("disallows negative positions", function() {
        expect(displayBuffer.clipScreenPosition([-1, -1])).toEqual([0, 0]);
        expect(displayBuffer.clipScreenPosition([-1, 10])).toEqual([0, 0]);
        return expect(displayBuffer.clipScreenPosition([0, -1])).toEqual([0, 0]);
      });
      it("disallows positions beyond the last row", function() {
        expect(displayBuffer.clipScreenPosition([1000, 0])).toEqual([15, 2]);
        return expect(displayBuffer.clipScreenPosition([1000, 1000])).toEqual([15, 2]);
      });
      describe("when wrapBeyondNewlines is false (the default)", function() {
        return it("wraps positions beyond the end of hard newlines to the end of the line", function() {
          expect(displayBuffer.clipScreenPosition([1, 10000])).toEqual([1, 30]);
          expect(displayBuffer.clipScreenPosition([4, 30])).toEqual([4, 11]);
          return expect(displayBuffer.clipScreenPosition([4, 1000])).toEqual([4, 11]);
        });
      });
      describe("when wrapBeyondNewlines is true", function() {
        it("wraps positions past the end of hard newlines to the next line", function() {
          expect(displayBuffer.clipScreenPosition([0, 29], {
            wrapBeyondNewlines: true
          })).toEqual([0, 29]);
          expect(displayBuffer.clipScreenPosition([0, 30], {
            wrapBeyondNewlines: true
          })).toEqual([1, 0]);
          return expect(displayBuffer.clipScreenPosition([0, 1000], {
            wrapBeyondNewlines: true
          })).toEqual([1, 0]);
        });
        return it("wraps positions in the middle of fold lines to the next screen line", function() {
          displayBuffer.createFold(3, 5);
          return expect(displayBuffer.clipScreenPosition([3, 5], {
            wrapBeyondNewlines: true
          })).toEqual([4, 0]);
        });
      });
      describe("when wrapAtSoftNewlines is false (the default)", function() {
        return it("clips positions at the end of soft-wrapped lines to the character preceding the end of the line", function() {
          expect(displayBuffer.clipScreenPosition([3, 50])).toEqual([3, 50]);
          expect(displayBuffer.clipScreenPosition([3, 51])).toEqual([3, 50]);
          expect(displayBuffer.clipScreenPosition([3, 58])).toEqual([3, 50]);
          return expect(displayBuffer.clipScreenPosition([3, 1000])).toEqual([3, 50]);
        });
      });
      describe("when wrapAtSoftNewlines is true", function() {
        return it("wraps positions at the end of soft-wrapped lines to the next screen line", function() {
          expect(displayBuffer.clipScreenPosition([3, 50], {
            wrapAtSoftNewlines: true
          })).toEqual([3, 50]);
          expect(displayBuffer.clipScreenPosition([3, 51], {
            wrapAtSoftNewlines: true
          })).toEqual([4, 0]);
          expect(displayBuffer.clipScreenPosition([3, 58], {
            wrapAtSoftNewlines: true
          })).toEqual([4, 0]);
          return expect(displayBuffer.clipScreenPosition([3, 1000], {
            wrapAtSoftNewlines: true
          })).toEqual([4, 0]);
        });
      });
      describe("when skipAtomicTokens is false (the default)", function() {
        return it("clips screen positions in the middle of atomic tab characters to the beginning of the character", function() {
          buffer.insert([0, 0], '\t');
          expect(displayBuffer.clipScreenPosition([0, 0])).toEqual([0, 0]);
          expect(displayBuffer.clipScreenPosition([0, 1])).toEqual([0, 0]);
          return expect(displayBuffer.clipScreenPosition([0, tabLength])).toEqual([0, tabLength]);
        });
      });
      return describe("when skipAtomicTokens is true", function() {
        return it("clips screen positions in the middle of atomic tab characters to the end of the character", function() {
          buffer.insert([0, 0], '\t');
          expect(displayBuffer.clipScreenPosition([0, 0], {
            skipAtomicTokens: true
          })).toEqual([0, 0]);
          expect(displayBuffer.clipScreenPosition([0, 1], {
            skipAtomicTokens: true
          })).toEqual([0, tabLength]);
          return expect(displayBuffer.clipScreenPosition([0, tabLength], {
            skipAtomicTokens: true
          })).toEqual([0, tabLength]);
        });
      });
    });
    describe("::screenPositionForBufferPosition(bufferPosition, options)", function() {
      return it("clips the specified buffer position", function() {
        expect(displayBuffer.screenPositionForBufferPosition([0, 2])).toEqual([0, 2]);
        expect(displayBuffer.screenPositionForBufferPosition([0, 100000])).toEqual([0, 29]);
        expect(displayBuffer.screenPositionForBufferPosition([100000, 0])).toEqual([12, 2]);
        return expect(displayBuffer.screenPositionForBufferPosition([100000, 100000])).toEqual([12, 2]);
      });
    });
    describe("position translation in the presence of hard tabs", function() {
      it("correctly translates positions on either side of a tab", function() {
        buffer.setText('\t');
        expect(displayBuffer.screenPositionForBufferPosition([0, 1])).toEqual([0, 2]);
        return expect(displayBuffer.bufferPositionForScreenPosition([0, 2])).toEqual([0, 1]);
      });
      return it("correctly translates positions on soft wrapped lines containing tabs", function() {
        buffer.setText('\t\taa  bb  cc  dd  ee  ff  gg');
        displayBuffer.setSoftWrapped(true);
        displayBuffer.setEditorWidthInChars(10);
        expect(displayBuffer.screenPositionForBufferPosition([0, 10], {
          wrapAtSoftNewlines: true
        })).toEqual([1, 0]);
        return expect(displayBuffer.bufferPositionForScreenPosition([1, 0])).toEqual([0, 10]);
      });
    });
    describe("::getMaxLineLength()", function() {
      it("returns the length of the longest screen line", function() {
        expect(displayBuffer.getMaxLineLength()).toBe(65);
        buffer["delete"]([[6, 0], [6, 65]]);
        return expect(displayBuffer.getMaxLineLength()).toBe(62);
      });
      return it("correctly updates the location of the longest screen line when changes occur", function() {
        expect(displayBuffer.getLongestScreenRow()).toBe(6);
        buffer["delete"]([[0, 0], [2, 0]]);
        expect(displayBuffer.getLongestScreenRow()).toBe(4);
        buffer["delete"]([[4, 0], [5, 0]]);
        expect(displayBuffer.getLongestScreenRow()).toBe(1);
        expect(displayBuffer.getMaxLineLength()).toBe(62);
        buffer["delete"]([[2, 0], [4, 0]]);
        expect(displayBuffer.getLongestScreenRow()).toBe(1);
        return expect(displayBuffer.getMaxLineLength()).toBe(62);
      });
    });
    describe("::destroy()", function() {
      return it("unsubscribes all display buffer markers from their underlying buffer marker (regression)", function() {
        var marker;
        marker = displayBuffer.markBufferPosition([12, 2]);
        displayBuffer.destroy();
        expect(marker.bufferMarker.getSubscriptionCount()).toBe(0);
        return expect(function() {
          return buffer.insert([12, 2], '\n');
        }).not.toThrow();
      });
    });
    describe("markers", function() {
      beforeEach(function() {
        return displayBuffer.createFold(4, 7);
      });
      describe("marker creation and manipulation", function() {
        it("allows markers to be created in terms of both screen and buffer coordinates", function() {
          var marker1, marker2;
          marker1 = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          marker2 = displayBuffer.markBufferRange([[8, 4], [8, 10]]);
          expect(marker1.getBufferRange()).toEqual([[8, 4], [8, 10]]);
          return expect(marker2.getScreenRange()).toEqual([[5, 4], [5, 10]]);
        });
        it("emits a 'marker-created' event on the DisplayBuffer whenever a marker is created", function() {
          var marker1, marker2, markerCreatedHandler;
          displayBuffer.onDidCreateMarker(markerCreatedHandler = jasmine.createSpy("markerCreatedHandler"));
          marker1 = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          expect(markerCreatedHandler).toHaveBeenCalledWith(marker1);
          markerCreatedHandler.reset();
          marker2 = buffer.markRange([[5, 4], [5, 10]]);
          return expect(markerCreatedHandler).toHaveBeenCalledWith(displayBuffer.getMarker(marker2.id));
        });
        it("allows marker head and tail positions to be manipulated in both screen and buffer coordinates", function() {
          var marker;
          marker = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          marker.setHeadScreenPosition([5, 4]);
          marker.setTailBufferPosition([5, 4]);
          expect(marker.isReversed()).toBeFalsy();
          expect(marker.getBufferRange()).toEqual([[5, 4], [8, 4]]);
          marker.setHeadBufferPosition([5, 4]);
          marker.setTailScreenPosition([5, 4]);
          expect(marker.isReversed()).toBeTruthy();
          return expect(marker.getBufferRange()).toEqual([[5, 4], [8, 4]]);
        });
        return it("returns whether a position changed when it is assigned", function() {
          var marker;
          marker = displayBuffer.markScreenRange([[0, 0], [0, 0]]);
          expect(marker.setHeadScreenPosition([5, 4])).toBeTruthy();
          expect(marker.setHeadScreenPosition([5, 4])).toBeFalsy();
          expect(marker.setHeadBufferPosition([1, 0])).toBeTruthy();
          expect(marker.setHeadBufferPosition([1, 0])).toBeFalsy();
          expect(marker.setTailScreenPosition([5, 4])).toBeTruthy();
          expect(marker.setTailScreenPosition([5, 4])).toBeFalsy();
          expect(marker.setTailBufferPosition([1, 0])).toBeTruthy();
          return expect(marker.setTailBufferPosition([1, 0])).toBeFalsy();
        });
      });
      describe("marker change events", function() {
        var marker, markerChangedHandler, _ref1;
        _ref1 = [], markerChangedHandler = _ref1[0], marker = _ref1[1];
        beforeEach(function() {
          marker = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          return marker.onDidChange(markerChangedHandler = jasmine.createSpy("markerChangedHandler"));
        });
        it("triggers the 'changed' event whenever the markers head's screen position changes in the buffer or on screen", function() {
          marker.setHeadScreenPosition([8, 20]);
          expect(markerChangedHandler).toHaveBeenCalled();
          expect(markerChangedHandler.argsForCall[0][0]).toEqual({
            oldHeadScreenPosition: [5, 10],
            oldHeadBufferPosition: [8, 10],
            newHeadScreenPosition: [8, 20],
            newHeadBufferPosition: [11, 20],
            oldTailScreenPosition: [5, 4],
            oldTailBufferPosition: [8, 4],
            newTailScreenPosition: [5, 4],
            newTailBufferPosition: [8, 4],
            textChanged: false,
            isValid: true
          });
          markerChangedHandler.reset();
          buffer.insert([11, 0], '...');
          expect(markerChangedHandler).toHaveBeenCalled();
          expect(markerChangedHandler.argsForCall[0][0]).toEqual({
            oldHeadScreenPosition: [8, 20],
            oldHeadBufferPosition: [11, 20],
            newHeadScreenPosition: [8, 23],
            newHeadBufferPosition: [11, 23],
            oldTailScreenPosition: [5, 4],
            oldTailBufferPosition: [8, 4],
            newTailScreenPosition: [5, 4],
            newTailBufferPosition: [8, 4],
            textChanged: true,
            isValid: true
          });
          markerChangedHandler.reset();
          displayBuffer.unfoldBufferRow(4);
          expect(markerChangedHandler).toHaveBeenCalled();
          expect(markerChangedHandler.argsForCall[0][0]).toEqual({
            oldHeadScreenPosition: [8, 23],
            oldHeadBufferPosition: [11, 23],
            newHeadScreenPosition: [11, 23],
            newHeadBufferPosition: [11, 23],
            oldTailScreenPosition: [5, 4],
            oldTailBufferPosition: [8, 4],
            newTailScreenPosition: [8, 4],
            newTailBufferPosition: [8, 4],
            textChanged: false,
            isValid: true
          });
          markerChangedHandler.reset();
          displayBuffer.createFold(4, 7);
          expect(markerChangedHandler).toHaveBeenCalled();
          return expect(markerChangedHandler.argsForCall[0][0]).toEqual({
            oldHeadScreenPosition: [11, 23],
            oldHeadBufferPosition: [11, 23],
            newHeadScreenPosition: [8, 23],
            newHeadBufferPosition: [11, 23],
            oldTailScreenPosition: [8, 4],
            oldTailBufferPosition: [8, 4],
            newTailScreenPosition: [5, 4],
            newTailBufferPosition: [8, 4],
            textChanged: false,
            isValid: true
          });
        });
        it("triggers the 'changed' event whenever the marker tail's position changes in the buffer or on screen", function() {
          marker.setTailScreenPosition([8, 20]);
          expect(markerChangedHandler).toHaveBeenCalled();
          expect(markerChangedHandler.argsForCall[0][0]).toEqual({
            oldHeadScreenPosition: [5, 10],
            oldHeadBufferPosition: [8, 10],
            newHeadScreenPosition: [5, 10],
            newHeadBufferPosition: [8, 10],
            oldTailScreenPosition: [5, 4],
            oldTailBufferPosition: [8, 4],
            newTailScreenPosition: [8, 20],
            newTailBufferPosition: [11, 20],
            textChanged: false,
            isValid: true
          });
          markerChangedHandler.reset();
          buffer.insert([11, 0], '...');
          expect(markerChangedHandler).toHaveBeenCalled();
          return expect(markerChangedHandler.argsForCall[0][0]).toEqual({
            oldHeadScreenPosition: [5, 10],
            oldHeadBufferPosition: [8, 10],
            newHeadScreenPosition: [5, 10],
            newHeadBufferPosition: [8, 10],
            oldTailScreenPosition: [8, 20],
            oldTailBufferPosition: [11, 20],
            newTailScreenPosition: [8, 23],
            newTailBufferPosition: [11, 23],
            textChanged: true,
            isValid: true
          });
        });
        it("triggers the 'changed' event whenever the marker is invalidated or revalidated", function() {
          buffer.deleteRow(8);
          expect(markerChangedHandler).toHaveBeenCalled();
          expect(markerChangedHandler.argsForCall[0][0]).toEqual({
            oldHeadScreenPosition: [5, 10],
            oldHeadBufferPosition: [8, 10],
            newHeadScreenPosition: [5, 0],
            newHeadBufferPosition: [8, 0],
            oldTailScreenPosition: [5, 4],
            oldTailBufferPosition: [8, 4],
            newTailScreenPosition: [5, 0],
            newTailBufferPosition: [8, 0],
            textChanged: true,
            isValid: false
          });
          markerChangedHandler.reset();
          buffer.undo();
          expect(markerChangedHandler).toHaveBeenCalled();
          return expect(markerChangedHandler.argsForCall[0][0]).toEqual({
            oldHeadScreenPosition: [5, 0],
            oldHeadBufferPosition: [8, 0],
            newHeadScreenPosition: [5, 10],
            newHeadBufferPosition: [8, 10],
            oldTailScreenPosition: [5, 0],
            oldTailBufferPosition: [8, 0],
            newTailScreenPosition: [5, 4],
            newTailBufferPosition: [8, 4],
            textChanged: true,
            isValid: true
          });
        });
        it("does not call the callback for screen changes that don't change the position of the marker", function() {
          displayBuffer.createFold(10, 11);
          return expect(markerChangedHandler).not.toHaveBeenCalled();
        });
        it("updates markers before emitting buffer change events, but does not notify their observers until the change event", function() {
          var marker2, marker2ChangedHandler, marker3, marker3ChangedHandler, onDisplayBufferChange;
          marker2 = displayBuffer.markBufferRange([[8, 1], [8, 1]]);
          marker2.onDidChange(marker2ChangedHandler = jasmine.createSpy("marker2ChangedHandler"));
          displayBuffer.onDidChange(changeHandler = jasmine.createSpy("changeHandler").andCallFake(function() {
            return onDisplayBufferChange();
          }));
          onDisplayBufferChange = function() {
            expect(markerChangedHandler).not.toHaveBeenCalled();
            expect(marker2ChangedHandler).not.toHaveBeenCalled();
            expect(marker.getScreenRange()).toEqual([[5, 7], [5, 13]]);
            expect(marker.getHeadScreenPosition()).toEqual([5, 13]);
            expect(marker.getTailScreenPosition()).toEqual([5, 7]);
            return expect(marker2.isValid()).toBeFalsy();
          };
          buffer.setTextInRange([[8, 0], [8, 2]], ".....");
          expect(changeHandler).toHaveBeenCalled();
          expect(markerChangedHandler).toHaveBeenCalled();
          expect(marker2ChangedHandler).toHaveBeenCalled();
          changeHandler.reset();
          markerChangedHandler.reset();
          marker2ChangedHandler.reset();
          marker3 = displayBuffer.markBufferRange([[8, 1], [8, 2]]);
          marker3.onDidChange(marker3ChangedHandler = jasmine.createSpy("marker3ChangedHandler"));
          onDisplayBufferChange = function() {
            expect(markerChangedHandler).not.toHaveBeenCalled();
            expect(marker2ChangedHandler).not.toHaveBeenCalled();
            expect(marker3ChangedHandler).not.toHaveBeenCalled();
            expect(marker.getScreenRange()).toEqual([[5, 4], [5, 10]]);
            expect(marker.getHeadScreenPosition()).toEqual([5, 10]);
            expect(marker.getTailScreenPosition()).toEqual([5, 4]);
            expect(marker2.isValid()).toBeTruthy();
            return expect(marker3.isValid()).toBeFalsy();
          };
          buffer.undo();
          expect(changeHandler).toHaveBeenCalled();
          expect(markerChangedHandler).toHaveBeenCalled();
          expect(marker2ChangedHandler).toHaveBeenCalled();
          expect(marker3ChangedHandler).toHaveBeenCalled();
          changeHandler.reset();
          markerChangedHandler.reset();
          marker2ChangedHandler.reset();
          marker3ChangedHandler.reset();
          onDisplayBufferChange = function() {
            expect(markerChangedHandler).not.toHaveBeenCalled();
            expect(marker2ChangedHandler).not.toHaveBeenCalled();
            expect(marker3ChangedHandler).not.toHaveBeenCalled();
            expect(marker.getScreenRange()).toEqual([[5, 7], [5, 13]]);
            expect(marker.getHeadScreenPosition()).toEqual([5, 13]);
            expect(marker.getTailScreenPosition()).toEqual([5, 7]);
            expect(marker2.isValid()).toBeFalsy();
            return expect(marker3.isValid()).toBeTruthy();
          };
          buffer.redo();
          expect(changeHandler).toHaveBeenCalled();
          expect(markerChangedHandler).toHaveBeenCalled();
          expect(marker2ChangedHandler).toHaveBeenCalled();
          return expect(marker3ChangedHandler).toHaveBeenCalled();
        });
        return it("updates the position of markers before emitting change events that aren't caused by a buffer change", function() {
          displayBuffer.onDidChange(changeHandler = jasmine.createSpy("changeHandler").andCallFake(function() {
            expect(markerChangedHandler).not.toHaveBeenCalled();
            expect(marker.getScreenRange()).toEqual([[8, 4], [8, 10]]);
            expect(marker.getHeadScreenPosition()).toEqual([8, 10]);
            return expect(marker.getTailScreenPosition()).toEqual([8, 4]);
          }));
          displayBuffer.unfoldBufferRow(4);
          expect(changeHandler).toHaveBeenCalled();
          return expect(markerChangedHandler).toHaveBeenCalled();
        });
      });
      describe("::findMarkers(attributes)", function() {
        it("allows the startBufferRow and endBufferRow to be specified", function() {
          var marker1, marker2, marker3;
          marker1 = displayBuffer.markBufferRange([[0, 0], [3, 0]], {
            "class": 'a'
          });
          marker2 = displayBuffer.markBufferRange([[0, 0], [5, 0]], {
            "class": 'a'
          });
          marker3 = displayBuffer.markBufferRange([[9, 0], [10, 0]], {
            "class": 'b'
          });
          expect(displayBuffer.findMarkers({
            "class": 'a',
            startBufferRow: 0
          })).toEqual([marker2, marker1]);
          expect(displayBuffer.findMarkers({
            "class": 'a',
            startBufferRow: 0,
            endBufferRow: 3
          })).toEqual([marker1]);
          return expect(displayBuffer.findMarkers({
            endBufferRow: 10
          })).toEqual([marker3]);
        });
        it("allows the startScreenRow and endScreenRow to be specified", function() {
          var marker1, marker2;
          marker1 = displayBuffer.markBufferRange([[6, 0], [7, 0]], {
            "class": 'a'
          });
          marker2 = displayBuffer.markBufferRange([[9, 0], [10, 0]], {
            "class": 'a'
          });
          displayBuffer.createFold(4, 7);
          return expect(displayBuffer.findMarkers({
            "class": 'a',
            startScreenRow: 6,
            endScreenRow: 7
          })).toEqual([marker2]);
        });
        it("allows intersectsBufferRowRange to be specified", function() {
          var marker1, marker2;
          marker1 = displayBuffer.markBufferRange([[5, 0], [5, 0]], {
            "class": 'a'
          });
          marker2 = displayBuffer.markBufferRange([[8, 0], [8, 0]], {
            "class": 'a'
          });
          displayBuffer.createFold(4, 7);
          return expect(displayBuffer.findMarkers({
            "class": 'a',
            intersectsBufferRowRange: [5, 6]
          })).toEqual([marker1]);
        });
        it("allows intersectsScreenRowRange to be specified", function() {
          var marker1, marker2;
          marker1 = displayBuffer.markBufferRange([[5, 0], [5, 0]], {
            "class": 'a'
          });
          marker2 = displayBuffer.markBufferRange([[8, 0], [8, 0]], {
            "class": 'a'
          });
          displayBuffer.createFold(4, 7);
          return expect(displayBuffer.findMarkers({
            "class": 'a',
            intersectsScreenRowRange: [5, 10]
          })).toEqual([marker2]);
        });
        it("allows containedInScreenRange to be specified", function() {
          var marker1, marker2;
          marker1 = displayBuffer.markBufferRange([[5, 0], [5, 0]], {
            "class": 'a'
          });
          marker2 = displayBuffer.markBufferRange([[8, 0], [8, 0]], {
            "class": 'a'
          });
          displayBuffer.createFold(4, 7);
          return expect(displayBuffer.findMarkers({
            "class": 'a',
            containedInScreenRange: [[5, 0], [7, 0]]
          })).toEqual([marker2]);
        });
        it("allows intersectsBufferRange to be specified", function() {
          var marker1, marker2;
          marker1 = displayBuffer.markBufferRange([[5, 0], [5, 0]], {
            "class": 'a'
          });
          marker2 = displayBuffer.markBufferRange([[8, 0], [8, 0]], {
            "class": 'a'
          });
          displayBuffer.createFold(4, 7);
          return expect(displayBuffer.findMarkers({
            "class": 'a',
            intersectsBufferRange: [[5, 0], [6, 0]]
          })).toEqual([marker1]);
        });
        return it("allows intersectsScreenRange to be specified", function() {
          var marker1, marker2;
          marker1 = displayBuffer.markBufferRange([[5, 0], [5, 0]], {
            "class": 'a'
          });
          marker2 = displayBuffer.markBufferRange([[8, 0], [8, 0]], {
            "class": 'a'
          });
          displayBuffer.createFold(4, 7);
          return expect(displayBuffer.findMarkers({
            "class": 'a',
            intersectsScreenRange: [[5, 0], [10, 0]]
          })).toEqual([marker2]);
        });
      });
      describe("marker destruction", function() {
        it("allows markers to be destroyed", function() {
          var marker;
          marker = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          marker.destroy();
          expect(marker.isValid()).toBeFalsy();
          return expect(displayBuffer.getMarker(marker.id)).toBeUndefined();
        });
        return it("notifies ::onDidDestroy observers when markers are destroyed", function() {
          var destroyedHandler, marker, marker2;
          destroyedHandler = jasmine.createSpy("destroyedHandler");
          marker = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          marker.onDidDestroy(destroyedHandler);
          marker.destroy();
          expect(destroyedHandler).toHaveBeenCalled();
          destroyedHandler.reset();
          marker2 = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          marker2.onDidDestroy(destroyedHandler);
          buffer.getMarker(marker2.id).destroy();
          return expect(destroyedHandler).toHaveBeenCalled();
        });
      });
      describe("Marker::copy(attributes)", function() {
        return it("creates a copy of the marker with the given attributes merged in", function() {
          var initialMarkerCount, marker1, marker2;
          initialMarkerCount = displayBuffer.getMarkerCount();
          marker1 = displayBuffer.markScreenRange([[5, 4], [5, 10]], {
            a: 1,
            b: 2
          });
          expect(displayBuffer.getMarkerCount()).toBe(initialMarkerCount + 1);
          marker2 = marker1.copy({
            b: 3
          });
          expect(marker2.getBufferRange()).toEqual(marker1.getBufferRange());
          expect(displayBuffer.getMarkerCount()).toBe(initialMarkerCount + 2);
          expect(marker1.getProperties()).toEqual({
            a: 1,
            b: 2
          });
          return expect(marker2.getProperties()).toEqual({
            a: 1,
            b: 3
          });
        });
      });
      describe("Marker::getPixelRange()", function() {
        return it("returns the start and end positions of the marker based on the line height and character widths assigned to the DisplayBuffer", function() {
          var char, end, marker, start, _i, _len, _ref1, _ref2;
          marker = displayBuffer.markScreenRange([[5, 10], [6, 4]]);
          displayBuffer.setLineHeightInPixels(20);
          displayBuffer.setDefaultCharWidth(10);
          _ref1 = ['r', 'e', 't', 'u', 'r', 'n'];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            char = _ref1[_i];
            displayBuffer.setScopedCharWidth(["source.js", "keyword.control.js"], char, 11);
          }
          _ref2 = marker.getPixelRange(), start = _ref2.start, end = _ref2.end;
          expect(start.top).toBe(5 * 20);
          return expect(start.left).toBe((4 * 10) + (6 * 11));
        });
      });
      return describe('when there are multiple DisplayBuffers for a buffer', function() {
        return describe('when a marker is created', function() {
          return it('the second display buffer will not emit a marker-created event when the marker has been deleted in the first marker-created event', function() {
            var displayBuffer2, markerCreated1, markerCreated2;
            displayBuffer2 = new DisplayBuffer({
              buffer: buffer,
              tabLength: tabLength
            });
            displayBuffer.onDidCreateMarker(markerCreated1 = jasmine.createSpy().andCallFake(function(marker) {
              return marker.destroy();
            }));
            displayBuffer2.onDidCreateMarker(markerCreated2 = jasmine.createSpy());
            displayBuffer.markBufferRange([[0, 0], [1, 5]], {});
            expect(markerCreated1).toHaveBeenCalled();
            return expect(markerCreated2).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe("decorations", function() {
      var decoration, decorationProperties, marker, _ref1;
      _ref1 = [], marker = _ref1[0], decoration = _ref1[1], decorationProperties = _ref1[2];
      beforeEach(function() {
        marker = displayBuffer.markBufferRange([[2, 13], [3, 15]]);
        decorationProperties = {
          type: 'gutter',
          "class": 'one'
        };
        return decoration = displayBuffer.decorateMarker(marker, decorationProperties);
      });
      it("can add decorations associated with markers and remove them", function() {
        expect(decoration).toBeDefined();
        expect(decoration.getProperties()).toBe(decorationProperties);
        expect(displayBuffer.decorationForId(decoration.id)).toBe(decoration);
        expect(displayBuffer.decorationsForScreenRowRange(2, 3)[marker.id][0]).toBe(decoration);
        decoration.destroy();
        expect(displayBuffer.decorationsForScreenRowRange(2, 3)[marker.id]).not.toBeDefined();
        return expect(displayBuffer.decorationForId(decoration.id)).not.toBeDefined();
      });
      it("will not fail if the decoration is removed twice", function() {
        decoration.destroy();
        decoration.destroy();
        return expect(displayBuffer.decorationForId(decoration.id)).not.toBeDefined();
      });
      return describe("when a decoration is updated via Decoration::update()", function() {
        return it("emits an 'updated' event containing the new and old params", function() {
          var newProperties, oldProperties, updatedSpy, _ref2;
          decoration.onDidChangeProperties(updatedSpy = jasmine.createSpy());
          decoration.setProperties({
            type: 'gutter',
            "class": 'two'
          });
          _ref2 = updatedSpy.mostRecentCall.args[0], oldProperties = _ref2.oldProperties, newProperties = _ref2.newProperties;
          expect(oldProperties).toEqual(decorationProperties);
          return expect(newProperties).toEqual({
            type: 'gutter',
            "class": 'two',
            id: decoration.id
          });
        });
      });
    });
    describe("::setScrollTop", function() {
      beforeEach(function() {
        displayBuffer.manageScrollPosition = true;
        return displayBuffer.setLineHeightInPixels(10);
      });
      it("disallows negative values", function() {
        displayBuffer.setHeight(displayBuffer.getScrollHeight() + 100);
        expect(displayBuffer.setScrollTop(-10)).toBe(0);
        return expect(displayBuffer.getScrollTop()).toBe(0);
      });
      return it("disallows values that would make ::getScrollBottom() exceed ::getScrollHeight()", function() {
        var maxScrollTop;
        displayBuffer.setHeight(50);
        maxScrollTop = displayBuffer.getScrollHeight() - displayBuffer.getHeight();
        expect(displayBuffer.setScrollTop(maxScrollTop)).toBe(maxScrollTop);
        expect(displayBuffer.getScrollTop()).toBe(maxScrollTop);
        expect(displayBuffer.setScrollTop(maxScrollTop + 50)).toBe(maxScrollTop);
        return expect(displayBuffer.getScrollTop()).toBe(maxScrollTop);
      });
    });
    describe("editor.scrollPastEnd", function() {
      describe("when editor.scrollPastEnd is false", function() {
        beforeEach(function() {
          atom.config.set("editor.scrollPastEnd", false);
          displayBuffer.manageScrollPosition = true;
          return displayBuffer.setLineHeightInPixels(10);
        });
        return it("does not add the height of the view to the scroll height", function() {
          var lineHeight, originalScrollHeight;
          lineHeight = displayBuffer.getLineHeightInPixels();
          originalScrollHeight = displayBuffer.getScrollHeight();
          displayBuffer.setHeight(50);
          return expect(displayBuffer.getScrollHeight()).toBe(originalScrollHeight);
        });
      });
      return describe("when editor.scrollPastEnd is true", function() {
        beforeEach(function() {
          atom.config.set("editor.scrollPastEnd", true);
          displayBuffer.manageScrollPosition = true;
          return displayBuffer.setLineHeightInPixels(10);
        });
        return it("adds the height of the view to the scroll height", function() {
          var lineHeight, originalScrollHeight;
          lineHeight = displayBuffer.getLineHeightInPixels();
          originalScrollHeight = displayBuffer.getScrollHeight();
          displayBuffer.setHeight(50);
          return expect(displayBuffer.getScrollHeight()).toEqual(originalScrollHeight + displayBuffer.height - (lineHeight * 3));
        });
      });
    });
    describe("::setScrollLeft", function() {
      beforeEach(function() {
        displayBuffer.manageScrollPosition = true;
        displayBuffer.setLineHeightInPixels(10);
        return displayBuffer.setDefaultCharWidth(10);
      });
      it("disallows negative values", function() {
        displayBuffer.setWidth(displayBuffer.getScrollWidth() + 100);
        expect(displayBuffer.setScrollLeft(-10)).toBe(0);
        return expect(displayBuffer.getScrollLeft()).toBe(0);
      });
      return it("disallows values that would make ::getScrollRight() exceed ::getScrollWidth()", function() {
        var maxScrollLeft;
        displayBuffer.setWidth(50);
        maxScrollLeft = displayBuffer.getScrollWidth() - displayBuffer.getWidth();
        expect(displayBuffer.setScrollLeft(maxScrollLeft)).toBe(maxScrollLeft);
        expect(displayBuffer.getScrollLeft()).toBe(maxScrollLeft);
        expect(displayBuffer.setScrollLeft(maxScrollLeft + 50)).toBe(maxScrollLeft);
        return expect(displayBuffer.getScrollLeft()).toBe(maxScrollLeft);
      });
    });
    describe("::scrollToScreenPosition(position, [options])", function() {
      beforeEach(function() {
        displayBuffer.manageScrollPosition = true;
        displayBuffer.setLineHeightInPixels(10);
        displayBuffer.setDefaultCharWidth(10);
        displayBuffer.setHorizontalScrollbarHeight(0);
        displayBuffer.setHeight(50);
        return displayBuffer.setWidth(50);
      });
      it("sets the scroll top and scroll left so the given screen position is in view", function() {
        displayBuffer.scrollToScreenPosition([8, 20]);
        expect(displayBuffer.getScrollBottom()).toBe((9 + displayBuffer.getVerticalScrollMargin()) * 10);
        return expect(displayBuffer.getScrollRight()).toBe((20 + displayBuffer.getHorizontalScrollMargin()) * 10);
      });
      return describe("when the 'center' option is true", function() {
        it("vertically scrolls to center the given position vertically", function() {
          displayBuffer.scrollToScreenPosition([8, 20], {
            center: true
          });
          expect(displayBuffer.getScrollTop()).toBe((8 * 10) + 5 - (50 / 2));
          return expect(displayBuffer.getScrollRight()).toBe((20 + displayBuffer.getHorizontalScrollMargin()) * 10);
        });
        return it("does not scroll vertically if the position is already in view", function() {
          displayBuffer.scrollToScreenPosition([4, 20], {
            center: true
          });
          return expect(displayBuffer.getScrollTop()).toBe(0);
        });
      });
    });
    return describe("scroll width", function() {
      var cursorWidth;
      cursorWidth = 1;
      beforeEach(function() {
        return displayBuffer.setDefaultCharWidth(10);
      });
      it("recomputes the scroll width when the default character width changes", function() {
        expect(displayBuffer.getScrollWidth()).toBe(10 * 65 + cursorWidth);
        displayBuffer.setDefaultCharWidth(12);
        return expect(displayBuffer.getScrollWidth()).toBe(12 * 65 + cursorWidth);
      });
      it("recomputes the scroll width when the max line length changes", function() {
        buffer.insert([6, 12], ' ');
        expect(displayBuffer.getScrollWidth()).toBe(10 * 66 + cursorWidth);
        buffer["delete"]([[6, 10], [6, 12]], ' ');
        return expect(displayBuffer.getScrollWidth()).toBe(10 * 64 + cursorWidth);
      });
      it("recomputes the scroll width when the scoped character widths change", function() {
        var operatorWidth;
        operatorWidth = 20;
        displayBuffer.setScopedCharWidth(['source.js', 'keyword.operator.js'], '<', operatorWidth);
        return expect(displayBuffer.getScrollWidth()).toBe(10 * 64 + operatorWidth + cursorWidth);
      });
      return it("recomputes the scroll width when the scoped character widths change in a batch", function() {
        var changedSpy, operatorWidth;
        operatorWidth = 20;
        displayBuffer.onDidChangeCharacterWidths(changedSpy = jasmine.createSpy());
        displayBuffer.batchCharacterMeasurement(function() {
          displayBuffer.setScopedCharWidth(['source.js', 'keyword.operator.js'], '<', operatorWidth);
          return displayBuffer.setScopedCharWidth(['source.js', 'keyword.operator.js'], '?', operatorWidth);
        });
        expect(displayBuffer.getScrollWidth()).toBe(10 * 63 + operatorWidth * 2 + cursorWidth);
        return expect(changedSpy.callCount).toBe(1);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsdUJBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFFBQUEscURBQUE7QUFBQSxJQUFBLE9BQW9ELEVBQXBELEVBQUMsdUJBQUQsRUFBZ0IsZ0JBQWhCLEVBQXdCLHVCQUF4QixFQUF1QyxtQkFBdkMsQ0FBQTtBQUFBLElBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsU0FBQSxHQUFZLENBQVosQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBK0IsV0FBL0IsQ0FGVCxDQUFBO0FBQUEsTUFHQSxhQUFBLEdBQW9CLElBQUEsYUFBQSxDQUFjO0FBQUEsUUFBQyxRQUFBLE1BQUQ7QUFBQSxRQUFTLFdBQUEsU0FBVDtPQUFkLENBSHBCLENBQUE7QUFBQSxNQUlBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsZUFBbEIsQ0FKaEIsQ0FBQTtBQUFBLE1BS0EsYUFBYSxDQUFDLFdBQWQsQ0FBMEIsYUFBMUIsQ0FMQSxDQUFBO2FBT0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7TUFBQSxDQUFoQixFQVJTO0lBQUEsQ0FBWCxDQURBLENBQUE7QUFBQSxJQVlBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7QUFDUixNQUFBLGFBQWEsQ0FBQyxPQUFkLENBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUZRO0lB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LENBQXVFLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBdkUsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sYUFBYSxDQUFDLCtCQUFkLENBQThDLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBOUMsQ0FBUCxDQUE4RCxDQUFDLE9BQS9ELENBQXVFLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBdkUsQ0FIQSxDQUFBO0FBQUEsVUFNQSxNQUFBLENBQU8sYUFBYSxDQUFDLCtCQUFkLENBQThDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUMsQ0FBUCxDQUE2RCxDQUFDLE9BQTlELENBQXNFLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBdEUsQ0FOQSxDQUFBO0FBQUEsVUFPQSxNQUFBLENBQU8sYUFBYSxDQUFDLCtCQUFkLENBQThDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUMsQ0FBUCxDQUE2RCxDQUFDLE9BQTlELENBQXNFLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBdEUsQ0FQQSxDQUFBO0FBQUEsVUFRQSxNQUFBLENBQU8sYUFBYSxDQUFDLCtCQUFkLENBQThDLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBOUMsQ0FBUCxDQUE4RCxDQUFDLE9BQS9ELENBQXVFLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBdkUsQ0FSQSxDQUFBO0FBQUEsVUFTQSxNQUFBLENBQU8sYUFBYSxDQUFDLCtCQUFkLENBQThDLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBOUMsQ0FBUCxDQUE4RCxDQUFDLE9BQS9ELENBQXVFLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBdkUsQ0FUQSxDQUFBO0FBQUEsVUFVQSxNQUFBLENBQU8sYUFBYSxDQUFDLCtCQUFkLENBQThDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUMsQ0FBUCxDQUE2RCxDQUFDLE9BQTlELENBQXNFLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBdEUsQ0FWQSxDQUFBO0FBQUEsVUFXQSxNQUFBLENBQU8sYUFBYSxDQUFDLCtCQUFkLENBQThDLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/display-buffer-spec.coffee