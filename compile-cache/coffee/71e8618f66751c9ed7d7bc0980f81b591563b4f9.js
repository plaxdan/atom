(function() {
  var EditorComponent, ReactEditorView, extend, flatten, last, nbsp, toArray, _,
    __slice = [].slice;

  _ = require('underscore-plus');

  extend = _.extend, flatten = _.flatten, toArray = _.toArray, last = _.last;

  ReactEditorView = require('../src/react-editor-view');

  EditorComponent = require('../src/editor-component');

  nbsp = String.fromCharCode(160);

  describe("EditorComponent", function() {
    var buildMouseEvent, charWidth, clientCoordinatesForScreenPosition, clientCoordinatesForScreenRowInGutter, component, contentNode, delayAnimationFrames, editor, horizontalScrollbarNode, lineAndLineNumberHaveClass, lineHasClass, lineHeightInPixels, lineNumberForBufferRowHasClass, lineNumberHasClass, lineOverdrawMargin, nextAnimationFrame, node, runSetImmediateCallbacks, verticalScrollbarNode, wrapperView, _ref, _ref1;
    _ref = [], contentNode = _ref[0], editor = _ref[1], wrapperView = _ref[2], component = _ref[3], node = _ref[4], verticalScrollbarNode = _ref[5], horizontalScrollbarNode = _ref[6];
    _ref1 = [], lineHeightInPixels = _ref1[0], charWidth = _ref1[1], delayAnimationFrames = _ref1[2], nextAnimationFrame = _ref1[3], runSetImmediateCallbacks = _ref1[4], lineOverdrawMargin = _ref1[5];
    beforeEach(function() {
      lineOverdrawMargin = 2;
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
      runs(function() {
        spyOn(window, "setInterval").andCallFake(window.fakeSetInterval);
        spyOn(window, "clearInterval").andCallFake(window.fakeClearInterval);
        delayAnimationFrames = false;
        nextAnimationFrame = function() {
          throw new Error('No animation frame requested');
        };
        return spyOn(window, 'requestAnimationFrame').andCallFake(function(fn) {
          if (delayAnimationFrames) {
            return nextAnimationFrame = fn;
          } else {
            return fn();
          }
        });
      });
      waitsForPromise(function() {
        return atom.project.open('sample.js').then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        var setImmediateFns;
        setImmediateFns = [];
        runSetImmediateCallbacks = function() {
          var fn, fns, _i, _len, _results;
          if (setImmediateFns.length === 0) {
            throw new Error("runSetImmediateCallbacks not requested");
          } else {
            fns = setImmediateFns.slice();
            setImmediateFns.length = 0;
            _results = [];
            for (_i = 0, _len = fns.length; _i < _len; _i++) {
              fn = fns[_i];
              _results.push(fn());
            }
            return _results;
          }
        };
        spyOn(window, 'setImmediate').andCallFake(function(fn) {
          return setImmediateFns.push(fn);
        });
        contentNode = document.querySelector('#jasmine-content');
        contentNode.style.width = '1000px';
        wrapperView = new ReactEditorView(editor, {
          lineOverdrawMargin: lineOverdrawMargin
        });
        wrapperView.attachToDom();
        component = wrapperView.component;
        component.performSyncUpdates = false;
        component.setLineHeight(1.3);
        component.setFontSize(20);
        lineHeightInPixels = editor.getLineHeightInPixels();
        charWidth = editor.getDefaultCharWidth();
        node = component.getDOMNode();
        verticalScrollbarNode = node.querySelector('.vertical-scrollbar');
        horizontalScrollbarNode = node.querySelector('.horizontal-scrollbar');
        node.style.height = editor.getLineCount() * lineHeightInPixels + 'px';
        node.style.width = '1000px';
        component.measureScrollView();
        return runSetImmediateCallbacks();
      });
    });
    afterEach(function() {
      return contentNode.style.width = '';
    });
    describe("line rendering", function() {
      it("renders the currently-visible lines plus the overdraw margin", function() {
        var linesNode;
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        linesNode = node.querySelector('.lines');
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, 0px, 0px)");
        expect(node.querySelectorAll('.line').length).toBe(6 + 2);
        expect(component.lineNodeForScreenRow(0).textContent).toBe(editor.lineForScreenRow(0).text);
        expect(component.lineNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNodeForScreenRow(5).textContent).toBe(editor.lineForScreenRow(5).text);
        expect(component.lineNodeForScreenRow(5).offsetTop).toBe(5 * lineHeightInPixels);
        verticalScrollbarNode.scrollTop = 4.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, " + (-4.5 * lineHeightInPixels) + "px, 0px)");
        expect(node.querySelectorAll('.line').length).toBe(6 + 4);
        expect(component.lineNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(2).textContent).toBe(editor.lineForScreenRow(2).text);
        expect(component.lineNodeForScreenRow(9).offsetTop).toBe(9 * lineHeightInPixels);
        return expect(component.lineNodeForScreenRow(9).textContent).toBe(editor.lineForScreenRow(9).text);
      });
      it("updates the top position of subsequent lines when lines are inserted or removed", function() {
        var lineNodes;
        editor.getBuffer().deleteRows(0, 1);
        runSetImmediateCallbacks();
        lineNodes = node.querySelectorAll('.line');
        expect(component.lineNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        editor.getBuffer().insert([0, 0], '\n\n');
        runSetImmediateCallbacks();
        lineNodes = node.querySelectorAll('.line');
        expect(component.lineNodeForScreenRow(0).offsetTop).toBe(0 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(3).offsetTop).toBe(3 * lineHeightInPixels);
        return expect(component.lineNodeForScreenRow(4).offsetTop).toBe(4 * lineHeightInPixels);
      });
      it("updates the lines when lines are inserted or removed above the rendered row range", function() {
        var buffer;
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        verticalScrollbarNode.scrollTop = 5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        buffer = editor.getBuffer();
        buffer.insert([0, 0], '\n\n');
        runSetImmediateCallbacks();
        expect(component.lineNodeForScreenRow(3).textContent).toBe(editor.lineForScreenRow(3).text);
        buffer["delete"]([[0, 0], [3, 0]]);
        runSetImmediateCallbacks();
        return expect(component.lineNodeForScreenRow(3).textContent).toBe(editor.lineForScreenRow(3).text);
      });
      it("updates the top position of lines when the line height changes", function() {
        var initialLineHeightInPixels, newLineHeightInPixels;
        initialLineHeightInPixels = editor.getLineHeightInPixels();
        component.setLineHeight(2);
        runSetImmediateCallbacks();
        newLineHeightInPixels = editor.getLineHeightInPixels();
        expect(newLineHeightInPixels).not.toBe(initialLineHeightInPixels);
        return expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * newLineHeightInPixels);
      });
      it("updates the top position of lines when the font size changes", function() {
        var initialLineHeightInPixels, newLineHeightInPixels;
        initialLineHeightInPixels = editor.getLineHeightInPixels();
        component.setFontSize(10);
        runSetImmediateCallbacks();
        newLineHeightInPixels = editor.getLineHeightInPixels();
        expect(newLineHeightInPixels).not.toBe(initialLineHeightInPixels);
        return expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * newLineHeightInPixels);
      });
      it("updates the top position of lines when the font family changes", function() {
        var initialLineHeightInPixels, linesComponent, newLineHeightInPixels;
        linesComponent = component.refs.lines;
        spyOn(linesComponent, 'measureLineHeightAndDefaultCharWidth').andCallFake(function() {
          return editor.setLineHeightInPixels(10);
        });
        initialLineHeightInPixels = editor.getLineHeightInPixels();
        component.setFontFamily('sans-serif');
        runSetImmediateCallbacks();
        expect(linesComponent.measureLineHeightAndDefaultCharWidth).toHaveBeenCalled();
        newLineHeightInPixels = editor.getLineHeightInPixels();
        expect(newLineHeightInPixels).not.toBe(initialLineHeightInPixels);
        return expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * newLineHeightInPixels);
      });
      it("renders the .lines div at the full height of the editor if there aren't enough lines to scroll vertically", function() {
        var linesNode;
        editor.setText('');
        node.style.height = '300px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        linesNode = node.querySelector('.lines');
        return expect(linesNode.offsetHeight).toBe(300);
      });
      it("assigns the width of each line so it extends across the full width of the editor", function() {
        var gutterWidth, lineNode, lineNodes, scrollViewNode, scrollViewWidth, _i, _j, _len, _len1, _results;
        gutterWidth = node.querySelector('.gutter').offsetWidth;
        scrollViewNode = node.querySelector('.scroll-view');
        lineNodes = node.querySelectorAll('.line');
        node.style.width = gutterWidth + (30 * charWidth) + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(editor.getScrollWidth()).toBeGreaterThan(scrollViewNode.offsetWidth);
        for (_i = 0, _len = lineNodes.length; _i < _len; _i++) {
          lineNode = lineNodes[_i];
          expect(lineNode.style.width).toBe(editor.getScrollWidth() + 'px');
        }
        node.style.width = gutterWidth + editor.getScrollWidth() + 100 + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        scrollViewWidth = scrollViewNode.offsetWidth;
        _results = [];
        for (_j = 0, _len1 = lineNodes.length; _j < _len1; _j++) {
          lineNode = lineNodes[_j];
          _results.push(expect(lineNode.style.width).toBe(scrollViewWidth + 'px'));
        }
        return _results;
      });
      describe("when showInvisibles is enabled", function() {
        var invisibles;
        invisibles = null;
        beforeEach(function() {
          invisibles = {
            eol: 'E',
            space: 'S',
            tab: 'T',
            cr: 'C'
          };
          atom.config.set("editor.showInvisibles", true);
          return atom.config.set("editor.invisibles", invisibles);
        });
        it("re-renders the lines when the showInvisibles config option changes", function() {
          editor.setText(" a line with tabs\tand spaces ");
          runSetImmediateCallbacks();
          expect(component.lineNodeForScreenRow(0).textContent).toBe("" + invisibles.space + "a line with tabs" + invisibles.tab + "and spaces" + invisibles.space + invisibles.eol);
          atom.config.set("editor.showInvisibles", false);
          expect(component.lineNodeForScreenRow(0).textContent).toBe(" a line with tabs and spaces ");
          atom.config.set("editor.showInvisibles", true);
          return expect(component.lineNodeForScreenRow(0).textContent).toBe("" + invisibles.space + "a line with tabs" + invisibles.tab + "and spaces" + invisibles.space + invisibles.eol);
        });
        it("displays spaces, tabs, and newlines as visible characters", function() {
          editor.setText(" a line with tabs\tand spaces ");
          runSetImmediateCallbacks();
          return expect(component.lineNodeForScreenRow(0).textContent).toBe("" + invisibles.space + "a line with tabs" + invisibles.tab + "and spaces" + invisibles.space + invisibles.eol);
        });
        it("displays newlines as their own token outside of the other tokens' scopes", function() {
          editor.setText("var");
          runSetImmediateCallbacks();
          return expect(component.lineNodeForScreenRow(0).innerHTML).toBe("<span class=\"source js\"><span class=\"storage modifier js\">var</span></span><span class=\"invisible-character\">" + invisibles.eol + "</span>");
        });
        it("displays trailing carriage returns using a visible, non-empty value", function() {
          editor.setText("a line that ends with a carriage return\r\n");
          runSetImmediateCallbacks();
          return expect(component.lineNodeForScreenRow(0).textContent).toBe("a line that ends with a carriage return" + invisibles.cr + invisibles.eol);
        });
        return describe("when soft wrapping is enabled", function() {
          beforeEach(function() {
            editor.setText("a line that wraps ");
            editor.setSoftWrap(true);
            runSetImmediateCallbacks();
            node.style.width = 16 * charWidth + 'px';
            component.measureScrollView();
            return runSetImmediateCallbacks();
          });
          return it("doesn't show end of line invisibles at the end of wrapped lines", function() {
            expect(component.lineNodeForScreenRow(0).textContent).toBe("a line that ");
            return expect(component.lineNodeForScreenRow(1).textContent).toBe("wraps" + invisibles.space + invisibles.eol);
          });
        });
      });
      describe("when indent guides are enabled", function() {
        var getLeafNodes;
        beforeEach(function() {
          component.setShowIndentGuide(true);
          return runSetImmediateCallbacks();
        });
        it("adds an 'indent-guide' class to spans comprising the leading whitespace", function() {
          var line1LeafNodes, line2LeafNodes;
          line1LeafNodes = getLeafNodes(component.lineNodeForScreenRow(1));
          expect(line1LeafNodes[0].textContent).toBe('  ');
          expect(line1LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line1LeafNodes[1].classList.contains('indent-guide')).toBe(false);
          line2LeafNodes = getLeafNodes(component.lineNodeForScreenRow(2));
          expect(line2LeafNodes[0].textContent).toBe('  ');
          expect(line2LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line2LeafNodes[1].textContent).toBe('  ');
          expect(line2LeafNodes[1].classList.contains('indent-guide')).toBe(true);
          return expect(line2LeafNodes[2].classList.contains('indent-guide')).toBe(false);
        });
        it("renders leading whitespace spans with the 'indent-guide' class for empty lines", function() {
          var line2LeafNodes;
          editor.getBuffer().insert([1, Infinity], '\n');
          runSetImmediateCallbacks();
          line2LeafNodes = getLeafNodes(component.lineNodeForScreenRow(2));
          expect(line2LeafNodes.length).toBe(2);
          expect(line2LeafNodes[0].textContent).toBe('  ');
          expect(line2LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line2LeafNodes[1].textContent).toBe('  ');
          return expect(line2LeafNodes[1].classList.contains('indent-guide')).toBe(true);
        });
        it("renders indent guides correctly on lines containing only whitespace", function() {
          var line2LeafNodes;
          editor.getBuffer().insert([1, Infinity], '\n      ');
          runSetImmediateCallbacks();
          line2LeafNodes = getLeafNodes(component.lineNodeForScreenRow(2));
          expect(line2LeafNodes.length).toBe(3);
          expect(line2LeafNodes[0].textContent).toBe('  ');
          expect(line2LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line2LeafNodes[1].textContent).toBe('  ');
          expect(line2LeafNodes[1].classList.contains('indent-guide')).toBe(true);
          expect(line2LeafNodes[2].textContent).toBe('  ');
          return expect(line2LeafNodes[2].classList.contains('indent-guide')).toBe(true);
        });
        it("does not render indent guides in trailing whitespace for lines containing non whitespace characters", function() {
          var line0LeafNodes;
          editor.getBuffer().setText("  hi  ");
          runSetImmediateCallbacks();
          line0LeafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
          expect(line0LeafNodes[0].textContent).toBe('  ');
          expect(line0LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line0LeafNodes[1].textContent).toBe('  ');
          return expect(line0LeafNodes[1].classList.contains('indent-guide')).toBe(false);
        });
        it("updates the indent guides on empty lines preceding an indentation change", function() {
          var line12LeafNodes;
          editor.getBuffer().insert([12, 0], '\n');
          runSetImmediateCallbacks();
          editor.getBuffer().insert([13, 0], '    ');
          runSetImmediateCallbacks();
          line12LeafNodes = getLeafNodes(component.lineNodeForScreenRow(12));
          expect(line12LeafNodes[0].textContent).toBe('  ');
          expect(line12LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line12LeafNodes[1].textContent).toBe('  ');
          return expect(line12LeafNodes[1].classList.contains('indent-guide')).toBe(true);
        });
        it("updates the indent guides on empty lines following an indentation change", function() {
          var line13LeafNodes;
          editor.getBuffer().insert([12, 2], '\n');
          runSetImmediateCallbacks();
          editor.getBuffer().insert([12, 0], '    ');
          runSetImmediateCallbacks();
          line13LeafNodes = getLeafNodes(component.lineNodeForScreenRow(13));
          expect(line13LeafNodes[0].textContent).toBe('  ');
          expect(line13LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line13LeafNodes[1].textContent).toBe('  ');
          return expect(line13LeafNodes[1].classList.contains('indent-guide')).toBe(true);
        });
        return getLeafNodes = function(node) {
          if (node.children.length > 0) {
            return flatten(toArray(node.children).map(getLeafNodes));
          } else {
            return [node];
          }
        };
      });
      describe("when the buffer contains null bytes", function() {
        return it("excludes the null byte from character measurement", function() {
          editor.setText("a\0b");
          runSetImmediateCallbacks();
          return expect(editor.pixelPositionForScreenPosition([0, Infinity]).left).toEqual(2 * charWidth);
        });
      });
      return describe("when there is a fold", function() {
        return it("renders a fold marker on the folded line", function() {
          var foldedLineNode;
          foldedLineNode = component.lineNodeForScreenRow(4);
          expect(foldedLineNode.querySelector('.fold-marker')).toBeFalsy();
          editor.foldBufferRow(4);
          runSetImmediateCallbacks();
          foldedLineNode = component.lineNodeForScreenRow(4);
          expect(foldedLineNode.querySelector('.fold-marker')).toBeTruthy();
          editor.unfoldBufferRow(4);
          runSetImmediateCallbacks();
          foldedLineNode = component.lineNodeForScreenRow(4);
          return expect(foldedLineNode.querySelector('.fold-marker')).toBeFalsy();
        });
      });
    });
    describe("gutter rendering", function() {
      var gutter;
      gutter = [][0];
      beforeEach(function() {
        var _ref2;
        return _ref2 = component.refs, gutter = _ref2.gutter, _ref2;
      });
      it("renders the currently-visible line numbers", function() {
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(node.querySelectorAll('.line-number').length).toBe(6 + 2 + 1);
        expect(component.lineNumberNodeForScreenRow(0).textContent).toBe("" + nbsp + "1");
        expect(component.lineNumberNodeForScreenRow(5).textContent).toBe("" + nbsp + "6");
        verticalScrollbarNode.scrollTop = 2.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        expect(node.querySelectorAll('.line-number').length).toBe(6 + 4 + 1);
        expect(component.lineNumberNodeForScreenRow(2).textContent).toBe("" + nbsp + "3");
        expect(component.lineNumberNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(7).textContent).toBe("" + nbsp + "8");
        return expect(component.lineNumberNodeForScreenRow(7).offsetTop).toBe(7 * lineHeightInPixels);
      });
      it("updates the translation of subsequent line numbers when lines are inserted or removed", function() {
        var lineNumberNodes;
        editor.getBuffer().insert([0, 0], '\n\n');
        runSetImmediateCallbacks();
        lineNumberNodes = node.querySelectorAll('.line-number');
        expect(component.lineNumberNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNumberNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(3).offsetTop).toBe(3 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(4).offsetTop).toBe(4 * lineHeightInPixels);
        editor.getBuffer().insert([0, 0], '\n\n');
        runSetImmediateCallbacks();
        expect(component.lineNumberNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNumberNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(3).offsetTop).toBe(3 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(4).offsetTop).toBe(4 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(5).offsetTop).toBe(5 * lineHeightInPixels);
        return expect(component.lineNumberNodeForScreenRow(6).offsetTop).toBe(6 * lineHeightInPixels);
      });
      it("renders • characters for soft-wrapped lines", function() {
        editor.setSoftWrap(true);
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        node.style.width = 30 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(node.querySelectorAll('.line-number').length).toBe(6 + lineOverdrawMargin + 1);
        expect(component.lineNumberNodeForScreenRow(0).textContent).toBe("" + nbsp + "1");
        expect(component.lineNumberNodeForScreenRow(1).textContent).toBe("" + nbsp + "•");
        expect(component.lineNumberNodeForScreenRow(2).textContent).toBe("" + nbsp + "2");
        expect(component.lineNumberNodeForScreenRow(3).textContent).toBe("" + nbsp + "•");
        expect(component.lineNumberNodeForScreenRow(4).textContent).toBe("" + nbsp + "3");
        return expect(component.lineNumberNodeForScreenRow(5).textContent).toBe("" + nbsp + "•");
      });
      it("pads line numbers to be right-justified based on the maximum number of line number digits", function() {
        var gutterNode, initialGutterWidth, screenRow, _i, _j, _k;
        editor.getBuffer().setText([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].join('\n'));
        runSetImmediateCallbacks();
        for (screenRow = _i = 0; _i <= 8; screenRow = ++_i) {
          expect(component.lineNumberNodeForScreenRow(screenRow).textContent).toBe("" + nbsp + (screenRow + 1));
        }
        expect(component.lineNumberNodeForScreenRow(9).textContent).toBe("10");
        gutterNode = node.querySelector('.gutter');
        initialGutterWidth = gutterNode.offsetWidth;
        editor.getBuffer()["delete"]([[1, 0], [2, 0]]);
        runSetImmediateCallbacks();
        for (screenRow = _j = 0; _j <= 8; screenRow = ++_j) {
          expect(component.lineNumberNodeForScreenRow(screenRow).textContent).toBe("" + (screenRow + 1));
        }
        expect(gutterNode.offsetWidth).toBeLessThan(initialGutterWidth);
        editor.getBuffer().insert([0, 0], '\n\n');
        runSetImmediateCallbacks();
        for (screenRow = _k = 0; _k <= 8; screenRow = ++_k) {
          expect(component.lineNumberNodeForScreenRow(screenRow).textContent).toBe("" + nbsp + (screenRow + 1));
        }
        expect(component.lineNumberNodeForScreenRow(9).textContent).toBe("10");
        return expect(gutterNode.offsetWidth).toBe(initialGutterWidth);
      });
      it("renders the .line-numbers div at the full height of the editor even if it's taller than its content", function() {
        node.style.height = node.offsetHeight + 100 + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        return expect(node.querySelector('.line-numbers').offsetHeight).toBe(node.offsetHeight);
      });
      describe("when the editor.showLineNumbers config is false", function() {
        return it("doesn't render any line numbers", function() {
          expect(component.refs.gutter).toBeDefined();
          atom.config.set("editor.showLineNumbers", false);
          expect(component.refs.gutter).not.toBeDefined();
          atom.config.set("editor.showLineNumbers", true);
          return expect(component.refs.gutter).toBeDefined();
        });
      });
      return describe("fold decorations", function() {
        describe("rendering fold decorations", function() {
          it("adds the foldable class to line numbers when the line is foldable", function() {
            expect(lineNumberHasClass(0, 'foldable')).toBe(true);
            expect(lineNumberHasClass(1, 'foldable')).toBe(true);
            expect(lineNumberHasClass(2, 'foldable')).toBe(false);
            expect(lineNumberHasClass(3, 'foldable')).toBe(false);
            expect(lineNumberHasClass(4, 'foldable')).toBe(true);
            return expect(lineNumberHasClass(5, 'foldable')).toBe(false);
          });
          it("updates the foldable class on the correct line numbers when the foldable positions change", function() {
            editor.getBuffer().insert([0, 0], '\n');
            runSetImmediateCallbacks();
            expect(lineNumberHasClass(0, 'foldable')).toBe(false);
            expect(lineNumberHasClass(1, 'foldable')).toBe(true);
            expect(lineNumberHasClass(2, 'foldable')).toBe(true);
            expect(lineNumberHasClass(3, 'foldable')).toBe(false);
            expect(lineNumberHasClass(4, 'foldable')).toBe(false);
            expect(lineNumberHasClass(5, 'foldable')).toBe(true);
            return expect(lineNumberHasClass(6, 'foldable')).toBe(false);
          });
          it("updates the foldable class on a line number that becomes foldable", function() {
            expect(lineNumberHasClass(11, 'foldable')).toBe(false);
            editor.getBuffer().insert([11, 44], '\n    fold me');
            runSetImmediateCallbacks();
            expect(lineNumberHasClass(11, 'foldable')).toBe(true);
            editor.undo();
            runSetImmediateCallbacks();
            return expect(lineNumberHasClass(11, 'foldable')).toBe(false);
          });
          return it("adds, updates and removes the folded class on the correct line number nodes", function() {
            editor.foldBufferRow(4);
            runSetImmediateCallbacks();
            expect(lineNumberHasClass(4, 'folded')).toBe(true);
            editor.getBuffer().insert([0, 0], '\n');
            runSetImmediateCallbacks();
            expect(lineNumberHasClass(4, 'folded')).toBe(false);
            expect(lineNumberHasClass(5, 'folded')).toBe(true);
            editor.unfoldBufferRow(5);
            runSetImmediateCallbacks();
            return expect(lineNumberHasClass(5, 'folded')).toBe(false);
          });
        });
        return describe("mouse interactions with fold indicators", function() {
          var buildClickEvent, gutterNode;
          gutterNode = [][0];
          buildClickEvent = function(target) {
            return buildMouseEvent('click', {
              target: target
            });
          };
          beforeEach(function() {
            return gutterNode = node.querySelector('.gutter');
          });
          it("folds and unfolds the block represented by the fold indicator when clicked", function() {
            var lineNumber, target;
            expect(lineNumberHasClass(1, 'folded')).toBe(false);
            lineNumber = component.lineNumberNodeForScreenRow(1);
            target = lineNumber.querySelector('.icon-right');
            target.dispatchEvent(buildClickEvent(target));
            runSetImmediateCallbacks();
            expect(lineNumberHasClass(1, 'folded')).toBe(true);
            lineNumber = component.lineNumberNodeForScreenRow(1);
            target = lineNumber.querySelector('.icon-right');
            target.dispatchEvent(buildClickEvent(target));
            runSetImmediateCallbacks();
            return expect(lineNumberHasClass(1, 'folded')).toBe(false);
          });
          return it("does not fold when the line number node is clicked", function() {
            var lineNumber;
            lineNumber = component.lineNumberNodeForScreenRow(1);
            lineNumber.dispatchEvent(buildClickEvent(lineNumber));
            runSetImmediateCallbacks();
            return expect(lineNumberHasClass(1, 'folded')).toBe(false);
          });
        });
      });
    });
    describe("cursor rendering", function() {
      it("renders the currently visible cursors, translated relative to the scroll position", function() {
        var cursor1, cursor2, cursor3, cursorNodes;
        cursor1 = editor.getCursor();
        cursor1.setScreenPosition([0, 5]);
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        node.style.width = 20 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        cursorNodes = node.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        expect(cursorNodes[0].offsetHeight).toBe(lineHeightInPixels);
        expect(cursorNodes[0].offsetWidth).toBe(charWidth);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + (5 * charWidth) + "px, " + (0 * lineHeightInPixels) + "px, 0px)");
        cursor2 = editor.addCursorAtScreenPosition([8, 11]);
        cursor3 = editor.addCursorAtScreenPosition([4, 10]);
        runSetImmediateCallbacks();
        cursorNodes = node.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(2);
        expect(cursorNodes[0].offsetTop).toBe(0);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + (5 * charWidth) + "px, " + (0 * lineHeightInPixels) + "px, 0px)");
        expect(cursorNodes[1].style['-webkit-transform']).toBe("translate3d(" + (10 * charWidth) + "px, " + (4 * lineHeightInPixels) + "px, 0px)");
        verticalScrollbarNode.scrollTop = 4.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        horizontalScrollbarNode.scrollLeft = 3.5 * charWidth;
        horizontalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        cursorNodes = node.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(2);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + ((11 - 3.5) * charWidth) + "px, " + ((8 - 4.5) * lineHeightInPixels) + "px, 0px)");
        expect(cursorNodes[1].style['-webkit-transform']).toBe("translate3d(" + ((10 - 3.5) * charWidth) + "px, " + ((4 - 4.5) * lineHeightInPixels) + "px, 0px)");
        cursor3.destroy();
        runSetImmediateCallbacks();
        cursorNodes = node.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        return expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + ((11 - 3.5) * charWidth) + "px, " + ((6 - 2.5) * lineHeightInPixels) + "px, 0px)");
      });
      it("accounts for character widths when positioning cursors", function() {
        var cursor, cursorLocationTextNode, cursorRect, range, rangeRect;
        atom.config.set('editor.fontFamily', 'sans-serif');
        editor.setCursorScreenPosition([0, 16]);
        runSetImmediateCallbacks();
        cursor = node.querySelector('.cursor');
        cursorRect = cursor.getBoundingClientRect();
        cursorLocationTextNode = component.lineNodeForScreenRow(0).querySelector('.storage.type.function.js').firstChild;
        range = document.createRange();
        range.setStart(cursorLocationTextNode, 0);
        range.setEnd(cursorLocationTextNode, 1);
        rangeRect = range.getBoundingClientRect();
        expect(cursorRect.left).toBe(rangeRect.left);
        return expect(cursorRect.width).toBe(rangeRect.width);
      });
      it("positions cursors correctly after character widths are changed via a stylesheet change", function() {
        var cursor, cursorLocationTextNode, cursorRect, range, rangeRect;
        atom.config.set('editor.fontFamily', 'sans-serif');
        editor.setCursorScreenPosition([0, 16]);
        runSetImmediateCallbacks();
        atom.themes.applyStylesheet('test', ".function.js {\n  font-weight: bold;\n}");
        runSetImmediateCallbacks();
        runSetImmediateCallbacks();
        cursor = node.querySelector('.cursor');
        cursorRect = cursor.getBoundingClientRect();
        cursorLocationTextNode = component.lineNodeForScreenRow(0).querySelector('.storage.type.function.js').firstChild;
        range = document.createRange();
        range.setStart(cursorLocationTextNode, 0);
        range.setEnd(cursorLocationTextNode, 1);
        rangeRect = range.getBoundingClientRect();
        expect(cursorRect.left).toBe(rangeRect.left);
        expect(cursorRect.width).toBe(rangeRect.width);
        return atom.themes.removeStylesheet('test');
      });
      it("sets the cursor to the default character width at the end of a line", function() {
        var cursorNode;
        editor.setCursorScreenPosition([0, Infinity]);
        runSetImmediateCallbacks();
        cursorNode = node.querySelector('.cursor');
        return expect(cursorNode.offsetWidth).toBe(charWidth);
      });
      it("gives the cursor a non-zero width even if it's inside atomic tokens", function() {
        var cursorNode;
        editor.setCursorScreenPosition([1, 0]);
        runSetImmediateCallbacks();
        cursorNode = node.querySelector('.cursor');
        return expect(cursorNode.offsetWidth).toBe(charWidth);
      });
      it("blinks cursors when they aren't moving", function() {
        var cursorsNode;
        spyOn(_._, 'now').andCallFake(function() {
          return window.now;
        });
        cursorsNode = node.querySelector('.cursors');
        expect(cursorsNode.classList.contains('blink-off')).toBe(false);
        advanceClock(component.props.cursorBlinkPeriod / 2);
        expect(cursorsNode.classList.contains('blink-off')).toBe(true);
        advanceClock(component.props.cursorBlinkPeriod / 2);
        expect(cursorsNode.classList.contains('blink-off')).toBe(false);
        editor.moveCursorRight();
        expect(cursorsNode.classList.contains('blink-off')).toBe(false);
        advanceClock(component.props.cursorBlinkResumeDelay);
        advanceClock(component.props.cursorBlinkPeriod / 2);
        return expect(cursorsNode.classList.contains('blink-off')).toBe(true);
      });
      it("does not render cursors that are associated with non-empty selections", function() {
        var cursorNodes;
        editor.setSelectedScreenRange([[0, 4], [4, 6]]);
        editor.addCursorAtScreenPosition([6, 8]);
        runSetImmediateCallbacks();
        cursorNodes = node.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        return expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + (8 * charWidth) + "px, " + (6 * lineHeightInPixels) + "px, 0px)");
      });
      it("updates cursor positions when the line height changes", function() {
        var cursorNode;
        editor.setCursorBufferPosition([1, 10]);
        component.setLineHeight(2);
        runSetImmediateCallbacks();
        cursorNode = node.querySelector('.cursor');
        return expect(cursorNode.style['-webkit-transform']).toBe("translate3d(" + (10 * editor.getDefaultCharWidth()) + "px, " + (editor.getLineHeightInPixels()) + "px, 0px)");
      });
      it("updates cursor positions when the font size changes", function() {
        var cursorNode;
        editor.setCursorBufferPosition([1, 10]);
        component.setFontSize(10);
        runSetImmediateCallbacks();
        cursorNode = node.querySelector('.cursor');
        return expect(cursorNode.style['-webkit-transform']).toBe("translate3d(" + (10 * editor.getDefaultCharWidth()) + "px, " + (editor.getLineHeightInPixels()) + "px, 0px)");
      });
      return it("updates cursor positions when the font family changes", function() {
        var cursorNode, left;
        editor.setCursorBufferPosition([1, 10]);
        component.setFontFamily('sans-serif');
        runSetImmediateCallbacks();
        cursorNode = node.querySelector('.cursor');
        left = editor.pixelPositionForScreenPosition([1, 10]).left;
        return expect(cursorNode.style['-webkit-transform']).toBe("translate3d(" + left + "px, " + (editor.getLineHeightInPixels()) + "px, 0px)");
      });
    });
    describe("selection rendering", function() {
      var scrollViewClientLeft, scrollViewNode, _ref2;
      _ref2 = [], scrollViewNode = _ref2[0], scrollViewClientLeft = _ref2[1];
      beforeEach(function() {
        scrollViewNode = node.querySelector('.scroll-view');
        return scrollViewClientLeft = node.querySelector('.scroll-view').getBoundingClientRect().left;
      });
      it("renders 1 region for 1-line selections", function() {
        var regionRect, regions;
        editor.setSelectedScreenRange([[1, 6], [1, 10]]);
        runSetImmediateCallbacks();
        regions = node.querySelectorAll('.selection .region');
        expect(regions.length).toBe(1);
        regionRect = regions[0].getBoundingClientRect();
        expect(regionRect.top).toBe(1 * lineHeightInPixels);
        expect(regionRect.height).toBe(1 * lineHeightInPixels);
        expect(regionRect.left).toBe(scrollViewClientLeft + 6 * charWidth);
        return expect(regionRect.width).toBe(4 * charWidth);
      });
      it("renders 2 regions for 2-line selections", function() {
        var region1Rect, region2Rect, regions;
        editor.setSelectedScreenRange([[1, 6], [2, 10]]);
        runSetImmediateCallbacks();
        regions = node.querySelectorAll('.selection .region');
        expect(regions.length).toBe(2);
        region1Rect = regions[0].getBoundingClientRect();
        expect(region1Rect.top).toBe(1 * lineHeightInPixels);
        expect(region1Rect.height).toBe(1 * lineHeightInPixels);
        expect(region1Rect.left).toBe(scrollViewClientLeft + 6 * charWidth);
        expect(region1Rect.right).toBe(scrollViewNode.getBoundingClientRect().right);
        region2Rect = regions[1].getBoundingClientRect();
        expect(region2Rect.top).toBe(2 * lineHeightInPixels);
        expect(region2Rect.height).toBe(1 * lineHeightInPixels);
        expect(region2Rect.left).toBe(scrollViewClientLeft + 0);
        return expect(region2Rect.width).toBe(10 * charWidth);
      });
      it("renders 3 regions for selections with more than 2 lines", function() {
        var region1Rect, region2Rect, region3Rect, regions;
        editor.setSelectedScreenRange([[1, 6], [5, 10]]);
        runSetImmediateCallbacks();
        regions = node.querySelectorAll('.selection .region');
        expect(regions.length).toBe(3);
        region1Rect = regions[0].getBoundingClientRect();
        expect(region1Rect.top).toBe(1 * lineHeightInPixels);
        expect(region1Rect.height).toBe(1 * lineHeightInPixels);
        expect(region1Rect.left).toBe(scrollViewClientLeft + 6 * charWidth);
        expect(region1Rect.right).toBe(scrollViewNode.getBoundingClientRect().right);
        region2Rect = regions[1].getBoundingClientRect();
        expect(region2Rect.top).toBe(2 * lineHeightInPixels);
        expect(region2Rect.height).toBe(3 * lineHeightInPixels);
        expect(region2Rect.left).toBe(scrollViewClientLeft + 0);
        expect(region2Rect.right).toBe(scrollViewNode.getBoundingClientRect().right);
        region3Rect = regions[2].getBoundingClientRect();
        expect(region3Rect.top).toBe(5 * lineHeightInPixels);
        expect(region3Rect.height).toBe(1 * lineHeightInPixels);
        expect(region3Rect.left).toBe(scrollViewClientLeft + 0);
        return expect(region3Rect.width).toBe(10 * charWidth);
      });
      it("does not render empty selections", function() {
        editor.addSelectionForBufferRange([[2, 2], [2, 2]]);
        runSetImmediateCallbacks();
        expect(editor.getSelection(0).isEmpty()).toBe(true);
        expect(editor.getSelection(1).isEmpty()).toBe(true);
        return expect(node.querySelectorAll('.selection').length).toBe(0);
      });
      it("updates selections when the line height changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setLineHeight(2);
        runSetImmediateCallbacks();
        selectionNode = node.querySelector('.region');
        return expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
      });
      it("updates selections when the font size changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setFontSize(10);
        runSetImmediateCallbacks();
        selectionNode = node.querySelector('.region');
        expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
        return expect(selectionNode.offsetLeft).toBe(6 * editor.getDefaultCharWidth());
      });
      it("updates selections when the font family changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setFontFamily('sans-serif');
        runSetImmediateCallbacks();
        selectionNode = node.querySelector('.region');
        expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
        return expect(selectionNode.offsetLeft).toBe(editor.pixelPositionForScreenPosition([1, 6]).left);
      });
      return it("will flash the selection when flash:true is passed to editor::setSelectedBufferRange", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]], {
          flash: true
        });
        runSetImmediateCallbacks();
        selectionNode = node.querySelector('.selection');
        expect(selectionNode.classList.contains('flash')).toBe(true);
        advanceClock(editor.selectionFlashDuration);
        expect(selectionNode.classList.contains('flash')).toBe(false);
        editor.setSelectedBufferRange([[1, 5], [1, 7]], {
          flash: true
        });
        runSetImmediateCallbacks();
        return expect(selectionNode.classList.contains('flash')).toBe(true);
      });
    });
    describe("line decoration rendering", function() {
      var decoration, decorationParams, marker, _ref2;
      _ref2 = [], marker = _ref2[0], decoration = _ref2[1], decorationParams = _ref2[2];
      beforeEach(function() {
        marker = editor.displayBuffer.markBufferRange([[2, 13], [3, 15]], {
          invalidate: 'inside'
        });
        decorationParams = {
          type: ['gutter', 'line'],
          "class": 'a'
        };
        decoration = editor.decorateMarker(marker, decorationParams);
        return runSetImmediateCallbacks();
      });
      it("applies line decoration classes to lines and line numbers", function() {
        var marker2;
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(true);
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        marker2 = editor.displayBuffer.markBufferRange([[9, 0], [9, 0]]);
        editor.decorateMarker(marker2, {
          type: ['gutter', 'line'],
          "class": 'b'
        });
        runSetImmediateCallbacks();
        verticalScrollbarNode.scrollTop = 2.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        expect(lineAndLineNumberHaveClass(9, 'b')).toBe(true);
        editor.foldBufferRow(5);
        runSetImmediateCallbacks();
        expect(lineAndLineNumberHaveClass(9, 'b')).toBe(false);
        return expect(lineAndLineNumberHaveClass(6, 'b')).toBe(true);
      });
      it("only applies decorations to screen rows that are spanned by their marker when lines are soft-wrapped", function() {
        editor.setText("a line that wraps, ok");
        editor.setSoftWrap(true);
        node.style.width = 16 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        marker.destroy();
        marker = editor.markBufferRange([[0, 0], [0, 2]]);
        editor.decorateMarker(marker, {
          type: ['gutter', 'line'],
          "class": 'b'
        });
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(0, 'b')).toBe(true);
        expect(lineNumberHasClass(1, 'b')).toBe(false);
        marker.setBufferRange([[0, 0], [0, Infinity]]);
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(0, 'b')).toBe(true);
        return expect(lineNumberHasClass(1, 'b')).toBe(true);
      });
      it("updates decorations when markers move", function() {
        expect(lineAndLineNumberHaveClass(1, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(4, 'a')).toBe(false);
        editor.getBuffer().insert([0, 0], '\n');
        runSetImmediateCallbacks();
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(4, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(5, 'a')).toBe(false);
        marker.setBufferRange([[4, 4], [6, 4]]);
        runSetImmediateCallbacks();
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(4, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(5, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(6, 'a')).toBe(true);
        return expect(lineAndLineNumberHaveClass(7, 'a')).toBe(false);
      });
      it("remove decoration classes and unsubscribes from markers decorations are removed", function() {
        expect(marker.getSubscriptionCount('changed'));
        decoration.destroy();
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(1, 'a')).toBe(false);
        expect(lineNumberHasClass(2, 'a')).toBe(false);
        expect(lineNumberHasClass(3, 'a')).toBe(false);
        expect(lineNumberHasClass(4, 'a')).toBe(false);
        return expect(marker.getSubscriptionCount('changed')).toBe(0);
      });
      it("removes decorations when their marker is invalidated", function() {
        editor.getBuffer().insert([3, 2], 'n');
        runSetImmediateCallbacks();
        expect(marker.isValid()).toBe(false);
        expect(lineAndLineNumberHaveClass(1, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(4, 'a')).toBe(false);
        editor.undo();
        runSetImmediateCallbacks();
        expect(marker.isValid()).toBe(true);
        expect(lineAndLineNumberHaveClass(1, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(true);
        return expect(lineAndLineNumberHaveClass(4, 'a')).toBe(false);
      });
      it("removes decorations when their marker is destroyed", function() {
        marker.destroy();
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(1, 'a')).toBe(false);
        expect(lineNumberHasClass(2, 'a')).toBe(false);
        expect(lineNumberHasClass(3, 'a')).toBe(false);
        return expect(lineNumberHasClass(4, 'a')).toBe(false);
      });
      describe("when the decoration's 'onlyHead' property is true", function() {
        return it("only applies the decoration's class to lines containing the marker's head", function() {
          editor.decorateMarker(marker, {
            type: ['gutter', 'line'],
            "class": 'only-head',
            onlyHead: true
          });
          runSetImmediateCallbacks();
          expect(lineAndLineNumberHaveClass(1, 'only-head')).toBe(false);
          expect(lineAndLineNumberHaveClass(2, 'only-head')).toBe(false);
          expect(lineAndLineNumberHaveClass(3, 'only-head')).toBe(true);
          return expect(lineAndLineNumberHaveClass(4, 'only-head')).toBe(false);
        });
      });
      describe("when the decoration's 'onlyEmpty' property is true", function() {
        return it("only applies the decoration when its marker is empty", function() {
          editor.decorateMarker(marker, {
            type: ['gutter', 'line'],
            "class": 'only-empty',
            onlyEmpty: true
          });
          runSetImmediateCallbacks();
          expect(lineAndLineNumberHaveClass(2, 'only-empty')).toBe(false);
          expect(lineAndLineNumberHaveClass(3, 'only-empty')).toBe(false);
          marker.clearTail();
          runSetImmediateCallbacks();
          expect(lineAndLineNumberHaveClass(2, 'only-empty')).toBe(false);
          return expect(lineAndLineNumberHaveClass(3, 'only-empty')).toBe(true);
        });
      });
      return describe("when the decoration's 'onlyNonEmpty' property is true", function() {
        return it("only applies the decoration when its marker is non-empty", function() {
          editor.decorateMarker(marker, {
            type: ['gutter', 'line'],
            "class": 'only-non-empty',
            onlyNonEmpty: true
          });
          runSetImmediateCallbacks();
          expect(lineAndLineNumberHaveClass(2, 'only-non-empty')).toBe(true);
          expect(lineAndLineNumberHaveClass(3, 'only-non-empty')).toBe(true);
          marker.clearTail();
          runSetImmediateCallbacks();
          expect(lineAndLineNumberHaveClass(2, 'only-non-empty')).toBe(false);
          return expect(lineAndLineNumberHaveClass(3, 'only-non-empty')).toBe(false);
        });
      });
    });
    describe("highlight decoration rendering", function() {
      var decoration, decorationParams, marker, scrollViewClientLeft, _ref2;
      _ref2 = [], marker = _ref2[0], decoration = _ref2[1], decorationParams = _ref2[2], scrollViewClientLeft = _ref2[3];
      beforeEach(function() {
        scrollViewClientLeft = node.querySelector('.scroll-view').getBoundingClientRect().left;
        marker = editor.displayBuffer.markBufferRange([[2, 13], [3, 15]], {
          invalidate: 'inside'
        });
        decorationParams = {
          type: 'highlight',
          "class": 'test-highlight'
        };
        decoration = editor.decorateMarker(marker, decorationParams);
        return runSetImmediateCallbacks();
      });
      it("does not render highlights for off-screen lines until they come on-screen", function() {
        var regionRect, regions;
        node.style.height = 2.5 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        marker = editor.displayBuffer.markBufferRange([[9, 2], [9, 4]], {
          invalidate: 'inside'
        });
        editor.decorateMarker(marker, {
          type: 'highlight',
          "class": 'some-highlight'
        });
        runSetImmediateCallbacks();
        expect(component.getRenderedRowRange()[1]).toBeLessThan(9);
        regions = node.querySelectorAll('.some-highlight .region');
        expect(regions.length).toBe(0);
        verticalScrollbarNode.scrollTop = 3.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        regions = node.querySelectorAll('.some-highlight .region');
        expect(regions.length).toBe(1);
        regionRect = regions[0].style;
        expect(regionRect.top).toBe(9 * lineHeightInPixels + 'px');
        expect(regionRect.height).toBe(1 * lineHeightInPixels + 'px');
        expect(regionRect.left).toBe(2 * charWidth + 'px');
        return expect(regionRect.width).toBe(2 * charWidth + 'px');
      });
      it("renders highlights decoration's marker is added", function() {
        var regions;
        regions = node.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(2);
      });
      it("removes highlights when a decoration is removed", function() {
        var regions;
        decoration.destroy();
        runSetImmediateCallbacks();
        regions = node.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(0);
      });
      it("does not render a highlight that is within a fold", function() {
        editor.foldBufferRow(1);
        runSetImmediateCallbacks();
        return expect(node.querySelectorAll('.test-highlight').length).toBe(0);
      });
      it("removes highlights when a decoration's marker is destroyed", function() {
        var regions;
        marker.destroy();
        runSetImmediateCallbacks();
        regions = node.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(0);
      });
      it("only renders highlights when a decoration's marker is valid", function() {
        var regions;
        editor.getBuffer().insert([3, 2], 'n');
        runSetImmediateCallbacks();
        expect(marker.isValid()).toBe(false);
        regions = node.querySelectorAll('.test-highlight .region');
        expect(regions.length).toBe(0);
        editor.getBuffer().undo();
        runSetImmediateCallbacks();
        expect(marker.isValid()).toBe(true);
        regions = node.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(2);
      });
      describe("when flashing a decoration via Decoration::flash()", function() {
        var highlightNode;
        highlightNode = null;
        beforeEach(function() {
          return highlightNode = node.querySelector('.test-highlight');
        });
        it("adds and removes the flash class specified in ::flash", function() {
          expect(highlightNode.classList.contains('flash-class')).toBe(false);
          decoration.flash('flash-class', 10);
          expect(highlightNode.classList.contains('flash-class')).toBe(true);
          advanceClock(10);
          return expect(highlightNode.classList.contains('flash-class')).toBe(false);
        });
        return describe("when ::flash is called again before the first has finished", function() {
          return it("removes the class from the decoration highlight before adding it for the second ::flash call", function() {
            delayAnimationFrames = true;
            decoration.flash('flash-class', 10);
            nextAnimationFrame();
            expect(highlightNode.classList.contains('flash-class')).toBe(true);
            advanceClock(2);
            decoration.flash('flash-class', 10);
            expect(highlightNode.classList.contains('flash-class')).toBe(false);
            nextAnimationFrame();
            expect(highlightNode.classList.contains('flash-class')).toBe(true);
            advanceClock(10);
            return expect(highlightNode.classList.contains('flash-class')).toBe(false);
          });
        });
      });
      describe("when a decoration's marker moves", function() {
        it("moves rendered highlights when the buffer is changed", function() {
          var newTop, originalTop, regionStyle;
          regionStyle = node.querySelector('.test-highlight .region').style;
          originalTop = parseInt(regionStyle.top);
          editor.getBuffer().insert([0, 0], '\n');
          runSetImmediateCallbacks();
          regionStyle = node.querySelector('.test-highlight .region').style;
          newTop = parseInt(regionStyle.top);
          return expect(newTop).toBe(originalTop + lineHeightInPixels);
        });
        return it("moves rendered highlights when the marker is manually moved", function() {
          var regionStyle;
          regionStyle = node.querySelector('.test-highlight .region').style;
          expect(parseInt(regionStyle.top)).toBe(2 * lineHeightInPixels);
          marker.setBufferRange([[5, 8], [5, 13]]);
          runSetImmediateCallbacks();
          regionStyle = node.querySelector('.test-highlight .region').style;
          return expect(parseInt(regionStyle.top)).toBe(5 * lineHeightInPixels);
        });
      });
      return describe("when a decoration is updated via Decoration::update", function() {
        return it("renders the decoration's new params", function() {
          expect(node.querySelector('.test-highlight')).toBeTruthy();
          decoration.update({
            type: 'highlight',
            "class": 'new-test-highlight'
          });
          runSetImmediateCallbacks();
          expect(node.querySelector('.test-highlight')).toBeFalsy();
          return expect(node.querySelector('.new-test-highlight')).toBeTruthy();
        });
      });
    });
    describe("hidden input field", function() {
      return it("renders the hidden input field at the position of the last cursor if the cursor is on screen and the editor is focused", function() {
        var inputNode;
        editor.setVerticalScrollMargin(0);
        editor.setHorizontalScrollMargin(0);
        inputNode = node.querySelector('.hidden-input');
        node.style.height = 5 * lineHeightInPixels + 'px';
        node.style.width = 10 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        editor.setScrollTop(3 * lineHeightInPixels);
        editor.setScrollLeft(3 * charWidth);
        runSetImmediateCallbacks();
        expect(inputNode.offsetTop).toBe(0);
        expect(inputNode.offsetLeft).toBe(0);
        editor.setCursorBufferPosition([5, 4]);
        runSetImmediateCallbacks();
        expect(inputNode.offsetTop).toBe(0);
        expect(inputNode.offsetLeft).toBe(0);
        inputNode.focus();
        expect(inputNode.offsetTop).toBe((5 * lineHeightInPixels) - editor.getScrollTop());
        expect(inputNode.offsetLeft).toBe((4 * charWidth) - editor.getScrollLeft());
        inputNode.blur();
        expect(inputNode.offsetTop).toBe(0);
        expect(inputNode.offsetLeft).toBe(0);
        editor.setCursorBufferPosition([1, 2]);
        runSetImmediateCallbacks();
        expect(inputNode.offsetTop).toBe(0);
        expect(inputNode.offsetLeft).toBe(0);
        inputNode.focus();
        expect(inputNode.offsetTop).toBe(0);
        return expect(inputNode.offsetLeft).toBe(0);
      });
    });
    describe("mouse interactions on the lines", function() {
      var linesNode;
      linesNode = null;
      beforeEach(function() {
        delayAnimationFrames = true;
        return linesNode = node.querySelector('.lines');
      });
      describe("when a non-folded line is single-clicked", function() {
        describe("when no modifier keys are held down", function() {
          return it("moves the cursor to the nearest screen position", function() {
            node.style.height = 4.5 * lineHeightInPixels + 'px';
            node.style.width = 10 * charWidth + 'px';
            component.measureScrollView();
            editor.setScrollTop(3.5 * lineHeightInPixels);
            editor.setScrollLeft(2 * charWidth);
            runSetImmediateCallbacks();
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([4, 8])));
            runSetImmediateCallbacks();
            return expect(editor.getCursorScreenPosition()).toEqual([4, 8]);
          });
        });
        describe("when the shift key is held down", function() {
          return it("selects to the nearest screen position", function() {
            editor.setCursorScreenPosition([3, 4]);
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 6]), {
              shiftKey: true
            }));
            runSetImmediateCallbacks();
            return expect(editor.getSelectedScreenRange()).toEqual([[3, 4], [5, 6]]);
          });
        });
        return describe("when the command key is held down", function() {
          return it("adds a cursor at the nearest screen position", function() {
            editor.setCursorScreenPosition([3, 4]);
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 6]), {
              metaKey: true
            }));
            runSetImmediateCallbacks();
            return expect(editor.getSelectedScreenRanges()).toEqual([[[3, 4], [3, 4]], [[5, 6], [5, 6]]]);
          });
        });
      });
      describe("when a non-folded line is double-clicked", function() {
        describe("when no modifier keys are held down", function() {
          return it("selects the word containing the nearest screen position", function() {
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 1
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 2
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            expect(editor.getSelectedScreenRange()).toEqual([[5, 6], [5, 13]]);
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([6, 6]), {
              detail: 1
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            expect(editor.getSelectedScreenRange()).toEqual([[6, 6], [6, 6]]);
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([8, 8]), {
              detail: 1,
              shiftKey: true
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            return expect(editor.getSelectedScreenRange()).toEqual([[6, 6], [8, 8]]);
          });
        });
        return describe("when the command key is held down", function() {
          return it("selects the word containing the newly-added cursor", function() {
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 1,
              metaKey: true
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 2,
              metaKey: true
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            return expect(editor.getSelectedScreenRanges()).toEqual([[[0, 0], [0, 0]], [[5, 6], [5, 13]]]);
          });
        });
      });
      describe("when a non-folded line is triple-clicked", function() {
        describe("when no modifier keys are held down", function() {
          return it("selects the line containing the nearest screen position", function() {
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 1
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 2
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 3
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            expect(editor.getSelectedScreenRange()).toEqual([[5, 0], [6, 0]]);
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([6, 6]), {
              detail: 1,
              shiftKey: true
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            expect(editor.getSelectedScreenRange()).toEqual([[5, 0], [7, 0]]);
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([7, 5]), {
              detail: 1
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([8, 8]), {
              detail: 1,
              shiftKey: true
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            return expect(editor.getSelectedScreenRange()).toEqual([[7, 5], [8, 8]]);
          });
        });
        return describe("when the command key is held down", function() {
          return it("selects the line containing the newly-added cursor", function() {
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 1,
              metaKey: true
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 2,
              metaKey: true
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 10]), {
              detail: 3,
              metaKey: true
            }));
            linesNode.dispatchEvent(buildMouseEvent('mouseup'));
            return expect(editor.getSelectedScreenRanges()).toEqual([[[0, 0], [0, 0]], [[5, 0], [6, 0]]]);
          });
        });
      });
      describe("when the mouse is clicked and dragged", function() {
        it("selects to the nearest screen position until the mouse button is released", function() {
          linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([2, 4]), {
            which: 1
          }));
          linesNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenPosition([6, 8]), {
            which: 1
          }));
          nextAnimationFrame();
          expect(editor.getSelectedScreenRange()).toEqual([[2, 4], [6, 8]]);
          linesNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenPosition([10, 0]), {
            which: 1
          }));
          nextAnimationFrame();
          expect(editor.getSelectedScreenRange()).toEqual([[2, 4], [10, 0]]);
          linesNode.dispatchEvent(buildMouseEvent('mouseup'));
          linesNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenPosition([12, 0]), {
            which: 1
          }));
          nextAnimationFrame();
          return expect(editor.getSelectedScreenRange()).toEqual([[2, 4], [10, 0]]);
        });
        return it("stops selecting if the mouse is dragged into the dev tools", function() {
          linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([2, 4]), {
            which: 1
          }));
          linesNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenPosition([6, 8]), {
            which: 1
          }));
          nextAnimationFrame();
          expect(editor.getSelectedScreenRange()).toEqual([[2, 4], [6, 8]]);
          linesNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenPosition([10, 0]), {
            which: 0
          }));
          nextAnimationFrame();
          expect(editor.getSelectedScreenRange()).toEqual([[2, 4], [6, 8]]);
          linesNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenPosition([8, 0]), {
            which: 1
          }));
          nextAnimationFrame();
          return expect(editor.getSelectedScreenRange()).toEqual([[2, 4], [6, 8]]);
        });
      });
      return describe("when a line is folded", function() {
        beforeEach(function() {
          editor.foldBufferRow(4);
          return runSetImmediateCallbacks();
        });
        return describe("when the folded line's fold-marker is clicked", function() {
          return it("unfolds the buffer row", function() {
            var target;
            target = component.lineNodeForScreenRow(4).querySelector('.fold-marker');
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([4, 8]), {
              target: target
            }));
            return expect(editor.isFoldedAtBufferRow(4)).toBe(false);
          });
        });
      });
    });
    describe("mouse interactions on the gutter", function() {
      var gutterNode;
      gutterNode = null;
      beforeEach(function() {
        return gutterNode = node.querySelector('.gutter');
      });
      describe("when the gutter is clicked", function() {
        return it("moves the cursor to the beginning of the clicked row", function() {
          gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(4)));
          return expect(editor.getCursorScreenPosition()).toEqual([4, 0]);
        });
      });
      describe("when the gutter is shift-clicked", function() {
        beforeEach(function() {
          return editor.setSelectedScreenRange([[3, 4], [4, 5]]);
        });
        describe("when the clicked row is before the current selection's tail", function() {
          return it("selects to the beginning of the clicked row", function() {
            gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(1), {
              shiftKey: true
            }));
            return expect(editor.getSelectedScreenRange()).toEqual([[1, 0], [3, 4]]);
          });
        });
        return describe("when the clicked row is after the current selection's tail", function() {
          return it("selects to the beginning of the row following the clicked row", function() {
            gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(6), {
              shiftKey: true
            }));
            return expect(editor.getSelectedScreenRange()).toEqual([[3, 4], [7, 0]]);
          });
        });
      });
      describe("when the gutter is clicked and dragged", function() {
        beforeEach(function() {
          return delayAnimationFrames = true;
        });
        describe("when dragging downward", function() {
          return it("selects the rows between the start and end of the drag", function() {
            gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(2)));
            gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(6)));
            nextAnimationFrame();
            gutterNode.dispatchEvent(buildMouseEvent('mouseup', clientCoordinatesForScreenRowInGutter(6)));
            return expect(editor.getSelectedScreenRange()).toEqual([[2, 0], [7, 0]]);
          });
        });
        return describe("when dragging upward", function() {
          return it("selects the rows between the start and end of the drag", function() {
            gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(6)));
            gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(2)));
            nextAnimationFrame();
            gutterNode.dispatchEvent(buildMouseEvent('mouseup', clientCoordinatesForScreenRowInGutter(2)));
            return expect(editor.getSelectedScreenRange()).toEqual([[2, 0], [7, 0]]);
          });
        });
      });
      return describe("when the gutter is shift-clicked and dragged", function() {
        beforeEach(function() {
          return delayAnimationFrames = true;
        });
        describe("when the shift-click is below the existing selection's tail", function() {
          describe("when dragging downward", function() {
            return it("selects the rows between the existing selection's tail and the end of the drag", function() {
              editor.setSelectedScreenRange([[3, 4], [4, 5]]);
              gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(7), {
                shiftKey: true
              }));
              gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(8)));
              nextAnimationFrame();
              return expect(editor.getSelectedScreenRange()).toEqual([[3, 4], [9, 0]]);
            });
          });
          return describe("when dragging upward", function() {
            return it("selects the rows between the end of the drag and the tail of the existing selection", function() {
              editor.setSelectedScreenRange([[4, 4], [5, 5]]);
              gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(7), {
                shiftKey: true
              }));
              gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(5)));
              nextAnimationFrame();
              expect(editor.getSelectedScreenRange()).toEqual([[4, 4], [6, 0]]);
              gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(1)));
              nextAnimationFrame();
              return expect(editor.getSelectedScreenRange()).toEqual([[1, 0], [4, 4]]);
            });
          });
        });
        return describe("when the shift-click is above the existing selection's tail", function() {
          describe("when dragging upward", function() {
            return it("selects the rows between the end of the drag and the tail of the existing selection", function() {
              editor.setSelectedScreenRange([[4, 4], [5, 5]]);
              gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(2), {
                shiftKey: true
              }));
              gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(1)));
              nextAnimationFrame();
              return expect(editor.getSelectedScreenRange()).toEqual([[1, 0], [4, 4]]);
            });
          });
          return describe("when dragging downward", function() {
            return it("selects the rows between the existing selection's tail and the end of the drag", function() {
              editor.setSelectedScreenRange([[3, 4], [4, 5]]);
              gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(1), {
                shiftKey: true
              }));
              gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(2)));
              nextAnimationFrame();
              expect(editor.getSelectedScreenRange()).toEqual([[2, 0], [3, 4]]);
              gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(8)));
              nextAnimationFrame();
              return expect(editor.getSelectedScreenRange()).toEqual([[3, 4], [9, 0]]);
            });
          });
        });
      });
    });
    describe("focus handling", function() {
      var inputNode;
      inputNode = null;
      beforeEach(function() {
        return inputNode = node.querySelector('.hidden-input');
      });
      it("transfers focus to the hidden input", function() {
        expect(document.activeElement).toBe(document.body);
        node.focus();
        return expect(document.activeElement).toBe(inputNode);
      });
      return it("adds the 'is-focused' class to the editor when the hidden input is focused", function() {
        expect(document.activeElement).toBe(document.body);
        inputNode.focus();
        expect(node.classList.contains('is-focused')).toBe(true);
        expect(wrapperView.hasClass('is-focused')).toBe(true);
        inputNode.blur();
        expect(node.classList.contains('is-focused')).toBe(false);
        return expect(wrapperView.hasClass('is-focused')).toBe(false);
      });
    });
    describe("selection handling", function() {
      var cursor;
      cursor = null;
      beforeEach(function() {
        cursor = editor.getCursor();
        cursor.setScreenPosition([0, 0]);
        return runSetImmediateCallbacks();
      });
      return it("adds the 'has-selection' class to the editor when there is a selection", function() {
        expect(node.classList.contains('has-selection')).toBe(false);
        editor.selectDown();
        runSetImmediateCallbacks();
        expect(node.classList.contains('has-selection')).toBe(true);
        cursor.moveDown();
        runSetImmediateCallbacks();
        return expect(node.classList.contains('has-selection')).toBe(false);
      });
    });
    describe("scrolling", function() {
      it("updates the vertical scrollbar when the scrollTop is changed in the model", function() {
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.scrollTop).toBe(0);
        editor.setScrollTop(10);
        runSetImmediateCallbacks();
        return expect(verticalScrollbarNode.scrollTop).toBe(10);
      });
      it("updates the horizontal scrollbar and the x transform of the lines based on the scrollLeft of the model", function() {
        var linesNode;
        node.style.width = 30 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        linesNode = node.querySelector('.lines');
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, 0px, 0px)");
        expect(horizontalScrollbarNode.scrollLeft).toBe(0);
        editor.setScrollLeft(100);
        runSetImmediateCallbacks();
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(-100px, 0px, 0px)");
        return expect(horizontalScrollbarNode.scrollLeft).toBe(100);
      });
      it("updates the scrollLeft of the model when the scrollLeft of the horizontal scrollbar changes", function() {
        node.style.width = 30 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(editor.getScrollLeft()).toBe(0);
        horizontalScrollbarNode.scrollLeft = 100;
        horizontalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        return expect(editor.getScrollLeft()).toBe(100);
      });
      it("does not obscure the last line with the horizontal scrollbar", function() {
        var bottomOfEditor, bottomOfLastLine, lastLineNode, topOfHorizontalScrollbar;
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        node.style.width = 10 * charWidth + 'px';
        component.measureScrollView();
        editor.setScrollBottom(editor.getScrollHeight());
        runSetImmediateCallbacks();
        lastLineNode = component.lineNodeForScreenRow(editor.getLastScreenRow());
        bottomOfLastLine = lastLineNode.getBoundingClientRect().bottom;
        topOfHorizontalScrollbar = horizontalScrollbarNode.getBoundingClientRect().top;
        expect(bottomOfLastLine).toBe(topOfHorizontalScrollbar);
        node.style.width = 100 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        bottomOfLastLine = lastLineNode.getBoundingClientRect().bottom;
        bottomOfEditor = node.getBoundingClientRect().bottom;
        return expect(bottomOfLastLine).toBe(bottomOfEditor);
      });
      it("does not obscure the last character of the longest line with the vertical scrollbar", function() {
        var leftOfVerticalScrollbar, rightOfLongestLine;
        node.style.height = 7 * lineHeightInPixels + 'px';
        node.style.width = 10 * charWidth + 'px';
        component.measureScrollView();
        editor.setScrollLeft(Infinity);
        runSetImmediateCallbacks();
        rightOfLongestLine = component.lineNodeForScreenRow(6).querySelector('.line > span:last-child').getBoundingClientRect().right;
        leftOfVerticalScrollbar = verticalScrollbarNode.getBoundingClientRect().left;
        return expect(Math.round(rightOfLongestLine)).toBe(leftOfVerticalScrollbar - 1);
      });
      it("only displays dummy scrollbars when scrollable in that direction", function() {
        expect(verticalScrollbarNode.style.display).toBe('none');
        expect(horizontalScrollbarNode.style.display).toBe('none');
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        node.style.width = '1000px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.display).toBe('');
        expect(horizontalScrollbarNode.style.display).toBe('none');
        node.style.width = 10 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.display).toBe('');
        expect(horizontalScrollbarNode.style.display).toBe('');
        node.style.height = 20 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.display).toBe('none');
        return expect(horizontalScrollbarNode.style.display).toBe('');
      });
      it("makes the dummy scrollbar divs only as tall/wide as the actual scrollbars", function() {
        var scrollbarCornerNode;
        node.style.height = 4 * lineHeightInPixels + 'px';
        node.style.width = 10 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        atom.themes.applyStylesheet("test", "::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}");
        scrollbarCornerNode = node.querySelector('.scrollbar-corner');
        expect(verticalScrollbarNode.offsetWidth).toBe(8);
        expect(horizontalScrollbarNode.offsetHeight).toBe(8);
        expect(scrollbarCornerNode.offsetWidth).toBe(8);
        return expect(scrollbarCornerNode.offsetHeight).toBe(8);
      });
      it("assigns the bottom/right of the scrollbars to the width of the opposite scrollbar if it is visible", function() {
        var scrollbarCornerNode;
        scrollbarCornerNode = node.querySelector('.scrollbar-corner');
        expect(verticalScrollbarNode.style.bottom).toBe('');
        expect(horizontalScrollbarNode.style.right).toBe('');
        node.style.height = 4.5 * lineHeightInPixels + 'px';
        node.style.width = '1000px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.bottom).toBe('');
        expect(horizontalScrollbarNode.style.right).toBe(verticalScrollbarNode.offsetWidth + 'px');
        expect(scrollbarCornerNode.style.display).toBe('none');
        node.style.width = 10 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.bottom).toBe(horizontalScrollbarNode.offsetHeight + 'px');
        expect(horizontalScrollbarNode.style.right).toBe(verticalScrollbarNode.offsetWidth + 'px');
        expect(scrollbarCornerNode.style.display).toBe('');
        node.style.height = 20 * lineHeightInPixels + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.bottom).toBe(horizontalScrollbarNode.offsetHeight + 'px');
        expect(horizontalScrollbarNode.style.right).toBe('');
        return expect(scrollbarCornerNode.style.display).toBe('none');
      });
      return it("accounts for the width of the gutter in the scrollWidth of the horizontal scrollbar", function() {
        var gutterNode;
        gutterNode = node.querySelector('.gutter');
        node.style.width = 10 * charWidth + 'px';
        component.measureScrollView();
        runSetImmediateCallbacks();
        return expect(horizontalScrollbarNode.scrollWidth).toBe(gutterNode.offsetWidth + editor.getScrollWidth());
      });
    });
    describe("mousewheel events", function() {
      beforeEach(function() {
        return atom.config.set('editor.scrollSensitivity', 100);
      });
      describe("updating scrollTop and scrollLeft", function() {
        beforeEach(function() {
          node.style.height = 4.5 * lineHeightInPixels + 'px';
          node.style.width = 20 * charWidth + 'px';
          component.measureScrollView();
          return runSetImmediateCallbacks();
        });
        it("updates the scrollLeft or scrollTop on mousewheel events depending on which delta is greater (x or y)", function() {
          expect(verticalScrollbarNode.scrollTop).toBe(0);
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          node.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -5,
            wheelDeltaY: -10
          }));
          expect(verticalScrollbarNode.scrollTop).toBe(10);
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          node.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -15,
            wheelDeltaY: -5
          }));
          expect(verticalScrollbarNode.scrollTop).toBe(10);
          return expect(horizontalScrollbarNode.scrollLeft).toBe(15);
        });
        it("updates the scrollLeft or scrollTop according to the scroll sensitivity", function() {
          atom.config.set('editor.scrollSensitivity', 50);
          node.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -5,
            wheelDeltaY: -10
          }));
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          node.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -15,
            wheelDeltaY: -5
          }));
          expect(verticalScrollbarNode.scrollTop).toBe(5);
          return expect(horizontalScrollbarNode.scrollLeft).toBe(7);
        });
        it("uses the previous scrollSensitivity when the value is not an int", function() {
          atom.config.set('editor.scrollSensitivity', 'nope');
          node.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -10
          }));
          return expect(verticalScrollbarNode.scrollTop).toBe(10);
        });
        return it("parses negative scrollSensitivity values as positive", function() {
          atom.config.set('editor.scrollSensitivity', -50);
          node.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -10
          }));
          return expect(verticalScrollbarNode.scrollTop).toBe(5);
        });
      });
      describe("when the mousewheel event's target is a line", function() {
        it("keeps the line on the DOM if it is scrolled off-screen", function() {
          var lineNode, wheelEvent;
          node.style.height = 4.5 * lineHeightInPixels + 'px';
          node.style.width = 20 * charWidth + 'px';
          component.measureScrollView();
          lineNode = node.querySelector('.line');
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -500
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNode;
            }
          });
          node.dispatchEvent(wheelEvent);
          return expect(node.contains(lineNode)).toBe(true);
        });
        it("does not set the mouseWheelScreenRow if scrolling horizontally", function() {
          var lineNode, wheelEvent;
          node.style.height = 4.5 * lineHeightInPixels + 'px';
          node.style.width = 20 * charWidth + 'px';
          component.measureScrollView();
          lineNode = node.querySelector('.line');
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 10,
            wheelDeltaY: 0
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNode;
            }
          });
          node.dispatchEvent(wheelEvent);
          return expect(component.mouseWheelScreenRow).toBe(null);
        });
        it("clears the mouseWheelScreenRow after a delay even if the event does not cause scrolling", function() {
          var lineNode, wheelEvent;
          spyOn(_._, 'now').andCallFake(function() {
            return window.now;
          });
          expect(editor.getScrollTop()).toBe(0);
          lineNode = node.querySelector('.line');
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: 10
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNode;
            }
          });
          node.dispatchEvent(wheelEvent);
          expect(editor.getScrollTop()).toBe(0);
          expect(component.mouseWheelScreenRow).toBe(0);
          advanceClock(component.mouseWheelScreenRowClearDelay);
          return expect(component.mouseWheelScreenRow).toBe(null);
        });
        return it("does not preserve the line if it is on screen", function() {
          var lineNode, lineNodes, wheelEvent;
          expect(node.querySelectorAll('.line-number').length).toBe(14);
          lineNodes = node.querySelectorAll('.line');
          expect(lineNodes.length).toBe(13);
          lineNode = lineNodes[0];
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: 100
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNode;
            }
          });
          node.dispatchEvent(wheelEvent);
          expect(component.mouseWheelScreenRow).toBe(0);
          editor.insertText("hello");
          expect(node.querySelectorAll('.line-number').length).toBe(14);
          return expect(node.querySelectorAll('.line').length).toBe(13);
        });
      });
      return describe("when the mousewheel event's target is a line number", function() {
        return it("keeps the line number on the DOM if it is scrolled off-screen", function() {
          var lineNumberNode, wheelEvent;
          node.style.height = 4.5 * lineHeightInPixels + 'px';
          node.style.width = 20 * charWidth + 'px';
          component.measureScrollView();
          lineNumberNode = node.querySelectorAll('.line-number')[1];
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -500
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNumberNode;
            }
          });
          node.dispatchEvent(wheelEvent);
          return expect(node.contains(lineNumberNode)).toBe(true);
        });
      });
    });
    describe("input events", function() {
      var buildTextInputEvent, inputNode;
      inputNode = null;
      beforeEach(function() {
        return inputNode = node.querySelector('.hidden-input');
      });
      buildTextInputEvent = function(_arg) {
        var data, event, target;
        data = _arg.data, target = _arg.target;
        event = new Event('textInput');
        event.data = data;
        Object.defineProperty(event, 'target', {
          get: function() {
            return target;
          }
        });
        return event;
      };
      it("inserts the newest character in the input's value into the buffer", function() {
        node.dispatchEvent(buildTextInputEvent({
          data: 'x',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        expect(editor.lineForBufferRow(0)).toBe('xvar quicksort = function () {');
        node.dispatchEvent(buildTextInputEvent({
          data: 'y',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        return expect(editor.lineForBufferRow(0)).toBe('xyvar quicksort = function () {');
      });
      it("replaces the last character if the length of the input's value doesn't increase, as occurs with the accented character menu", function() {
        node.dispatchEvent(buildTextInputEvent({
          data: 'u',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        expect(editor.lineForBufferRow(0)).toBe('uvar quicksort = function () {');
        inputNode.setSelectionRange(0, 1);
        node.dispatchEvent(buildTextInputEvent({
          data: 'ü',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        return expect(editor.lineForBufferRow(0)).toBe('üvar quicksort = function () {');
      });
      it("does not handle input events when input is disabled", function() {
        component.setInputEnabled(false);
        node.dispatchEvent(buildTextInputEvent({
          data: 'x',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        return expect(editor.lineForBufferRow(0)).toBe('var quicksort = function () {');
      });
      return describe("when IME composition is used to insert international characters", function() {
        var buildIMECompositionEvent;
        inputNode = null;
        buildIMECompositionEvent = function(event, _arg) {
          var data, target, _ref2;
          _ref2 = _arg != null ? _arg : {}, data = _ref2.data, target = _ref2.target;
          event = new Event(event);
          event.data = data;
          Object.defineProperty(event, 'target', {
            get: function() {
              return target;
            }
          });
          return event;
        };
        beforeEach(function() {
          return inputNode = inputNode = node.querySelector('.hidden-input');
        });
        describe("when nothing is selected", function() {
          it("inserts the chosen completion", function() {
            node.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('svar quicksort = function () {');
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('sdvar quicksort = function () {');
            node.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            node.dispatchEvent(buildTextInputEvent({
              data: '速度',
              target: inputNode
            }));
            return expect(editor.lineForBufferRow(0)).toBe('速度var quicksort = function () {');
          });
          it("reverts back to the original text when the completion helper is dismissed", function() {
            node.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('svar quicksort = function () {');
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('sdvar quicksort = function () {');
            node.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            return expect(editor.lineForBufferRow(0)).toBe('var quicksort = function () {');
          });
          return it("allows multiple accented character to be inserted with the ' on a US international layout", function() {
            inputNode.value = "'";
            inputNode.setSelectionRange(0, 1);
            node.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: "'",
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe("'var quicksort = function () {");
            node.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            node.dispatchEvent(buildTextInputEvent({
              data: 'á',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe("ávar quicksort = function () {");
            inputNode.value = "'";
            inputNode.setSelectionRange(0, 1);
            node.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: "'",
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe("á'var quicksort = function () {");
            node.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            node.dispatchEvent(buildTextInputEvent({
              data: 'á',
              target: inputNode
            }));
            return expect(editor.lineForBufferRow(0)).toBe("áávar quicksort = function () {");
          });
        });
        return describe("when a string is selected", function() {
          beforeEach(function() {
            return editor.setSelectedBufferRange([[0, 4], [0, 9]]);
          });
          it("inserts the chosen completion", function() {
            node.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('var ssort = function () {');
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('var sdsort = function () {');
            node.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            node.dispatchEvent(buildTextInputEvent({
              data: '速度',
              target: inputNode
            }));
            return expect(editor.lineForBufferRow(0)).toBe('var 速度sort = function () {');
          });
          return it("reverts back to the original text when the completion helper is dismissed", function() {
            node.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('var ssort = function () {');
            node.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('var sdsort = function () {');
            node.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            return expect(editor.lineForBufferRow(0)).toBe('var quicksort = function () {');
          });
        });
      });
    });
    describe("commands", function() {
      return describe("editor:consolidate-selections", function() {
        return it("consolidates selections on the editor model, aborting the key binding if there is only one selection", function() {
          var event;
          spyOn(editor, 'consolidateSelections').andCallThrough();
          event = new CustomEvent('editor:consolidate-selections', {
            bubbles: true,
            cancelable: true
          });
          event.abortKeyBinding = jasmine.createSpy("event.abortKeyBinding");
          node.dispatchEvent(event);
          expect(editor.consolidateSelections).toHaveBeenCalled();
          return expect(event.abortKeyBinding).toHaveBeenCalled();
        });
      });
    });
    describe("hiding and showing the editor", function() {
      describe("when the lineHeight changes while the editor is hidden", function() {
        return it("does not attempt to measure the lineHeightInPixels until the editor becomes visible again", function() {
          var initialLineHeightInPixels;
          wrapperView.hide();
          initialLineHeightInPixels = editor.getLineHeightInPixels();
          component.setLineHeight(2);
          runSetImmediateCallbacks();
          expect(editor.getLineHeightInPixels()).toBe(initialLineHeightInPixels);
          wrapperView.show();
          return expect(editor.getLineHeightInPixels()).not.toBe(initialLineHeightInPixels);
        });
      });
      describe("when the fontSize changes while the editor is hidden", function() {
        it("does not attempt to measure the lineHeightInPixels or defaultCharWidth until the editor becomes visible again", function() {
          var initialCharWidth, initialLineHeightInPixels;
          wrapperView.hide();
          initialLineHeightInPixels = editor.getLineHeightInPixels();
          initialCharWidth = editor.getDefaultCharWidth();
          component.setFontSize(22);
          runSetImmediateCallbacks();
          expect(editor.getLineHeightInPixels()).toBe(initialLineHeightInPixels);
          expect(editor.getDefaultCharWidth()).toBe(initialCharWidth);
          wrapperView.show();
          expect(editor.getLineHeightInPixels()).not.toBe(initialLineHeightInPixels);
          return expect(editor.getDefaultCharWidth()).not.toBe(initialCharWidth);
        });
        return it("does not re-measure character widths until the editor is shown again", function() {
          var cursorLeft, line0Right;
          wrapperView.hide();
          component.setFontSize(22);
          runSetImmediateCallbacks();
          wrapperView.show();
          editor.setCursorBufferPosition([0, Infinity]);
          runSetImmediateCallbacks();
          cursorLeft = node.querySelector('.cursor').getBoundingClientRect().left;
          line0Right = node.querySelector('.line > span:last-child').getBoundingClientRect().right;
          return expect(cursorLeft).toBe(line0Right);
        });
      });
      describe("when the fontFamily changes while the editor is hidden", function() {
        it("does not attempt to measure the defaultCharWidth until the editor becomes visible again", function() {
          var initialCharWidth, initialLineHeightInPixels;
          wrapperView.hide();
          initialLineHeightInPixels = editor.getLineHeightInPixels();
          initialCharWidth = editor.getDefaultCharWidth();
          component.setFontFamily('sans-serif');
          runSetImmediateCallbacks();
          expect(editor.getDefaultCharWidth()).toBe(initialCharWidth);
          wrapperView.show();
          return expect(editor.getDefaultCharWidth()).not.toBe(initialCharWidth);
        });
        return it("does not re-measure character widths until the editor is shown again", function() {
          var cursorLeft, line0Right;
          wrapperView.hide();
          component.setFontFamily('sans-serif');
          runSetImmediateCallbacks();
          wrapperView.show();
          editor.setCursorBufferPosition([0, Infinity]);
          runSetImmediateCallbacks();
          cursorLeft = node.querySelector('.cursor').getBoundingClientRect().left;
          line0Right = node.querySelector('.line > span:last-child').getBoundingClientRect().right;
          return expect(cursorLeft).toBe(line0Right);
        });
      });
      describe("when stylesheets change while the editor is hidden", function() {
        afterEach(function() {
          return atom.themes.removeStylesheet('test');
        });
        return it("does not re-measure character widths until the editor is shown again", function() {
          var cursorLeft, line0Right;
          atom.config.set('editor.fontFamily', 'sans-serif');
          wrapperView.hide();
          atom.themes.applyStylesheet('test', ".function.js {\n  font-weight: bold;\n}");
          runSetImmediateCallbacks();
          wrapperView.show();
          editor.setCursorBufferPosition([0, Infinity]);
          runSetImmediateCallbacks();
          cursorLeft = node.querySelector('.cursor').getBoundingClientRect().left;
          line0Right = node.querySelector('.line > span:last-child').getBoundingClientRect().right;
          return expect(cursorLeft).toBe(line0Right);
        });
      });
      return describe("when lines are changed while the editor is hidden", function() {
        return it("does not measure new characters until the editor is shown again", function() {
          editor.setText('');
          wrapperView.hide();
          editor.setText('var z = 1');
          editor.setCursorBufferPosition([0, Infinity]);
          runSetImmediateCallbacks();
          wrapperView.show();
          return expect(node.querySelector('.cursor').style['-webkit-transform']).toBe("translate3d(" + (9 * charWidth) + "px, 0px, 0px)");
        });
      });
    });
    describe("soft wrapping", function() {
      beforeEach(function() {
        return editor.setSoftWrap(true);
      });
      it("updates the wrap location when the editor is resized", function() {
        var gutterWidth, newHeight;
        newHeight = 4 * editor.getLineHeightInPixels() + "px";
        expect(newHeight).toBeLessThan(node.style.height);
        node.style.height = newHeight;
        advanceClock(component.scrollViewMeasurementInterval);
        runSetImmediateCallbacks();
        expect(node.querySelectorAll('.line')).toHaveLength(4 + lineOverdrawMargin + 1);
        gutterWidth = node.querySelector('.gutter').offsetWidth;
        node.style.width = gutterWidth + 14 * charWidth + 'px';
        advanceClock(component.scrollViewMeasurementInterval);
        runSetImmediateCallbacks();
        return expect(node.querySelector('.line').textContent).toBe("var quicksort ");
      });
      return it("accounts for the scroll view's padding when determining the wrap location", function() {
        var scrollViewNode;
        scrollViewNode = node.querySelector('.scroll-view');
        scrollViewNode.style.paddingLeft = 20 + 'px';
        node.style.width = 30 * charWidth + 'px';
        advanceClock(component.scrollViewMeasurementInterval);
        runSetImmediateCallbacks();
        return expect(component.lineNodeForScreenRow(0).textContent).toBe("var quicksort = ");
      });
    });
    describe("default decorations", function() {
      it("applies .cursor-line decorations for line numbers overlapping selections", function() {
        editor.setCursorScreenPosition([4, 4]);
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(3, 'cursor-line')).toBe(false);
        expect(lineNumberHasClass(4, 'cursor-line')).toBe(true);
        expect(lineNumberHasClass(5, 'cursor-line')).toBe(false);
        editor.setSelectedScreenRange([[3, 4], [4, 4]]);
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(3, 'cursor-line')).toBe(true);
        expect(lineNumberHasClass(4, 'cursor-line')).toBe(true);
        editor.setSelectedScreenRange([[3, 4], [4, 0]]);
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(3, 'cursor-line')).toBe(true);
        return expect(lineNumberHasClass(4, 'cursor-line')).toBe(false);
      });
      it("does not apply .cursor-line to the last line of a selection if it's empty", function() {
        editor.setSelectedScreenRange([[3, 4], [5, 0]]);
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(3, 'cursor-line')).toBe(true);
        expect(lineNumberHasClass(4, 'cursor-line')).toBe(true);
        return expect(lineNumberHasClass(5, 'cursor-line')).toBe(false);
      });
      it("applies .cursor-line decorations for lines containing the cursor in non-empty selections", function() {
        editor.setCursorScreenPosition([4, 4]);
        runSetImmediateCallbacks();
        expect(lineHasClass(3, 'cursor-line')).toBe(false);
        expect(lineHasClass(4, 'cursor-line')).toBe(true);
        expect(lineHasClass(5, 'cursor-line')).toBe(false);
        editor.setSelectedScreenRange([[3, 4], [4, 4]]);
        runSetImmediateCallbacks();
        expect(lineHasClass(2, 'cursor-line')).toBe(false);
        expect(lineHasClass(3, 'cursor-line')).toBe(false);
        expect(lineHasClass(4, 'cursor-line')).toBe(false);
        return expect(lineHasClass(5, 'cursor-line')).toBe(false);
      });
      return it("applies .cursor-line-no-selection to line numbers for rows containing the cursor when the selection is empty", function() {
        editor.setCursorScreenPosition([4, 4]);
        runSetImmediateCallbacks();
        expect(lineNumberHasClass(4, 'cursor-line-no-selection')).toBe(true);
        editor.setSelectedScreenRange([[3, 4], [4, 4]]);
        runSetImmediateCallbacks();
        return expect(lineNumberHasClass(4, 'cursor-line-no-selection')).toBe(false);
      });
    });
    describe("legacy editor compatibility", function() {
      return it("triggers the screen-lines-changed event before the editor:display-update event", function() {
        var callingOrder;
        editor.setSoftWrap(true);
        callingOrder = [];
        editor.on('screen-lines-changed', function() {
          return callingOrder.push('screen-lines-changed');
        });
        wrapperView.on('editor:display-updated', function() {
          return callingOrder.push('editor:display-updated');
        });
        editor.insertText("HELLO! HELLO!\n HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! ");
        runSetImmediateCallbacks();
        return expect(callingOrder).toEqual(['screen-lines-changed', 'editor:display-updated']);
      });
    });
    buildMouseEvent = function() {
      var event, properties, type;
      type = arguments[0], properties = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      properties = extend.apply(null, [{
        bubbles: true,
        cancelable: true
      }].concat(__slice.call(properties)));
      if (properties.detail == null) {
        properties.detail = 1;
      }
      event = new MouseEvent(type, properties);
      if (properties.which != null) {
        Object.defineProperty(event, 'which', {
          get: function() {
            return properties.which;
          }
        });
      }
      if (properties.target != null) {
        Object.defineProperty(event, 'target', {
          get: function() {
            return properties.target;
          }
        });
        Object.defineProperty(event, 'srcObject', {
          get: function() {
            return properties.target;
          }
        });
      }
      return event;
    };
    clientCoordinatesForScreenPosition = function(screenPosition) {
      var clientX, clientY, positionOffset, scrollViewClientRect;
      positionOffset = editor.pixelPositionForScreenPosition(screenPosition);
      scrollViewClientRect = node.querySelector('.scroll-view').getBoundingClientRect();
      clientX = scrollViewClientRect.left + positionOffset.left - editor.getScrollLeft();
      clientY = scrollViewClientRect.top + positionOffset.top - editor.getScrollTop();
      return {
        clientX: clientX,
        clientY: clientY
      };
    };
    clientCoordinatesForScreenRowInGutter = function(screenRow) {
      var clientX, clientY, gutterClientRect, positionOffset;
      positionOffset = editor.pixelPositionForScreenPosition([screenRow, 1]);
      gutterClientRect = node.querySelector('.gutter').getBoundingClientRect();
      clientX = gutterClientRect.left + positionOffset.left - editor.getScrollLeft();
      clientY = gutterClientRect.top + positionOffset.top - editor.getScrollTop();
      return {
        clientX: clientX,
        clientY: clientY
      };
    };
    lineAndLineNumberHaveClass = function(screenRow, klass) {
      return lineHasClass(screenRow, klass) && lineNumberHasClass(screenRow, klass);
    };
    lineNumberHasClass = function(screenRow, klass) {
      return component.lineNumberNodeForScreenRow(screenRow).classList.contains(klass);
    };
    lineNumberForBufferRowHasClass = function(bufferRow, klass) {
      var screenRow;
      screenRow = editor.displayBuffer.screenRowForBufferRow(bufferRow);
      return component.lineNumberNodeForScreenRow(screenRow).classList.contains(klass);
    };
    return lineHasClass = function(screenRow, klass) {
      return component.lineNodeForScreenRow(screenRow).classList.contains(klass);
    };
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlFQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFdBQUEsTUFBRCxFQUFTLFlBQUEsT0FBVCxFQUFrQixZQUFBLE9BQWxCLEVBQTJCLFNBQUEsSUFEM0IsQ0FBQTs7QUFBQSxFQUdBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLDBCQUFSLENBSGxCLENBQUE7O0FBQUEsRUFJQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSx5QkFBUixDQUpsQixDQUFBOztBQUFBLEVBS0EsSUFBQSxHQUFPLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEdBQXBCLENBTFAsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSwrWkFBQTtBQUFBLElBQUEsT0FBc0csRUFBdEcsRUFBQyxxQkFBRCxFQUFjLGdCQUFkLEVBQXNCLHFCQUF0QixFQUFtQyxtQkFBbkMsRUFBOEMsY0FBOUMsRUFBb0QsK0JBQXBELEVBQTJFLGlDQUEzRSxDQUFBO0FBQUEsSUFDQSxRQUEwSCxFQUExSCxFQUFDLDZCQUFELEVBQXFCLG9CQUFyQixFQUFnQywrQkFBaEMsRUFBc0QsNkJBQXRELEVBQTBFLG1DQUExRSxFQUFvRyw2QkFEcEcsQ0FBQTtBQUFBLElBR0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsa0JBQUEsR0FBcUIsQ0FBckIsQ0FBQTtBQUFBLE1BRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7TUFBQSxDQUFoQixDQUZBLENBQUE7QUFBQSxNQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLEtB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/editor-component-spec.coffee