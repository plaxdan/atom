(function() {
  var $, $$, EditorView, WorkspaceView, fs, path, temp, _, _ref;

  WorkspaceView = require('../src/workspace-view');

  EditorView = require('../src/editor-view');

  _ref = require('../src/space-pen-extensions'), $ = _ref.$, $$ = _ref.$$;

  _ = require('underscore-plus');

  fs = require('fs-plus');

  path = require('path');

  temp = require('temp');

  describe("EditorView", function() {
    var buffer, cachedCharWidth, cachedEditor, cachedLineHeight, calcDimensions, editor, editorView, fart, getCharWidth, getLineHeight, _ref1;
    _ref1 = [], buffer = _ref1[0], editorView = _ref1[1], editor = _ref1[2], cachedEditor = _ref1[3], cachedLineHeight = _ref1[4], cachedCharWidth = _ref1[5], fart = _ref1[6];
    beforeEach(function() {
      atom.config.set('core.useReactEditor', false);
      waitsForPromise(function() {
        return atom.workspace.open('sample.js').then(function(o) {
          return editor = o;
        });
      });
      waitsForPromise(function() {
        return atom.workspace.open('sample.less').then(function(o) {
          return cachedEditor = o;
        });
      });
      runs(function() {
        buffer = editor.buffer;
        editorView = new EditorView(editor);
        editorView.lineOverdraw = 2;
        editorView.isFocused = true;
        editorView.enableKeymap();
        editorView.calculateHeightInLines = function() {
          return Math.ceil(this.height() / this.lineHeight);
        };
        return editorView.attachToDom = function(_arg) {
          var heightInLines, widthInChars, _ref2;
          _ref2 = _arg != null ? _arg : {}, heightInLines = _ref2.heightInLines, widthInChars = _ref2.widthInChars;
          if (heightInLines == null) {
            heightInLines = this.getEditor().getBuffer().getLineCount();
          }
          this.height(getLineHeight() * heightInLines);
          if (widthInChars) {
            this.width(getCharWidth() * widthInChars);
          }
          return $('#jasmine-content').append(this);
        };
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-text');
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
    });
    getLineHeight = function() {
      if (cachedLineHeight != null) {
        return cachedLineHeight;
      }
      calcDimensions();
      return cachedLineHeight;
    };
    getCharWidth = function() {
      if (cachedCharWidth != null) {
        return cachedCharWidth;
      }
      calcDimensions();
      return cachedCharWidth;
    };
    calcDimensions = function() {
      var editorForMeasurement;
      editorForMeasurement = new EditorView({
        editor: cachedEditor
      });
      editorForMeasurement.attachToDom();
      cachedLineHeight = editorForMeasurement.lineHeight;
      cachedCharWidth = editorForMeasurement.charWidth;
      return editorForMeasurement.remove();
    };
    describe("construction", function() {
      return it("throws an error if no edit session is given", function() {
        return expect(function() {
          return new EditorView;
        }).toThrow();
      });
    });
    describe("when the editor view view is attached to the dom", function() {
      it("calculates line height and char width and updates the pixel position of the cursor", function() {
        expect(editorView.lineHeight).toBeNull();
        expect(editorView.charWidth).toBeNull();
        editor.setCursorScreenPosition({
          row: 2,
          column: 2
        });
        editorView.attachToDom();
        expect(editorView.lineHeight).not.toBeNull();
        expect(editorView.charWidth).not.toBeNull();
        return expect(editorView.find('.cursor').offset()).toEqual(pagePixelPositionForPoint(editorView, [2, 2]));
      });
      return it("is focused", function() {
        editorView.attachToDom();
        return expect(editorView).toMatchSelector(":has(:focus)");
      });
    });
    describe("when the editor view view receives focus", function() {
      it("focuses the hidden input", function() {
        editorView.attachToDom();
        editorView.focus();
        expect(editorView).not.toMatchSelector(':focus');
        return expect(editorView.hiddenInput).toMatchSelector(':focus');
      });
      return it("does not scroll the editor view (regression)", function() {
        editorView.attachToDom({
          heightInLines: 2
        });
        editor.selectAll();
        editorView.hiddenInput.blur();
        editorView.focus();
        expect(editorView.hiddenInput).toMatchSelector(':focus');
        expect($(editorView[0]).scrollTop()).toBe(0);
        expect($(editorView.scrollView[0]).scrollTop()).toBe(0);
        editor.moveCursorToBottom();
        editorView.hiddenInput.blur();
        editorView.scrollTop(0);
        editorView.focus();
        expect(editorView.hiddenInput).toMatchSelector(':focus');
        expect($(editorView[0]).scrollTop()).toBe(0);
        return expect($(editorView.scrollView[0]).scrollTop()).toBe(0);
      });
    });
    describe("when the hidden input is focused / unfocused", function() {
      return it("assigns the isFocused flag on the editor view view and also adds/removes the .focused css class", function() {
        editorView.attachToDom();
        editorView.isFocused = false;
        editorView.hiddenInput.focus();
        expect(editorView.isFocused).toBeTruthy();
        editorView.hiddenInput.focusout();
        return expect(editorView.isFocused).toBeFalsy();
      });
    });
    describe("when the editor's file is modified on disk", function() {
      return it("triggers an alert", function() {
        var fileChangeHandler, filePath;
        fileChangeHandler = null;
        filePath = path.join(temp.dir, 'atom-changed-file.txt');
        fs.writeFileSync(filePath, "");
        waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          editorView.edit(editor);
          editor.insertText("now the buffer is modified");
          fileChangeHandler = jasmine.createSpy('fileChange');
          editor.buffer.file.on('contents-changed', fileChangeHandler);
          spyOn(atom, "confirm");
          return fs.writeFileSync(filePath, "a file change");
        });
        waitsFor("file to trigger contents-changed event", function() {
          return fileChangeHandler.callCount > 0;
        });
        return runs(function() {
          return expect(atom.confirm).toHaveBeenCalled();
        });
      });
    });
    describe(".remove()", function() {
      return it("destroys the edit session", function() {
        editorView.remove();
        return expect(editorView.editor.isDestroyed()).toBe(true);
      });
    });
    describe(".edit(editor)", function() {
      var newBuffer, newEditor, _ref2;
      _ref2 = [], newEditor = _ref2[0], newBuffer = _ref2[1];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('two-hundred.txt').then(function(o) {
            return newEditor = o;
          });
        });
        return runs(function() {
          return newBuffer = newEditor.buffer;
        });
      });
      it("updates the rendered lines, cursors, selections, scroll position, and event subscriptions to match the given edit session", function() {
        var firstRenderedScreenRow, lastRenderedScreenRow, previousScrollHeight, previousScrollLeft, previousScrollTop;
        editorView.attachToDom({
          heightInLines: 5,
          widthInChars: 30
        });
        editor.setCursorBufferPosition([6, 13]);
        editorView.scrollToBottom();
        editorView.scrollLeft(150);
        previousScrollHeight = editorView.verticalScrollbar.prop('scrollHeight');
        previousScrollTop = editorView.scrollTop();
        previousScrollLeft = editorView.scrollLeft();
        newEditor.setScrollTop(900);
        newEditor.setSelectedBufferRange([[40, 0], [43, 1]]);
        editorView.edit(newEditor);
        firstRenderedScreenRow = editorView.firstRenderedScreenRow, lastRenderedScreenRow = editorView.lastRenderedScreenRow;
        expect(editorView.lineElementForScreenRow(firstRenderedScreenRow).text()).toBe(newBuffer.lineForRow(firstRenderedScreenRow));
        expect(editorView.lineElementForScreenRow(lastRenderedScreenRow).text()).toBe(newBuffer.lineForRow(editorView.lastRenderedScreenRow));
        expect(editorView.scrollTop()).toBe(900);
        expect(editorView.scrollLeft()).toBe(0);
        expect(editorView.getSelectionView().regions[0].position().top).toBe(40 * editorView.lineHeight);
        newEditor.insertText("hello");
        expect(editorView.lineElementForScreenRow(40).text()).toBe("hello3");
        editorView.edit(editor);
        firstRenderedScreenRow = editorView.firstRenderedScreenRow, lastRenderedScreenRow = editorView.lastRenderedScreenRow;
        expect(editorView.lineElementForScreenRow(firstRenderedScreenRow).text()).toBe(buffer.lineForRow(firstRenderedScreenRow));
        expect(editorView.lineElementForScreenRow(lastRenderedScreenRow).text()).toBe(buffer.lineForRow(editorView.lastRenderedScreenRow));
        expect(editorView.verticalScrollbar.prop('scrollHeight')).toBe(previousScrollHeight);
        expect(editorView.scrollTop()).toBe(previousScrollTop);
        expect(editorView.scrollLeft()).toBe(previousScrollLeft);
        expect(editorView.getCursorView().position()).toEqual({
          top: 6 * editorView.lineHeight,
          left: 13 * editorView.charWidth
        });
        editor.insertText("goodbye");
        return expect(editorView.lineElementForScreenRow(6).text()).toMatch(/^      currentgoodbye/);
      });
      return it("triggers alert if edit session's buffer goes into conflict with changes on disk", function() {
        var contentsConflictedHandler, filePath, tempEditor;
        contentsConflictedHandler = null;
        filePath = path.join(temp.dir, 'atom-changed-file.txt');
        fs.writeFileSync(filePath, "");
        tempEditor = null;
        waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function(o) {
            return tempEditor = o;
          });
        });
        runs(function() {
          editorView.edit(tempEditor);
          tempEditor.insertText("a buffer change");
          spyOn(atom, "confirm");
          contentsConflictedHandler = jasmine.createSpy("contentsConflictedHandler");
          tempEditor.on('contents-conflicted', contentsConflictedHandler);
          return fs.writeFileSync(filePath, "a file change");
        });
        waitsFor(function() {
          return contentsConflictedHandler.callCount > 0;
        });
        return runs(function() {
          return expect(atom.confirm).toHaveBeenCalled();
        });
      });
    });
    describe(".scrollTop(n)", function() {
      beforeEach(function() {
        editorView.attachToDom({
          heightInLines: 5
        });
        return expect(editorView.verticalScrollbar.scrollTop()).toBe(0);
      });
      describe("when called with a scroll top argument", function() {
        it("sets the scrollTop of the vertical scrollbar and sets scrollTop on the line numbers and lines", function() {
          editorView.scrollTop(100);
          expect(editorView.verticalScrollbar.scrollTop()).toBe(100);
          expect(editorView.scrollView.scrollTop()).toBe(0);
          expect(editorView.renderedLines.css('top')).toBe("-100px");
          expect(editorView.gutter.lineNumbers.css('top')).toBe("-100px");
          editorView.scrollTop(120);
          expect(editorView.verticalScrollbar.scrollTop()).toBe(120);
          expect(editorView.scrollView.scrollTop()).toBe(0);
          expect(editorView.renderedLines.css('top')).toBe("-120px");
          return expect(editorView.gutter.lineNumbers.css('top')).toBe("-120px");
        });
        it("does not allow negative scrollTops to be assigned", function() {
          editorView.scrollTop(-100);
          return expect(editorView.scrollTop()).toBe(0);
        });
        it("doesn't do anything if the scrollTop hasn't changed", function() {
          editorView.scrollTop(100);
          spyOn(editorView.verticalScrollbar, 'scrollTop');
          spyOn(editorView.renderedLines, 'css');
          spyOn(editorView.gutter.lineNumbers, 'css');
          editorView.scrollTop(100);
          expect(editorView.verticalScrollbar.scrollTop).not.toHaveBeenCalled();
          expect(editorView.renderedLines.css).not.toHaveBeenCalled();
          return expect(editorView.gutter.lineNumbers.css).not.toHaveBeenCalled();
        });
        return describe("when the 'adjustVerticalScrollbar' option is false (defaults to true)", function() {
          return it("doesn't adjust the scrollTop of the vertical scrollbar", function() {
            editorView.scrollTop(100, {
              adjustVerticalScrollbar: false
            });
            expect(editorView.verticalScrollbar.scrollTop()).toBe(0);
            expect(editorView.renderedLines.css('top')).toBe("-100px");
            return expect(editorView.gutter.lineNumbers.css('top')).toBe("-100px");
          });
        });
      });
      describe("when called with no argument", function() {
        return it("returns the last assigned value or 0 if none has been assigned", function() {
          expect(editorView.scrollTop()).toBe(0);
          editorView.scrollTop(50);
          return expect(editorView.scrollTop()).toBe(50);
        });
      });
      return it("sets the new scroll top position on the active edit session", function() {
        expect(editorView.editor.getScrollTop()).toBe(0);
        editorView.scrollTop(123);
        return expect(editorView.editor.getScrollTop()).toBe(123);
      });
    });
    describe(".scrollHorizontally(pixelPosition)", function() {
      return it("sets the new scroll left position on the active edit session", function() {
        editorView.attachToDom({
          heightInLines: 5
        });
        setEditorWidthInChars(editorView, 5);
        expect(editorView.editor.getScrollLeft()).toBe(0);
        editorView.scrollHorizontally({
          left: 50
        });
        expect(editorView.editor.getScrollLeft()).toBeGreaterThan(0);
        return expect(editorView.editor.getScrollLeft()).toBe(editorView.scrollLeft());
      });
    });
    describe("editor:attached event", function() {
      return it('only triggers an editor:attached event when it is first added to the DOM', function() {
        var event, eventEditor, openHandler, _ref2;
        openHandler = jasmine.createSpy('openHandler');
        editorView.on('editor:attached', openHandler);
        editorView.attachToDom();
        expect(openHandler).toHaveBeenCalled();
        _ref2 = openHandler.argsForCall[0], event = _ref2[0], eventEditor = _ref2[1];
        expect(eventEditor).toBe(editorView);
        openHandler.reset();
        editorView.attachToDom();
        return expect(openHandler).not.toHaveBeenCalled();
      });
    });
    describe("editor:path-changed event", function() {
      var filePath;
      filePath = null;
      beforeEach(function() {
        filePath = path.join(temp.dir, 'something.txt');
        return fs.writeFileSync(filePath, filePath);
      });
      afterEach(function() {
        if (fs.existsSync(filePath)) {
          return fs.removeSync(filePath);
        }
      });
      it("emits event when buffer's path is changed", function() {
        var eventHandler;
        eventHandler = jasmine.createSpy('eventHandler');
        editorView.on('editor:path-changed', eventHandler);
        editor.saveAs(filePath);
        return expect(eventHandler).toHaveBeenCalled();
      });
      it("emits event when editor view view receives a new buffer", function() {
        var eventHandler;
        eventHandler = jasmine.createSpy('eventHandler');
        editorView.on('editor:path-changed', eventHandler);
        waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function(editor) {
            return editorView.edit(editor);
          });
        });
        return runs(function() {
          return expect(eventHandler).toHaveBeenCalled();
        });
      });
      it("stops listening to events on previously set buffers", function() {
        var eventHandler, newEditor, oldBuffer;
        eventHandler = jasmine.createSpy('eventHandler');
        oldBuffer = editor.getBuffer();
        newEditor = null;
        waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function(o) {
            return newEditor = o;
          });
        });
        return runs(function() {
          editorView.on('editor:path-changed', eventHandler);
          editorView.edit(newEditor);
          expect(eventHandler).toHaveBeenCalled();
          eventHandler.reset();
          oldBuffer.saveAs(path.join(temp.dir, 'atom-bad.txt'));
          expect(eventHandler).not.toHaveBeenCalled();
          eventHandler.reset();
          newEditor.getBuffer().saveAs(path.join(temp.dir, 'atom-new.txt'));
          return expect(eventHandler).toHaveBeenCalled();
        });
      });
      return it("loads the grammar for the new path", function() {
        expect(editor.getGrammar().name).toBe('JavaScript');
        editor.getBuffer().saveAs(filePath);
        return expect(editor.getGrammar().name).toBe('Plain Text');
      });
    });
    describe("font family", function() {
      beforeEach(function() {
        return expect(editorView.css('font-family')).toBe('Courier');
      });
      it("when there is no config in fontFamily don't set it", function() {
        atom.config.set('editor.fontFamily', null);
        return expect(editorView.css('font-family')).toBe('');
      });
      return describe("when the font family changes", function() {
        var fontFamily;
        fontFamily = [][0];
        beforeEach(function() {
          if (process.platform === 'darwin') {
            return fontFamily = "PCMyungjo";
          } else {
            return fontFamily = "Consolas";
          }
        });
        return it("updates the font family of editors and recalculates dimensions critical to cursor positioning", function() {
          var charWidthBefore, lineHeightBefore, newEditor;
          editorView.attachToDom(12);
          lineHeightBefore = editorView.lineHeight;
          charWidthBefore = editorView.charWidth;
          editor.setCursorScreenPosition([5, 6]);
          atom.config.set("editor.fontFamily", fontFamily);
          expect(editorView.css('font-family')).toBe(fontFamily);
          expect(editorView.charWidth).not.toBe(charWidthBefore);
          expect(editorView.getCursorView().position()).toEqual({
            top: 5 * editorView.lineHeight,
            left: 6 * editorView.charWidth
          });
          newEditor = new EditorView(editorView.editor.copy());
          newEditor.attachToDom();
          return expect(newEditor.css('font-family')).toBe(fontFamily);
        });
      });
    });
    describe("font size", function() {
      beforeEach(function() {
        expect(editorView.css('font-size')).not.toBe("20px");
        return expect(editorView.css('font-size')).not.toBe("10px");
      });
      it("sets the initial font size based on the value from config", function() {
        return expect(editorView.css('font-size')).toBe("" + (atom.config.get('editor.fontSize')) + "px");
      });
      return describe("when the font size changes", function() {
        it("updates the font sizes of editors and recalculates dimensions critical to cursor positioning", function() {
          var charWidthBefore, lineHeightBefore, newEditor;
          atom.config.set("editor.fontSize", 10);
          editorView.attachToDom();
          lineHeightBefore = editorView.lineHeight;
          charWidthBefore = editorView.charWidth;
          editor.setCursorScreenPosition([5, 6]);
          atom.config.set("editor.fontSize", 30);
          expect(editorView.css('font-size')).toBe('30px');
          expect(editorView.lineHeight).toBeGreaterThan(lineHeightBefore);
          expect(editorView.charWidth).toBeGreaterThan(charWidthBefore);
          expect(editorView.getCursorView().position()).toEqual({
            top: 5 * editorView.lineHeight,
            left: 6 * editorView.charWidth
          });
          expect(editorView.renderedLines.outerHeight()).toBe(buffer.getLineCount() * editorView.lineHeight);
          expect(editorView.verticalScrollbarContent.height()).toBe(buffer.getLineCount() * editorView.lineHeight);
          newEditor = new EditorView(editorView.editor.copy());
          editorView.remove();
          newEditor.attachToDom();
          return expect(newEditor.css('font-size')).toBe('30px');
        });
        it("updates the position and size of selection regions", function() {
          var selectionRegion;
          atom.config.set("editor.fontSize", 10);
          editor.setSelectedBufferRange([[5, 2], [5, 7]]);
          editorView.attachToDom();
          atom.config.set("editor.fontSize", 30);
          selectionRegion = editorView.find('.region');
          expect(selectionRegion.position().top).toBe(5 * editorView.lineHeight);
          expect(selectionRegion.position().left).toBe(2 * editorView.charWidth);
          expect(selectionRegion.height()).toBe(editorView.lineHeight);
          return expect(selectionRegion.width()).toBe(5 * editorView.charWidth);
        });
        it("updates lines if there are unrendered lines", function() {
          var originalLineCount;
          editorView.attachToDom({
            heightInLines: 5
          });
          originalLineCount = editorView.renderedLines.find(".line").length;
          expect(originalLineCount).toBeGreaterThan(0);
          atom.config.set("editor.fontSize", 10);
          return expect(editorView.renderedLines.find(".line").length).toBeGreaterThan(originalLineCount);
        });
        return describe("when the font size changes while editor view view is detached", function() {
          return it("redraws the editor view view according to the new font size when it is reattached", function() {
            var initialCharWidth, initialCursorPosition, initialLineHeight, initialScrollbarHeight;
            editor.setCursorScreenPosition([4, 2]);
            editorView.attachToDom();
            initialLineHeight = editorView.lineHeight;
            initialCharWidth = editorView.charWidth;
            initialCursorPosition = editorView.getCursorView().position();
            initialScrollbarHeight = editorView.verticalScrollbarContent.height();
            editorView.detach();
            atom.config.set("editor.fontSize", 10);
            expect(editorView.lineHeight).toBe(initialLineHeight);
            expect(editorView.charWidth).toBe(initialCharWidth);
            editorView.attachToDom();
            expect(editorView.lineHeight).not.toBe(initialLineHeight);
            expect(editorView.charWidth).not.toBe(initialCharWidth);
            expect(editorView.getCursorView().position()).not.toEqual(initialCursorPosition);
            return expect(editorView.verticalScrollbarContent.height()).not.toBe(initialScrollbarHeight);
          });
        });
      });
    });
    describe("mouse events", function() {
      beforeEach(function() {
        editorView.attachToDom();
        return editorView.css({
          position: 'absolute',
          top: 10,
          left: 10,
          width: 400
        });
      });
      describe("single-click", function() {
        it("re-positions the cursor to the clicked row / column", function() {
          expect(editor.getCursorScreenPosition()).toEqual({
            row: 0,
            column: 0
          });
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [3, 10]
          }));
          return expect(editor.getCursorScreenPosition()).toEqual({
            row: 3,
            column: 10
          });
        });
        describe("when the lines are scrolled to the right", function() {
          return it("re-positions the cursor on the clicked location", function() {
            setEditorWidthInChars(editorView, 30);
            expect(editor.getCursorScreenPosition()).toEqual({
              row: 0,
              column: 0
            });
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [3, 30]
            }));
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [3, 50]
            }));
            return expect(editor.getCursorBufferPosition()).toEqual({
              row: 3,
              column: 50
            });
          });
        });
        describe("when the editor view view is using a variable-width font", function() {
          return beforeEach(function() {
            return editorView.setFontFamily('sans-serif');
          });
        });
        return it("positions the cursor to the clicked row and column", function() {
          var left, top, _ref2;
          _ref2 = editorView.pixelOffsetForScreenPosition([3, 30]), top = _ref2.top, left = _ref2.left;
          editorView.renderedLines.trigger(mousedownEvent({
            pageX: left,
            pageY: top
          }));
          return expect(editor.getCursorScreenPosition()).toEqual([3, 30]);
        });
      });
      describe("double-click", function() {
        it("selects the word under the cursor, and expands the selection wordwise in either direction on a subsequent shift-click", function() {
          expect(editor.getCursorScreenPosition()).toEqual({
            row: 0,
            column: 0
          });
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [8, 24],
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [8, 24],
            originalEvent: {
              detail: 2
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelectedText()).toBe("concat");
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [8, 7],
            shiftKey: true
          }));
          editorView.renderedLines.trigger('mouseup');
          return expect(editor.getSelectedText()).toBe("return sort(left).concat");
        });
        it("stops selecting by word when the selection is emptied", function() {
          expect(editor.getCursorScreenPosition()).toEqual({
            row: 0,
            column: 0
          });
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [0, 8],
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [0, 8],
            originalEvent: {
              detail: 2
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelectedText()).toBe("quicksort");
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [3, 10]
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [3, 12],
            originalEvent: {
              detail: 1
            },
            shiftKey: true
          }));
          return expect(editor.getSelectedBufferRange()).toEqual([[3, 10], [3, 12]]);
        });
        it("stops selecting by word when another selection is made", function() {
          expect(editor.getCursorScreenPosition()).toEqual({
            row: 0,
            column: 0
          });
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [0, 8],
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [0, 8],
            originalEvent: {
              detail: 2
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelectedText()).toBe("quicksort");
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [3, 10]
          }));
          editorView.renderedLines.trigger(mousemoveEvent({
            editorView: editorView,
            point: [3, 12],
            which: 1
          }));
          editorView.renderedLines.trigger('mouseup');
          return expect(editor.getSelectedBufferRange()).toEqual([[3, 10], [3, 12]]);
        });
        describe("when double-clicking between a word and a non-word", function() {
          return it("selects the word", function() {
            expect(editor.getCursorScreenPosition()).toEqual({
              row: 0,
              column: 0
            });
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [1, 21],
              originalEvent: {
                detail: 1
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [1, 21],
              originalEvent: {
                detail: 2
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            expect(editor.getSelectedText()).toBe("function");
            editor.setCursorBufferPosition([0, 0]);
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [1, 22],
              originalEvent: {
                detail: 1
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [1, 22],
              originalEvent: {
                detail: 2
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            expect(editor.getSelectedText()).toBe("items");
            editor.setCursorBufferPosition([0, 0]);
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [0, 28],
              originalEvent: {
                detail: 1
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [0, 28],
              originalEvent: {
                detail: 2
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            return expect(editor.getSelectedText()).toBe("{");
          });
        });
        return describe("when double-clicking on whitespace", function() {
          return it("selects all adjacent whitespace", function() {
            editor.setText("   some  text    ");
            editor.setCursorBufferPosition([0, 2]);
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [0, 2],
              originalEvent: {
                detail: 1
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [0, 2],
              originalEvent: {
                detail: 2
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            expect(editor.getSelectedBufferRange()).toEqual([[0, 0], [0, 3]]);
            editor.setCursorBufferPosition([0, 8]);
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [0, 8],
              originalEvent: {
                detail: 1
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [0, 8],
              originalEvent: {
                detail: 2
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            expect(editor.getSelectedBufferRange()).toEqual([[0, 7], [0, 9]]);
            editor.setCursorBufferPosition([0, 14]);
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [0, 14],
              originalEvent: {
                detail: 1
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [0, 14],
              originalEvent: {
                detail: 2
              }
            }));
            editorView.renderedLines.trigger('mouseup');
            return expect(editor.getSelectedBufferRange()).toEqual([[0, 13], [0, 17]]);
          });
        });
      });
      describe("triple/quardruple/etc-click", function() {
        it("selects the line under the cursor", function() {
          expect(editor.getCursorScreenPosition()).toEqual({
            row: 0,
            column: 0
          });
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [1, 8],
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [1, 8],
            originalEvent: {
              detail: 2
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [1, 8],
            originalEvent: {
              detail: 3
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelectedText()).toBe("  var sort = function(items) {\n");
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [2, 3],
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [2, 3],
            originalEvent: {
              detail: 2
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [2, 3],
            originalEvent: {
              detail: 3
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [2, 3],
            originalEvent: {
              detail: 4
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          return expect(editor.getSelectedText()).toBe("    if (items.length <= 1) return items;\n");
        });
        return it("expands the selection linewise in either direction on a subsequent shift-click, but stops selecting linewise once the selection is emptied", function() {
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [4, 8],
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [4, 8],
            originalEvent: {
              detail: 2
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [4, 8],
            originalEvent: {
              detail: 3
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelectedBufferRange()).toEqual([[4, 0], [5, 0]]);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [1, 8],
            originalEvent: {
              detail: 1
            },
            shiftKey: true
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelectedBufferRange()).toEqual([[1, 0], [5, 0]]);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [2, 8],
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelection().isEmpty()).toBeTruthy();
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [3, 8],
            originalEvent: {
              detail: 1
            },
            shiftKey: true
          }));
          editorView.renderedLines.trigger('mouseup');
          return expect(editor.getSelectedBufferRange()).toEqual([[2, 8], [3, 8]]);
        });
      });
      describe("shift-click", function() {
        return it("selects from the cursor's current location to the clicked location", function() {
          editor.setCursorScreenPosition([4, 7]);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [5, 24],
            shiftKey: true
          }));
          return expect(editor.getSelection().getScreenRange()).toEqual([[4, 7], [5, 24]]);
        });
      });
      describe("shift-double-click", function() {
        return it("expands the selection on the first click and ignores the second click", function() {
          editor.setCursorScreenPosition([4, 7]);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [5, 24],
            shiftKey: true,
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelection().getScreenRange()).toEqual([[4, 7], [5, 24]]);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [5, 24],
            shiftKey: true,
            originalEvent: {
              detail: 2
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          return expect(editor.getSelection().getScreenRange()).toEqual([[4, 7], [5, 24]]);
        });
      });
      describe("shift-triple-click", function() {
        return it("expands the selection on the first click and ignores the second click", function() {
          editor.setCursorScreenPosition([4, 7]);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [5, 24],
            shiftKey: true,
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelection().getScreenRange()).toEqual([[4, 7], [5, 24]]);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [5, 24],
            shiftKey: true,
            originalEvent: {
              detail: 2
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [5, 24],
            shiftKey: true,
            originalEvent: {
              detail: 3
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          return expect(editor.getSelection().getScreenRange()).toEqual([[4, 7], [5, 24]]);
        });
      });
      describe("meta-click", function() {
        return it("places an additional cursor", function() {
          var cursor1, cursor2, _ref2;
          editorView.attachToDom();
          setEditorHeightInLines(editorView, 5);
          editor.setCursorBufferPosition([3, 0]);
          editorView.scrollTop(editorView.lineHeight * 6);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [6, 0],
            metaKey: true
          }));
          expect(editorView.scrollTop()).toBe(editorView.lineHeight * (6 - editorView.vScrollMargin));
          _ref2 = editorView.getCursorViews(), cursor1 = _ref2[0], cursor2 = _ref2[1];
          expect(cursor1.position()).toEqual({
            top: 3 * editorView.lineHeight,
            left: 0
          });
          expect(cursor1.getBufferPosition()).toEqual([3, 0]);
          expect(cursor2.position()).toEqual({
            top: 6 * editorView.lineHeight,
            left: 0
          });
          return expect(cursor2.getBufferPosition()).toEqual([6, 0]);
        });
      });
      describe("click and drag", function() {
        it("creates a selection from the initial click to mouse cursor's location ", function() {
          var range;
          editorView.attachToDom();
          editorView.css({
            position: 'absolute',
            top: 10,
            left: 10
          });
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [4, 10]
          }));
          $(document).trigger(mousemoveEvent({
            editorView: editorView,
            point: [5, 27],
            which: 1
          }));
          range = editor.getSelection().getScreenRange();
          expect(range.start).toEqual({
            row: 4,
            column: 10
          });
          expect(range.end).toEqual({
            row: 5,
            column: 27
          });
          expect(editor.getCursorScreenPosition()).toEqual({
            row: 5,
            column: 27
          });
          $(document).trigger('mouseup');
          editorView.renderedLines.trigger(mousemoveEvent({
            editorView: editorView,
            point: [8, 8]
          }));
          range = editor.getSelection().getScreenRange();
          expect(range.start).toEqual({
            row: 4,
            column: 10
          });
          expect(range.end).toEqual({
            row: 5,
            column: 27
          });
          return expect(editor.getCursorScreenPosition()).toEqual({
            row: 5,
            column: 27
          });
        });
        it("selects and scrolls if the mouse is dragged outside of the editor view view itself", function() {
          var originalScrollTop, x, _i;
          editorView.vScrollMargin = 0;
          editorView.attachToDom({
            heightInLines: 5
          });
          editorView.scrollToBottom();
          spyOn(window, 'setInterval').andCallFake(function() {});
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [12, 0]
          }));
          originalScrollTop = editorView.scrollTop();
          $(document).trigger(mousemoveEvent({
            editorView: editorView,
            pageX: 0,
            pageY: -1,
            which: 1
          }));
          expect(editorView.scrollTop()).toBe(originalScrollTop - editorView.lineHeight);
          for (x = _i = 0; _i <= 10; x = ++_i) {
            $(document).trigger(mousemoveEvent({
              editorView: editorView,
              pageX: 0,
              pageY: -1,
              which: 1
            }));
          }
          return expect(editorView.scrollTop()).toBe(0);
        });
        it("ignores non left-click and drags", function() {
          var event, range;
          editorView.attachToDom();
          editorView.css({
            position: 'absolute',
            top: 10,
            left: 10
          });
          event = mousedownEvent({
            editorView: editorView,
            point: [4, 10]
          });
          event.originalEvent.which = 2;
          editorView.renderedLines.trigger(event);
          $(document).trigger(mousemoveEvent({
            editorView: editorView,
            point: [5, 27],
            which: 1
          }));
          $(document).trigger('mouseup');
          range = editor.getSelection().getScreenRange();
          expect(range.start).toEqual({
            row: 4,
            column: 10
          });
          return expect(range.end).toEqual({
            row: 4,
            column: 10
          });
        });
        it("ignores ctrl-click and drags", function() {
          var event, range;
          editorView.attachToDom();
          editorView.css({
            position: 'absolute',
            top: 10,
            left: 10
          });
          event = mousedownEvent({
            editorView: editorView,
            point: [4, 10]
          });
          event.ctrlKey = true;
          editorView.renderedLines.trigger(event);
          $(document).trigger(mousemoveEvent({
            editorView: editorView,
            point: [5, 27]
          }));
          $(document).trigger('mouseup');
          range = editor.getSelection().getScreenRange();
          expect(range.start).toEqual({
            row: 4,
            column: 10
          });
          return expect(range.end).toEqual({
            row: 4,
            column: 10
          });
        });
        return describe("when the editor is hidden", function() {
          return it("stops scrolling the editor", function() {
            var originalScrollTop;
            editorView.vScrollMargin = 0;
            editorView.attachToDom({
              heightInLines: 5
            });
            editorView.scrollToBottom();
            spyOn(window, 'setInterval').andCallFake(function() {});
            editorView.renderedLines.trigger(mousedownEvent({
              editorView: editorView,
              point: [12, 0]
            }));
            originalScrollTop = editorView.scrollTop();
            $(document).trigger(mousemoveEvent({
              editorView: editorView,
              pageX: 0,
              pageY: -1,
              which: 1
            }));
            expect(editorView.scrollTop()).toBe(originalScrollTop - editorView.lineHeight);
            editorView.hide();
            $(document).trigger(mousemoveEvent({
              editorView: editorView,
              pageX: 100000,
              pageY: -1,
              which: 1
            }));
            return expect(editorView.scrollTop()).toBe(originalScrollTop - editorView.lineHeight);
          });
        });
      });
      describe("double-click and drag", function() {
        return it("selects the word under the cursor, then continues to select by word in either direction as the mouse is dragged", function() {
          expect(editor.getCursorScreenPosition()).toEqual({
            row: 0,
            column: 0
          });
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [0, 8],
            originalEvent: {
              detail: 1
            }
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [0, 8],
            originalEvent: {
              detail: 2
            }
          }));
          expect(editor.getSelectedText()).toBe("quicksort");
          editorView.renderedLines.trigger(mousemoveEvent({
            editorView: editorView,
            point: [1, 8],
            which: 1
          }));
          expect(editor.getSelectedBufferRange()).toEqual([[0, 4], [1, 10]]);
          expect(editor.getCursorBufferPosition()).toEqual([1, 10]);
          editorView.renderedLines.trigger(mousemoveEvent({
            editorView: editorView,
            point: [0, 1],
            which: 1
          }));
          expect(editor.getSelectedBufferRange()).toEqual([[0, 0], [0, 13]]);
          expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
          editorView.renderedLines.trigger('mouseup');
          expect(editor.getSelectedBufferRange()).toEqual([[0, 0], [0, 13]]);
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [5, 25],
            originalEvent: {
              detail: 1
            },
            shiftKey: true
          }));
          editorView.renderedLines.trigger('mouseup');
          return expect(editor.getSelectedBufferRange()).toEqual([[0, 13], [5, 27]]);
        });
      });
      describe("triple-click and drag", function() {
        return it("expands the initial selection linewise in either direction", function() {
          editorView.attachToDom();
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [4, 7],
            originalEvent: {
              detail: 1
            }
          }));
          $(document).trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [4, 7],
            originalEvent: {
              detail: 2
            }
          }));
          $(document).trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [4, 7],
            originalEvent: {
              detail: 3
            }
          }));
          expect(editor.getSelectedBufferRange()).toEqual([[4, 0], [5, 0]]);
          editorView.renderedLines.trigger(mousemoveEvent({
            editorView: editorView,
            point: [5, 27],
            which: 1
          }));
          expect(editor.getSelectedBufferRange()).toEqual([[4, 0], [6, 0]]);
          expect(editor.getCursorBufferPosition()).toEqual([6, 0]);
          editorView.renderedLines.trigger(mousemoveEvent({
            editorView: editorView,
            point: [2, 27],
            which: 1
          }));
          expect(editor.getSelectedBufferRange()).toEqual([[2, 0], [5, 0]]);
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          return $(document).trigger('mouseup');
        });
      });
      describe("meta-click and drag", function() {
        return it("adds an additional selection", function() {
          var selection1, selection2, selections;
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [4, 10]
          }));
          editorView.renderedLines.trigger(mousemoveEvent({
            editorView: editorView,
            point: [5, 27],
            which: 1
          }));
          editorView.renderedLines.trigger('mouseup');
          editorView.renderedLines.trigger(mousedownEvent({
            editorView: editorView,
            point: [6, 10],
            metaKey: true
          }));
          editorView.renderedLines.trigger(mousemoveEvent({
            editorView: editorView,
            point: [8, 27],
            metaKey: true,
            which: 1
          }));
          editorView.renderedLines.trigger('mouseup');
          selections = editor.getSelections();
          expect(selections.length).toBe(2);
          selection1 = selections[0], selection2 = selections[1];
          expect(selection1.getScreenRange()).toEqual([[4, 10], [5, 27]]);
          return expect(selection2.getScreenRange()).toEqual([[6, 10], [8, 27]]);
        });
      });
      return describe("mousedown on the fold icon of a foldable line number", function() {
        return it("toggles folding on the clicked buffer row", function() {
          expect(editor.isFoldedAtScreenRow(1)).toBe(false);
          editorView.gutter.find('.line-number:eq(1) .icon-right').mousedown();
          expect(editor.isFoldedAtScreenRow(1)).toBe(true);
          editorView.gutter.find('.line-number:eq(1) .icon-right').mousedown();
          return expect(editor.isFoldedAtScreenRow(1)).toBe(false);
        });
      });
    });
    describe("when text input events are triggered on the hidden input element", function() {
      return it("inserts the typed character at the cursor position, both in the buffer and the pre element", function() {
        editorView.attachToDom();
        editor.setCursorScreenPosition({
          row: 1,
          column: 6
        });
        expect(buffer.lineForRow(1).charAt(6)).not.toBe('q');
        editorView.hiddenInput.textInput('q');
        expect(buffer.lineForRow(1).charAt(6)).toBe('q');
        expect(editor.getCursorScreenPosition()).toEqual({
          row: 1,
          column: 7
        });
        return expect(editorView.renderedLines.find('.line:eq(1)')).toHaveText(buffer.lineForRow(1));
      });
    });
    describe("selection rendering", function() {
      var charWidth, lineHeight, selection, selectionView, _ref2;
      _ref2 = [], charWidth = _ref2[0], lineHeight = _ref2[1], selection = _ref2[2], selectionView = _ref2[3];
      beforeEach(function() {
        editorView.attachToDom();
        editorView.width(500);
        charWidth = editorView.charWidth, lineHeight = editorView.lineHeight;
        selection = editor.getSelection();
        return selectionView = editorView.getSelectionView();
      });
      describe("when a selection is added", function() {
        return it("adds a selection view for it with the proper regions", function() {
          var region, selectionViews;
          editorView.editor.addSelectionForBufferRange([[2, 7], [2, 25]]);
          selectionViews = editorView.getSelectionViews();
          expect(selectionViews.length).toBe(2);
          expect(selectionViews[1].regions.length).toBe(1);
          region = selectionViews[1].regions[0];
          expect(region.position().top).toBeCloseTo(2 * lineHeight);
          expect(region.position().left).toBeCloseTo(7 * charWidth);
          expect(region.height()).toBeCloseTo(lineHeight);
          return expect(region.width()).toBeCloseTo((25 - 7) * charWidth);
        });
      });
      describe("when a selection changes", function() {
        describe("when the selection is within a single line", function() {
          return it("covers the selection's range with a single region", function() {
            var region;
            selection.setBufferRange([[2, 7], [2, 25]]);
            expect(selectionView.regions.length).toBe(1);
            region = selectionView.regions[0];
            expect(region.position().top).toBeCloseTo(2 * lineHeight);
            expect(region.position().left).toBeCloseTo(7 * charWidth);
            expect(region.height()).toBeCloseTo(lineHeight);
            return expect(region.width()).toBeCloseTo((25 - 7) * charWidth);
          });
        });
        describe("when the selection spans 2 lines", function() {
          return it("covers the selection's range with 2 regions", function() {
            var region1, region2;
            selection.setBufferRange([[2, 7], [3, 25]]);
            expect(selectionView.regions.length).toBe(2);
            region1 = selectionView.regions[0];
            expect(region1.position().top).toBeCloseTo(2 * lineHeight);
            expect(region1.position().left).toBeCloseTo(7 * charWidth);
            expect(region1.height()).toBeCloseTo(lineHeight);
            expect(region1.width()).toBeCloseTo(editorView.renderedLines.outerWidth() - region1.position().left);
            region2 = selectionView.regions[1];
            expect(region2.position().top).toBeCloseTo(3 * lineHeight);
            expect(region2.position().left).toBeCloseTo(0);
            expect(region2.height()).toBeCloseTo(lineHeight);
            return expect(region2.width()).toBeCloseTo(25 * charWidth);
          });
        });
        describe("when the selection spans more than 2 lines", function() {
          return it("covers the selection's range with 3 regions", function() {
            var region1, region2, region3;
            selection.setBufferRange([[2, 7], [6, 25]]);
            expect(selectionView.regions.length).toBe(3);
            region1 = selectionView.regions[0];
            expect(region1.position().top).toBeCloseTo(2 * lineHeight);
            expect(region1.position().left).toBeCloseTo(7 * charWidth);
            expect(region1.height()).toBeCloseTo(lineHeight);
            expect(region1.width()).toBeCloseTo(editorView.renderedLines.outerWidth() - region1.position().left);
            region2 = selectionView.regions[1];
            expect(region2.position().top).toBeCloseTo(3 * lineHeight);
            expect(region2.position().left).toBeCloseTo(0);
            expect(region2.height()).toBeCloseTo(3 * lineHeight);
            expect(region2.width()).toBeCloseTo(editorView.renderedLines.outerWidth());
            expect(editorView.width()).toBeLessThan(800);
            editorView.width(800);
            editorView.resize();
            region2 = selectionView.regions[1];
            expect(region2.width()).toBe(editorView.renderedLines.outerWidth());
            region3 = selectionView.regions[2];
            expect(region3.position().top).toBeCloseTo(6 * lineHeight);
            expect(region3.position().left).toBeCloseTo(0);
            expect(region3.height()).toBeCloseTo(lineHeight);
            return expect(region3.width()).toBeCloseTo(25 * charWidth);
          });
        });
        return it("clears previously drawn regions before creating new ones", function() {
          selection.setBufferRange([[2, 7], [4, 25]]);
          expect(selectionView.regions.length).toBe(3);
          expect(selectionView.find('.region').length).toBe(3);
          selectionView.updateDisplay();
          expect(selectionView.regions.length).toBe(3);
          return expect(selectionView.find('.region').length).toBe(3);
        });
      });
      describe("when a selection merges with another selection", function() {
        return it("removes the merged selection view", function() {
          editor = editorView.editor;
          editor.setCursorScreenPosition([4, 10]);
          editor.selectToScreenPosition([5, 27]);
          editor.addCursorAtScreenPosition([3, 10]);
          editor.selectToScreenPosition([6, 27]);
          expect(editorView.getSelectionViews().length).toBe(1);
          return expect(editorView.find('.region').length).toBe(3);
        });
      });
      describe("when a selection is added and removed before the display is updated", function() {
        return it("does not attempt to render the selection", function() {
          jasmine.unspy(editorView, 'requestDisplayUpdate');
          spyOn(editorView, 'requestDisplayUpdate');
          editor = editorView.editor;
          selection = editor.addSelectionForBufferRange([[3, 0], [3, 4]]);
          selection.destroy();
          editorView.updateDisplay();
          return expect(editorView.getSelectionViews().length).toBe(1);
        });
      });
      describe("when the selection is created with the selectAll event", function() {
        return it("does not scroll to the end of the buffer", function() {
          editorView.height(150);
          editor.selectAll();
          expect(editorView.scrollTop()).toBe(0);
          editorView.hiddenInput.blur();
          editorView.hiddenInput.focus();
          expect(editorView.scrollTop()).toBe(0);
          expect(editorView.scrollView.scrollTop()).toBe(0);
          editor.moveCursorDown();
          return expect(editorView.scrollTop()).toBeGreaterThan(0);
        });
      });
      return describe("selection autoscrolling and highlighting when setting selected buffer range", function() {
        beforeEach(function() {
          return setEditorHeightInLines(editorView, 4);
        });
        describe("if autoscroll is true", function() {
          it("centers the viewport on the selection if its vertical center is currently offscreen", function() {
            editor.setSelectedBufferRange([[2, 0], [4, 0]], {
              autoscroll: true
            });
            expect(editorView.scrollTop()).toBe(0);
            editor.setSelectedBufferRange([[6, 0], [8, 0]], {
              autoscroll: true
            });
            return expect(editorView.scrollTop()).toBe(5 * editorView.lineHeight);
          });
          return it("highlights the selection if autoscroll is true", function() {
            editor.setSelectedBufferRange([[2, 0], [4, 0]], {
              autoscroll: true
            });
            expect(editorView.getSelectionView()).toHaveClass('highlighted');
            advanceClock(1000);
            expect(editorView.getSelectionView()).not.toHaveClass('highlighted');
            editor.setSelectedBufferRange([[3, 0], [5, 0]], {
              autoscroll: true
            });
            expect(editorView.getSelectionView()).toHaveClass('highlighted');
            advanceClock(500);
            spyOn(editorView.getSelectionView(), 'removeClass').andCallThrough();
            editor.setSelectedBufferRange([[2, 0], [4, 0]], {
              autoscroll: true
            });
            expect(editorView.getSelectionView().removeClass).toHaveBeenCalledWith('highlighted');
            expect(editorView.getSelectionView()).toHaveClass('highlighted');
            advanceClock(500);
            return expect(editorView.getSelectionView()).toHaveClass('highlighted');
          });
        });
        describe("if autoscroll is false", function() {
          return it("does not scroll to the selection or the cursor", function() {
            var scrollTopBefore;
            editorView.scrollToBottom();
            scrollTopBefore = editorView.scrollTop();
            editor.setSelectedBufferRange([[0, 0], [1, 0]], {
              autoscroll: false
            });
            return expect(editorView.scrollTop()).toBe(scrollTopBefore);
          });
        });
        return describe("if autoscroll is not specified", function() {
          return it("autoscrolls to the cursor as normal", function() {
            editorView.scrollToBottom();
            editor.setSelectedBufferRange([[0, 0], [1, 0]]);
            return expect(editorView.scrollTop()).toBe(0);
          });
        });
      });
    });
    describe("cursor rendering", function() {
      return describe("when the cursor moves", function() {
        var charWidth;
        charWidth = null;
        beforeEach(function() {
          editorView.attachToDom();
          editorView.vScrollMargin = 3;
          editorView.hScrollMargin = 5;
          return charWidth = editorView.charWidth, editorView;
        });
        it("repositions the cursor's view on screen", function() {
          editor.setCursorScreenPosition({
            row: 2,
            column: 2
          });
          return expect(editorView.getCursorView().position()).toEqual({
            top: 2 * editorView.lineHeight,
            left: 2 * editorView.charWidth
          });
        });
        it("hides the cursor when the selection is non-empty, and shows it otherwise", function() {
          var cursorView;
          cursorView = editorView.getCursorView();
          expect(editor.getSelection().isEmpty()).toBeTruthy();
          expect(cursorView).toBeVisible();
          editor.setSelectedBufferRange([[0, 0], [3, 0]]);
          expect(editor.getSelection().isEmpty()).toBeFalsy();
          expect(cursorView).toBeHidden();
          editor.setCursorBufferPosition([1, 3]);
          expect(editor.getSelection().isEmpty()).toBeTruthy();
          return expect(cursorView).toBeVisible();
        });
        it("moves the hiddenInput to the same position with cursor's view", function() {
          editor.setCursorScreenPosition({
            row: 2,
            column: 2
          });
          return expect(editorView.getCursorView().offset()).toEqual(editorView.hiddenInput.offset());
        });
        describe("when the editor view is using a variable-width font", function() {
          beforeEach(function() {
            return editorView.setFontFamily('sans-serif');
          });
          describe("on #darwin or #linux", function() {
            return it("correctly positions the cursor", function() {
              editor.setCursorBufferPosition([3, 30]);
              expect(editorView.getCursorView().position()).toEqual({
                top: 3 * editorView.lineHeight,
                left: 178
              });
              editor.setCursorBufferPosition([3, Infinity]);
              return expect(editorView.getCursorView().position()).toEqual({
                top: 3 * editorView.lineHeight,
                left: 353
              });
            });
          });
          return describe("on #win32", function() {
            return it("correctly positions the cursor", function() {
              editor.setCursorBufferPosition([3, 30]);
              expect(editorView.getCursorView().position()).toEqual({
                top: 3 * editorView.lineHeight,
                left: 175
              });
              editor.setCursorBufferPosition([3, Infinity]);
              return expect(editorView.getCursorView().position()).toEqual({
                top: 3 * editorView.lineHeight,
                left: 346
              });
            });
          });
        });
        return describe("autoscrolling", function() {
          it("only autoscrolls when the last cursor is moved", function() {
            var cursor1, cursor2, _ref2;
            editor.setCursorBufferPosition([11, 0]);
            editor.addCursorAtBufferPosition([6, 50]);
            _ref2 = editor.getCursors(), cursor1 = _ref2[0], cursor2 = _ref2[1];
            spyOn(editorView, 'scrollToPixelPosition');
            cursor1.setScreenPosition([10, 10]);
            expect(editorView.scrollToPixelPosition).not.toHaveBeenCalled();
            cursor2.setScreenPosition([11, 11]);
            return expect(editorView.scrollToPixelPosition).toHaveBeenCalled();
          });
          it("does not autoscroll if the 'autoscroll' option is false", function() {
            editor.setCursorBufferPosition([11, 0]);
            spyOn(editorView, 'scrollToPixelPosition');
            editor.setCursorScreenPosition([10, 10], {
              autoscroll: false
            });
            return expect(editorView.scrollToPixelPosition).not.toHaveBeenCalled();
          });
          it("autoscrolls to cursor if autoscroll is true, even if the position does not change", function() {
            spyOn(editorView, 'scrollToPixelPosition');
            editor.setCursorScreenPosition([4, 10], {
              autoscroll: false
            });
            editor.setCursorScreenPosition([4, 10]);
            expect(editorView.scrollToPixelPosition).toHaveBeenCalled();
            editorView.scrollToPixelPosition.reset();
            editor.setCursorBufferPosition([4, 10]);
            return expect(editorView.scrollToPixelPosition).toHaveBeenCalled();
          });
          it("does not autoscroll the cursor based on a buffer change, unless the buffer change was initiated by the cursor", function() {
            var lastVisibleRow;
            lastVisibleRow = editorView.getLastVisibleScreenRow();
            editor.addCursorAtBufferPosition([lastVisibleRow, 0]);
            spyOn(editorView, 'scrollToPixelPosition');
            buffer.insert([lastVisibleRow, 0], "\n\n");
            expect(editorView.scrollToPixelPosition).not.toHaveBeenCalled();
            editor.insertText('\n\n');
            return expect(editorView.scrollToPixelPosition.callCount).toBe(1);
          });
          it("autoscrolls on undo/redo", function() {
            spyOn(editorView, 'scrollToPixelPosition');
            editor.insertText('\n\n');
            expect(editorView.scrollToPixelPosition.callCount).toBe(1);
            editor.undo();
            expect(editorView.scrollToPixelPosition.callCount).toBe(2);
            editor.redo();
            return expect(editorView.scrollToPixelPosition.callCount).toBe(3);
          });
          describe("when the last cursor exceeds the upper or lower scroll margins", function() {
            describe("when the editor view is taller than twice the vertical scroll margin", function() {
              return it("sets the scrollTop so the cursor remains within the scroll margin", function() {
                setEditorHeightInLines(editorView, 10);
                _.times(6, function() {
                  return editor.moveCursorDown();
                });
                expect(editorView.scrollTop()).toBe(0);
                editor.moveCursorDown();
                expect(editorView.scrollTop()).toBe(editorView.lineHeight);
                editor.moveCursorDown();
                expect(editorView.scrollTop()).toBe(editorView.lineHeight * 2);
                _.times(3, function() {
                  return editor.moveCursorUp();
                });
                editor.moveCursorUp();
                expect(editorView.scrollTop()).toBe(editorView.lineHeight);
                editor.moveCursorUp();
                return expect(editorView.scrollTop()).toBe(0);
              });
            });
            return describe("when the editor view is shorter than twice the vertical scroll margin", function() {
              return it("sets the scrollTop based on a reduced scroll margin, which prevents a jerky tug-of-war between upper and lower scroll margins", function() {
                setEditorHeightInLines(editorView, 5);
                _.times(3, function() {
                  return editor.moveCursorDown();
                });
                expect(editorView.scrollTop()).toBe(editorView.lineHeight);
                editor.moveCursorUp();
                return expect(editorView.renderedLines.css('top')).toBe("0px");
              });
            });
          });
          return describe("when the last cursor exceeds the right or left scroll margins", function() {
            describe("when soft-wrap is disabled", function() {
              describe("when the editor view is wider than twice the horizontal scroll margin", function() {
                return it("sets the scrollView's scrollLeft so the cursor remains within the scroll margin", function() {
                  setEditorWidthInChars(editorView, 30);
                  editor.setCursorScreenPosition([2, 24]);
                  expect(editorView.scrollLeft()).toBe(0);
                  editor.setCursorScreenPosition([2, 25]);
                  expect(editorView.scrollLeft()).toBe(charWidth);
                  editor.setCursorScreenPosition([2, 28]);
                  expect(editorView.scrollLeft()).toBe(charWidth * 4);
                  editor.setCursorScreenPosition([2, 9]);
                  expect(editorView.scrollLeft()).toBe(charWidth * 4);
                  editor.setCursorScreenPosition([2, 8]);
                  expect(editorView.scrollLeft()).toBe(charWidth * 3);
                  editor.setCursorScreenPosition([2, 5]);
                  return expect(editorView.scrollLeft()).toBe(0);
                });
              });
              return describe("when the editor view is narrower than twice the horizontal scroll margin", function() {
                return it("sets the scrollView's scrollLeft based on a reduced horizontal scroll margin, to prevent a jerky tug-of-war between right and left scroll margins", function() {
                  editorView.hScrollMargin = 6;
                  setEditorWidthInChars(editorView, 7);
                  editor.setCursorScreenPosition([2, 3]);
                  window.advanceClock();
                  expect(editorView.scrollLeft()).toBe(0);
                  editor.setCursorScreenPosition([2, 4]);
                  window.advanceClock();
                  expect(editorView.scrollLeft()).toBe(charWidth);
                  editor.setCursorScreenPosition([2, 3]);
                  window.advanceClock();
                  return expect(editorView.scrollLeft()).toBe(0);
                });
              });
            });
            return describe("when soft-wrap is enabled", function() {
              beforeEach(function() {
                return editor.setSoftWrap(true);
              });
              return it("does not scroll the buffer horizontally", function() {
                editorView.width(charWidth * 30);
                editor.setCursorScreenPosition([2, 24]);
                expect(editorView.scrollLeft()).toBe(0);
                editor.setCursorScreenPosition([2, 25]);
                expect(editorView.scrollLeft()).toBe(0);
                editor.setCursorScreenPosition([2, 28]);
                expect(editorView.scrollLeft()).toBe(0);
                editor.setCursorScreenPosition([2, 9]);
                expect(editorView.scrollLeft()).toBe(0);
                editor.setCursorScreenPosition([2, 8]);
                expect(editorView.scrollLeft()).toBe(0);
                editor.setCursorScreenPosition([2, 5]);
                return expect(editorView.scrollLeft()).toBe(0);
              });
            });
          });
        });
      });
    });
    describe("when editor:toggle-soft-wrap is toggled", function() {
      return describe("when the text exceeds the editor view width and the scroll-view is horizontally scrolled", function() {
        return it("wraps the text and renders properly", function() {
          editorView.attachToDom({
            heightInLines: 30,
            widthInChars: 30
          });
          editorView.setWidthInChars(100);
          editor.setText("Fashion axe umami jean shorts retro hashtag carles mumblecore. Photo booth skateboard Austin gentrify occupy ethical. Food truck gastropub keffiyeh, squid deep v pinterest literally sustainable salvia scenester messenger bag. Neutra messenger bag flexitarian four loko, shoreditch VHS pop-up tumblr seitan synth master cleanse. Marfa selvage ugh, raw denim authentic try-hard mcsweeney's trust fund fashion axe actually polaroid viral sriracha. Banh mi marfa plaid single-origin coffee. Pickled mumblecore lomo ugh bespoke.");
          editorView.scrollLeft(editorView.charWidth * 30);
          editorView.trigger("editor:toggle-soft-wrap");
          expect(editorView.scrollLeft()).toBe(0);
          return expect(editorView.editor.getSoftWrapColumn()).not.toBe(100);
        });
      });
    });
    describe("text rendering", function() {
      describe("when all lines in the buffer are visible on screen", function() {
        beforeEach(function() {
          editorView.attachToDom();
          return expect(editorView.trueHeight()).toBeCloseTo(buffer.getLineCount() * editorView.lineHeight);
        });
        it("creates a line element for each line in the buffer with the html-escaped text of the line", function() {
          expect(editorView.renderedLines.find('.line').length).toEqual(buffer.getLineCount());
          expect(buffer.lineForRow(2)).toContain('<');
          expect(editorView.renderedLines.find('.line:eq(2)').html()).toContain('&lt;');
          expect(buffer.lineForRow(10)).toBe('');
          return expect(editorView.renderedLines.find('.line:eq(10)').html()).toBe('&nbsp;');
        });
        it("syntax highlights code based on the file type", function() {
          var line0, line12, span0, span0_1;
          line0 = editorView.renderedLines.find('.line:first');
          span0 = line0.children('span:eq(0)');
          expect(span0).toMatchSelector('.source.js');
          expect(span0.children('span:eq(0)')).toMatchSelector('.storage.modifier.js');
          expect(span0.children('span:eq(0)').text()).toBe('var');
          span0_1 = span0.children('span:eq(1)');
          expect(span0_1).toMatchSelector('.meta.function.js');
          expect(span0_1.text()).toBe('quicksort = function ()');
          expect(span0_1.children('span:eq(0)')).toMatchSelector('.entity.name.function.js');
          expect(span0_1.children('span:eq(0)').text()).toBe("quicksort");
          expect(span0_1.children('span:eq(1)')).toMatchSelector('.keyword.operator.js');
          expect(span0_1.children('span:eq(1)').text()).toBe("=");
          expect(span0_1.children('span:eq(2)')).toMatchSelector('.storage.type.function.js');
          expect(span0_1.children('span:eq(2)').text()).toBe("function");
          expect(span0_1.children('span:eq(3)')).toMatchSelector('.punctuation.definition.parameters.begin.js');
          expect(span0_1.children('span:eq(3)').text()).toBe("(");
          expect(span0_1.children('span:eq(4)')).toMatchSelector('.punctuation.definition.parameters.end.js');
          expect(span0_1.children('span:eq(4)').text()).toBe(")");
          expect(span0.children('span:eq(2)')).toMatchSelector('.meta.brace.curly.js');
          expect(span0.children('span:eq(2)').text()).toBe("{");
          line12 = editorView.renderedLines.find('.line:eq(11)').children('span:eq(0)');
          return expect(line12.children('span:eq(1)')).toMatchSelector('.keyword');
        });
        it("wraps hard tabs in a span", function() {
          var line0, span0_0;
          editor.setText('\t<- hard tab');
          line0 = editorView.renderedLines.find('.line:first');
          span0_0 = line0.children('span:eq(0)').children('span:eq(0)');
          expect(span0_0).toMatchSelector('.hard-tab');
          expect(span0_0.text()).toBe('  ');
          return expect(span0_0.text().length).toBe(editor.getTabLength());
        });
        it("wraps leading whitespace in a span", function() {
          var line1, span0_0;
          line1 = editorView.renderedLines.find('.line:eq(1)');
          span0_0 = line1.children('span:eq(0)').children('span:eq(0)');
          expect(span0_0).toMatchSelector('.leading-whitespace');
          return expect(span0_0.text()).toBe('  ');
        });
        describe("when the line has trailing whitespace", function() {
          return it("wraps trailing whitespace in a span", function() {
            var line0, span0_last;
            editor.setText('trailing whitespace ->   ');
            line0 = editorView.renderedLines.find('.line:first');
            span0_last = line0.children('span:eq(0)').children('span:last');
            expect(span0_last).toMatchSelector('.trailing-whitespace');
            return expect(span0_last.text()).toBe('   ');
          });
        });
        return describe("when lines are updated in the buffer", function() {
          return it("syntax highlights the updated lines", function() {
            expect(editorView.renderedLines.find('.line:eq(0) > span:first > span:first')).toMatchSelector('.storage.modifier.js');
            buffer.insert([0, 0], "q");
            expect(editorView.renderedLines.find('.line:eq(0) > span:first > span:first')).not.toMatchSelector('.storage.modifier.js');
            buffer.insert([5, 0], "/* */");
            buffer.insert([1, 0], "/*");
            return expect(editorView.renderedLines.find('.line:eq(2) > span:first > span:first')).toMatchSelector('.comment');
          });
        });
      });
      describe("when some lines at the end of the buffer are not visible on screen", function() {
        beforeEach(function() {
          return editorView.attachToDom({
            heightInLines: 5.5
          });
        });
        it("only renders the visible lines plus the overdrawn lines, setting the padding-bottom of the lines element to account for the missing lines", function() {
          var expectedPaddingBottom;
          expect(editorView.renderedLines.find('.line').length).toBe(8);
          expectedPaddingBottom = (buffer.getLineCount() - 8) * editorView.lineHeight;
          expect(editorView.renderedLines.css('padding-bottom')).toBe("" + expectedPaddingBottom + "px");
          expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(0));
          return expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(7));
        });
        it("renders additional lines when the editor view is resized", function() {
          setEditorHeightInLines(editorView, 10);
          $(window).trigger('resize');
          expect(editorView.renderedLines.find('.line').length).toBe(12);
          expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(0));
          return expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(11));
        });
        it("renders correctly when scrolling after text is added to the buffer", function() {
          editor.insertText("1\n");
          _.times(4, function() {
            return editor.moveCursorDown();
          });
          expect(editorView.renderedLines.find('.line:eq(2)').text()).toBe(editor.lineForBufferRow(2));
          return expect(editorView.renderedLines.find('.line:eq(7)').text()).toBe(editor.lineForBufferRow(7));
        });
        it("renders correctly when scrolling after text is removed from buffer", function() {
          editor.getBuffer()["delete"]([[0, 0], [1, 0]]);
          expect(editorView.renderedLines.find('.line:eq(0)').text()).toBe(editor.lineForBufferRow(0));
          expect(editorView.renderedLines.find('.line:eq(5)').text()).toBe(editor.lineForBufferRow(5));
          editorView.scrollTop(3 * editorView.lineHeight);
          expect(editorView.renderedLines.find('.line:first').text()).toBe(editor.lineForBufferRow(1));
          return expect(editorView.renderedLines.find('.line:last').text()).toBe(editor.lineForBufferRow(10));
        });
        describe("when creating and destroying folds that are longer than the visible lines", function() {
          describe("when the cursor precedes the fold when it is destroyed", function() {
            return it("renders lines and line numbers correctly", function() {
              var fold, scrollHeightBeforeFold;
              scrollHeightBeforeFold = editorView.scrollView.prop('scrollHeight');
              fold = editor.createFold(1, 9);
              fold.destroy();
              expect(editorView.scrollView.prop('scrollHeight')).toBe(scrollHeightBeforeFold);
              expect(editorView.renderedLines.find('.line').length).toBe(8);
              expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(7));
              expect(editorView.gutter.find('.line-number').length).toBe(8);
              expect(editorView.gutter.find('.line-number:last').intValue()).toBe(8);
              editorView.scrollTop(4 * editorView.lineHeight);
              expect(editorView.renderedLines.find('.line').length).toBe(10);
              return expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(11));
            });
          });
          return describe("when the cursor follows the fold when it is destroyed", function() {
            return it("renders lines and line numbers correctly", function() {
              var fold;
              fold = editor.createFold(1, 9);
              editor.setCursorBufferPosition([10, 0]);
              fold.destroy();
              expect(editorView.renderedLines.find('.line').length).toBe(8);
              expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(12));
              expect(editorView.gutter.find('.line-number').length).toBe(8);
              expect(editorView.gutter.find('.line-number:last').text()).toBe('13');
              editorView.scrollTop(4 * editorView.lineHeight);
              expect(editorView.renderedLines.find('.line').length).toBe(10);
              return expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(11));
            });
          });
        });
        return describe("when scrolling vertically", function() {
          describe("when scrolling less than the editor view's height", function() {
            return it("draws new lines and removes old lines when the last visible line will exceed the last rendered line", function() {
              expect(editorView.renderedLines.find('.line').length).toBe(8);
              editorView.scrollTop(editorView.lineHeight * 1.5);
              expect(editorView.renderedLines.find('.line').length).toBe(8);
              expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(0));
              expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(7));
              editorView.scrollTop(editorView.lineHeight * 3.5);
              expect(editorView.renderedLines.find('.line').length).toBe(10);
              expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(1));
              expect(editorView.renderedLines.find('.line:last').html()).toBe('&nbsp;');
              expect(editorView.gutter.find('.line-number:first').intValue()).toBe(2);
              expect(editorView.gutter.find('.line-number:last').intValue()).toBe(11);
              editorView.scrollTop(editorView.lineHeight * 5.5);
              expect(editorView.renderedLines.find('.line').length).toBe(10);
              expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(1));
              expect(editorView.renderedLines.find('.line:last').html()).toBe('&nbsp;');
              expect(editorView.gutter.find('.line-number:first').intValue()).toBe(2);
              expect(editorView.gutter.find('.line-number:last').intValue()).toBe(11);
              editorView.scrollTop(editorView.lineHeight * 7.5);
              expect(editorView.renderedLines.find('.line').length).toBe(8);
              expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(5));
              expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(12));
              editorView.scrollTop(editorView.lineHeight * 3.5);
              expect(editorView.renderedLines.find('.line').length).toBe(10);
              expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(1));
              expect(editorView.renderedLines.find('.line:last').html()).toBe('&nbsp;');
              editorView.scrollTop(0);
              expect(editorView.renderedLines.find('.line').length).toBe(8);
              expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(0));
              return expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(7));
            });
          });
          describe("when scrolling more than the editors height", function() {
            return it("removes lines that are offscreen and not in range of the overdraw and builds lines that become visible", function() {
              editorView.scrollTop(editorView.layerHeight - editorView.scrollView.height());
              expect(editorView.renderedLines.find('.line').length).toBe(8);
              expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(5));
              expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(12));
              editorView.verticalScrollbar.scrollBottom(0);
              editorView.verticalScrollbar.trigger('scroll');
              expect(editorView.renderedLines.find('.line').length).toBe(8);
              expect(editorView.renderedLines.find('.line:first').text()).toBe(buffer.lineForRow(0));
              return expect(editorView.renderedLines.find('.line:last').text()).toBe(buffer.lineForRow(7));
            });
          });
          return it("adjusts the vertical padding of the lines element to account for non-rendered lines", function() {
            var expectedPaddingBottom, expectedPaddingTop, firstOverdrawnBufferRow, firstVisibleBufferRow, lastOverdrawnRow, lastVisibleBufferRow;
            editorView.scrollTop(editorView.lineHeight * 3);
            firstVisibleBufferRow = 3;
            expectedPaddingTop = (firstVisibleBufferRow - editorView.lineOverdraw) * editorView.lineHeight;
            expect(editorView.renderedLines.css('padding-top')).toBe("" + expectedPaddingTop + "px");
            lastVisibleBufferRow = Math.ceil(3 + 5.5);
            lastOverdrawnRow = lastVisibleBufferRow + editorView.lineOverdraw;
            expectedPaddingBottom = (buffer.getLineCount() - lastOverdrawnRow) * editorView.lineHeight;
            expect(editorView.renderedLines.css('padding-bottom')).toBe("" + expectedPaddingBottom + "px");
            editorView.scrollToBottom();
            firstVisibleBufferRow = Math.floor(buffer.getLineCount() - 5.5);
            firstOverdrawnBufferRow = firstVisibleBufferRow - editorView.lineOverdraw;
            expectedPaddingTop = firstOverdrawnBufferRow * editorView.lineHeight;
            expect(editorView.renderedLines.css('padding-top')).toBe("" + expectedPaddingTop + "px");
            return expect(editorView.renderedLines.css('padding-bottom')).toBe("0px");
          });
        });
      });
      describe("when lines are added", function() {
        beforeEach(function() {
          return editorView.attachToDom({
            heightInLines: 5
          });
        });
        describe("when the change precedes the first rendered row", function() {
          return it("inserts and removes rendered lines to account for upstream change", function() {
            editorView.scrollToBottom();
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(6));
            expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(12));
            buffer.setTextInRange([[1, 0], [3, 0]], "1\n2\n3\n");
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(6));
            return expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(12));
          });
        });
        describe("when the change straddles the first rendered row", function() {
          return it("doesn't render rows that were not previously rendered", function() {
            editorView.scrollToBottom();
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(6));
            expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(12));
            buffer.setTextInRange([[2, 0], [7, 0]], "2\n3\n4\n5\n6\n7\n8\n9\n");
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(6));
            return expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(12));
          });
        });
        describe("when the change straddles the last rendered row", function() {
          return it("doesn't render rows that were not previously rendered", function() {
            buffer.setTextInRange([[2, 0], [7, 0]], "2\n3\n4\n5\n6\n7\n8\n");
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(0));
            return expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(6));
          });
        });
        describe("when the change the follows the last rendered row", function() {
          return it("does not change the rendered lines", function() {
            buffer.setTextInRange([[12, 0], [12, 0]], "12\n13\n14\n");
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(0));
            return expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(6));
          });
        });
        return it("increases the width of the rendered lines element to be either the width of the longest line or the width of the scrollView (whichever is longer)", function() {
          var maxLineLength, widthBefore, _i, _ref2, _results;
          maxLineLength = editor.getMaxScreenLineLength();
          setEditorWidthInChars(editorView, maxLineLength);
          widthBefore = editorView.renderedLines.width();
          expect(widthBefore).toBe(editorView.scrollView.width() + 20);
          buffer.setTextInRange([[12, 0], [12, 0]], (function() {
            _results = [];
            for (var _i = 1, _ref2 = maxLineLength * 2; 1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; 1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this).join(''));
          return expect(editorView.renderedLines.width()).toBeGreaterThan(widthBefore);
        });
      });
      describe("when lines are removed", function() {
        beforeEach(function() {
          return editorView.attachToDom({
            heightInLines: 5
          });
        });
        it("sets the rendered screen line's width to either the max line length or the scollView's width (whichever is greater)", function() {
          var maxLineLength, widthBefore, _i, _ref2, _results;
          maxLineLength = editor.getMaxScreenLineLength();
          setEditorWidthInChars(editorView, maxLineLength);
          buffer.setTextInRange([[12, 0], [12, 0]], (function() {
            _results = [];
            for (var _i = 1, _ref2 = maxLineLength * 2; 1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; 1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this).join(''));
          expect(editorView.renderedLines.width()).toBeGreaterThan(editorView.scrollView.width());
          widthBefore = editorView.renderedLines.width();
          buffer["delete"]([[12, 0], [12, Infinity]]);
          return expect(editorView.renderedLines.width()).toBe(editorView.scrollView.width() + 20);
        });
        describe("when the change the precedes the first rendered row", function() {
          return it("removes rendered lines to account for upstream change", function() {
            editorView.scrollToBottom();
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(6));
            expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(12));
            buffer.setTextInRange([[1, 0], [2, 0]], "");
            expect(editorView.renderedLines.find(".line").length).toBe(6);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(6));
            return expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(11));
          });
        });
        describe("when the change straddles the first rendered row", function() {
          return it("renders the correct rows", function() {
            editorView.scrollToBottom();
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(6));
            expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(12));
            buffer.setTextInRange([[7, 0], [11, 0]], "1\n2\n");
            expect(editorView.renderedLines.find(".line").length).toBe(5);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(6));
            return expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(10));
          });
        });
        describe("when the change straddles the last rendered row", function() {
          return it("renders the correct rows", function() {
            buffer.setTextInRange([[2, 0], [7, 0]], "");
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(0));
            return expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(6));
          });
        });
        describe("when the change the follows the last rendered row", function() {
          return it("does not change the rendered lines", function() {
            buffer.setTextInRange([[10, 0], [12, 0]], "");
            expect(editorView.renderedLines.find(".line").length).toBe(7);
            expect(editorView.renderedLines.find(".line:first").text()).toBe(buffer.lineForRow(0));
            return expect(editorView.renderedLines.find(".line:last").text()).toBe(buffer.lineForRow(6));
          });
        });
        return describe("when the last line is removed when the editor view is scrolled to the bottom", function() {
          return it("reduces the editor view's scrollTop (due to the reduced total scroll height) and renders the correct screen lines", function() {
            var initialScrollTop;
            editor.setCursorScreenPosition([Infinity, Infinity]);
            editor.insertText('\n\n\n');
            editorView.scrollToBottom();
            expect(buffer.getLineCount()).toBe(16);
            initialScrollTop = editorView.scrollTop();
            expect(editorView.firstRenderedScreenRow).toBe(9);
            expect(editorView.lastRenderedScreenRow).toBe(15);
            editor.backspace();
            expect(editorView.scrollTop()).toBeLessThan(initialScrollTop);
            expect(editorView.firstRenderedScreenRow).toBe(9);
            expect(editorView.lastRenderedScreenRow).toBe(14);
            expect(editorView.find('.line').length).toBe(6);
            editor.backspace();
            expect(editorView.firstRenderedScreenRow).toBe(9);
            expect(editorView.lastRenderedScreenRow).toBe(13);
            expect(editorView.find('.line').length).toBe(5);
            editor.backspace();
            expect(editorView.firstRenderedScreenRow).toBe(6);
            expect(editorView.lastRenderedScreenRow).toBe(12);
            return expect(editorView.find('.line').length).toBe(7);
          });
        });
      });
      describe("when folding leaves less then a screen worth of text (regression)", function() {
        return it("renders lines properly", function() {
          editorView.lineOverdraw = 1;
          editorView.attachToDom({
            heightInLines: 5
          });
          editorView.editor.foldBufferRow(4);
          editorView.editor.foldBufferRow(0);
          expect(editorView.renderedLines.find('.line').length).toBe(1);
          return expect(editorView.renderedLines.find('.line').text()).toBe(buffer.lineForRow(0));
        });
      });
      describe("when folding leaves fewer screen lines than the first rendered screen line (regression)", function() {
        return it("clears all screen lines and does not throw any exceptions", function() {
          editorView.lineOverdraw = 1;
          editorView.attachToDom({
            heightInLines: 5
          });
          editorView.scrollToBottom();
          editorView.editor.foldBufferRow(0);
          expect(editorView.renderedLines.find('.line').length).toBe(1);
          return expect(editorView.renderedLines.find('.line').text()).toBe(buffer.lineForRow(0));
        });
      });
      describe("when autoscrolling at the end of the document", function() {
        return it("renders lines properly", function() {
          waitsForPromise(function() {
            return atom.workspace.open('two-hundred.txt').then(function(editor) {
              return editorView.edit(editor);
            });
          });
          return runs(function() {
            editorView.attachToDom({
              heightInLines: 5.5
            });
            expect(editorView.renderedLines.find('.line').length).toBe(8);
            editor.moveCursorToBottom();
            return expect(editorView.renderedLines.find('.line').length).toBe(8);
          });
        });
      });
      describe("when line has a character that could push it to be too tall (regression)", function() {
        return it("does renders the line at a consistent height", function() {
          editorView.attachToDom();
          buffer.insert([0, 0], "–");
          return expect(editorView.find('.line:eq(0)').outerHeight()).toBe(editorView.find('.line:eq(1)').outerHeight());
        });
      });
      describe("when editor.showInvisibles config is set to true", function() {
        it("displays spaces, tabs, and newlines using visible non-empty values", function() {
          var eol, space, tab, _ref2, _ref3, _ref4;
          editor.setText(" a line with tabs\tand spaces ");
          editorView.attachToDom();
          expect(atom.config.get("editor.showInvisibles")).toBeFalsy();
          expect(editorView.renderedLines.find('.line').text()).toBe(" a line with tabs and spaces ");
          atom.config.set("editor.showInvisibles", true);
          space = (_ref2 = editorView.invisibles) != null ? _ref2.space : void 0;
          expect(space).toBeTruthy();
          tab = (_ref3 = editorView.invisibles) != null ? _ref3.tab : void 0;
          expect(tab).toBeTruthy();
          eol = (_ref4 = editorView.invisibles) != null ? _ref4.eol : void 0;
          expect(eol).toBeTruthy();
          expect(editorView.renderedLines.find('.line').text()).toBe("" + space + "a line with tabs" + tab + "and spaces" + space + eol);
          atom.config.set("editor.showInvisibles", false);
          return expect(editorView.renderedLines.find('.line').text()).toBe(" a line with tabs and spaces ");
        });
        it("displays newlines as their own token outside of the other tokens scope", function() {
          editorView.setShowInvisibles(true);
          editorView.attachToDom();
          editor.setText("var");
          return expect(editorView.find('.line').html()).toBe('<span class="source js"><span class="storage modifier js">var</span></span><span class="invisible-character">¬</span>');
        });
        it("allows invisible glyphs to be customized via the editor.invisibles config", function() {
          editor.setText(" \t ");
          editorView.attachToDom();
          atom.config.set("editor.showInvisibles", true);
          atom.config.set("editor.invisibles", {
            eol: ";",
            space: "_",
            tab: "tab"
          });
          return expect(editorView.find(".line:first").text()).toBe("_tab_;");
        });
        it("displays trailing carriage return using a visible non-empty value", function() {
          var cr, eol, _ref2, _ref3;
          editor.setText("a line that ends with a carriage return\r\n");
          editorView.attachToDom();
          expect(atom.config.get("editor.showInvisibles")).toBeFalsy();
          expect(editorView.renderedLines.find('.line:first').text()).toBe("a line that ends with a carriage return");
          atom.config.set("editor.showInvisibles", true);
          cr = (_ref2 = editorView.invisibles) != null ? _ref2.cr : void 0;
          expect(cr).toBeTruthy();
          eol = (_ref3 = editorView.invisibles) != null ? _ref3.eol : void 0;
          expect(eol).toBeTruthy();
          return expect(editorView.renderedLines.find('.line:first').text()).toBe("a line that ends with a carriage return" + cr + eol);
        });
        return describe("when wrapping is on", function() {
          beforeEach(function() {
            return editor.setSoftWrap(true);
          });
          it("doesn't show the end of line invisible at the end of lines broken due to wrapping", function() {
            var eol, space, _ref2, _ref3;
            editor.setText("a line that wraps ");
            editorView.attachToDom();
            editorView.setWidthInChars(6);
            atom.config.set("editor.showInvisibles", true);
            space = (_ref2 = editorView.invisibles) != null ? _ref2.space : void 0;
            expect(space).toBeTruthy();
            eol = (_ref3 = editorView.invisibles) != null ? _ref3.eol : void 0;
            expect(eol).toBeTruthy();
            expect(editorView.renderedLines.find('.line:first').text()).toBe("a line ");
            return expect(editorView.renderedLines.find('.line:last').text()).toBe("wraps" + space + eol);
          });
          return it("displays trailing carriage return using a visible non-empty value", function() {
            var cr, eol, space, _ref2, _ref3, _ref4;
            editor.setText("a line that \r\n");
            editorView.attachToDom();
            editorView.setWidthInChars(6);
            atom.config.set("editor.showInvisibles", true);
            space = (_ref2 = editorView.invisibles) != null ? _ref2.space : void 0;
            expect(space).toBeTruthy();
            cr = (_ref3 = editorView.invisibles) != null ? _ref3.cr : void 0;
            expect(cr).toBeTruthy();
            eol = (_ref4 = editorView.invisibles) != null ? _ref4.eol : void 0;
            expect(eol).toBeTruthy();
            expect(editorView.renderedLines.find('.line:first').text()).toBe("a line ");
            expect(editorView.renderedLines.find('.line:eq(1)').text()).toBe("that" + space + cr + eol);
            return expect(editorView.renderedLines.find('.line:last').text()).toBe("" + eol);
          });
        });
      });
      describe("when editor.showIndentGuide is set to true", function() {
        it("adds an indent-guide class to each leading whitespace span", function() {
          editorView.attachToDom();
          expect(atom.config.get("editor.showIndentGuide")).toBeFalsy();
          atom.config.set("editor.showIndentGuide", true);
          expect(editorView.showIndentGuide).toBeTruthy();
          expect(editorView.renderedLines.find('.line:eq(0) .indent-guide').length).toBe(0);
          expect(editorView.renderedLines.find('.line:eq(1) .indent-guide').length).toBe(1);
          expect(editorView.renderedLines.find('.line:eq(1) .indent-guide').text()).toBe('  ');
          expect(editorView.renderedLines.find('.line:eq(2) .indent-guide').length).toBe(2);
          expect(editorView.renderedLines.find('.line:eq(2) .indent-guide').text()).toBe('    ');
          expect(editorView.renderedLines.find('.line:eq(3) .indent-guide').length).toBe(2);
          expect(editorView.renderedLines.find('.line:eq(3) .indent-guide').text()).toBe('    ');
          expect(editorView.renderedLines.find('.line:eq(4) .indent-guide').length).toBe(2);
          expect(editorView.renderedLines.find('.line:eq(4) .indent-guide').text()).toBe('    ');
          expect(editorView.renderedLines.find('.line:eq(5) .indent-guide').length).toBe(3);
          expect(editorView.renderedLines.find('.line:eq(5) .indent-guide').text()).toBe('      ');
          expect(editorView.renderedLines.find('.line:eq(6) .indent-guide').length).toBe(3);
          expect(editorView.renderedLines.find('.line:eq(6) .indent-guide').text()).toBe('      ');
          expect(editorView.renderedLines.find('.line:eq(7) .indent-guide').length).toBe(2);
          expect(editorView.renderedLines.find('.line:eq(7) .indent-guide').text()).toBe('    ');
          expect(editorView.renderedLines.find('.line:eq(8) .indent-guide').length).toBe(2);
          expect(editorView.renderedLines.find('.line:eq(8) .indent-guide').text()).toBe('    ');
          expect(editorView.renderedLines.find('.line:eq(9) .indent-guide').length).toBe(1);
          expect(editorView.renderedLines.find('.line:eq(9) .indent-guide').text()).toBe('  ');
          expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').length).toBe(1);
          expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').text()).toBe('  ');
          expect(editorView.renderedLines.find('.line:eq(11) .indent-guide').length).toBe(1);
          expect(editorView.renderedLines.find('.line:eq(11) .indent-guide').text()).toBe('  ');
          return expect(editorView.renderedLines.find('.line:eq(12) .indent-guide').length).toBe(0);
        });
        describe("when the indentation level on a line before an empty line is changed", function() {
          return it("updates the indent guide on the empty line", function() {
            editorView.attachToDom();
            atom.config.set("editor.showIndentGuide", true);
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').length).toBe(1);
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').text()).toBe('  ');
            editor.setCursorBufferPosition([9]);
            editor.indentSelectedRows();
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').length).toBe(2);
            return expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').text()).toBe('    ');
          });
        });
        describe("when the indentation level on a line after an empty line is changed", function() {
          return it("updates the indent guide on the empty line", function() {
            editorView.attachToDom();
            atom.config.set("editor.showIndentGuide", true);
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').length).toBe(1);
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').text()).toBe('  ');
            editor.setCursorBufferPosition([11]);
            editor.indentSelectedRows();
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').length).toBe(2);
            return expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').text()).toBe('    ');
          });
        });
        describe("when a line contains only whitespace", function() {
          it("displays an indent guide on the line", function() {
            editorView.attachToDom();
            atom.config.set("editor.showIndentGuide", true);
            editor.setCursorBufferPosition([10]);
            editor.indent();
            editor.indent();
            expect(editor.getCursorBufferPosition()).toEqual([10, 4]);
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').length).toBe(2);
            return expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').text()).toBe('    ');
          });
          return it("uses the highest indent guide level from the next or previous non-empty line", function() {
            editorView.attachToDom();
            atom.config.set("editor.showIndentGuide", true);
            editor.setCursorBufferPosition([1, Infinity]);
            editor.insertNewline();
            expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
            expect(editorView.renderedLines.find('.line:eq(2) .indent-guide').length).toBe(2);
            return expect(editorView.renderedLines.find('.line:eq(2) .indent-guide').text()).toBe('    ');
          });
        });
        describe("when the line has leading and trailing whitespace", function() {
          return it("does not display the indent guide in the trailing whitespace", function() {
            editorView.attachToDom();
            atom.config.set("editor.showIndentGuide", true);
            editor.insertText("/*\n * \n*/");
            expect(editorView.renderedLines.find('.line:eq(1) .indent-guide').length).toBe(1);
            return expect(editorView.renderedLines.find('.line:eq(1) .indent-guide')).toHaveClass('leading-whitespace');
          });
        });
        return describe("when the line is empty and end of show invisibles are enabled", function() {
          return it("renders the indent guides interleaved with the end of line invisibles", function() {
            var eol, _ref2;
            editorView.attachToDom();
            atom.config.set("editor.showIndentGuide", true);
            atom.config.set("editor.showInvisibles", true);
            eol = (_ref2 = editorView.invisibles) != null ? _ref2.eol : void 0;
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').length).toBe(1);
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').text()).toBe("" + eol + " ");
            expect(editorView.renderedLines.find('.line:eq(10) .invisible-character').text()).toBe(eol);
            editor.setCursorBufferPosition([9]);
            editor.indent();
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').length).toBe(2);
            expect(editorView.renderedLines.find('.line:eq(10) .indent-guide').text()).toBe("" + eol + "   ");
            return expect(editorView.renderedLines.find('.line:eq(10) .invisible-character').text()).toBe(eol);
          });
        });
      });
      return describe("when editor.showIndentGuide is set to false", function() {
        return it("does not render the indent guide on whitespace only lines (regression)", function() {
          editorView.attachToDom();
          editor.setText('    ');
          atom.config.set('editor.showIndentGuide', false);
          return expect(editorView.renderedLines.find('.line:eq(0) .indent-guide').length).toBe(0);
        });
      });
    });
    describe("when soft-wrap is enabled", function() {
      beforeEach(function() {
        jasmine.unspy(window, 'setTimeout');
        editor.setSoftWrap(true);
        editorView.attachToDom();
        setEditorHeightInLines(editorView, 20);
        setEditorWidthInChars(editorView, 50);
        return expect(editorView.editor.getSoftWrapColumn()).toBe(50);
      });
      it("wraps lines that are too long to fit within the editor view's width, adjusting cursor positioning accordingly", function() {
        var region1, region2, _ref2;
        expect(editorView.renderedLines.find('.line').length).toBe(16);
        expect(editorView.renderedLines.find('.line:eq(3)').text()).toBe("    var pivot = items.shift(), current, left = [], ");
        expect(editorView.renderedLines.find('.line:eq(4)').text()).toBe("right = [];");
        editor.setCursorBufferPosition([3, 51], {
          wrapAtSoftNewlines: true
        });
        expect(editorView.find('.cursor').offset()).toEqual(editorView.renderedLines.find('.line:eq(4)').offset());
        editor.setCursorBufferPosition([4, 0]);
        expect(editorView.find('.cursor').offset()).toEqual(editorView.renderedLines.find('.line:eq(5)').offset());
        editor.getSelection().setBufferRange([[6, 30], [6, 55]]);
        _ref2 = editorView.getSelectionView().regions, region1 = _ref2[0], region2 = _ref2[1];
        expect(region1.offset().top).toBeCloseTo(editorView.renderedLines.find('.line:eq(7)').offset().top);
        return expect(region2.offset().top).toBeCloseTo(editorView.renderedLines.find('.line:eq(8)').offset().top);
      });
      it("handles changes to wrapped lines correctly", function() {
        buffer.insert([6, 28], '1234567');
        expect(editorView.renderedLines.find('.line:eq(7)').text()).toBe('      current < pivot ? left1234567.push(current) ');
        expect(editorView.renderedLines.find('.line:eq(8)').text()).toBe(': right.push(current);');
        return expect(editorView.renderedLines.find('.line:eq(9)').text()).toBe('    }');
      });
      it("changes the max line length and repositions the cursor when the window size changes", function() {
        editor.setCursorBufferPosition([3, 60]);
        setEditorWidthInChars(editorView, 40);
        expect(editorView.renderedLines.find('.line').length).toBe(19);
        expect(editorView.renderedLines.find('.line:eq(4)').text()).toBe("left = [], right = [];");
        expect(editorView.renderedLines.find('.line:eq(5)').text()).toBe("    while(items.length > 0) {");
        return expect(editor.bufferPositionForScreenPosition(editor.getCursorScreenPosition())).toEqual([3, 60]);
      });
      it("does not wrap the lines of any newly assigned buffers", function() {
        var otherEditor;
        otherEditor = null;
        waitsForPromise(function() {
          return atom.workspace.open().then(function(o) {
            return otherEditor = o;
          });
        });
        return runs(function() {
          var _i, _results;
          otherEditor.buffer.setText((function() {
            _results = [];
            for (_i = 1; _i <= 100; _i++){ _results.push(_i); }
            return _results;
          }).apply(this).join(''));
          editorView.edit(otherEditor);
          return expect(editorView.renderedLines.find('.line').length).toBe(1);
        });
      });
      it("unwraps lines when softwrap is disabled", function() {
        editorView.toggleSoftWrap();
        return expect(editorView.renderedLines.find('.line:eq(3)').text()).toBe('    var pivot = items.shift(), current, left = [], right = [];');
      });
      it("allows the cursor to move down to the last line", function() {
        _.times(editor.getLastScreenRow(), function() {
          return editor.moveCursorDown();
        });
        expect(editor.getCursorScreenPosition()).toEqual([editor.getLastScreenRow(), 0]);
        editor.moveCursorDown();
        return expect(editor.getCursorScreenPosition()).toEqual([editor.getLastScreenRow(), 2]);
      });
      it("allows the cursor to move up to a shorter soft wrapped line", function() {
        editor.setCursorScreenPosition([11, 15]);
        editor.moveCursorUp();
        expect(editor.getCursorScreenPosition()).toEqual([10, 10]);
        editor.moveCursorUp();
        editor.moveCursorUp();
        return expect(editor.getCursorScreenPosition()).toEqual([8, 15]);
      });
      it("it allows the cursor to wrap when moving horizontally past the beginning / end of a wrapped line", function() {
        editor.setCursorScreenPosition([11, 0]);
        editor.moveCursorLeft();
        expect(editor.getCursorScreenPosition()).toEqual([10, 10]);
        editor.moveCursorRight();
        return expect(editor.getCursorScreenPosition()).toEqual([11, 0]);
      });
      it("calls .setWidthInChars() when the editor view is attached because now its dimensions are available to calculate it", function() {
        var otherEditorView;
        otherEditorView = new EditorView(editor);
        spyOn(otherEditorView, 'setWidthInChars');
        otherEditorView.editor.setSoftWrap(true);
        expect(otherEditorView.setWidthInChars).not.toHaveBeenCalled();
        otherEditorView.simulateDomAttachment();
        expect(otherEditorView.setWidthInChars).toHaveBeenCalled();
        return otherEditorView.remove();
      });
      return describe("when the editor view's width changes", function() {
        it("updates the width in characters on the edit session", function() {
          var previousSoftWrapColumn;
          previousSoftWrapColumn = editor.getSoftWrapColumn();
          spyOn(editorView, 'setWidthInChars').andCallThrough();
          editorView.width(editorView.width() / 2);
          waitsFor(function() {
            return editorView.setWidthInChars.callCount > 0;
          });
          return runs(function() {
            return expect(editor.getSoftWrapColumn()).toBeLessThan(previousSoftWrapColumn);
          });
        });
        return it("accounts for the width of the scrollbar if there is one", function() {
          $('#jasmine-content').prepend("<style>\n  ::-webkit-scrollbar { width: 15px; }\n</style>");
          setEditorHeightInLines(editorView, 5);
          setEditorWidthInChars(editorView, 40);
          return expect(editor.lineForScreenRow(2).text.length).toBe(34);
        });
      });
    });
    describe("gutter rendering", function() {
      beforeEach(function() {
        return editorView.attachToDom({
          heightInLines: 5.5
        });
      });
      it("creates a line number element for each visible line with &nbsp; padding to the left of the number", function() {
        expect(editorView.gutter.find('.line-number').length).toBe(8);
        expect(editorView.find('.line-number:first').html()).toMatch(/^&nbsp;1/);
        expect(editorView.gutter.find('.line-number:last').html()).toMatch(/^&nbsp;8/);
        editorView.scrollTop(editorView.lineHeight * 1.5);
        expect(editorView.renderedLines.find('.line').length).toBe(8);
        expect(editorView.gutter.find('.line-number:first').html()).toMatch(/^&nbsp;1/);
        expect(editorView.gutter.find('.line-number:last').html()).toMatch(/^&nbsp;8/);
        editorView.scrollTop(editorView.lineHeight * 3.5);
        expect(editorView.renderedLines.find('.line').length).toBe(10);
        expect(editorView.gutter.find('.line-number:first').html()).toMatch(/^&nbsp;2/);
        return expect(editorView.gutter.find('.line-number:last').html()).toMatch(/^11/);
      });
      it("adds a .foldable class to lines that start foldable regions", function() {
        expect(editorView.gutter.find('.line-number:eq(0)')).toHaveClass('foldable');
        expect(editorView.gutter.find('.line-number:eq(1)')).toHaveClass('foldable');
        expect(editorView.gutter.find('.line-number:eq(2)')).not.toHaveClass('foldable');
        expect(editorView.gutter.find('.line-number:eq(3)')).not.toHaveClass('foldable');
        expect(editorView.gutter.find('.line-number:eq(4)')).toHaveClass('foldable');
        editor.setIndentationForBufferRow(1, 0);
        expect(editorView.gutter.find('.line-number:eq(0)')).not.toHaveClass('foldable');
        expect(editorView.gutter.find('.line-number:eq(1)')).toHaveClass('foldable');
        editor.toggleLineCommentsForBufferRows(2, 3);
        expect(editorView.gutter.find('.line-number:eq(2)')).toHaveClass('foldable');
        expect(editorView.gutter.find('.line-number:eq(3)')).not.toHaveClass('foldable');
        editor.toggleLineCommentForBufferRow(2);
        expect(editorView.gutter.find('.line-number:eq(2)')).not.toHaveClass('foldable');
        expect(editorView.gutter.find('.line-number:eq(3)')).not.toHaveClass('foldable');
        editor.toggleLineCommentForBufferRow(4);
        return expect(editorView.gutter.find('.line-number:eq(3)')).toHaveClass('foldable');
      });
      describe("when lines are inserted", function() {
        it("re-renders the correct line number range in the gutter", function() {
          editorView.scrollTop(3 * editorView.lineHeight);
          expect(editorView.gutter.find('.line-number:first').intValue()).toBe(2);
          expect(editorView.gutter.find('.line-number:last').intValue()).toBe(11);
          buffer.insert([6, 0], '\n');
          expect(editorView.gutter.find('.line-number:first').intValue()).toBe(2);
          return expect(editorView.gutter.find('.line-number:last').intValue()).toBe(11);
        });
        return it("re-renders the correct line number range when there are folds", function() {
          editorView.editor.foldBufferRow(1);
          expect(editorView.gutter.find('.line-number-1')).toHaveClass('folded');
          buffer.insert([0, 0], '\n');
          return expect(editorView.gutter.find('.line-number-2')).toHaveClass('folded');
        });
      });
      describe("when wrapping is on", function() {
        return it("renders a • instead of line number for wrapped portions of lines", function() {
          editor.setSoftWrap(true);
          editorView.setWidthInChars(50);
          expect(editorView.gutter.find('.line-number').length).toEqual(8);
          expect(editorView.gutter.find('.line-number:eq(3)').intValue()).toBe(4);
          expect(editorView.gutter.find('.line-number:eq(4)').html()).toMatch(/^&nbsp;•/);
          return expect(editorView.gutter.find('.line-number:eq(5)').intValue()).toBe(5);
        });
      });
      describe("when there are folds", function() {
        it("skips line numbers covered by the fold and updates them when the fold changes", function() {
          editor.createFold(3, 5);
          expect(editorView.gutter.find('.line-number:eq(3)').intValue()).toBe(4);
          expect(editorView.gutter.find('.line-number:eq(4)').intValue()).toBe(7);
          buffer.insert([4, 0], "\n\n");
          expect(editorView.gutter.find('.line-number:eq(3)').intValue()).toBe(4);
          expect(editorView.gutter.find('.line-number:eq(4)').intValue()).toBe(9);
          buffer["delete"]([[3, 0], [6, 0]]);
          expect(editorView.gutter.find('.line-number:eq(3)').intValue()).toBe(4);
          return expect(editorView.gutter.find('.line-number:eq(4)').intValue()).toBe(6);
        });
        it("redraws gutter numbers when lines are unfolded", function() {
          var fold;
          setEditorHeightInLines(editorView, 20);
          fold = editor.createFold(2, 12);
          expect(editorView.gutter.find('.line-number').length).toBe(3);
          fold.destroy();
          return expect(editorView.gutter.find('.line-number').length).toBe(13);
        });
        return it("styles folded line numbers", function() {
          editor.createFold(3, 5);
          expect(editorView.gutter.find('.line-number.folded').length).toBe(1);
          return expect(editorView.gutter.find('.line-number.folded:eq(0)').intValue()).toBe(4);
        });
      });
      describe("when the scrollView is scrolled to the right", function() {
        return it("adds a drop shadow to the gutter", function() {
          editorView.attachToDom();
          editorView.width(100);
          expect(editorView.gutter).not.toHaveClass('drop-shadow');
          editorView.scrollLeft(10);
          editorView.scrollView.trigger('scroll');
          expect(editorView.gutter).toHaveClass('drop-shadow');
          editorView.scrollLeft(0);
          editorView.scrollView.trigger('scroll');
          return expect(editorView.gutter).not.toHaveClass('drop-shadow');
        });
      });
      describe("when the editor view is scrolled vertically", function() {
        return it("adjusts the padding-top to account for non-rendered line numbers", function() {
          editorView.scrollTop(editorView.lineHeight * 3.5);
          expect(editorView.gutter.lineNumbers.css('padding-top')).toBe("" + (editorView.lineHeight * 1) + "px");
          expect(editorView.gutter.lineNumbers.css('padding-bottom')).toBe("" + (editorView.lineHeight * 2) + "px");
          expect(editorView.renderedLines.find('.line').length).toBe(10);
          expect(editorView.gutter.find('.line-number:first').intValue()).toBe(2);
          return expect(editorView.gutter.find('.line-number:last').intValue()).toBe(11);
        });
      });
      describe("when the switching from an edit session for a long buffer to an edit session for a short buffer", function() {
        return it("updates the line numbers to reflect the shorter buffer", function() {
          var emptyEditor;
          emptyEditor = null;
          waitsForPromise(function() {
            return atom.workspace.open().then(function(o) {
              return emptyEditor = o;
            });
          });
          return runs(function() {
            editorView.edit(emptyEditor);
            expect(editorView.gutter.lineNumbers.find('.line-number').length).toBe(1);
            editorView.edit(editor);
            expect(editorView.gutter.lineNumbers.find('.line-number').length).toBeGreaterThan(1);
            editorView.edit(emptyEditor);
            return expect(editorView.gutter.lineNumbers.find('.line-number').length).toBe(1);
          });
        });
      });
      describe("when the editor view is mini", function() {
        it("hides the gutter", function() {
          var miniEditor;
          miniEditor = new EditorView({
            mini: true
          });
          miniEditor.attachToDom();
          return expect(miniEditor.gutter).toBeHidden();
        });
        it("doesn't highlight the only line", function() {
          var miniEditor;
          miniEditor = new EditorView({
            mini: true
          });
          miniEditor.attachToDom();
          expect(miniEditor.getEditor().getCursorBufferPosition().row).toBe(0);
          return expect(miniEditor.find('.line.cursor-line').length).toBe(0);
        });
        it("doesn't show the end of line invisible", function() {
          var miniEditor, space, tab, _ref2, _ref3;
          atom.config.set("editor.showInvisibles", true);
          miniEditor = new EditorView({
            mini: true
          });
          miniEditor.attachToDom();
          space = (_ref2 = miniEditor.invisibles) != null ? _ref2.space : void 0;
          expect(space).toBeTruthy();
          tab = (_ref3 = miniEditor.invisibles) != null ? _ref3.tab : void 0;
          expect(tab).toBeTruthy();
          miniEditor.getEditor().setText(" a line with tabs\tand spaces ");
          return expect(miniEditor.renderedLines.find('.line').text()).toBe("" + space + "a line with tabs" + tab + "and spaces" + space);
        });
        it("doesn't show the indent guide", function() {
          var miniEditor;
          atom.config.set("editor.showIndentGuide", true);
          miniEditor = new EditorView({
            mini: true
          });
          miniEditor.attachToDom();
          miniEditor.getEditor().setText("      and indented line");
          return expect(miniEditor.renderedLines.find('.indent-guide').length).toBe(0);
        });
        it("lets you set the grammar", function() {
          var miniEditor, previousTokens;
          miniEditor = new EditorView({
            mini: true
          });
          miniEditor.getEditor().setText("var something");
          previousTokens = miniEditor.getEditor().lineForScreenRow(0).tokens;
          miniEditor.getEditor().setGrammar(atom.syntax.selectGrammar('something.js'));
          expect(miniEditor.getEditor().getGrammar().name).toBe("JavaScript");
          expect(previousTokens).not.toEqual(miniEditor.getEditor().lineForScreenRow(0).tokens);
          return expect(function() {
            return editor.setGrammar();
          }).toThrow();
        });
        return describe("placeholderText", function() {
          it("is hidden and shown when appropriate", function() {
            var miniEditor;
            miniEditor = new EditorView({
              mini: true,
              placeholderText: 'octokitten'
            });
            miniEditor.attachToDom();
            expect(miniEditor.underlayer.find('.placeholder-text')).toExist();
            miniEditor.getEditor().setText("var something");
            expect(miniEditor.underlayer.find('.placeholder-text')).not.toExist();
            miniEditor.getEditor().setText("");
            return expect(miniEditor.underlayer.find('.placeholder-text')).toExist();
          });
          return it("can be set", function() {
            var miniEditor;
            miniEditor = new EditorView({
              mini: true
            });
            miniEditor.attachToDom();
            expect(miniEditor.find('.placeholder-text').text()).toEqual('');
            miniEditor.setPlaceholderText('octokitten');
            expect(miniEditor.find('.placeholder-text').text()).toEqual('octokitten');
            miniEditor.setPlaceholderText('new one');
            return expect(miniEditor.find('.placeholder-text').text()).toEqual('new one');
          });
        });
      });
      describe("when the editor.showLineNumbers config is false", function() {
        return it("doesn't render any line numbers", function() {
          expect(editorView.gutter.lineNumbers).toBeVisible();
          atom.config.set("editor.showLineNumbers", false);
          return expect(editorView.gutter.lineNumbers).not.toBeVisible();
        });
      });
      return describe("using gutter's api", function() {
        it("can get all the line number elements", function() {
          var elements, len;
          elements = editorView.gutter.getLineNumberElements();
          len = editorView.gutter.lastScreenRow - editorView.gutter.firstScreenRow + 1;
          return expect(elements).toHaveLength(len);
        });
        it("can get a single line number element", function() {
          var element;
          element = editorView.gutter.getLineNumberElement(3);
          return expect(element).toBeTruthy();
        });
        it("returns falsy when there is no line element", function() {
          return expect(editorView.gutter.getLineNumberElement(42)).toHaveLength(0);
        });
        it("can add and remove classes to all the line numbers", function() {
          var elements, wasAdded;
          wasAdded = editorView.gutter.addClassToAllLines('heyok');
          expect(wasAdded).toBe(true);
          elements = editorView.gutter.getLineNumberElementsForClass('heyok');
          expect($(elements)).toHaveClass('heyok');
          editorView.gutter.removeClassFromAllLines('heyok');
          return expect($(editorView.gutter.getLineNumberElements())).not.toHaveClass('heyok');
        });
        it("can add and remove classes from a single line number", function() {
          var element, wasAdded;
          wasAdded = editorView.gutter.addClassToLine(3, 'heyok');
          expect(wasAdded).toBe(true);
          element = editorView.gutter.getLineNumberElement(2);
          return expect($(element)).not.toHaveClass('heyok');
        });
        return it("can fetch line numbers by their class", function() {
          var elements;
          editorView.gutter.addClassToLine(1, 'heyok');
          editorView.gutter.addClassToLine(3, 'heyok');
          elements = editorView.gutter.getLineNumberElementsForClass('heyok');
          expect(elements.length).toBe(2);
          expect($(elements[0])).toHaveClass('line-number-1');
          expect($(elements[0])).toHaveClass('heyok');
          expect($(elements[1])).toHaveClass('line-number-3');
          return expect($(elements[1])).toHaveClass('heyok');
        });
      });
    });
    describe("gutter line highlighting", function() {
      beforeEach(function() {
        return editorView.attachToDom({
          heightInLines: 5.5
        });
      });
      describe("when there is no wrapping", function() {
        it("highlights the line where the initial cursor position is", function() {
          expect(editor.getCursorBufferPosition().row).toBe(0);
          expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').length).toBe(1);
          return expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').intValue()).toBe(1);
        });
        return it("updates the highlighted line when the cursor position changes", function() {
          editor.setCursorBufferPosition([1, 0]);
          expect(editor.getCursorBufferPosition().row).toBe(1);
          expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').length).toBe(1);
          return expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').intValue()).toBe(2);
        });
      });
      describe("when there is wrapping", function() {
        beforeEach(function() {
          editorView.attachToDom(30);
          editor.setSoftWrap(true);
          return setEditorWidthInChars(editorView, 20);
        });
        it("highlights the line where the initial cursor position is", function() {
          expect(editor.getCursorBufferPosition().row).toBe(0);
          expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').length).toBe(1);
          return expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').intValue()).toBe(1);
        });
        return it("updates the highlighted line when the cursor position changes", function() {
          editor.setCursorBufferPosition([1, 0]);
          expect(editor.getCursorBufferPosition().row).toBe(1);
          expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').length).toBe(1);
          return expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').intValue()).toBe(2);
        });
      });
      describe("when the selection spans multiple lines", function() {
        beforeEach(function() {
          return editorView.attachToDom(30);
        });
        it("highlights the foreground of the gutter", function() {
          editor.getSelection().setBufferRange([[0, 0], [2, 2]]);
          expect(editor.getSelection().isSingleScreenLine()).toBe(false);
          return expect(editorView.find('.line-number.cursor-line').length).toBe(3);
        });
        it("doesn't highlight the background of the gutter", function() {
          editor.getSelection().setBufferRange([[0, 0], [2, 0]]);
          expect(editor.getSelection().isSingleScreenLine()).toBe(false);
          return expect(editorView.find('.line-number.cursor-line.cursor-line-no-selection').length).toBe(0);
        });
        return it("doesn't highlight the last line if it ends at the beginning of a line", function() {
          editor.getSelection().setBufferRange([[0, 0], [1, 0]]);
          expect(editor.getSelection().isSingleScreenLine()).toBe(false);
          expect(editorView.find('.line-number.cursor-line').length).toBe(1);
          return expect(editorView.find('.line-number.cursor-line').intValue()).toBe(1);
        });
      });
      return it("when a newline is deleted with backspace, the line number of the new cursor position is highlighted", function() {
        editor.setCursorScreenPosition([1, 0]);
        editor.backspace();
        expect(editorView.find('.line-number.cursor-line').length).toBe(1);
        return expect(editorView.find('.line-number.cursor-line').intValue()).toBe(1);
      });
    });
    describe("line highlighting", function() {
      beforeEach(function() {
        return editorView.attachToDom(30);
      });
      describe("when there is no wrapping", function() {
        it("highlights the line where the initial cursor position is", function() {
          expect(editor.getCursorBufferPosition().row).toBe(0);
          expect(editorView.find('.line.cursor-line').length).toBe(1);
          return expect(editorView.find('.line.cursor-line').text()).toBe(buffer.lineForRow(0));
        });
        it("updates the highlighted line when the cursor position changes", function() {
          editor.setCursorBufferPosition([1, 0]);
          expect(editor.getCursorBufferPosition().row).toBe(1);
          expect(editorView.find('.line.cursor-line').length).toBe(1);
          return expect(editorView.find('.line.cursor-line').text()).toBe(buffer.lineForRow(1));
        });
        return it("when a newline is deleted with backspace, the line of the new cursor position is highlighted", function() {
          editor.setCursorScreenPosition([1, 0]);
          editor.backspace();
          return expect(editorView.find('.line.cursor-line').length).toBe(1);
        });
      });
      describe("when there is wrapping", function() {
        beforeEach(function() {
          editor.setSoftWrap(true);
          return setEditorWidthInChars(editorView, 20);
        });
        it("highlights the line where the initial cursor position is", function() {
          expect(editor.getCursorBufferPosition().row).toBe(0);
          expect(editorView.find('.line.cursor-line').length).toBe(1);
          return expect(editorView.find('.line.cursor-line').text()).toBe('var quicksort = ');
        });
        return it("updates the highlighted line when the cursor position changes", function() {
          editor.setCursorBufferPosition([1, 0]);
          expect(editor.getCursorBufferPosition().row).toBe(1);
          expect(editorView.find('.line.cursor-line').length).toBe(1);
          return expect(editorView.find('.line.cursor-line').text()).toBe('  var sort = ');
        });
      });
      return describe("when there is a non-empty selection", function() {
        return it("does not highlight the line", function() {
          editor.setSelectedBufferRange([[1, 0], [1, 1]]);
          return expect(editorView.find('.line.cursor-line').length).toBe(0);
        });
      });
    });
    describe("folding", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('two-hundred.txt').then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          buffer = editor.buffer;
          editorView.edit(editor);
          return editorView.attachToDom();
        });
      });
      describe("when a fold-selection event is triggered", function() {
        it("folds the lines covered by the selection into a single line with a fold class and marker", function() {
          editor.getSelection().setBufferRange([[4, 29], [7, 4]]);
          editorView.trigger('editor:fold-selection');
          expect(editorView.renderedLines.find('.line:eq(4)')).toHaveClass('fold');
          expect(editorView.renderedLines.find('.line:eq(4) > .fold-marker')).toExist();
          expect(editorView.renderedLines.find('.line:eq(5)').text()).toBe('8');
          expect(editor.getSelection().isEmpty()).toBeTruthy();
          return expect(editor.getCursorScreenPosition()).toEqual([5, 0]);
        });
        return it("keeps the gutter line and the editor view line the same heights (regression)", function() {
          editor.getSelection().setBufferRange([[4, 29], [7, 4]]);
          editorView.trigger('editor:fold-selection');
          return expect(editorView.gutter.find('.line-number:eq(4)').height()).toBe(editorView.renderedLines.find('.line:eq(4)').height());
        });
      });
      describe("when a fold placeholder line is clicked", function() {
        return it("removes the associated fold and places the cursor at its beginning", function() {
          var foldLine;
          editor.setCursorBufferPosition([3, 0]);
          editor.createFold(3, 5);
          foldLine = editorView.find('.line.fold');
          expect(foldLine).toExist();
          foldLine.mousedown();
          expect(editorView.find('.fold')).not.toExist();
          expect(editorView.find('.fold-marker')).not.toExist();
          expect(editorView.renderedLines.find('.line:eq(4)').text()).toMatch(/4-+/);
          expect(editorView.renderedLines.find('.line:eq(5)').text()).toMatch(/5/);
          return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        });
      });
      describe("when the unfold-current-row event is triggered when the cursor is on a fold placeholder line", function() {
        return it("removes the associated fold and places the cursor at its beginning", function() {
          editor.setCursorBufferPosition([3, 0]);
          editorView.trigger('editor:fold-current-row');
          editor.setCursorBufferPosition([3, 0]);
          editorView.trigger('editor:unfold-current-row');
          expect(editorView.find('.fold')).not.toExist();
          expect(editorView.renderedLines.find('.line:eq(4)').text()).toMatch(/4-+/);
          expect(editorView.renderedLines.find('.line:eq(5)').text()).toMatch(/5/);
          return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        });
      });
      describe("when a selection starts/stops intersecting a fold", function() {
        return it("adds/removes the 'fold-selected' class to the fold's line element and hides the cursor if it is on the fold line", function() {
          editor.createFold(2, 4);
          editor.setSelectedBufferRange([[1, 0], [2, 0]], {
            preserveFolds: true,
            reversed: true
          });
          expect(editorView.lineElementForScreenRow(2)).toMatchSelector('.fold.fold-selected');
          editor.setSelectedBufferRange([[1, 0], [1, 1]], {
            preserveFolds: true
          });
          expect(editorView.lineElementForScreenRow(2)).not.toMatchSelector('.fold.fold-selected');
          editor.setSelectedBufferRange([[1, 0], [5, 0]], {
            preserveFolds: true
          });
          expect(editorView.lineElementForScreenRow(2)).toMatchSelector('.fold.fold-selected');
          editor.setCursorScreenPosition([3, 0]);
          expect(editorView.lineElementForScreenRow(2)).not.toMatchSelector('.fold.fold-selected');
          editor.setCursorScreenPosition([2, 0]);
          expect(editorView.lineElementForScreenRow(2)).toMatchSelector('.fold.fold-selected');
          expect(editorView.find('.cursor')).toBeHidden();
          editor.setCursorScreenPosition([3, 0]);
          return expect(editorView.find('.cursor')).toBeVisible();
        });
      });
      return describe("when a selected fold is scrolled into view (and the fold line was not previously rendered)", function() {
        return it("renders the fold's line element with the 'fold-selected' class", function() {
          setEditorHeightInLines(editorView, 5);
          editorView.resetDisplay();
          editor.createFold(2, 4);
          editor.setSelectedBufferRange([[1, 0], [5, 0]], {
            preserveFolds: true
          });
          expect(editorView.renderedLines.find('.fold.fold-selected')).toExist();
          editorView.scrollToBottom();
          expect(editorView.renderedLines.find('.fold.fold-selected')).not.toExist();
          editorView.scrollTop(0);
          return expect(editorView.lineElementForScreenRow(2)).toMatchSelector('.fold.fold-selected');
        });
      });
    });
    describe("paging up and down", function() {
      beforeEach(function() {
        return editorView.attachToDom();
      });
      it("moves to the last line when page down is repeated from the first line", function() {
        var newRow, row, rows;
        rows = editor.getLineCount() - 1;
        expect(rows).toBeGreaterThan(0);
        row = editor.getCursor().getScreenPosition().row;
        expect(row).toBe(0);
        while (row < rows) {
          editorView.pageDown();
          newRow = editor.getCursor().getScreenPosition().row;
          expect(newRow).toBeGreaterThan(row);
          if (newRow <= row) {
            break;
          }
          row = newRow;
        }
        expect(row).toBe(rows);
        return expect(editorView.getLastVisibleScreenRow()).toBe(rows);
      });
      it("moves to the first line when page up is repeated from the last line", function() {
        var newRow, row;
        editor.moveCursorToBottom();
        row = editor.getCursor().getScreenPosition().row;
        expect(row).toBeGreaterThan(0);
        while (row > 0) {
          editorView.pageUp();
          newRow = editor.getCursor().getScreenPosition().row;
          expect(newRow).toBeLessThan(row);
          if (newRow >= row) {
            break;
          }
          row = newRow;
        }
        expect(row).toBe(0);
        return expect(editorView.getFirstVisibleScreenRow()).toBe(0);
      });
      return it("resets to original position when down is followed by up", function() {
        expect(editor.getCursor().getScreenPosition().row).toBe(0);
        editorView.pageDown();
        expect(editor.getCursor().getScreenPosition().row).toBeGreaterThan(0);
        editorView.pageUp();
        expect(editor.getCursor().getScreenPosition().row).toBe(0);
        return expect(editorView.getFirstVisibleScreenRow()).toBe(0);
      });
    });
    describe(".checkoutHead()", function() {
      var filePath;
      filePath = [][0];
      beforeEach(function() {
        var workingDirPath;
        workingDirPath = temp.mkdirSync('atom-working-dir');
        fs.copySync(path.join(__dirname, 'fixtures', 'git', 'working-dir'), workingDirPath);
        fs.renameSync(path.join(workingDirPath, 'git.git'), path.join(workingDirPath, '.git'));
        atom.project.setPath(workingDirPath);
        filePath = atom.project.resolve('file.txt');
        waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          return editorView.edit(editor);
        });
      });
      return it("restores the contents of the editor view to the HEAD revision", function() {
        var fileChangeHandler;
        editor.setText('');
        editor.save();
        fileChangeHandler = jasmine.createSpy('fileChange');
        editor.getBuffer().file.on('contents-changed', fileChangeHandler);
        editorView.checkoutHead();
        waitsFor("file to trigger contents-changed event", function() {
          return fileChangeHandler.callCount > 0;
        });
        return runs(function() {
          return expect(editor.getText()).toBe('undefined');
        });
      });
    });
    describe(".pixelPositionForBufferPosition(position)", function() {
      describe("when the editor view is detached", function() {
        return it("returns top and left values of 0", function() {
          expect(editorView.isOnDom()).toBeFalsy();
          return expect(editorView.pixelPositionForBufferPosition([2, 7])).toEqual({
            top: 0,
            left: 0
          });
        });
      });
      describe("when the editor view is invisible", function() {
        return it("returns top and left values of 0", function() {
          editorView.attachToDom();
          editorView.hide();
          expect(editorView.isVisible()).toBeFalsy();
          return expect(editorView.pixelPositionForBufferPosition([2, 7])).toEqual({
            top: 0,
            left: 0
          });
        });
      });
      return describe("when the editor view is attached and visible", function() {
        beforeEach(function() {
          return editorView.attachToDom();
        });
        it("returns the top and left pixel positions", function() {
          return expect(editorView.pixelPositionForBufferPosition([2, 7])).toEqual({
            top: 40,
            left: 70
          });
        });
        return it("caches the left position", function() {
          editorView.renderedLines.css('font-size', '16px');
          expect(editorView.pixelPositionForBufferPosition([2, 8])).toEqual({
            top: 40,
            left: 80
          });
          editorView.renderedLines.css('font-size', '15px');
          return expect(editorView.pixelPositionForBufferPosition([2, 8])).toEqual({
            top: 40,
            left: 80
          });
        });
      });
    });
    describe("when clicking in the gutter", function() {
      beforeEach(function() {
        return editorView.attachToDom();
      });
      describe("when single clicking", function() {
        return it("moves the cursor to the start of the selected line", function() {
          var event;
          expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
          event = $.Event("mousedown");
          event.pageY = editorView.gutter.find(".line-number:eq(1)").offset().top;
          event.originalEvent = {
            detail: 1
          };
          editorView.gutter.find(".line-number:eq(1)").trigger(event);
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
        });
      });
      describe("when shift-clicking", function() {
        return it("selects to the start of the selected line", function() {
          var event;
          expect(editor.getSelection().getScreenRange()).toEqual([[0, 0], [0, 0]]);
          event = $.Event("mousedown");
          event.pageY = editorView.gutter.find(".line-number:eq(1)").offset().top;
          event.originalEvent = {
            detail: 1
          };
          event.shiftKey = true;
          editorView.gutter.find(".line-number:eq(1)").trigger(event);
          return expect(editor.getSelection().getScreenRange()).toEqual([[0, 0], [2, 0]]);
        });
      });
      return describe("when mousing down and then moving across multiple lines before mousing up", function() {
        describe("when selecting from top to bottom", function() {
          return it("selects the lines", function() {
            var mousedownEvent, mousemoveEvent;
            mousedownEvent = $.Event("mousedown");
            mousedownEvent.pageY = editorView.gutter.find(".line-number:eq(1)").offset().top;
            mousedownEvent.originalEvent = {
              detail: 1
            };
            editorView.gutter.find(".line-number:eq(1)").trigger(mousedownEvent);
            mousemoveEvent = $.Event("mousemove");
            mousemoveEvent.pageY = editorView.gutter.find(".line-number:eq(5)").offset().top;
            mousemoveEvent.originalEvent = {
              detail: 1
            };
            editorView.gutter.find(".line-number:eq(5)").trigger(mousemoveEvent);
            $(document).trigger('mouseup');
            return expect(editor.getSelection().getScreenRange()).toEqual([[1, 0], [6, 0]]);
          });
        });
        return describe("when selecting from bottom to top", function() {
          return it("selects the lines", function() {
            var mousedownEvent, mousemoveEvent;
            mousedownEvent = $.Event("mousedown");
            mousedownEvent.pageY = editorView.gutter.find(".line-number:eq(5)").offset().top;
            mousedownEvent.originalEvent = {
              detail: 1
            };
            editorView.gutter.find(".line-number:eq(5)").trigger(mousedownEvent);
            mousemoveEvent = $.Event("mousemove");
            mousemoveEvent.pageY = editorView.gutter.find(".line-number:eq(1)").offset().top;
            mousemoveEvent.originalEvent = {
              detail: 1
            };
            editorView.gutter.find(".line-number:eq(1)").trigger(mousemoveEvent);
            $(document).trigger('mouseup');
            return expect(editor.getSelection().getScreenRange()).toEqual([[1, 0], [6, 0]]);
          });
        });
      });
    });
    describe("when clicking below the last line", function() {
      beforeEach(function() {
        return editorView.attachToDom();
      });
      it("move the cursor to the end of the file", function() {
        var event;
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        event = mousedownEvent({
          editorView: editorView,
          point: [Infinity, 10]
        });
        editorView.underlayer.trigger(event);
        return expect(editor.getCursorScreenPosition()).toEqual([12, 2]);
      });
      return it("selects to the end of the files when shift is pressed", function() {
        var event;
        expect(editor.getSelection().getScreenRange()).toEqual([[0, 0], [0, 0]]);
        event = mousedownEvent({
          editorView: editorView,
          point: [Infinity, 10],
          shiftKey: true
        });
        editorView.underlayer.trigger(event);
        return expect(editor.getSelection().getScreenRange()).toEqual([[0, 0], [12, 2]]);
      });
    });
    describe("when the editor's grammar is changed", function() {
      return it("emits an editor:grammar-changed event", function() {
        var eventHandler;
        eventHandler = jasmine.createSpy('eventHandler');
        editorView.on('editor:grammar-changed', eventHandler);
        editor.setGrammar(atom.syntax.selectGrammar('.coffee'));
        return expect(eventHandler).toHaveBeenCalled();
      });
    });
    describe(".replaceSelectedText()", function() {
      it("doesn't call the replace function when the selection is empty", function() {
        var edited, replaced, replacer;
        replaced = false;
        edited = false;
        replacer = function(text) {
          replaced = true;
          return 'new';
        };
        editor.moveCursorToTop();
        edited = editorView.replaceSelectedText(replacer);
        expect(replaced).toBe(false);
        return expect(edited).toBe(false);
      });
      it("returns true when transformed text is non-empty", function() {
        var edited, replaced, replacer;
        replaced = false;
        edited = false;
        replacer = function(text) {
          replaced = true;
          return 'new';
        };
        editor.moveCursorToTop();
        editor.selectToEndOfLine();
        edited = editorView.replaceSelectedText(replacer);
        expect(replaced).toBe(true);
        return expect(edited).toBe(true);
      });
      it("returns false when transformed text is null", function() {
        var edited, replaced, replacer;
        replaced = false;
        edited = false;
        replacer = function(text) {
          replaced = true;
          return null;
        };
        editor.moveCursorToTop();
        editor.selectToEndOfLine();
        edited = editorView.replaceSelectedText(replacer);
        expect(replaced).toBe(true);
        return expect(edited).toBe(false);
      });
      return it("returns false when transformed text is undefined", function() {
        var edited, replaced, replacer;
        replaced = false;
        edited = false;
        replacer = function(text) {
          replaced = true;
          return void 0;
        };
        editor.moveCursorToTop();
        editor.selectToEndOfLine();
        edited = editorView.replaceSelectedText(replacer);
        expect(replaced).toBe(true);
        return expect(edited).toBe(false);
      });
    });
    describe("when editor:copy-path is triggered", function() {
      return it("copies the absolute path to the editor view's file to the clipboard", function() {
        editorView.trigger('editor:copy-path');
        return expect(atom.clipboard.read()).toBe(editor.getPath());
      });
    });
    describe("when editor:move-line-up is triggered", function() {
      describe("when there is no selection", function() {
        it("moves the line where the cursor is up", function() {
          editor.setCursorBufferPosition([1, 0]);
          editorView.trigger('editor:move-line-up');
          expect(buffer.lineForRow(0)).toBe('  var sort = function(items) {');
          return expect(buffer.lineForRow(1)).toBe('var quicksort = function () {');
        });
        it("moves the cursor to the new row and the same column", function() {
          editor.setCursorBufferPosition([1, 2]);
          editorView.trigger('editor:move-line-up');
          return expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
        });
        describe("when the line above is folded", function() {
          it("moves the line around the fold", function() {
            editor.foldBufferRow(1);
            editor.setCursorBufferPosition([10, 0]);
            editorView.trigger('editor:move-line-up');
            expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            expect(buffer.lineForRow(1)).toBe('');
            expect(buffer.lineForRow(2)).toBe('  var sort = function(items) {');
            expect(editor.isFoldedAtBufferRow(1)).toBe(false);
            return expect(editor.isFoldedAtBufferRow(2)).toBe(true);
          });
          return describe("when the line being moved is folded", function() {
            return it("moves the fold around the fold above it", function() {
              editor.setCursorBufferPosition([0, 0]);
              editor.insertText("var a = function() {\n  b = 3;\n};\n");
              editor.foldBufferRow(0);
              editor.foldBufferRow(3);
              editor.setCursorBufferPosition([3, 0]);
              editorView.trigger('editor:move-line-up');
              expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
              expect(buffer.lineForRow(0)).toBe('var quicksort = function () {');
              expect(buffer.lineForRow(13)).toBe('var a = function() {');
              editor.logScreenLines();
              expect(editor.isFoldedAtBufferRow(0)).toBe(true);
              return expect(editor.isFoldedAtBufferRow(13)).toBe(true);
            });
          });
        });
        return describe("when the line above is empty and the line above that is folded", function() {
          return it("moves the line to the empty line", function() {
            editor.foldBufferRow(2);
            editor.setCursorBufferPosition([11, 0]);
            editorView.trigger('editor:move-line-up');
            expect(editor.getCursorBufferPosition()).toEqual([10, 0]);
            expect(buffer.lineForRow(9)).toBe('  };');
            expect(buffer.lineForRow(10)).toBe('  return sort(Array.apply(this, arguments));');
            expect(buffer.lineForRow(11)).toBe('');
            expect(editor.isFoldedAtBufferRow(2)).toBe(true);
            return expect(editor.isFoldedAtBufferRow(10)).toBe(false);
          });
        });
      });
      describe("where there is a selection", function() {
        describe("when the selection falls inside the line", function() {
          return it("maintains the selection", function() {
            editor.setSelectedBufferRange([[1, 2], [1, 5]]);
            expect(editor.getSelectedText()).toBe('var');
            editorView.trigger('editor:move-line-up');
            expect(editor.getSelectedBufferRange()).toEqual([[0, 2], [0, 5]]);
            return expect(editor.getSelectedText()).toBe('var');
          });
        });
        describe("where there are multiple lines selected", function() {
          it("moves the selected lines up", function() {
            editor.setSelectedBufferRange([[2, 0], [3, Infinity]]);
            editorView.trigger('editor:move-line-up');
            expect(buffer.lineForRow(0)).toBe('var quicksort = function () {');
            expect(buffer.lineForRow(1)).toBe('    if (items.length <= 1) return items;');
            expect(buffer.lineForRow(2)).toBe('    var pivot = items.shift(), current, left = [], right = [];');
            return expect(buffer.lineForRow(3)).toBe('  var sort = function(items) {');
          });
          return it("maintains the selection", function() {
            editor.setSelectedBufferRange([[2, 0], [3, 62]]);
            editorView.trigger('editor:move-line-up');
            return expect(editor.getSelectedBufferRange()).toEqual([[1, 0], [2, 62]]);
          });
        });
        describe("when the last line is selected", function() {
          return it("moves the selected line up", function() {
            editor.setSelectedBufferRange([[12, 0], [12, Infinity]]);
            editorView.trigger('editor:move-line-up');
            expect(buffer.lineForRow(11)).toBe('};');
            return expect(buffer.lineForRow(12)).toBe('  return sort(Array.apply(this, arguments));');
          });
        });
        return describe("when the last two lines are selected", function() {
          return it("moves the selected lines up", function() {
            editor.setSelectedBufferRange([[11, 0], [12, Infinity]]);
            editorView.trigger('editor:move-line-up');
            expect(buffer.lineForRow(10)).toBe('  return sort(Array.apply(this, arguments));');
            expect(buffer.lineForRow(11)).toBe('};');
            return expect(buffer.lineForRow(12)).toBe('');
          });
        });
      });
      describe("when the cursor is on the first line", function() {
        return it("does not move the line", function() {
          var originalText;
          editor.setCursorBufferPosition([0, 0]);
          originalText = editor.getText();
          editorView.trigger('editor:move-line-up');
          return expect(editor.getText()).toBe(originalText);
        });
      });
      describe("when the cursor is on the trailing newline", function() {
        return it("does not move the line", function() {
          var originalText;
          editor.moveCursorToBottom();
          editor.insertNewline();
          editor.moveCursorToBottom();
          originalText = editor.getText();
          editorView.trigger('editor:move-line-up');
          return expect(editor.getText()).toBe(originalText);
        });
      });
      describe("when the cursor is on a folded line", function() {
        return it("moves all lines in the fold up and preserves the fold", function() {
          editor.setCursorBufferPosition([4, 0]);
          editor.foldCurrentRow();
          editorView.trigger('editor:move-line-up');
          expect(buffer.lineForRow(3)).toBe('    while(items.length > 0) {');
          expect(buffer.lineForRow(7)).toBe('    var pivot = items.shift(), current, left = [], right = [];');
          expect(editor.getSelectedBufferRange()).toEqual([[3, 0], [3, 0]]);
          return expect(editor.isFoldedAtScreenRow(3)).toBeTruthy();
        });
      });
      describe("when the selection contains a folded and unfolded line", function() {
        return it("moves the selected lines up and preserves the fold", function() {
          editor.setCursorBufferPosition([4, 0]);
          editor.foldCurrentRow();
          editor.setCursorBufferPosition([3, 4]);
          editor.selectDown();
          expect(editor.isFoldedAtScreenRow(4)).toBeTruthy();
          editorView.trigger('editor:move-line-up');
          expect(buffer.lineForRow(2)).toBe('    var pivot = items.shift(), current, left = [], right = [];');
          expect(buffer.lineForRow(3)).toBe('    while(items.length > 0) {');
          expect(editor.getSelectedBufferRange()).toEqual([[2, 4], [3, 0]]);
          return expect(editor.isFoldedAtScreenRow(3)).toBeTruthy();
        });
      });
      return describe("when an entire line is selected including the newline", function() {
        return it("moves the selected line up", function() {
          editor.setCursorBufferPosition([1]);
          editor.selectToEndOfLine();
          editor.selectRight();
          editorView.trigger('editor:move-line-up');
          expect(buffer.lineForRow(0)).toBe('  var sort = function(items) {');
          return expect(buffer.lineForRow(1)).toBe('var quicksort = function () {');
        });
      });
    });
    describe("when editor:move-line-down is triggered", function() {
      describe("when there is no selection", function() {
        it("moves the line where the cursor is down", function() {
          editor.setCursorBufferPosition([0, 0]);
          editorView.trigger('editor:move-line-down');
          expect(buffer.lineForRow(0)).toBe('  var sort = function(items) {');
          return expect(buffer.lineForRow(1)).toBe('var quicksort = function () {');
        });
        it("moves the cursor to the new row and the same column", function() {
          editor.setCursorBufferPosition([0, 2]);
          editorView.trigger('editor:move-line-down');
          return expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
        });
        describe("when the line below is folded", function() {
          it("moves the line around the fold", function() {
            editor.setCursorBufferPosition([0, 0]);
            editor.foldBufferRow(1);
            editorView.trigger('editor:move-line-down');
            expect(editor.getCursorBufferPosition()).toEqual([9, 0]);
            expect(buffer.lineForRow(0)).toBe('  var sort = function(items) {');
            expect(buffer.lineForRow(9)).toBe('var quicksort = function () {');
            expect(editor.isFoldedAtBufferRow(0)).toBe(true);
            return expect(editor.isFoldedAtBufferRow(9)).toBe(false);
          });
          return describe("when the line being moved is folded", function() {
            return it("moves the fold around the fold below it", function() {
              editor.setCursorBufferPosition([0, 0]);
              editor.insertText("var a = function() {\n  b = 3;\n};\n");
              editor.foldBufferRow(0);
              editor.foldBufferRow(3);
              editor.setCursorBufferPosition([0, 0]);
              editorView.trigger('editor:move-line-down');
              expect(editor.getCursorBufferPosition()).toEqual([13, 0]);
              expect(buffer.lineForRow(0)).toBe('var quicksort = function () {');
              expect(buffer.lineForRow(13)).toBe('var a = function() {');
              expect(editor.isFoldedAtBufferRow(0)).toBe(true);
              return expect(editor.isFoldedAtBufferRow(13)).toBe(true);
            });
          });
        });
        return describe("when the line below is empty and the line below that is folded", function() {
          return it("moves the line to the empty line", function() {
            editor.setCursorBufferPosition([0, Infinity]);
            editor.insertText('\n');
            editor.setCursorBufferPosition([0, 0]);
            editor.foldBufferRow(2);
            editorView.trigger('editor:move-line-down');
            expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            expect(buffer.lineForRow(0)).toBe('');
            expect(buffer.lineForRow(1)).toBe('var quicksort = function () {');
            expect(buffer.lineForRow(2)).toBe('  var sort = function(items) {');
            expect(editor.isFoldedAtBufferRow(0)).toBe(false);
            expect(editor.isFoldedAtBufferRow(1)).toBe(false);
            return expect(editor.isFoldedAtBufferRow(2)).toBe(true);
          });
        });
      });
      describe("when the cursor is on the last line", function() {
        return it("does not move the line", function() {
          editor.moveCursorToBottom();
          editorView.trigger('editor:move-line-down');
          expect(buffer.lineForRow(12)).toBe('};');
          return expect(editor.getSelectedBufferRange()).toEqual([[12, 2], [12, 2]]);
        });
      });
      describe("when the cursor is on the second to last line", function() {
        return it("moves the line down", function() {
          editor.setCursorBufferPosition([11, 0]);
          editorView.trigger('editor:move-line-down');
          expect(buffer.lineForRow(11)).toBe('};');
          expect(buffer.lineForRow(12)).toBe('  return sort(Array.apply(this, arguments));');
          return expect(buffer.lineForRow(13)).toBeUndefined();
        });
      });
      describe("when the cursor is on the second to last line and the last line is empty", function() {
        return it("does not move the line", function() {
          editor.moveCursorToBottom();
          editor.insertNewline();
          editor.setCursorBufferPosition([12, 2]);
          editorView.trigger('editor:move-line-down');
          expect(buffer.lineForRow(12)).toBe('};');
          expect(buffer.lineForRow(13)).toBe('');
          return expect(editor.getSelectedBufferRange()).toEqual([[12, 2], [12, 2]]);
        });
      });
      return describe("where there is a selection", function() {
        describe("when the selection falls inside the line", function() {
          return it("maintains the selection", function() {
            editor.setSelectedBufferRange([[1, 2], [1, 5]]);
            expect(editor.getSelectedText()).toBe('var');
            editorView.trigger('editor:move-line-down');
            expect(editor.getSelectedBufferRange()).toEqual([[2, 2], [2, 5]]);
            return expect(editor.getSelectedText()).toBe('var');
          });
        });
        describe("where there are multiple lines selected", function() {
          it("moves the selected lines down", function() {
            editor.setSelectedBufferRange([[2, 0], [3, Infinity]]);
            editorView.trigger('editor:move-line-down');
            expect(buffer.lineForRow(2)).toBe('    while(items.length > 0) {');
            expect(buffer.lineForRow(3)).toBe('    if (items.length <= 1) return items;');
            expect(buffer.lineForRow(4)).toBe('    var pivot = items.shift(), current, left = [], right = [];');
            return expect(buffer.lineForRow(5)).toBe('      current = items.shift();');
          });
          return it("maintains the selection", function() {
            editor.setSelectedBufferRange([[2, 0], [3, 62]]);
            editorView.trigger('editor:move-line-down');
            return expect(editor.getSelectedBufferRange()).toEqual([[3, 0], [4, 62]]);
          });
        });
        describe("when the cursor is on a folded line", function() {
          return it("moves all lines in the fold down and preserves the fold", function() {
            editor.setCursorBufferPosition([4, 0]);
            editor.foldCurrentRow();
            editorView.trigger('editor:move-line-down');
            expect(buffer.lineForRow(4)).toBe('    return sort(left).concat(pivot).concat(sort(right));');
            expect(buffer.lineForRow(5)).toBe('    while(items.length > 0) {');
            expect(editor.getSelectedBufferRange()).toEqual([[5, 0], [5, 0]]);
            return expect(editor.isFoldedAtScreenRow(5)).toBeTruthy();
          });
        });
        describe("when the selection contains a folded and unfolded line", function() {
          return it("moves the selected lines down and preserves the fold", function() {
            editor.setCursorBufferPosition([4, 0]);
            editor.foldCurrentRow();
            editor.setCursorBufferPosition([3, 4]);
            editor.selectDown();
            expect(editor.isFoldedAtScreenRow(4)).toBeTruthy();
            editorView.trigger('editor:move-line-down');
            expect(buffer.lineForRow(3)).toBe('    return sort(left).concat(pivot).concat(sort(right));');
            expect(buffer.lineForRow(4)).toBe('    var pivot = items.shift(), current, left = [], right = [];');
            expect(buffer.lineForRow(5)).toBe('    while(items.length > 0) {');
            expect(editor.getSelectedBufferRange()).toEqual([[4, 4], [5, 0]]);
            return expect(editor.isFoldedAtScreenRow(5)).toBeTruthy();
          });
        });
        return describe("when an entire line is selected including the newline", function() {
          return it("moves the selected line down", function() {
            editor.setCursorBufferPosition([1]);
            editor.selectToEndOfLine();
            editor.selectRight();
            editorView.trigger('editor:move-line-down');
            expect(buffer.lineForRow(1)).toBe('    if (items.length <= 1) return items;');
            return expect(buffer.lineForRow(2)).toBe('  var sort = function(items) {');
          });
        });
      });
    });
    describe("when the escape key is pressed on the editor view", function() {
      return it("clears multiple selections if there are any, and otherwise allows other bindings to be handled", function() {
        var testEventHandler;
        atom.keymaps.add('name', {
          '.editor': {
            'escape': 'test-event'
          }
        });
        testEventHandler = jasmine.createSpy("testEventHandler");
        editorView.on('test-event', testEventHandler);
        editorView.editor.addSelectionForBufferRange([[3, 0], [3, 0]]);
        expect(editorView.editor.getSelections().length).toBe(2);
        editorView.trigger(keydownEvent('escape'));
        expect(editorView.editor.getSelections().length).toBe(1);
        expect(testEventHandler).not.toHaveBeenCalled();
        editorView.trigger(keydownEvent('escape'));
        return expect(testEventHandler).toHaveBeenCalled();
      });
    });
    describe("when the editor view is attached but invisible", function() {
      return describe("when the editor view's text is changed", function() {
        it("redraws the editor view when it is next shown", function() {
          var displayUpdatedHandler;
          displayUpdatedHandler = null;
          atom.workspaceView = new WorkspaceView;
          waitsForPromise(function() {
            return atom.workspaceView.open('sample.txt').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            var view;
            atom.workspaceView.attachToDom();
            editorView = atom.workspaceView.getActiveView();
            view = $$(function() {
              return this.div({
                id: 'view',
                tabindex: -1
              }, 'View');
            });
            editorView.getPane().activateItem(view);
            expect(editorView.isVisible()).toBeFalsy();
            editor.setText('hidden changes');
            editor.setCursorBufferPosition([0, 4]);
            displayUpdatedHandler = jasmine.createSpy("displayUpdatedHandler");
            editorView.on('editor:display-updated', displayUpdatedHandler);
            editorView.getPane().activateItem(editorView.getModel());
            return expect(editorView.isVisible()).toBeTruthy();
          });
          waitsFor(function() {
            return displayUpdatedHandler.callCount === 1;
          });
          return runs(function() {
            return expect(editorView.renderedLines.find('.line').text()).toBe('hidden changes');
          });
        });
        return it("redraws the editor view when it is next reattached", function() {
          var displayUpdatedHandler;
          editorView.attachToDom();
          editorView.hide();
          editor.setText('hidden changes');
          editor.setCursorBufferPosition([0, 4]);
          editorView.detach();
          displayUpdatedHandler = jasmine.createSpy("displayUpdatedHandler");
          editorView.on('editor:display-updated', displayUpdatedHandler);
          editorView.show();
          editorView.attachToDom();
          waitsFor(function() {
            return displayUpdatedHandler.callCount === 1;
          });
          return runs(function() {
            return expect(editorView.renderedLines.find('.line').text()).toBe('hidden changes');
          });
        });
      });
    });
    describe("editor:scroll-to-cursor", function() {
      return it("scrolls to and centers the editor view on the cursor's position", function() {
        editorView.attachToDom({
          heightInLines: 3
        });
        editor.setCursorBufferPosition([1, 2]);
        editorView.scrollToBottom();
        expect(editorView.getFirstVisibleScreenRow()).not.toBe(0);
        expect(editorView.getLastVisibleScreenRow()).not.toBe(2);
        editorView.trigger('editor:scroll-to-cursor');
        expect(editorView.getFirstVisibleScreenRow()).toBe(0);
        return expect(editorView.getLastVisibleScreenRow()).toBe(2);
      });
    });
    describe("when the editor view is removed", function() {
      return it("fires a editor:will-be-removed event", function() {
        atom.workspaceView = new WorkspaceView;
        waitsForPromise(function() {
          return atom.workspace.open('sample.js');
        });
        return runs(function() {
          var willBeRemovedHandler;
          atom.workspaceView.attachToDom();
          editorView = atom.workspaceView.getActiveView();
          willBeRemovedHandler = jasmine.createSpy('willBeRemovedHandler');
          editorView.on('editor:will-be-removed', willBeRemovedHandler);
          editorView.getPane().destroyActiveItem();
          return expect(willBeRemovedHandler).toHaveBeenCalled();
        });
      });
    });
    describe("when setInvisibles is toggled (regression)", function() {
      it("renders inserted newlines properly", function() {
        var rowNumber, _i, _results;
        editorView.setShowInvisibles(true);
        editor.setCursorBufferPosition([0, 0]);
        editorView.attachToDom({
          heightInLines: 20
        });
        editorView.setShowInvisibles(false);
        editor.insertText("\n");
        _results = [];
        for (rowNumber = _i = 1; _i <= 5; rowNumber = ++_i) {
          _results.push(expect(editorView.lineElementForScreenRow(rowNumber).text()).toBe(buffer.lineForRow(rowNumber)));
        }
        return _results;
      });
      return it("correctly calculates the position left for non-monospaced invisibles", function() {
        editorView.setShowInvisibles(true);
        editorView.setInvisibles({
          tab: '♘'
        });
        editor.setText('\tx');
        editorView.setFontFamily('serif');
        editorView.setFontSize(10);
        editorView.attachToDom();
        editorView.setWidthInChars(5);
        expect(editorView.pixelPositionForScreenPosition([0, 0]).left).toEqual(0);
        expect(editorView.pixelPositionForScreenPosition([0, 1]).left).toEqual(10);
        return expect(editorView.pixelPositionForScreenPosition([0, 2]).left).toEqual(13);
      });
    });
    describe("when the window is resized", function() {
      return it("updates the active edit session with the current soft wrap column", function() {
        editorView.attachToDom();
        setEditorWidthInChars(editorView, 50);
        expect(editorView.editor.getSoftWrapColumn()).toBe(50);
        setEditorWidthInChars(editorView, 100);
        $(window).trigger('resize');
        return expect(editorView.editor.getSoftWrapColumn()).toBe(100);
      });
    });
    describe("character width caching", function() {
      return describe("when soft wrap is enabled", function() {
        return it("correctly calculates the the position left for a column", function() {
          editor.setSoftWrap(true);
          editor.setText('lllll 00000');
          editorView.setFontFamily('serif');
          editorView.setFontSize(10);
          editorView.attachToDom();
          editorView.setWidthInChars(5);
          expect(editorView.pixelPositionForScreenPosition([0, 5]).left).toEqual(15);
          expect(editorView.pixelPositionForScreenPosition([1, 5]).left).toEqual(25);
          spyOn(editorView, 'measureToColumn').andCallThrough();
          editorView.pixelPositionForScreenPosition([0, 5]);
          editorView.pixelPositionForScreenPosition([1, 5]);
          return expect(editorView.measureToColumn.callCount).toBe(0);
        });
      });
    });
    describe("when stylesheets are changed", function() {
      afterEach(function() {
        atom.themes.removeStylesheet('line-height');
        return atom.themes.removeStylesheet('char-width');
      });
      return it("updates the editor if the line height or character width changes due to a stylesheet change", function() {
        editorView.attachToDom();
        editor.setCursorScreenPosition([1, 3]);
        expect(editorView.pixelPositionForScreenPosition([1, 3])).toEqual({
          top: 20,
          left: 30
        });
        expect(editorView.getCursorView().position()).toEqual({
          top: 20,
          left: 30
        });
        atom.themes.applyStylesheet('line-height', ".editor { line-height: 2; }");
        expect(editorView.pixelPositionForScreenPosition([1, 3])).toEqual({
          top: 20,
          left: 30
        });
        expect(editorView.getCursorView().position()).toEqual({
          top: 20,
          left: 30
        });
        atom.themes.applyStylesheet('char-width', ".editor { letter-spacing: 2px; }");
        expect(editorView.pixelPositionForScreenPosition([1, 3])).toEqual({
          top: 20,
          left: 36
        });
        return expect(editorView.getCursorView().position()).toEqual({
          top: 20,
          left: 36
        });
      });
    });
    return describe("when the editor contains hard tabs", function() {
      return it("correctly calculates the the position left for a column", function() {
        editor.setText('\ttest');
        editorView.attachToDom();
        expect(editorView.pixelPositionForScreenPosition([0, editor.getTabLength()]).left).toEqual(20);
        expect(editorView.pixelPositionForScreenPosition([0, editor.getTabLength() + 1]).left).toEqual(30);
        spyOn(editorView, 'measureToColumn').andCallThrough();
        editorView.pixelPositionForScreenPosition([0, editor.getTabLength()]);
        editorView.pixelPositionForScreenPosition([0, editor.getTabLength() + 1]);
        return expect(editorView.measureToColumn.callCount).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlEQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsdUJBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsb0JBQVIsQ0FEYixDQUFBOztBQUFBLEVBRUEsT0FBVSxPQUFBLENBQVEsNkJBQVIsQ0FBVixFQUFDLFNBQUEsQ0FBRCxFQUFJLFVBQUEsRUFGSixDQUFBOztBQUFBLEVBR0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUhKLENBQUE7O0FBQUEsRUFJQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FKTCxDQUFBOztBQUFBLEVBS0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTFAsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQU5QLENBQUE7O0FBQUEsRUFRQSxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBLEdBQUE7QUFDckIsUUFBQSxxSUFBQTtBQUFBLElBQUEsUUFBc0YsRUFBdEYsRUFBQyxpQkFBRCxFQUFTLHFCQUFULEVBQXFCLGlCQUFyQixFQUE2Qix1QkFBN0IsRUFBMkMsMkJBQTNDLEVBQTZELDBCQUE3RCxFQUE4RSxlQUE5RSxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLEVBQXVDLEtBQXZDLENBQUEsQ0FBQTtBQUFBLE1BRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsV0FBcEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxTQUFDLENBQUQsR0FBQTtpQkFBTyxNQUFBLEdBQVMsRUFBaEI7UUFBQSxDQUF0QyxF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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/editor-view-spec.coffee