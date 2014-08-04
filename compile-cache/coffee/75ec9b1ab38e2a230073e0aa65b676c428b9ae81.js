(function() {
  var EditorComponent, ReactEditorView, extend, flatten, last, nbsp, toArray, _,
    __slice = [].slice;

  _ = require('underscore-plus');

  extend = _.extend, flatten = _.flatten, toArray = _.toArray, last = _.last;

  ReactEditorView = require('../src/react-editor-view');

  EditorComponent = require('../src/editor-component');

  nbsp = String.fromCharCode(160);

  describe("EditorComponent", function() {
    var buildMouseEvent, charWidth, clientCoordinatesForScreenPosition, clientCoordinatesForScreenRowInGutter, component, componentNode, contentNode, delayAnimationFrames, editor, hasSetImmediateCallbacks, horizontalScrollbarNode, lineAndLineNumberHaveClass, lineHasClass, lineHeightInPixels, lineNumberForBufferRowHasClass, lineNumberHasClass, lineOverdrawMargin, nextAnimationFrame, runSetImmediateCallbacks, verticalScrollbarNode, wrapperNode, wrapperView, _ref, _ref1;
    _ref = [], contentNode = _ref[0], editor = _ref[1], wrapperView = _ref[2], wrapperNode = _ref[3], component = _ref[4], componentNode = _ref[5], verticalScrollbarNode = _ref[6], horizontalScrollbarNode = _ref[7];
    _ref1 = [], lineHeightInPixels = _ref1[0], charWidth = _ref1[1], delayAnimationFrames = _ref1[2], nextAnimationFrame = _ref1[3], runSetImmediateCallbacks = _ref1[4], hasSetImmediateCallbacks = _ref1[5], lineOverdrawMargin = _ref1[6];
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
        hasSetImmediateCallbacks = function() {
          return setImmediateFns.length !== 0;
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
        wrapperNode = wrapperView.element;
        component = wrapperView.component;
        component.performSyncUpdates = false;
        component.setLineHeight(1.3);
        component.setFontSize(20);
        lineHeightInPixels = editor.getLineHeightInPixels();
        charWidth = editor.getDefaultCharWidth();
        componentNode = component.getDOMNode();
        verticalScrollbarNode = componentNode.querySelector('.vertical-scrollbar');
        horizontalScrollbarNode = componentNode.querySelector('.horizontal-scrollbar');
        component.measureHeightAndWidth();
        return runSetImmediateCallbacks();
      });
    });
    afterEach(function() {
      return contentNode.style.width = '';
    });
    describe("line rendering", function() {
      var getLeafNodes;
      it("renders the currently-visible lines plus the overdraw margin", function() {
        var linesNode;
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        linesNode = componentNode.querySelector('.lines');
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, 0px, 0px)");
        expect(componentNode.querySelectorAll('.line').length).toBe(6 + 2);
        expect(component.lineNodeForScreenRow(0).textContent).toBe(editor.lineForScreenRow(0).text);
        expect(component.lineNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNodeForScreenRow(5).textContent).toBe(editor.lineForScreenRow(5).text);
        expect(component.lineNodeForScreenRow(5).offsetTop).toBe(5 * lineHeightInPixels);
        verticalScrollbarNode.scrollTop = 4.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, " + (-4.5 * lineHeightInPixels) + "px, 0px)");
        expect(componentNode.querySelectorAll('.line').length).toBe(6 + 4);
        expect(component.lineNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(2).textContent).toBe(editor.lineForScreenRow(2).text);
        expect(component.lineNodeForScreenRow(9).offsetTop).toBe(9 * lineHeightInPixels);
        return expect(component.lineNodeForScreenRow(9).textContent).toBe(editor.lineForScreenRow(9).text);
      });
      it("updates the top position of subsequent lines when lines are inserted or removed", function() {
        var lineNodes;
        editor.getBuffer().deleteRows(0, 1);
        runSetImmediateCallbacks();
        lineNodes = componentNode.querySelectorAll('.line');
        expect(component.lineNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        editor.getBuffer().insert([0, 0], '\n\n');
        runSetImmediateCallbacks();
        lineNodes = componentNode.querySelectorAll('.line');
        expect(component.lineNodeForScreenRow(0).offsetTop).toBe(0 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(3).offsetTop).toBe(3 * lineHeightInPixels);
        return expect(component.lineNodeForScreenRow(4).offsetTop).toBe(4 * lineHeightInPixels);
      });
      it("updates the lines when lines are inserted or removed above the rendered row range", function() {
        var buffer;
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
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
        wrapperNode.style.height = '300px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        linesNode = componentNode.querySelector('.lines');
        return expect(linesNode.offsetHeight).toBe(300);
      });
      it("assigns the width of each line so it extends across the full width of the editor", function() {
        var gutterWidth, lineNode, lineNodes, scrollViewNode, scrollViewWidth, _i, _j, _len, _len1, _results;
        gutterWidth = componentNode.querySelector('.gutter').offsetWidth;
        scrollViewNode = componentNode.querySelector('.scroll-view');
        lineNodes = componentNode.querySelectorAll('.line');
        componentNode.style.width = gutterWidth + (30 * charWidth) + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(editor.getScrollWidth()).toBeGreaterThan(scrollViewNode.offsetWidth);
        for (_i = 0, _len = lineNodes.length; _i < _len; _i++) {
          lineNode = lineNodes[_i];
          expect(lineNode.style.width).toBe(editor.getScrollWidth() + 'px');
        }
        componentNode.style.width = gutterWidth + editor.getScrollWidth() + 100 + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        scrollViewWidth = scrollViewNode.offsetWidth;
        _results = [];
        for (_j = 0, _len1 = lineNodes.length; _j < _len1; _j++) {
          lineNode = lineNodes[_j];
          _results.push(expect(lineNode.style.width).toBe(scrollViewWidth + 'px'));
        }
        return _results;
      });
      it("renders an nbsp on empty lines when no line-ending character is defined", function() {
        atom.config.set("editor.showInvisibles", false);
        return expect(component.lineNodeForScreenRow(10).textContent).toBe(nbsp);
      });
      it("gives the lines div the same background color as the editor to improve GPU performance", function() {
        var backgroundColor, linesNode;
        linesNode = componentNode.querySelector('.lines');
        backgroundColor = getComputedStyle(wrapperNode).backgroundColor;
        expect(linesNode.style.backgroundColor).toBe(backgroundColor);
        wrapperNode.style.backgroundColor = 'rgb(255, 0, 0)';
        advanceClock(component.domPollingInterval);
        runSetImmediateCallbacks();
        return expect(linesNode.style.backgroundColor).toBe('rgb(255, 0, 0)');
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
        it("renders invisible line-ending characters on empty lines", function() {
          return expect(component.lineNodeForScreenRow(10).textContent).toBe(invisibles.eol);
        });
        it("renders an nbsp on empty lines when the line-ending character is an empty string", function() {
          atom.config.set("editor.invisibles", {
            eol: ''
          });
          return expect(component.lineNodeForScreenRow(10).textContent).toBe(nbsp);
        });
        it("renders an nbsp on empty lines when no line-ending character is defined", function() {
          atom.config.set("editor.invisibles", {
            eol: null
          });
          return expect(component.lineNodeForScreenRow(10).textContent).toBe(nbsp);
        });
        it("interleaves invisible line-ending characters with indent guides on empty lines", function() {
          component.setShowIndentGuide(true);
          editor.setTextInBufferRange([[10, 0], [11, 0]], "\r\n", false);
          runSetImmediateCallbacks();
          expect(component.lineNodeForScreenRow(10).innerHTML).toBe('<span class="indent-guide"><span class="invisible-character">C</span><span class="invisible-character">E</span></span>');
          editor.setTabLength(3);
          runSetImmediateCallbacks();
          expect(component.lineNodeForScreenRow(10).innerHTML).toBe('<span class="indent-guide"><span class="invisible-character">C</span><span class="invisible-character">E</span> </span>');
          editor.setTabLength(1);
          runSetImmediateCallbacks();
          expect(component.lineNodeForScreenRow(10).innerHTML).toBe('<span class="indent-guide"><span class="invisible-character">C</span></span><span class="indent-guide"><span class="invisible-character">E</span></span>');
          editor.setTextInBufferRange([[9, 0], [9, Infinity]], ' ');
          editor.setTextInBufferRange([[11, 0], [11, Infinity]], ' ');
          runSetImmediateCallbacks();
          return expect(component.lineNodeForScreenRow(10).innerHTML).toBe('<span class="indent-guide"><span class="invisible-character">C</span></span><span class="invisible-character">E</span>');
        });
        return describe("when soft wrapping is enabled", function() {
          beforeEach(function() {
            editor.setText("a line that wraps ");
            editor.setSoftWrap(true);
            runSetImmediateCallbacks();
            componentNode.style.width = 16 * charWidth + editor.getVerticalScrollbarWidth() + 'px';
            component.measureHeightAndWidth();
            return runSetImmediateCallbacks();
          });
          return it("doesn't show end of line invisibles at the end of wrapped lines", function() {
            expect(component.lineNodeForScreenRow(0).textContent).toBe("a line that ");
            return expect(component.lineNodeForScreenRow(1).textContent).toBe("wraps" + invisibles.space + invisibles.eol);
          });
        });
      });
      describe("when indent guides are enabled", function() {
        beforeEach(function() {
          return component.setShowIndentGuide(true);
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
        return it("updates the indent guides on empty lines following an indentation change", function() {
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
      });
      describe("when indent guides are disabled", function() {
        beforeEach(function() {
          return component.setShowIndentGuide(false);
        });
        return it("does not render indent guides on lines containing only whitespace", function() {
          var line2LeafNodes;
          editor.getBuffer().insert([1, Infinity], '\n      ');
          runSetImmediateCallbacks();
          line2LeafNodes = getLeafNodes(component.lineNodeForScreenRow(2));
          expect(line2LeafNodes.length).toBe(3);
          expect(line2LeafNodes[0].textContent).toBe('  ');
          expect(line2LeafNodes[0].classList.contains('indent-guide')).toBe(false);
          expect(line2LeafNodes[1].textContent).toBe('  ');
          expect(line2LeafNodes[1].classList.contains('indent-guide')).toBe(false);
          expect(line2LeafNodes[2].textContent).toBe('  ');
          return expect(line2LeafNodes[2].classList.contains('indent-guide')).toBe(false);
        });
      });
      describe("when the buffer contains null bytes", function() {
        return it("excludes the null byte from character measurement", function() {
          editor.setText("a\0b");
          runSetImmediateCallbacks();
          return expect(editor.pixelPositionForScreenPosition([0, Infinity]).left).toEqual(2 * charWidth);
        });
      });
      describe("when there is a fold", function() {
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
      return getLeafNodes = function(node) {
        if (node.children.length > 0) {
          return flatten(toArray(node.children).map(getLeafNodes));
        } else {
          return [node];
        }
      };
    });
    describe("gutter rendering", function() {
      var gutter;
      gutter = [][0];
      beforeEach(function() {
        var _ref2;
        return _ref2 = component.refs, gutter = _ref2.gutter, _ref2;
      });
      it("renders the currently-visible line numbers", function() {
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(componentNode.querySelectorAll('.line-number').length).toBe(6 + 2 + 1);
        expect(component.lineNumberNodeForScreenRow(0).textContent).toBe("" + nbsp + "1");
        expect(component.lineNumberNodeForScreenRow(5).textContent).toBe("" + nbsp + "6");
        verticalScrollbarNode.scrollTop = 2.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        expect(componentNode.querySelectorAll('.line-number').length).toBe(6 + 4 + 1);
        expect(component.lineNumberNodeForScreenRow(2).textContent).toBe("" + nbsp + "3");
        expect(component.lineNumberNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(7).textContent).toBe("" + nbsp + "8");
        return expect(component.lineNumberNodeForScreenRow(7).offsetTop).toBe(7 * lineHeightInPixels);
      });
      it("updates the translation of subsequent line numbers when lines are inserted or removed", function() {
        var lineNumberNodes;
        editor.getBuffer().insert([0, 0], '\n\n');
        runSetImmediateCallbacks();
        lineNumberNodes = componentNode.querySelectorAll('.line-number');
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
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 30 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(componentNode.querySelectorAll('.line-number').length).toBe(6 + lineOverdrawMargin + 1);
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
        gutterNode = componentNode.querySelector('.gutter');
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
        wrapperNode.style.height = componentNode.offsetHeight + 100 + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        return expect(componentNode.querySelector('.line-numbers').offsetHeight).toBe(componentNode.offsetHeight);
      });
      it("applies the background color of the gutter or the editor to the line numbers to improve GPU performance", function() {
        var backgroundColor, gutterNode, lineNumbersNode;
        gutterNode = componentNode.querySelector('.gutter');
        lineNumbersNode = gutterNode.querySelector('.line-numbers');
        backgroundColor = getComputedStyle(wrapperNode).backgroundColor;
        expect(lineNumbersNode.style.backgroundColor).toBe(backgroundColor);
        gutterNode.style.backgroundColor = 'rgb(255, 0, 0)';
        advanceClock(component.domPollingInterval);
        runSetImmediateCallbacks();
        return expect(lineNumbersNode.style.backgroundColor).toBe('rgb(255, 0, 0)');
      });
      describe("when the editor.showLineNumbers config is false", function() {
        return it("doesn't render any line numbers", function() {
          expect(component.refs.gutter).toBeDefined();
          atom.config.set("editor.showLineNumbers", false);
          expect(component.refs.gutter).not.toBeDefined();
          atom.config.set("editor.showLineNumbers", true);
          expect(component.refs.gutter).toBeDefined();
          return expect(component.lineNumberNodeForScreenRow(3)).toBeDefined();
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
          return it("adds, updates and removes the folded class on the correct line number componentNodes", function() {
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
            return gutterNode = componentNode.querySelector('.gutter');
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
          return it("does not fold when the line number componentNode is clicked", function() {
            var lineNumber;
            lineNumber = component.lineNumberNodeForScreenRow(1);
            lineNumber.dispatchEvent(buildClickEvent(lineNumber));
            expect(hasSetImmediateCallbacks()).toBe(false);
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
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 20 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        expect(cursorNodes[0].offsetHeight).toBe(lineHeightInPixels);
        expect(cursorNodes[0].offsetWidth).toBe(charWidth);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + (5 * charWidth) + "px, " + (0 * lineHeightInPixels) + "px, 0px)");
        cursor2 = editor.addCursorAtScreenPosition([8, 11]);
        cursor3 = editor.addCursorAtScreenPosition([4, 10]);
        runSetImmediateCallbacks();
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(2);
        expect(cursorNodes[0].offsetTop).toBe(0);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + (5 * charWidth) + "px, " + (0 * lineHeightInPixels) + "px, 0px)");
        expect(cursorNodes[1].style['-webkit-transform']).toBe("translate3d(" + (10 * charWidth) + "px, " + (4 * lineHeightInPixels) + "px, 0px)");
        verticalScrollbarNode.scrollTop = 4.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        horizontalScrollbarNode.scrollLeft = 3.5 * charWidth;
        horizontalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(2);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + ((11 - 3.5) * charWidth) + "px, " + ((8 - 4.5) * lineHeightInPixels) + "px, 0px)");
        expect(cursorNodes[1].style['-webkit-transform']).toBe("translate3d(" + ((10 - 3.5) * charWidth) + "px, " + ((4 - 4.5) * lineHeightInPixels) + "px, 0px)");
        cursor3.destroy();
        runSetImmediateCallbacks();
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        return expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + ((11 - 3.5) * charWidth) + "px, " + ((6 - 2.5) * lineHeightInPixels) + "px, 0px)");
      });
      it("accounts for character widths when positioning cursors", function() {
        var cursor, cursorLocationTextNode, cursorRect, range, rangeRect;
        atom.config.set('editor.fontFamily', 'sans-serif');
        editor.setCursorScreenPosition([0, 16]);
        runSetImmediateCallbacks();
        cursor = componentNode.querySelector('.cursor');
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
        cursor = componentNode.querySelector('.cursor');
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
        cursorNode = componentNode.querySelector('.cursor');
        return expect(cursorNode.offsetWidth).toBe(charWidth);
      });
      it("gives the cursor a non-zero width even if it's inside atomic tokens", function() {
        var cursorNode;
        editor.setCursorScreenPosition([1, 0]);
        runSetImmediateCallbacks();
        cursorNode = componentNode.querySelector('.cursor');
        return expect(cursorNode.offsetWidth).toBe(charWidth);
      });
      it("blinks cursors when they aren't moving", function() {
        var cursorsNode;
        spyOn(_._, 'now').andCallFake(function() {
          return window.now;
        });
        cursorsNode = componentNode.querySelector('.cursors');
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
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        return expect(cursorNodes[0].style['-webkit-transform']).toBe("translate3d(" + (8 * charWidth) + "px, " + (6 * lineHeightInPixels) + "px, 0px)");
      });
      it("updates cursor positions when the line height changes", function() {
        var cursorNode;
        editor.setCursorBufferPosition([1, 10]);
        component.setLineHeight(2);
        runSetImmediateCallbacks();
        cursorNode = componentNode.querySelector('.cursor');
        return expect(cursorNode.style['-webkit-transform']).toBe("translate3d(" + (10 * editor.getDefaultCharWidth()) + "px, " + (editor.getLineHeightInPixels()) + "px, 0px)");
      });
      it("updates cursor positions when the font size changes", function() {
        var cursorNode;
        editor.setCursorBufferPosition([1, 10]);
        component.setFontSize(10);
        runSetImmediateCallbacks();
        cursorNode = componentNode.querySelector('.cursor');
        return expect(cursorNode.style['-webkit-transform']).toBe("translate3d(" + (10 * editor.getDefaultCharWidth()) + "px, " + (editor.getLineHeightInPixels()) + "px, 0px)");
      });
      return it("updates cursor positions when the font family changes", function() {
        var cursorNode, left;
        editor.setCursorBufferPosition([1, 10]);
        component.setFontFamily('sans-serif');
        runSetImmediateCallbacks();
        cursorNode = componentNode.querySelector('.cursor');
        left = editor.pixelPositionForScreenPosition([1, 10]).left;
        return expect(cursorNode.style['-webkit-transform']).toBe("translate3d(" + left + "px, " + (editor.getLineHeightInPixels()) + "px, 0px)");
      });
    });
    describe("selection rendering", function() {
      var scrollViewClientLeft, scrollViewNode, _ref2;
      _ref2 = [], scrollViewNode = _ref2[0], scrollViewClientLeft = _ref2[1];
      beforeEach(function() {
        scrollViewNode = componentNode.querySelector('.scroll-view');
        return scrollViewClientLeft = componentNode.querySelector('.scroll-view').getBoundingClientRect().left;
      });
      it("renders 1 region for 1-line selections", function() {
        var regionRect, regions;
        editor.setSelectedScreenRange([[1, 6], [1, 10]]);
        runSetImmediateCallbacks();
        regions = componentNode.querySelectorAll('.selection .region');
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
        regions = componentNode.querySelectorAll('.selection .region');
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
        regions = componentNode.querySelectorAll('.selection .region');
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
        return expect(componentNode.querySelectorAll('.selection').length).toBe(0);
      });
      it("updates selections when the line height changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setLineHeight(2);
        runSetImmediateCallbacks();
        selectionNode = componentNode.querySelector('.region');
        return expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
      });
      it("updates selections when the font size changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setFontSize(10);
        runSetImmediateCallbacks();
        selectionNode = componentNode.querySelector('.region');
        expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
        return expect(selectionNode.offsetLeft).toBe(6 * editor.getDefaultCharWidth());
      });
      it("updates selections when the font family changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setFontFamily('sans-serif');
        runSetImmediateCallbacks();
        selectionNode = componentNode.querySelector('.region');
        expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
        return expect(selectionNode.offsetLeft).toBe(editor.pixelPositionForScreenPosition([1, 6]).left);
      });
      return it("will flash the selection when flash:true is passed to editor::setSelectedBufferRange", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]], {
          flash: true
        });
        runSetImmediateCallbacks();
        selectionNode = componentNode.querySelector('.selection');
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
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
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
        componentNode.style.width = 16 * charWidth + 'px';
        component.measureHeightAndWidth();
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
        scrollViewClientLeft = componentNode.querySelector('.scroll-view').getBoundingClientRect().left;
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
        wrapperNode.style.height = 2.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
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
        regions = componentNode.querySelectorAll('.some-highlight .region');
        expect(regions.length).toBe(0);
        verticalScrollbarNode.scrollTop = 3.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        regions = componentNode.querySelectorAll('.some-highlight .region');
        expect(regions.length).toBe(1);
        regionRect = regions[0].style;
        expect(regionRect.top).toBe(9 * lineHeightInPixels + 'px');
        expect(regionRect.height).toBe(1 * lineHeightInPixels + 'px');
        expect(regionRect.left).toBe(2 * charWidth + 'px');
        return expect(regionRect.width).toBe(2 * charWidth + 'px');
      });
      it("renders highlights decoration's marker is added", function() {
        var regions;
        regions = componentNode.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(2);
      });
      it("removes highlights when a decoration is removed", function() {
        var regions;
        decoration.destroy();
        runSetImmediateCallbacks();
        regions = componentNode.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(0);
      });
      it("does not render a highlight that is within a fold", function() {
        editor.foldBufferRow(1);
        runSetImmediateCallbacks();
        return expect(componentNode.querySelectorAll('.test-highlight').length).toBe(0);
      });
      it("removes highlights when a decoration's marker is destroyed", function() {
        var regions;
        marker.destroy();
        runSetImmediateCallbacks();
        regions = componentNode.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(0);
      });
      it("only renders highlights when a decoration's marker is valid", function() {
        var regions;
        editor.getBuffer().insert([3, 2], 'n');
        runSetImmediateCallbacks();
        expect(marker.isValid()).toBe(false);
        regions = componentNode.querySelectorAll('.test-highlight .region');
        expect(regions.length).toBe(0);
        editor.getBuffer().undo();
        runSetImmediateCallbacks();
        expect(marker.isValid()).toBe(true);
        regions = componentNode.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(2);
      });
      describe("when flashing a decoration via Decoration::flash()", function() {
        var highlightNode;
        highlightNode = null;
        beforeEach(function() {
          return highlightNode = componentNode.querySelector('.test-highlight');
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
          regionStyle = componentNode.querySelector('.test-highlight .region').style;
          originalTop = parseInt(regionStyle.top);
          editor.getBuffer().insert([0, 0], '\n');
          runSetImmediateCallbacks();
          regionStyle = componentNode.querySelector('.test-highlight .region').style;
          newTop = parseInt(regionStyle.top);
          return expect(newTop).toBe(originalTop + lineHeightInPixels);
        });
        return it("moves rendered highlights when the marker is manually moved", function() {
          var regionStyle;
          regionStyle = componentNode.querySelector('.test-highlight .region').style;
          expect(parseInt(regionStyle.top)).toBe(2 * lineHeightInPixels);
          marker.setBufferRange([[5, 8], [5, 13]]);
          runSetImmediateCallbacks();
          regionStyle = componentNode.querySelector('.test-highlight .region').style;
          return expect(parseInt(regionStyle.top)).toBe(5 * lineHeightInPixels);
        });
      });
      return describe("when a decoration is updated via Decoration::update", function() {
        return it("renders the decoration's new params", function() {
          expect(componentNode.querySelector('.test-highlight')).toBeTruthy();
          decoration.update({
            type: 'highlight',
            "class": 'new-test-highlight'
          });
          runSetImmediateCallbacks();
          expect(componentNode.querySelector('.test-highlight')).toBeFalsy();
          return expect(componentNode.querySelector('.new-test-highlight')).toBeTruthy();
        });
      });
    });
    describe("hidden input field", function() {
      return it("renders the hidden input field at the position of the last cursor if the cursor is on screen and the editor is focused", function() {
        var inputNode;
        editor.setVerticalScrollMargin(0);
        editor.setHorizontalScrollMargin(0);
        inputNode = componentNode.querySelector('.hidden-input');
        wrapperNode.style.height = 5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
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
        return linesNode = componentNode.querySelector('.lines');
      });
      describe("when a non-folded line is single-clicked", function() {
        describe("when no modifier keys are held down", function() {
          return it("moves the cursor to the nearest screen position", function() {
            wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
            wrapperNode.style.width = 10 * charWidth + 'px';
            component.measureHeightAndWidth();
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
        return gutterNode = componentNode.querySelector('.gutter');
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
        return inputNode = componentNode.querySelector('.hidden-input');
      });
      it("transfers focus to the hidden input", function() {
        expect(document.activeElement).toBe(document.body);
        componentNode.focus();
        return expect(document.activeElement).toBe(inputNode);
      });
      return it("adds the 'is-focused' class to the editor when the hidden input is focused", function() {
        expect(document.activeElement).toBe(document.body);
        inputNode.focus();
        expect(componentNode.classList.contains('is-focused')).toBe(true);
        expect(wrapperView.hasClass('is-focused')).toBe(true);
        inputNode.blur();
        expect(componentNode.classList.contains('is-focused')).toBe(false);
        return expect(wrapperView.hasClass('is-focused')).toBe(false);
      });
    });
    describe("selection handling", function() {
      var cursor;
      cursor = null;
      beforeEach(function() {
        cursor = editor.getCursor();
        return cursor.setScreenPosition([0, 0]);
      });
      return it("adds the 'has-selection' class to the editor when there is a selection", function() {
        expect(componentNode.classList.contains('has-selection')).toBe(false);
        editor.selectDown();
        runSetImmediateCallbacks();
        expect(componentNode.classList.contains('has-selection')).toBe(true);
        cursor.moveDown();
        runSetImmediateCallbacks();
        return expect(componentNode.classList.contains('has-selection')).toBe(false);
      });
    });
    describe("scrolling", function() {
      it("updates the vertical scrollbar when the scrollTop is changed in the model", function() {
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.scrollTop).toBe(0);
        editor.setScrollTop(10);
        runSetImmediateCallbacks();
        return expect(verticalScrollbarNode.scrollTop).toBe(10);
      });
      it("updates the horizontal scrollbar and the x transform of the lines based on the scrollLeft of the model", function() {
        var linesNode;
        componentNode.style.width = 30 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        linesNode = componentNode.querySelector('.lines');
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, 0px, 0px)");
        expect(horizontalScrollbarNode.scrollLeft).toBe(0);
        editor.setScrollLeft(100);
        runSetImmediateCallbacks();
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(-100px, 0px, 0px)");
        return expect(horizontalScrollbarNode.scrollLeft).toBe(100);
      });
      it("updates the scrollLeft of the model when the scrollLeft of the horizontal scrollbar changes", function() {
        componentNode.style.width = 30 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(editor.getScrollLeft()).toBe(0);
        horizontalScrollbarNode.scrollLeft = 100;
        horizontalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        return expect(editor.getScrollLeft()).toBe(100);
      });
      it("does not obscure the last line with the horizontal scrollbar", function() {
        var bottomOfEditor, bottomOfLastLine, lastLineNode, topOfHorizontalScrollbar;
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        editor.setScrollBottom(editor.getScrollHeight());
        runSetImmediateCallbacks();
        lastLineNode = component.lineNodeForScreenRow(editor.getLastScreenRow());
        bottomOfLastLine = lastLineNode.getBoundingClientRect().bottom;
        topOfHorizontalScrollbar = horizontalScrollbarNode.getBoundingClientRect().top;
        expect(bottomOfLastLine).toBe(topOfHorizontalScrollbar);
        wrapperNode.style.width = 100 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        bottomOfLastLine = lastLineNode.getBoundingClientRect().bottom;
        bottomOfEditor = componentNode.getBoundingClientRect().bottom;
        return expect(bottomOfLastLine).toBe(bottomOfEditor);
      });
      it("does not obscure the last character of the longest line with the vertical scrollbar", function() {
        var leftOfVerticalScrollbar, rightOfLongestLine;
        wrapperNode.style.height = 7 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        editor.setScrollLeft(Infinity);
        runSetImmediateCallbacks();
        rightOfLongestLine = component.lineNodeForScreenRow(6).querySelector('.line > span:last-child').getBoundingClientRect().right;
        leftOfVerticalScrollbar = verticalScrollbarNode.getBoundingClientRect().left;
        return expect(Math.round(rightOfLongestLine)).toBe(leftOfVerticalScrollbar - 1);
      });
      it("only displays dummy scrollbars when scrollable in that direction", function() {
        expect(verticalScrollbarNode.style.display).toBe('none');
        expect(horizontalScrollbarNode.style.display).toBe('none');
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = '1000px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.display).toBe('');
        expect(horizontalScrollbarNode.style.display).toBe('none');
        componentNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.display).toBe('');
        expect(horizontalScrollbarNode.style.display).toBe('');
        wrapperNode.style.height = 20 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.display).toBe('none');
        return expect(horizontalScrollbarNode.style.display).toBe('');
      });
      it("makes the dummy scrollbar divs only as tall/wide as the actual scrollbars", function() {
        var scrollbarCornerNode;
        wrapperNode.style.height = 4 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        atom.themes.applyStylesheet("test", "::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}");
        scrollbarCornerNode = componentNode.querySelector('.scrollbar-corner');
        expect(verticalScrollbarNode.offsetWidth).toBe(8);
        expect(horizontalScrollbarNode.offsetHeight).toBe(8);
        expect(scrollbarCornerNode.offsetWidth).toBe(8);
        expect(scrollbarCornerNode.offsetHeight).toBe(8);
        return atom.themes.removeStylesheet('test');
      });
      it("assigns the bottom/right of the scrollbars to the width of the opposite scrollbar if it is visible", function() {
        var scrollbarCornerNode;
        scrollbarCornerNode = componentNode.querySelector('.scrollbar-corner');
        expect(verticalScrollbarNode.style.bottom).toBe('');
        expect(horizontalScrollbarNode.style.right).toBe('');
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = '1000px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.bottom).toBe('');
        expect(horizontalScrollbarNode.style.right).toBe(verticalScrollbarNode.offsetWidth + 'px');
        expect(scrollbarCornerNode.style.display).toBe('none');
        componentNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.bottom).toBe(horizontalScrollbarNode.offsetHeight + 'px');
        expect(horizontalScrollbarNode.style.right).toBe(verticalScrollbarNode.offsetWidth + 'px');
        expect(scrollbarCornerNode.style.display).toBe('');
        wrapperNode.style.height = 20 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(verticalScrollbarNode.style.bottom).toBe(horizontalScrollbarNode.offsetHeight + 'px');
        expect(horizontalScrollbarNode.style.right).toBe('');
        return expect(scrollbarCornerNode.style.display).toBe('none');
      });
      return it("accounts for the width of the gutter in the scrollWidth of the horizontal scrollbar", function() {
        var gutterNode;
        gutterNode = componentNode.querySelector('.gutter');
        componentNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        expect(horizontalScrollbarNode.scrollWidth).toBe(editor.getScrollWidth());
        return expect(horizontalScrollbarNode.style.left).toBe('0px');
      });
    });
    describe("mousewheel events", function() {
      beforeEach(function() {
        return atom.config.set('editor.scrollSensitivity', 100);
      });
      describe("updating scrollTop and scrollLeft", function() {
        beforeEach(function() {
          wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
          wrapperNode.style.width = 20 * charWidth + 'px';
          component.measureHeightAndWidth();
          return runSetImmediateCallbacks();
        });
        it("updates the scrollLeft or scrollTop on mousewheel events depending on which delta is greater (x or y)", function() {
          expect(verticalScrollbarNode.scrollTop).toBe(0);
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -5,
            wheelDeltaY: -10
          }));
          runSetImmediateCallbacks();
          expect(verticalScrollbarNode.scrollTop).toBe(10);
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -15,
            wheelDeltaY: -5
          }));
          runSetImmediateCallbacks();
          expect(verticalScrollbarNode.scrollTop).toBe(10);
          return expect(horizontalScrollbarNode.scrollLeft).toBe(15);
        });
        it("updates the scrollLeft or scrollTop according to the scroll sensitivity", function() {
          atom.config.set('editor.scrollSensitivity', 50);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -5,
            wheelDeltaY: -10
          }));
          runSetImmediateCallbacks();
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -15,
            wheelDeltaY: -5
          }));
          runSetImmediateCallbacks();
          expect(verticalScrollbarNode.scrollTop).toBe(5);
          return expect(horizontalScrollbarNode.scrollLeft).toBe(7);
        });
        it("uses the previous scrollSensitivity when the value is not an int", function() {
          atom.config.set('editor.scrollSensitivity', 'nope');
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -10
          }));
          runSetImmediateCallbacks();
          return expect(verticalScrollbarNode.scrollTop).toBe(10);
        });
        return it("parses negative scrollSensitivity values as positive", function() {
          atom.config.set('editor.scrollSensitivity', -50);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -10
          }));
          runSetImmediateCallbacks();
          return expect(verticalScrollbarNode.scrollTop).toBe(5);
        });
      });
      describe("when the mousewheel event's target is a line", function() {
        it("keeps the line on the DOM if it is scrolled off-screen", function() {
          var lineNode, wheelEvent;
          wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
          wrapperNode.style.width = 20 * charWidth + 'px';
          component.measureHeightAndWidth();
          lineNode = componentNode.querySelector('.line');
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -500
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNode;
            }
          });
          componentNode.dispatchEvent(wheelEvent);
          runSetImmediateCallbacks();
          return expect(componentNode.contains(lineNode)).toBe(true);
        });
        it("does not set the mouseWheelScreenRow if scrolling horizontally", function() {
          var lineNode, wheelEvent;
          wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
          wrapperNode.style.width = 20 * charWidth + 'px';
          component.measureHeightAndWidth();
          lineNode = componentNode.querySelector('.line');
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 10,
            wheelDeltaY: 0
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNode;
            }
          });
          componentNode.dispatchEvent(wheelEvent);
          runSetImmediateCallbacks();
          return expect(component.mouseWheelScreenRow).toBe(null);
        });
        it("clears the mouseWheelScreenRow after a delay even if the event does not cause scrolling", function() {
          var lineNode, wheelEvent;
          spyOn(_._, 'now').andCallFake(function() {
            return window.now;
          });
          expect(editor.getScrollTop()).toBe(0);
          lineNode = componentNode.querySelector('.line');
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: 10
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNode;
            }
          });
          componentNode.dispatchEvent(wheelEvent);
          expect(hasSetImmediateCallbacks()).toBe(false);
          expect(editor.getScrollTop()).toBe(0);
          expect(component.mouseWheelScreenRow).toBe(0);
          advanceClock(component.mouseWheelScreenRowClearDelay);
          return expect(component.mouseWheelScreenRow).toBe(null);
        });
        return it("does not preserve the line if it is on screen", function() {
          var lineNode, lineNodes, wheelEvent;
          expect(componentNode.querySelectorAll('.line-number').length).toBe(14);
          lineNodes = componentNode.querySelectorAll('.line');
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
          componentNode.dispatchEvent(wheelEvent);
          expect(hasSetImmediateCallbacks()).toBe(false);
          expect(component.mouseWheelScreenRow).toBe(0);
          editor.insertText("hello");
          expect(componentNode.querySelectorAll('.line-number').length).toBe(14);
          return expect(componentNode.querySelectorAll('.line').length).toBe(13);
        });
      });
      describe("when the mousewheel event's target is a line number", function() {
        return it("keeps the line number on the DOM if it is scrolled off-screen", function() {
          var lineNumberNode, wheelEvent;
          wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
          wrapperNode.style.width = 20 * charWidth + 'px';
          component.measureHeightAndWidth();
          lineNumberNode = componentNode.querySelectorAll('.line-number')[1];
          wheelEvent = new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -500
          });
          Object.defineProperty(wheelEvent, 'target', {
            get: function() {
              return lineNumberNode;
            }
          });
          componentNode.dispatchEvent(wheelEvent);
          runSetImmediateCallbacks();
          return expect(componentNode.contains(lineNumberNode)).toBe(true);
        });
      });
      return it("only prevents the default action of the mousewheel event if it actually lead to scrolling", function() {
        var maxScrollLeft, maxScrollTop;
        spyOn(WheelEvent.prototype, 'preventDefault').andCallThrough();
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 20 * charWidth + 'px';
        component.measureHeightAndWidth();
        runSetImmediateCallbacks();
        componentNode.dispatchEvent(new WheelEvent('mousewheel', {
          wheelDeltaX: 0,
          wheelDeltaY: 50
        }));
        expect(editor.getScrollTop()).toBe(0);
        expect(WheelEvent.prototype.preventDefault).not.toHaveBeenCalled();
        componentNode.dispatchEvent(new WheelEvent('mousewheel', {
          wheelDeltaX: 0,
          wheelDeltaY: -3000
        }));
        runSetImmediateCallbacks();
        maxScrollTop = editor.getScrollTop();
        expect(WheelEvent.prototype.preventDefault).toHaveBeenCalled();
        WheelEvent.prototype.preventDefault.reset();
        componentNode.dispatchEvent(new WheelEvent('mousewheel', {
          wheelDeltaX: 0,
          wheelDeltaY: -30
        }));
        expect(editor.getScrollTop()).toBe(maxScrollTop);
        expect(WheelEvent.prototype.preventDefault).not.toHaveBeenCalled();
        componentNode.dispatchEvent(new WheelEvent('mousewheel', {
          wheelDeltaX: 50,
          wheelDeltaY: 0
        }));
        expect(editor.getScrollLeft()).toBe(0);
        expect(WheelEvent.prototype.preventDefault).not.toHaveBeenCalled();
        componentNode.dispatchEvent(new WheelEvent('mousewheel', {
          wheelDeltaX: -3000,
          wheelDeltaY: 0
        }));
        runSetImmediateCallbacks();
        maxScrollLeft = editor.getScrollLeft();
        expect(WheelEvent.prototype.preventDefault).toHaveBeenCalled();
        WheelEvent.prototype.preventDefault.reset();
        componentNode.dispatchEvent(new WheelEvent('mousewheel', {
          wheelDeltaX: -30,
          wheelDeltaY: 0
        }));
        expect(editor.getScrollLeft()).toBe(maxScrollLeft);
        return expect(WheelEvent.prototype.preventDefault).not.toHaveBeenCalled();
      });
    });
    describe("input events", function() {
      var buildTextInputEvent, inputNode;
      inputNode = null;
      beforeEach(function() {
        return inputNode = componentNode.querySelector('.hidden-input');
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
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'x',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        expect(editor.lineForBufferRow(0)).toBe('xvar quicksort = function () {');
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'y',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        return expect(editor.lineForBufferRow(0)).toBe('xyvar quicksort = function () {');
      });
      it("replaces the last character if the length of the input's value doesn't increase, as occurs with the accented character menu", function() {
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'u',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        expect(editor.lineForBufferRow(0)).toBe('uvar quicksort = function () {');
        inputNode.setSelectionRange(0, 1);
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'ü',
          target: inputNode
        }));
        runSetImmediateCallbacks();
        return expect(editor.lineForBufferRow(0)).toBe('üvar quicksort = function () {');
      });
      it("does not handle input events when input is disabled", function() {
        component.setInputEnabled(false);
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'x',
          target: inputNode
        }));
        expect(hasSetImmediateCallbacks()).toBe(false);
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
          return inputNode = inputNode = componentNode.querySelector('.hidden-input');
        });
        describe("when nothing is selected", function() {
          it("inserts the chosen completion", function() {
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('svar quicksort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('sdvar quicksort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildTextInputEvent({
              data: '速度',
              target: inputNode
            }));
            return expect(editor.lineForBufferRow(0)).toBe('速度var quicksort = function () {');
          });
          it("reverts back to the original text when the completion helper is dismissed", function() {
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('svar quicksort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('sdvar quicksort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            return expect(editor.lineForBufferRow(0)).toBe('var quicksort = function () {');
          });
          return it("allows multiple accented character to be inserted with the ' on a US international layout", function() {
            inputNode.value = "'";
            inputNode.setSelectionRange(0, 1);
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: "'",
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe("'var quicksort = function () {");
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildTextInputEvent({
              data: 'á',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe("ávar quicksort = function () {");
            inputNode.value = "'";
            inputNode.setSelectionRange(0, 1);
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: "'",
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe("á'var quicksort = function () {");
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildTextInputEvent({
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
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('var ssort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('var sdsort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildTextInputEvent({
              data: '速度',
              target: inputNode
            }));
            return expect(editor.lineForBufferRow(0)).toBe('var 速度sort = function () {');
          });
          return it("reverts back to the original text when the completion helper is dismissed", function() {
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('var ssort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineForBufferRow(0)).toBe('var sdsort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
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
          componentNode.dispatchEvent(event);
          expect(editor.consolidateSelections).toHaveBeenCalled();
          return expect(event.abortKeyBinding).toHaveBeenCalled();
        });
      });
    });
    describe("hiding and showing the editor", function() {
      describe("when the editor is hidden when it is mounted", function() {
        return it("defers measurement and rendering until the editor becomes visible", function() {
          var hiddenParent;
          wrapperView.remove();
          hiddenParent = document.createElement('div');
          hiddenParent.style.display = 'none';
          contentNode.appendChild(hiddenParent);
          wrapperView = new ReactEditorView(editor, {
            lineOverdrawMargin: lineOverdrawMargin
          });
          wrapperNode = wrapperView.element;
          wrapperView.appendTo(hiddenParent);
          component = wrapperView.component;
          componentNode = component.getDOMNode();
          expect(componentNode.querySelectorAll('.line').length).toBe(0);
          hiddenParent.style.display = 'block';
          advanceClock(component.domPollingInterval);
          return expect(componentNode.querySelectorAll('.line').length).toBeGreaterThan(0);
        });
      });
      describe("when the lineHeight changes while the editor is hidden", function() {
        return it("does not attempt to measure the lineHeightInPixels until the editor becomes visible again", function() {
          var initialLineHeightInPixels;
          wrapperView.hide();
          initialLineHeightInPixels = editor.getLineHeightInPixels();
          component.setLineHeight(2);
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
          wrapperView.show();
          editor.setCursorBufferPosition([0, Infinity]);
          runSetImmediateCallbacks();
          cursorLeft = componentNode.querySelector('.cursor').getBoundingClientRect().left;
          line0Right = componentNode.querySelector('.line > span:last-child').getBoundingClientRect().right;
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
          expect(editor.getDefaultCharWidth()).toBe(initialCharWidth);
          wrapperView.show();
          return expect(editor.getDefaultCharWidth()).not.toBe(initialCharWidth);
        });
        return it("does not re-measure character widths until the editor is shown again", function() {
          var cursorLeft, line0Right;
          wrapperView.hide();
          component.setFontFamily('sans-serif');
          wrapperView.show();
          editor.setCursorBufferPosition([0, Infinity]);
          runSetImmediateCallbacks();
          cursorLeft = componentNode.querySelector('.cursor').getBoundingClientRect().left;
          line0Right = componentNode.querySelector('.line > span:last-child').getBoundingClientRect().right;
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
          cursorLeft = componentNode.querySelector('.cursor').getBoundingClientRect().left;
          line0Right = componentNode.querySelector('.line > span:last-child').getBoundingClientRect().right;
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
          return expect(componentNode.querySelector('.cursor').style['-webkit-transform']).toBe("translate3d(" + (9 * charWidth) + "px, 0px, 0px)");
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
        expect(parseInt(newHeight)).toBeLessThan(wrapperNode.offsetHeight);
        wrapperNode.style.height = newHeight;
        advanceClock(component.domPollingInterval);
        runSetImmediateCallbacks();
        expect(componentNode.querySelectorAll('.line')).toHaveLength(4 + lineOverdrawMargin + 1);
        gutterWidth = componentNode.querySelector('.gutter').offsetWidth;
        componentNode.style.width = gutterWidth + 14 * charWidth + editor.getVerticalScrollbarWidth() + 'px';
        advanceClock(component.domPollingInterval);
        runSetImmediateCallbacks();
        return expect(componentNode.querySelector('.line').textContent).toBe("var quicksort ");
      });
      return it("accounts for the scroll view's padding when determining the wrap location", function() {
        var scrollViewNode;
        scrollViewNode = componentNode.querySelector('.scroll-view');
        scrollViewNode.style.paddingLeft = 20 + 'px';
        componentNode.style.width = 30 * charWidth + 'px';
        advanceClock(component.domPollingInterval);
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
    describe("height", function() {
      describe("when the wrapper view has an explicit height", function() {
        return it("does not assign a height on the component node", function() {
          wrapperNode.style.height = '200px';
          component.measureHeightAndWidth();
          return expect(componentNode.style.height).toBe('');
        });
      });
      return describe("when the wrapper view does not have an explicit height", function() {
        return it("assigns a height on the component node based on the editor's content", function() {
          expect(wrapperNode.style.height).toBe('');
          return expect(componentNode.style.height).toBe(editor.getScreenLineCount() * lineHeightInPixels + 'px');
        });
      });
    });
    describe("when the 'mini' property is true", function() {
      beforeEach(function() {
        return component.setProps({
          mini: true
        });
      });
      it("does not render the gutter", function() {
        return expect(componentNode.querySelector('.gutter')).toBeNull();
      });
      it("adds the 'mini' class to the wrapper view", function() {
        return expect(wrapperNode.classList.contains('mini')).toBe(true);
      });
      it("does not render invisible characters", function() {
        component.setInvisibles({
          eol: 'E'
        });
        component.setShowInvisibles(true);
        return expect(component.lineNodeForScreenRow(0).textContent).toBe('var quicksort = function () {');
      });
      it("does not assign an explicit line-height on the editor contents", function() {
        return expect(componentNode.style.lineHeight).toBe('');
      });
      return it("does not apply cursor-line decorations", function() {
        return expect(component.lineNodeForScreenRow(0).classList.contains('cursor-line')).toBe(false);
      });
    });
    describe("when placholderText is specified", function() {
      return it("renders the placeholder text when the buffer is empty", function() {
        component.setProps({
          placeholderText: 'Hello World'
        });
        expect(componentNode.querySelector('.placeholder-text')).toBeNull();
        editor.setText('');
        runSetImmediateCallbacks();
        expect(componentNode.querySelector('.placeholder-text').textContent).toBe("Hello World");
        editor.setText('hey');
        runSetImmediateCallbacks();
        return expect(componentNode.querySelector('.placeholder-text')).toBeNull();
      });
    });
    describe("legacy editor compatibility", function() {
      it("triggers the screen-lines-changed event before the editor:display-update event", function() {
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
      return it("works with the ::setEditorHeightInLines and ::setEditorWidthInChars helpers", function() {
        setEditorHeightInLines(wrapperView, 7);
        expect(componentNode.offsetHeight).toBe(lineHeightInPixels * 7);
        setEditorWidthInChars(wrapperView, 10);
        return expect(componentNode.querySelector('.scroll-view').offsetWidth).toBe(charWidth * 10);
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
      scrollViewClientRect = componentNode.querySelector('.scroll-view').getBoundingClientRect();
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
      gutterClientRect = componentNode.querySelector('.gutter').getBoundingClientRect();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlFQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFdBQUEsTUFBRCxFQUFTLFlBQUEsT0FBVCxFQUFrQixZQUFBLE9BQWxCLEVBQTJCLFNBQUEsSUFEM0IsQ0FBQTs7QUFBQSxFQUdBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLDBCQUFSLENBSGxCLENBQUE7O0FBQUEsRUFJQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSx5QkFBUixDQUpsQixDQUFBOztBQUFBLEVBS0EsSUFBQSxHQUFPLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEdBQXBCLENBTFAsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSwrY0FBQTtBQUFBLElBQUEsT0FBNEgsRUFBNUgsRUFBQyxxQkFBRCxFQUFjLGdCQUFkLEVBQXNCLHFCQUF0QixFQUFtQyxxQkFBbkMsRUFBZ0QsbUJBQWhELEVBQTJELHVCQUEzRCxFQUEwRSwrQkFBMUUsRUFBaUcsaUNBQWpHLENBQUE7QUFBQSxJQUNBLFFBQW9KLEVBQXBKLEVBQUMsNkJBQUQsRUFBcUIsb0JBQXJCLEVBQWdDLCtCQUFoQyxFQUFzRCw2QkFBdEQsRUFBMEUsbUNBQTFFLEVBQW9HLG1DQUFwRyxFQUE4SCw2QkFEOUgsQ0FBQTtBQUFBLElBR0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsa0JBQUEsR0FBcUIsQ0FBckIsQ0FBQTtBQUFBLE1BRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7TUFBQSxDQUFoQixDQUZBLENBQUE7QUFBQSxNQUtBLElBQUEs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/editor-component-spec.coffee