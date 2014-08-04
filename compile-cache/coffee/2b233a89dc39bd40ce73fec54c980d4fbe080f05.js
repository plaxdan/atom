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
      displayBuffer.on('changed', changeHandler);
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
        displayBuffer.setSoftWrap(true);
        displayBuffer.setEditorWidthInChars(50);
        return changeHandler.reset();
      });
      describe("rendering of soft-wrapped lines", function() {
        describe("when editor.softWrapAtPreferredLineLength is set", function() {
          return it("uses the preferred line length as the soft wrap column when it is less than the configured soft wrap column", function() {
            atom.config.set('editor.preferredLineLength', 100);
            atom.config.set('editor.softWrapAtPreferredLineLength', true);
            expect(displayBuffer.lineForRow(10).text).toBe('    return ');
            atom.config.set('editor.preferredLineLength', 5);
            expect(displayBuffer.lineForRow(10).text).toBe('funct');
            atom.config.set('editor.softWrapAtPreferredLineLength', false);
            return expect(displayBuffer.lineForRow(10).text).toBe('    return ');
          });
        });
        describe("when the line is shorter than the max line length", function() {
          return it("renders the line unchanged", function() {
            return expect(displayBuffer.lineForRow(0).text).toBe(buffer.lineForRow(0));
          });
        });
        describe("when the line is empty", function() {
          return it("renders the empty line", function() {
            return expect(displayBuffer.lineForRow(13).text).toBe('');
          });
        });
        describe("when there is a non-whitespace character at the max length boundary", function() {
          describe("when there is whitespace before the boundary", function() {
            return it("wraps the line at the end of the first whitespace preceding the boundary", function() {
              expect(displayBuffer.lineForRow(10).text).toBe('    return ');
              return expect(displayBuffer.lineForRow(11).text).toBe('sort(left).concat(pivot).concat(sort(right));');
            });
          });
          return describe("when there is no whitespace before the boundary", function() {
            return it("wraps the line exactly at the boundary since there's no more graceful place to wrap it", function() {
              buffer.setTextInRange([[0, 0], [1, 0]], 'abcdefghijklmnopqrstuvwxyz\n');
              displayBuffer.setEditorWidthInChars(10);
              expect(displayBuffer.lineForRow(0).text).toBe('abcdefghij');
              expect(displayBuffer.lineForRow(1).text).toBe('klmnopqrst');
              return expect(displayBuffer.lineForRow(2).text).toBe('uvwxyz');
            });
          });
        });
        describe("when there is a whitespace character at the max length boundary", function() {
          return it("wraps the line at the first non-whitespace character following the boundary", function() {
            expect(displayBuffer.lineForRow(3).text).toBe('    var pivot = items.shift(), current, left = [], ');
            return expect(displayBuffer.lineForRow(4).text).toBe('right = [];');
          });
        });
        return describe("when there are hard tabs", function() {
          beforeEach(function() {
            return buffer.setText(buffer.getText().replace(new RegExp('  ', 'g'), '\t'));
          });
          return it("correctly tokenizes the hard tabs", function() {
            expect(displayBuffer.lineForRow(3).tokens[0].isHardTab).toBeTruthy();
            return expect(displayBuffer.lineForRow(3).tokens[1].isHardTab).toBeTruthy();
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
              expect(displayBuffer.lineForRow(7).text).toBe('      current < pivot ?  : right.push(current);');
              expect(displayBuffer.lineForRow(8).text).toBe('    }');
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
          return describe("when the update causes a line to softwrap an additional time", function() {
            return it("rewraps the line and emits a change event", function() {
              buffer.insert([6, 28], '1234567890');
              expect(displayBuffer.lineForRow(7).text).toBe('      current < pivot ? ');
              expect(displayBuffer.lineForRow(8).text).toBe('left1234567890.push(current) : ');
              expect(displayBuffer.lineForRow(9).text).toBe('right.push(current);');
              expect(displayBuffer.lineForRow(10).text).toBe('    }');
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
            expect(displayBuffer.lineForRow(7).text).toBe('      current < pivot1234567890 abcdefghij ');
            expect(displayBuffer.lineForRow(8).text).toBe('1234567890');
            expect(displayBuffer.lineForRow(9).text).toBe('abcdefghij ? left.push(current) : ');
            expect(displayBuffer.lineForRow(10).text).toBe('right.push(current);');
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
            expect(displayBuffer.lineForRow(3).text).toBe('    var pivot = items;');
            expect(displayBuffer.lineForRow(4).text).toBe('    return ');
            expect(displayBuffer.lineForRow(5).text).toBe('sort(left).concat(pivot).concat(sort(right));');
            expect(displayBuffer.lineForRow(6).text).toBe('  };');
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
              softWrap: true
            });
            buffer.insert([0, 0], "the quick brown fox jumps over the lazy dog.");
            buffer.insert([0, Infinity], '\n');
            buffer["delete"]([[0, Infinity], [1, 0]]);
            buffer.insert([0, Infinity], '\n');
            expect(displayBuffer.lineForRow(0).text).toBe("the quick brown fox jumps over ");
            expect(displayBuffer.lineForRow(1).text).toBe("the lazy dog.");
            return expect(displayBuffer.lineForRow(2).text).toBe("");
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
          expect(tokensText(displayBuffer.lineForRow(4).tokens)).toBe('left = [], right = [];');
          expect(tokensText(displayBuffer.lineForRow(5).tokens)).toBe('    while(items.length > 0) {');
          expect(tokensText(displayBuffer.lineForRow(12).tokens)).toBe('sort(left).concat(pivot).concat(sort(rig');
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
        displayBuffer.setSoftWrap(false);
        displayBuffer.setScrollLeft(Infinity);
        expect(displayBuffer.getScrollLeft()).toBeGreaterThan(0);
        displayBuffer.setSoftWrap(true);
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
        return displayBuffer.on('changed', changeHandler);
      });
      describe("when folds are created and destroyed", function() {
        describe("when a fold spans multiple lines", function() {
          return it("replaces the lines spanned by the fold with a placeholder that references the fold object", function() {
            var fold, line4, line5, _ref1, _ref2;
            fold = displayBuffer.createFold(4, 7);
            expect(fold).toBeDefined();
            _ref1 = displayBuffer.linesForRows(4, 5), line4 = _ref1[0], line5 = _ref1[1];
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
            _ref2 = displayBuffer.linesForRows(4, 5), line4 = _ref2[0], line5 = _ref2[1];
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
            _ref1 = displayBuffer.linesForRows(4, 5), line4 = _ref1[0], line5 = _ref1[1];
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
            _ref2 = displayBuffer.linesForRows(4, 5), line4 = _ref2[0], line5 = _ref2[1];
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
            _ref1 = displayBuffer.linesForRows(4, 5), line4 = _ref1[0], line5 = _ref1[1];
            expect(line4.fold).toBe(outerFold);
            expect(line4.text).toMatch(/4-+/);
            expect(line5.text).toMatch(/9-+/);
            outerFold.destroy();
            _ref2 = displayBuffer.linesForRows(4, 7), line4 = _ref2[0], line5 = _ref2[1], line6 = _ref2[2], line7 = _ref2[3];
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
            _ref1 = displayBuffer.linesForRows(4, 5), line4 = _ref1[0], line5 = _ref1[1];
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
            _ref1 = displayBuffer.linesForRows(0, 1), line0 = _ref1[0], line1 = _ref1[1];
            expect(line0.fold).toBe(outerFold);
            expect(line1.fold).toBeUndefined();
            changeHandler.reset();
            innerFold.destroy();
            expect(changeHandler).not.toHaveBeenCalled();
            _ref2 = displayBuffer.linesForRows(0, 1), line0 = _ref2[0], line1 = _ref2[1];
            expect(line0.fold).toBe(outerFold);
            return expect(line1.fold).toBeUndefined();
          });
        });
        describe("when a fold ends where another fold begins", function() {
          return it("continues to hide the lines inside the second fold", function() {
            var fold1, fold2;
            fold2 = displayBuffer.createFold(4, 9);
            fold1 = displayBuffer.createFold(0, 4);
            expect(displayBuffer.lineForRow(0).text).toMatch(/^0/);
            return expect(displayBuffer.lineForRow(1).text).toMatch(/^10/);
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
            expect(displayBuffer.lineForRow(0).text).toBe("0");
            expect(displayBuffer.lineForRow(1).text).toBe("party!");
            expect(displayBuffer.lineForRow(2).fold).toBe(fold2);
            expect(displayBuffer.lineForRow(3).text).toMatch(/^9-+/);
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
              expect(displayBuffer.lineForRow(2).text).toBe('2');
              expect(displayBuffer.lineForRow(2).fold).toBe(fold1);
              return expect(displayBuffer.lineForRow(3).text).toBe('5');
            });
          });
        });
        describe("when the old range surrounds two nested folds", function() {
          return it("removes both folds and replaces the selection with the new text", function() {
            displayBuffer.createFold(2, 9);
            changeHandler.reset();
            buffer.setTextInRange([[1, 0], [10, 0]], 'goodbye');
            expect(displayBuffer.lineForRow(0).text).toBe("0");
            expect(displayBuffer.lineForRow(1).text).toBe("goodbye10");
            expect(displayBuffer.lineForRow(2).text).toBe("11");
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
              expect(displayBuffer.lineForRow(0).text).toBe("abc");
              expect(displayBuffer.lineForRow(1).fold).toBe(fold1);
              expect(displayBuffer.lineForRow(2).text).toBe("5");
              expect(displayBuffer.lineForRow(3).fold).toBe(fold2);
              expect(displayBuffer.lineForRow(4).text).toMatch(/^9-+/);
              expect(changeHandler).toHaveBeenCalledWith({
                start: 0,
                end: 1,
                screenDelta: -1,
                bufferDelta: -1
              });
              changeHandler.reset();
              fold1.destroy();
              expect(displayBuffer.lineForRow(0).text).toBe("abc");
              expect(displayBuffer.lineForRow(1).text).toBe("2");
              expect(displayBuffer.lineForRow(3).text).toMatch(/^4-+/);
              expect(displayBuffer.lineForRow(4).text).toBe("5");
              expect(displayBuffer.lineForRow(5).fold).toBe(fold2);
              expect(displayBuffer.lineForRow(6).text).toMatch(/^9-+/);
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
            expect(displayBuffer.lineForRow(1).text).toBe('1a');
            expect(displayBuffer.lineForRow(2).text).toBe('b');
            expect(displayBuffer.lineForRow(2).fold).toBeUndefined();
            return expect(displayBuffer.lineForRow(3).text).toBe('c');
          });
        });
        describe("when the old range follows a fold", function() {
          return it("re-positions the screen ranges for the change event based on the preceding fold", function() {
            buffer.setTextInRange([[10, 0], [11, 0]], 'abc');
            expect(displayBuffer.lineForRow(1).text).toBe("1");
            expect(displayBuffer.lineForRow(2).fold).toBe(fold1);
            expect(displayBuffer.lineForRow(3).text).toBe("5");
            expect(displayBuffer.lineForRow(4).fold).toBe(fold2);
            expect(displayBuffer.lineForRow(5).text).toMatch(/^9-+/);
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
              expect(displayBuffer.lineForRow(1).text).toBe("1");
              expect(displayBuffer.lineForRow(2).text).toBe("2");
              expect(displayBuffer.lineForRow(2).fold).toBe(fold1);
              expect(displayBuffer.lineForRow(3).text).toMatch("5");
              expect(displayBuffer.lineForRow(4).fold).toBe(fold2);
              expect(displayBuffer.lineForRow(5).text).toMatch(/^9-+/);
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
              expect(displayBuffer.lineForRow(1).text).toBe("1");
              expect(displayBuffer.lineForRow(2).text).toBe("2");
              expect(displayBuffer.lineForRow(2).fold).toBe(fold1);
              expect(displayBuffer.lineForRow(3).text).toMatch("5");
              expect(displayBuffer.lineForRow(4).fold).toBe(fold2);
              expect(displayBuffer.lineForRow(5).text).toMatch(/^9-+/);
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
              expect(displayBuffer.lineForRow(2).text).toBe('2');
              expect(displayBuffer.lineForRow(2).fold).toBeUndefined();
              expect(displayBuffer.lineForRow(3).text).toBe('a');
              return expect(displayBuffer.lineForRow(4).text).toBe('6');
            });
          });
        });
        describe("when the old range is contained to a single line in-between two folds", function() {
          return it("re-renders the line with the placeholder and re-positions the second fold", function() {
            buffer.insert([5, 0], 'abc\n');
            expect(displayBuffer.lineForRow(1).text).toBe("1");
            expect(displayBuffer.lineForRow(2).fold).toBe(fold1);
            expect(displayBuffer.lineForRow(3).text).toMatch("abc");
            expect(displayBuffer.lineForRow(4).text).toBe("5");
            expect(displayBuffer.lineForRow(5).fold).toBe(fold2);
            expect(displayBuffer.lineForRow(6).text).toMatch(/^9-+/);
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
          expect(displayBuffer.lineForRow(1).text).toBe('1');
          expect(displayBuffer.lineForRow(2).text).toBe('10');
          displayBuffer.unfoldBufferRow(2);
          expect(displayBuffer.lineForRow(1).text).toBe('1');
          expect(displayBuffer.lineForRow(2).text).toBe('2');
          expect(displayBuffer.lineForRow(7).fold).toBeDefined();
          expect(displayBuffer.lineForRow(8).text).toMatch(/^9-+/);
          return expect(displayBuffer.lineForRow(10).fold).toBeDefined();
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
        displayBuffer.setSoftWrap(true);
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
        displayBuffer.setSoftWrap(true);
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
          displayBuffer.on('marker-created', markerCreatedHandler = jasmine.createSpy("markerCreatedHandler"));
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
          return marker.on('changed', markerChangedHandler = jasmine.createSpy("markerChangedHandler"));
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
          marker2.on('changed', marker2ChangedHandler = jasmine.createSpy("marker2ChangedHandler"));
          displayBuffer.on('changed', changeHandler = jasmine.createSpy("changeHandler").andCallFake(function() {
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
          marker3.on('changed', marker3ChangedHandler = jasmine.createSpy("marker3ChangedHandler"));
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
          displayBuffer.on('changed', changeHandler = jasmine.createSpy("changeHandler").andCallFake(function() {
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
        return it("emits 'destroyed' events when markers are destroyed", function() {
          var destroyedHandler, marker, marker2;
          destroyedHandler = jasmine.createSpy("destroyedHandler");
          marker = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          marker.on('destroyed', destroyedHandler);
          marker.destroy();
          expect(destroyedHandler).toHaveBeenCalled();
          destroyedHandler.reset();
          marker2 = displayBuffer.markScreenRange([[5, 4], [5, 10]]);
          marker2.on('destroyed', destroyedHandler);
          buffer.getMarker(marker2.id).destroy();
          return expect(destroyedHandler).toHaveBeenCalled();
        });
      });
      describe("DisplayBufferMarker::copy(attributes)", function() {
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
          expect(marker1.getAttributes()).toEqual({
            a: 1,
            b: 2
          });
          return expect(marker2.getAttributes()).toEqual({
            a: 1,
            b: 3
          });
        });
      });
      return describe("DisplayBufferMarker::getPixelRange()", function() {
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
    });
    describe("decorations", function() {
      var decoration, decorationParams, marker, _ref1;
      _ref1 = [], marker = _ref1[0], decoration = _ref1[1], decorationParams = _ref1[2];
      beforeEach(function() {
        marker = displayBuffer.markBufferRange([[2, 13], [3, 15]]);
        decorationParams = {
          type: 'gutter',
          "class": 'one'
        };
        return decoration = displayBuffer.decorateMarker(marker, decorationParams);
      });
      it("can add decorations associated with markers and remove them", function() {
        expect(decoration).toBeDefined();
        expect(decoration.getParams()).toBe(decorationParams);
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
          var newParams, oldParams, updatedSpy, _ref2;
          decoration.on('updated', updatedSpy = jasmine.createSpy());
          decoration.update({
            type: 'gutter',
            "class": 'two'
          });
          _ref2 = updatedSpy.mostRecentCall.args[0], oldParams = _ref2.oldParams, newParams = _ref2.newParams;
          expect(oldParams).toEqual(decorationParams);
          return expect(newParams).toEqual({
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
        displayBuffer.on('character-widths-changed', changedSpy = jasmine.createSpy());
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsdUJBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFFBQUEscURBQUE7QUFBQSxJQUFBLE9BQW9ELEVBQXBELEVBQUMsdUJBQUQsRUFBZ0IsZ0JBQWhCLEVBQXdCLHVCQUF4QixFQUF1QyxtQkFBdkMsQ0FBQTtBQUFBLElBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsU0FBQSxHQUFZLENBQVosQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBK0IsV0FBL0IsQ0FGVCxDQUFBO0FBQUEsTUFHQSxhQUFBLEdBQW9CLElBQUEsYUFBQSxDQUFjO0FBQUEsUUFBQyxRQUFBLE1BQUQ7QUFBQSxRQUFTLFdBQUEsU0FBVDtPQUFkLENBSHBCLENBQUE7QUFBQSxNQUlBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsZUFBbEIsQ0FKaEIsQ0FBQTtBQUFBLE1BS0EsYUFBYSxDQUFDLEVBQWQsQ0FBaUIsU0FBakIsRUFBNEIsYUFBNUIsQ0FMQSxDQUFBO2FBT0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7TUFBQSxDQUFoQixFQVJTO0lBQUEsQ0FBWCxDQURBLENBQUE7QUFBQSxJQVlBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7QUFDUixNQUFBLGFBQWEsQ0FBQyxPQUFkLENBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBTSxDQUFDLE9BQVAs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QUksRUFBSixDQUF2RSxDQUZBLENBQUE7QUFBQSxVQUdBLE1BQUEsQ0FBTyxhQUFhLENBQUMsK0JBQWQsQ0FBOEMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUE5QyxDQUFQLENBQThELENBQUMsT0FBL0QsQ0FBdUUsQ0FBQyxDQUFELEVBQUksRUFBSixDQUF2RSxDQUhBLENBQUE7QUFBQSxVQU1BLE1BQUEsQ0FBTyxhQUFhLENBQUMsK0JBQWQsQ0FBOEMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5QyxDQUFQLENBQTZELENBQUMsT0FBOUQsQ0FBc0UsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF0RSxDQU5BLENBQUE7QUFBQSxVQU9BLE1BQUEsQ0FBTyxhQUFhLENBQUMsK0JBQWQsQ0FBOEMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5QyxDQUFQLENBQTZELENBQUMsT0FBOUQsQ0FBc0UsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF0RSxDQVBBLENBQUE7QUFBQSxVQVFBLE1BQUEsQ0FBTyxhQUFhLENBQUMsK0JBQWQsQ0FBOEMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUE5QyxDQUFQLENBQThELENBQUMsT0FBL0QsQ0FBdUUsQ0FBQyxDQUFELEVBQUksRUFBSixDQUF2RSxDQVJBLENBQUE7QUFBQSxVQVNBLE1BQUEsQ0FBTyxhQUFhLENBQUMsK0JBQWQsQ0FBOEMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUE5QyxDQUFQLENBQThELENBQUMsT0FBL0QsQ0FBdUUsQ0FBQyxDQUFELEVBQUksRUFBSixDQUF2RSxDQVRBLENBQUE7QUFBQSxVQVVBLE1BQUEsQ0FBTyxhQUFhLENBQUMsK0JBQWQsQ0FBOEMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5QyxDQUFQLENBQTZELENBQUMsT0FBOUQsQ0FBc0UsQ0FBQyxDQUFELEVBQUksRUFBSixDQUF0RSxDQVZBLENBQUE7QUFBQSxVQVdBLE1BQUEsQ0FBTyxhQUFhLENBQUMsK0JBQWQsQ0FBOEMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUE5QyxDQUFQLENBQThELENBQUMs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/display-buffer-spec.coffee