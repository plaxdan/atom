(function() {
  var TextEditorComponent, TextEditorView, extend, flatten, last, nbsp, toArray, _,
    __slice = [].slice;

  _ = require('underscore-plus');

  extend = _.extend, flatten = _.flatten, toArray = _.toArray, last = _.last;

  TextEditorView = require('../src/text-editor-view');

  TextEditorComponent = require('../src/text-editor-component');

  nbsp = String.fromCharCode(160);

  describe("TextEditorComponent", function() {
    var buildMouseEvent, charWidth, clientCoordinatesForScreenPosition, clientCoordinatesForScreenRowInGutter, component, componentNode, contentNode, editor, horizontalScrollbarNode, lineAndLineNumberHaveClass, lineHasClass, lineHeightInPixels, lineNumberForBufferRowHasClass, lineNumberHasClass, lineOverdrawMargin, nextAnimationFrame, noAnimationFrame, verticalScrollbarNode, wrapperNode, wrapperView, _ref, _ref1;
    _ref = [], contentNode = _ref[0], editor = _ref[1], wrapperView = _ref[2], wrapperNode = _ref[3], component = _ref[4], componentNode = _ref[5], verticalScrollbarNode = _ref[6], horizontalScrollbarNode = _ref[7];
    _ref1 = [], lineHeightInPixels = _ref1[0], charWidth = _ref1[1], nextAnimationFrame = _ref1[2], noAnimationFrame = _ref1[3], lineOverdrawMargin = _ref1[4];
    beforeEach(function() {
      lineOverdrawMargin = 2;
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
      runs(function() {
        spyOn(window, "setInterval").andCallFake(window.fakeSetInterval);
        spyOn(window, "clearInterval").andCallFake(window.fakeClearInterval);
        noAnimationFrame = function() {
          throw new Error('No animation frame requested');
        };
        nextAnimationFrame = noAnimationFrame;
        return spyOn(window, 'requestAnimationFrame').andCallFake(function(fn) {
          return nextAnimationFrame = function() {
            nextAnimationFrame = noAnimationFrame;
            return fn();
          };
        });
      });
      waitsForPromise(function() {
        return atom.project.open('sample.js').then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        contentNode = document.querySelector('#jasmine-content');
        contentNode.style.width = '1000px';
        wrapperView = new TextEditorView(editor, {
          lineOverdrawMargin: lineOverdrawMargin
        });
        wrapperView.attachToDom();
        wrapperNode = wrapperView.element;
        component = wrapperView.component;
        component.performSyncUpdates = false;
        component.setFontFamily('monospace');
        component.setLineHeight(1.3);
        component.setFontSize(20);
        lineHeightInPixels = editor.getLineHeightInPixels();
        charWidth = editor.getDefaultCharWidth();
        componentNode = component.getDOMNode();
        verticalScrollbarNode = componentNode.querySelector('.vertical-scrollbar');
        horizontalScrollbarNode = componentNode.querySelector('.horizontal-scrollbar');
        component.measureHeightAndWidth();
        return nextAnimationFrame();
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
        nextAnimationFrame();
        linesNode = componentNode.querySelector('.lines');
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, 0px, 0px)");
        expect(componentNode.querySelectorAll('.line').length).toBe(6 + 2);
        expect(component.lineNodeForScreenRow(0).textContent).toBe(editor.tokenizedLineForScreenRow(0).text);
        expect(component.lineNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNodeForScreenRow(5).textContent).toBe(editor.tokenizedLineForScreenRow(5).text);
        expect(component.lineNodeForScreenRow(5).offsetTop).toBe(5 * lineHeightInPixels);
        verticalScrollbarNode.scrollTop = 4.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        nextAnimationFrame();
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, " + (-4.5 * lineHeightInPixels) + "px, 0px)");
        expect(componentNode.querySelectorAll('.line').length).toBe(6 + 4);
        expect(component.lineNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(2).textContent).toBe(editor.tokenizedLineForScreenRow(2).text);
        expect(component.lineNodeForScreenRow(9).offsetTop).toBe(9 * lineHeightInPixels);
        return expect(component.lineNodeForScreenRow(9).textContent).toBe(editor.tokenizedLineForScreenRow(9).text);
      });
      it("updates the top position of subsequent lines when lines are inserted or removed", function() {
        var lineNodes;
        editor.getBuffer().deleteRows(0, 1);
        nextAnimationFrame();
        lineNodes = componentNode.querySelectorAll('.line');
        expect(component.lineNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        editor.getBuffer().insert([0, 0], '\n\n');
        nextAnimationFrame();
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
        nextAnimationFrame();
        verticalScrollbarNode.scrollTop = 5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        nextAnimationFrame();
        buffer = editor.getBuffer();
        buffer.insert([0, 0], '\n\n');
        nextAnimationFrame();
        expect(component.lineNodeForScreenRow(3).textContent).toBe(editor.tokenizedLineForScreenRow(3).text);
        buffer["delete"]([[0, 0], [3, 0]]);
        nextAnimationFrame();
        return expect(component.lineNodeForScreenRow(3).textContent).toBe(editor.tokenizedLineForScreenRow(3).text);
      });
      it("updates the top position of lines when the line height changes", function() {
        var initialLineHeightInPixels, newLineHeightInPixels;
        initialLineHeightInPixels = editor.getLineHeightInPixels();
        component.setLineHeight(2);
        nextAnimationFrame();
        newLineHeightInPixels = editor.getLineHeightInPixels();
        expect(newLineHeightInPixels).not.toBe(initialLineHeightInPixels);
        return expect(component.lineNodeForScreenRow(1).offsetTop).toBe(1 * newLineHeightInPixels);
      });
      it("updates the top position of lines when the font size changes", function() {
        var initialLineHeightInPixels, newLineHeightInPixels;
        initialLineHeightInPixels = editor.getLineHeightInPixels();
        component.setFontSize(10);
        nextAnimationFrame();
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
        nextAnimationFrame();
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
        nextAnimationFrame();
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
        nextAnimationFrame();
        expect(editor.getScrollWidth()).toBeGreaterThan(scrollViewNode.offsetWidth);
        for (_i = 0, _len = lineNodes.length; _i < _len; _i++) {
          lineNode = lineNodes[_i];
          expect(lineNode.style.width).toBe(editor.getScrollWidth() + 'px');
        }
        componentNode.style.width = gutterWidth + editor.getScrollWidth() + 100 + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
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
        nextAnimationFrame();
        return expect(linesNode.style.backgroundColor).toBe('rgb(255, 0, 0)');
      });
      it("applies .leading-whitespace for lines with leading spaces and/or tabs", function() {
        var leafNodes;
        editor.setText(' a');
        nextAnimationFrame();
        leafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
        expect(leafNodes[0].classList.contains('leading-whitespace')).toBe(true);
        expect(leafNodes[0].classList.contains('trailing-whitespace')).toBe(false);
        editor.setText('\ta');
        nextAnimationFrame();
        leafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
        expect(leafNodes[0].classList.contains('leading-whitespace')).toBe(true);
        return expect(leafNodes[0].classList.contains('trailing-whitespace')).toBe(false);
      });
      it("applies .trailing-whitespace for lines with trailing spaces and/or tabs", function() {
        var leafNodes;
        editor.setText(' ');
        nextAnimationFrame();
        leafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
        expect(leafNodes[0].classList.contains('trailing-whitespace')).toBe(true);
        expect(leafNodes[0].classList.contains('leading-whitespace')).toBe(false);
        editor.setText('\t');
        nextAnimationFrame();
        leafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
        expect(leafNodes[0].classList.contains('trailing-whitespace')).toBe(true);
        expect(leafNodes[0].classList.contains('leading-whitespace')).toBe(false);
        editor.setText('a ');
        nextAnimationFrame();
        leafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
        expect(leafNodes[0].classList.contains('trailing-whitespace')).toBe(true);
        expect(leafNodes[0].classList.contains('leading-whitespace')).toBe(false);
        editor.setText('a\t');
        nextAnimationFrame();
        leafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
        expect(leafNodes[0].classList.contains('trailing-whitespace')).toBe(true);
        return expect(leafNodes[0].classList.contains('leading-whitespace')).toBe(false);
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
          atom.config.set("editor.invisibles", invisibles);
          return nextAnimationFrame();
        });
        it("re-renders the lines when the showInvisibles config option changes", function() {
          editor.setText(" a line with tabs\tand spaces \n");
          nextAnimationFrame();
          expect(component.lineNodeForScreenRow(0).textContent).toBe("" + invisibles.space + "a line with tabs" + invisibles.tab + "and spaces" + invisibles.space + invisibles.eol);
          atom.config.set("editor.showInvisibles", false);
          nextAnimationFrame();
          expect(component.lineNodeForScreenRow(0).textContent).toBe(" a line with tabs and spaces ");
          atom.config.set("editor.showInvisibles", true);
          nextAnimationFrame();
          return expect(component.lineNodeForScreenRow(0).textContent).toBe("" + invisibles.space + "a line with tabs" + invisibles.tab + "and spaces" + invisibles.space + invisibles.eol);
        });
        it("displays leading/trailing spaces, tabs, and newlines as visible characters", function() {
          var leafNodes;
          editor.setText(" a line with tabs\tand spaces \n");
          nextAnimationFrame();
          expect(component.lineNodeForScreenRow(0).textContent).toBe("" + invisibles.space + "a line with tabs" + invisibles.tab + "and spaces" + invisibles.space + invisibles.eol);
          leafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
          expect(leafNodes[0].classList.contains('invisible-character')).toBe(true);
          return expect(leafNodes[leafNodes.length - 1].classList.contains('invisible-character')).toBe(true);
        });
        it("displays newlines as their own token outside of the other tokens' scopes", function() {
          editor.setText("var\n");
          nextAnimationFrame();
          return expect(component.lineNodeForScreenRow(0).innerHTML).toBe("<span class=\"source js\"><span class=\"storage modifier js\">var</span></span><span class=\"invisible-character\">" + invisibles.eol + "</span>");
        });
        it("displays trailing carriage returns using a visible, non-empty value", function() {
          editor.setText("a line that ends with a carriage return\r\n");
          nextAnimationFrame();
          return expect(component.lineNodeForScreenRow(0).textContent).toBe("a line that ends with a carriage return" + invisibles.cr + invisibles.eol);
        });
        it("renders invisible line-ending characters on empty lines", function() {
          return expect(component.lineNodeForScreenRow(10).textContent).toBe(invisibles.eol);
        });
        it("renders an nbsp on empty lines when the line-ending character is an empty string", function() {
          atom.config.set("editor.invisibles", {
            eol: ''
          });
          nextAnimationFrame();
          return expect(component.lineNodeForScreenRow(10).textContent).toBe(nbsp);
        });
        it("renders an nbsp on empty lines when the line-ending character is false", function() {
          atom.config.set("editor.invisibles", {
            eol: false
          });
          nextAnimationFrame();
          return expect(component.lineNodeForScreenRow(10).textContent).toBe(nbsp);
        });
        it("interleaves invisible line-ending characters with indent guides on empty lines", function() {
          component.setShowIndentGuide(true);
          editor.setTextInBufferRange([[10, 0], [11, 0]], "\r\n", false);
          nextAnimationFrame();
          expect(component.lineNodeForScreenRow(10).innerHTML).toBe('<span class="indent-guide"><span class="invisible-character">C</span><span class="invisible-character">E</span></span>');
          editor.setTabLength(3);
          nextAnimationFrame();
          expect(component.lineNodeForScreenRow(10).innerHTML).toBe('<span class="indent-guide"><span class="invisible-character">C</span><span class="invisible-character">E</span> </span>');
          editor.setTabLength(1);
          nextAnimationFrame();
          expect(component.lineNodeForScreenRow(10).innerHTML).toBe('<span class="indent-guide"><span class="invisible-character">C</span></span><span class="indent-guide"><span class="invisible-character">E</span></span>');
          editor.setTextInBufferRange([[9, 0], [9, Infinity]], ' ');
          editor.setTextInBufferRange([[11, 0], [11, Infinity]], ' ');
          nextAnimationFrame();
          return expect(component.lineNodeForScreenRow(10).innerHTML).toBe('<span class="indent-guide"><span class="invisible-character">C</span></span><span class="invisible-character">E</span>');
        });
        return describe("when soft wrapping is enabled", function() {
          beforeEach(function() {
            editor.setText("a line that wraps \n");
            editor.setSoftWrapped(true);
            nextAnimationFrame();
            componentNode.style.width = 16 * charWidth + editor.getVerticalScrollbarWidth() + 'px';
            component.measureHeightAndWidth();
            return nextAnimationFrame();
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
          nextAnimationFrame();
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
          nextAnimationFrame();
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
          nextAnimationFrame();
          line0LeafNodes = getLeafNodes(component.lineNodeForScreenRow(0));
          expect(line0LeafNodes[0].textContent).toBe('  ');
          expect(line0LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line0LeafNodes[1].textContent).toBe('  ');
          return expect(line0LeafNodes[1].classList.contains('indent-guide')).toBe(false);
        });
        it("updates the indent guides on empty lines preceding an indentation change", function() {
          var line12LeafNodes;
          editor.getBuffer().insert([12, 0], '\n');
          nextAnimationFrame();
          editor.getBuffer().insert([13, 0], '    ');
          nextAnimationFrame();
          line12LeafNodes = getLeafNodes(component.lineNodeForScreenRow(12));
          expect(line12LeafNodes[0].textContent).toBe('  ');
          expect(line12LeafNodes[0].classList.contains('indent-guide')).toBe(true);
          expect(line12LeafNodes[1].textContent).toBe('  ');
          return expect(line12LeafNodes[1].classList.contains('indent-guide')).toBe(true);
        });
        return it("updates the indent guides on empty lines following an indentation change", function() {
          var line13LeafNodes;
          editor.getBuffer().insert([12, 2], '\n');
          nextAnimationFrame();
          editor.getBuffer().insert([12, 0], '    ');
          nextAnimationFrame();
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
          nextAnimationFrame();
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
          nextAnimationFrame();
          return expect(editor.pixelPositionForScreenPosition([0, Infinity]).left).toEqual(2 * charWidth);
        });
      });
      describe("when there is a fold", function() {
        return it("renders a fold marker on the folded line", function() {
          var foldedLineNode;
          foldedLineNode = component.lineNodeForScreenRow(4);
          expect(foldedLineNode.querySelector('.fold-marker')).toBeFalsy();
          editor.foldBufferRow(4);
          nextAnimationFrame();
          foldedLineNode = component.lineNodeForScreenRow(4);
          expect(foldedLineNode.querySelector('.fold-marker')).toBeTruthy();
          editor.unfoldBufferRow(4);
          nextAnimationFrame();
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
        nextAnimationFrame();
        expect(componentNode.querySelectorAll('.line-number').length).toBe(6 + 2 + 1);
        expect(component.lineNumberNodeForScreenRow(0).textContent).toBe("" + nbsp + "1");
        expect(component.lineNumberNodeForScreenRow(5).textContent).toBe("" + nbsp + "6");
        verticalScrollbarNode.scrollTop = 2.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        nextAnimationFrame();
        expect(componentNode.querySelectorAll('.line-number').length).toBe(6 + 4 + 1);
        expect(component.lineNumberNodeForScreenRow(2).textContent).toBe("" + nbsp + "3");
        expect(component.lineNumberNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(7).textContent).toBe("" + nbsp + "8");
        return expect(component.lineNumberNodeForScreenRow(7).offsetTop).toBe(7 * lineHeightInPixels);
      });
      it("updates the translation of subsequent line numbers when lines are inserted or removed", function() {
        var lineNumberNodes;
        editor.getBuffer().insert([0, 0], '\n\n');
        nextAnimationFrame();
        lineNumberNodes = componentNode.querySelectorAll('.line-number');
        expect(component.lineNumberNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNumberNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(3).offsetTop).toBe(3 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(4).offsetTop).toBe(4 * lineHeightInPixels);
        editor.getBuffer().insert([0, 0], '\n\n');
        nextAnimationFrame();
        expect(component.lineNumberNodeForScreenRow(0).offsetTop).toBe(0);
        expect(component.lineNumberNodeForScreenRow(1).offsetTop).toBe(1 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(2).offsetTop).toBe(2 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(3).offsetTop).toBe(3 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(4).offsetTop).toBe(4 * lineHeightInPixels);
        expect(component.lineNumberNodeForScreenRow(5).offsetTop).toBe(5 * lineHeightInPixels);
        return expect(component.lineNumberNodeForScreenRow(6).offsetTop).toBe(6 * lineHeightInPixels);
      });
      it("renders • characters for soft-wrapped lines", function() {
        editor.setSoftWrapped(true);
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 30 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
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
        nextAnimationFrame();
        for (screenRow = _i = 0; _i <= 8; screenRow = ++_i) {
          expect(component.lineNumberNodeForScreenRow(screenRow).textContent).toBe("" + nbsp + (screenRow + 1));
        }
        expect(component.lineNumberNodeForScreenRow(9).textContent).toBe("10");
        gutterNode = componentNode.querySelector('.gutter');
        initialGutterWidth = gutterNode.offsetWidth;
        editor.getBuffer()["delete"]([[1, 0], [2, 0]]);
        nextAnimationFrame();
        for (screenRow = _j = 0; _j <= 8; screenRow = ++_j) {
          expect(component.lineNumberNodeForScreenRow(screenRow).textContent).toBe("" + (screenRow + 1));
        }
        expect(gutterNode.offsetWidth).toBeLessThan(initialGutterWidth);
        editor.getBuffer().insert([0, 0], '\n\n');
        nextAnimationFrame();
        for (screenRow = _k = 0; _k <= 8; screenRow = ++_k) {
          expect(component.lineNumberNodeForScreenRow(screenRow).textContent).toBe("" + nbsp + (screenRow + 1));
        }
        expect(component.lineNumberNodeForScreenRow(9).textContent).toBe("10");
        return expect(gutterNode.offsetWidth).toBe(initialGutterWidth);
      });
      it("renders the .line-numbers div at the full height of the editor even if it's taller than its content", function() {
        wrapperNode.style.height = componentNode.offsetHeight + 100 + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
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
        nextAnimationFrame();
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
            nextAnimationFrame();
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
            nextAnimationFrame();
            expect(lineNumberHasClass(11, 'foldable')).toBe(true);
            editor.undo();
            nextAnimationFrame();
            return expect(lineNumberHasClass(11, 'foldable')).toBe(false);
          });
          return it("adds, updates and removes the folded class on the correct line number componentNodes", function() {
            editor.foldBufferRow(4);
            nextAnimationFrame();
            expect(lineNumberHasClass(4, 'folded')).toBe(true);
            editor.getBuffer().insert([0, 0], '\n');
            nextAnimationFrame();
            expect(lineNumberHasClass(4, 'folded')).toBe(false);
            expect(lineNumberHasClass(5, 'folded')).toBe(true);
            editor.unfoldBufferRow(5);
            nextAnimationFrame();
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
            nextAnimationFrame();
            expect(lineNumberHasClass(1, 'folded')).toBe(true);
            lineNumber = component.lineNumberNodeForScreenRow(1);
            target = lineNumber.querySelector('.icon-right');
            target.dispatchEvent(buildClickEvent(target));
            nextAnimationFrame();
            return expect(lineNumberHasClass(1, 'folded')).toBe(false);
          });
          return it("does not fold when the line number componentNode is clicked", function() {
            var lineNumber;
            lineNumber = component.lineNumberNodeForScreenRow(1);
            lineNumber.dispatchEvent(buildClickEvent(lineNumber));
            expect(nextAnimationFrame).toBe(noAnimationFrame);
            return expect(lineNumberHasClass(1, 'folded')).toBe(false);
          });
        });
      });
    });
    describe("cursor rendering", function() {
      it("renders the currently visible cursors, translated relative to the scroll position", function() {
        var cursor1, cursor2, cursor3, cursorNodes;
        cursor1 = editor.getLastCursor();
        cursor1.setScreenPosition([0, 5]);
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 20 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        expect(cursorNodes[0].offsetHeight).toBe(lineHeightInPixels);
        expect(cursorNodes[0].offsetWidth).toBe(charWidth);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate(" + (5 * charWidth) + "px, " + (0 * lineHeightInPixels) + "px)");
        cursor2 = editor.addCursorAtScreenPosition([8, 11]);
        cursor3 = editor.addCursorAtScreenPosition([4, 10]);
        nextAnimationFrame();
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(2);
        expect(cursorNodes[0].offsetTop).toBe(0);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate(" + (5 * charWidth) + "px, " + (0 * lineHeightInPixels) + "px)");
        expect(cursorNodes[1].style['-webkit-transform']).toBe("translate(" + (10 * charWidth) + "px, " + (4 * lineHeightInPixels) + "px)");
        verticalScrollbarNode.scrollTop = 4.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        nextAnimationFrame();
        horizontalScrollbarNode.scrollLeft = 3.5 * charWidth;
        horizontalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        nextAnimationFrame();
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(2);
        expect(cursorNodes[0].style['-webkit-transform']).toBe("translate(" + (11 * charWidth) + "px, " + (8 * lineHeightInPixels) + "px)");
        expect(cursorNodes[1].style['-webkit-transform']).toBe("translate(" + (10 * charWidth) + "px, " + (4 * lineHeightInPixels) + "px)");
        cursor3.destroy();
        nextAnimationFrame();
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        return expect(cursorNodes[0].style['-webkit-transform']).toBe("translate(" + (11 * charWidth) + "px, " + (8 * lineHeightInPixels) + "px)");
      });
      it("accounts for character widths when positioning cursors", function() {
        var cursor, cursorLocationTextNode, cursorRect, range, rangeRect;
        atom.config.set('editor.fontFamily', 'sans-serif');
        editor.setCursorScreenPosition([0, 16]);
        nextAnimationFrame();
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
        nextAnimationFrame();
        atom.themes.applyStylesheet('test', ".function.js {\n  font-weight: bold;\n}");
        nextAnimationFrame();
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
        nextAnimationFrame();
        cursorNode = componentNode.querySelector('.cursor');
        return expect(cursorNode.offsetWidth).toBe(charWidth);
      });
      it("gives the cursor a non-zero width even if it's inside atomic tokens", function() {
        var cursorNode;
        editor.setCursorScreenPosition([1, 0]);
        nextAnimationFrame();
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
        editor.moveRight();
        expect(cursorsNode.classList.contains('blink-off')).toBe(false);
        advanceClock(component.props.cursorBlinkResumeDelay);
        advanceClock(component.props.cursorBlinkPeriod / 2);
        return expect(cursorsNode.classList.contains('blink-off')).toBe(true);
      });
      it("does not render cursors that are associated with non-empty selections", function() {
        var cursorNodes;
        editor.setSelectedScreenRange([[0, 4], [4, 6]]);
        editor.addCursorAtScreenPosition([6, 8]);
        nextAnimationFrame();
        cursorNodes = componentNode.querySelectorAll('.cursor');
        expect(cursorNodes.length).toBe(1);
        return expect(cursorNodes[0].style['-webkit-transform']).toBe("translate(" + (8 * charWidth) + "px, " + (6 * lineHeightInPixels) + "px)");
      });
      it("updates cursor positions when the line height changes", function() {
        var cursorNode;
        editor.setCursorBufferPosition([1, 10]);
        component.setLineHeight(2);
        nextAnimationFrame();
        cursorNode = componentNode.querySelector('.cursor');
        return expect(cursorNode.style['-webkit-transform']).toBe("translate(" + (10 * editor.getDefaultCharWidth()) + "px, " + (editor.getLineHeightInPixels()) + "px)");
      });
      it("updates cursor positions when the font size changes", function() {
        var cursorNode;
        editor.setCursorBufferPosition([1, 10]);
        component.setFontSize(10);
        nextAnimationFrame();
        cursorNode = componentNode.querySelector('.cursor');
        return expect(cursorNode.style['-webkit-transform']).toBe("translate(" + (10 * editor.getDefaultCharWidth()) + "px, " + (editor.getLineHeightInPixels()) + "px)");
      });
      return it("updates cursor positions when the font family changes", function() {
        var cursorNode, left;
        editor.setCursorBufferPosition([1, 10]);
        component.setFontFamily('sans-serif');
        nextAnimationFrame();
        cursorNode = componentNode.querySelector('.cursor');
        left = editor.pixelPositionForScreenPosition([1, 10]).left;
        return expect(cursorNode.style['-webkit-transform']).toBe("translate(" + left + "px, " + (editor.getLineHeightInPixels()) + "px)");
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
        nextAnimationFrame();
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
        nextAnimationFrame();
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
        nextAnimationFrame();
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
        nextAnimationFrame();
        expect(editor.getSelections()[0].isEmpty()).toBe(true);
        expect(editor.getSelections()[1].isEmpty()).toBe(true);
        return expect(componentNode.querySelectorAll('.selection').length).toBe(0);
      });
      it("updates selections when the line height changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setLineHeight(2);
        nextAnimationFrame();
        selectionNode = componentNode.querySelector('.region');
        return expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
      });
      it("updates selections when the font size changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setFontSize(10);
        nextAnimationFrame();
        selectionNode = componentNode.querySelector('.region');
        expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
        return expect(selectionNode.offsetLeft).toBe(6 * editor.getDefaultCharWidth());
      });
      it("updates selections when the font family changes", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]]);
        component.setFontFamily('sans-serif');
        nextAnimationFrame();
        selectionNode = componentNode.querySelector('.region');
        expect(selectionNode.offsetTop).toBe(editor.getLineHeightInPixels());
        return expect(selectionNode.offsetLeft).toBe(editor.pixelPositionForScreenPosition([1, 6]).left);
      });
      return it("will flash the selection when flash:true is passed to editor::setSelectedBufferRange", function() {
        var selectionNode;
        editor.setSelectedBufferRange([[1, 6], [1, 10]], {
          flash: true
        });
        nextAnimationFrame();
        nextAnimationFrame();
        selectionNode = componentNode.querySelector('.selection');
        expect(selectionNode.classList.contains('flash')).toBe(true);
        advanceClock(editor.selectionFlashDuration);
        expect(selectionNode.classList.contains('flash')).toBe(false);
        editor.setSelectedBufferRange([[1, 5], [1, 7]], {
          flash: true
        });
        nextAnimationFrame();
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
        return nextAnimationFrame();
      });
      it("applies line decoration classes to lines and line numbers", function() {
        var marker2;
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(true);
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        marker2 = editor.displayBuffer.markBufferRange([[9, 0], [9, 0]]);
        editor.decorateMarker(marker2, {
          type: ['gutter', 'line'],
          "class": 'b'
        });
        nextAnimationFrame();
        verticalScrollbarNode.scrollTop = 2.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        nextAnimationFrame();
        expect(lineAndLineNumberHaveClass(9, 'b')).toBe(true);
        editor.foldBufferRow(5);
        nextAnimationFrame();
        expect(lineAndLineNumberHaveClass(9, 'b')).toBe(false);
        return expect(lineAndLineNumberHaveClass(6, 'b')).toBe(true);
      });
      it("only applies decorations to screen rows that are spanned by their marker when lines are soft-wrapped", function() {
        editor.setText("a line that wraps, ok");
        editor.setSoftWrapped(true);
        componentNode.style.width = 16 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        marker.destroy();
        marker = editor.markBufferRange([[0, 0], [0, 2]]);
        editor.decorateMarker(marker, {
          type: ['gutter', 'line'],
          "class": 'b'
        });
        nextAnimationFrame();
        expect(lineNumberHasClass(0, 'b')).toBe(true);
        expect(lineNumberHasClass(1, 'b')).toBe(false);
        marker.setBufferRange([[0, 0], [0, Infinity]]);
        nextAnimationFrame();
        expect(lineNumberHasClass(0, 'b')).toBe(true);
        return expect(lineNumberHasClass(1, 'b')).toBe(true);
      });
      it("updates decorations when markers move", function() {
        expect(lineAndLineNumberHaveClass(1, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(4, 'a')).toBe(false);
        editor.getBuffer().insert([0, 0], '\n');
        nextAnimationFrame();
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(4, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(5, 'a')).toBe(false);
        marker.setBufferRange([[4, 4], [6, 4]]);
        nextAnimationFrame();
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
        nextAnimationFrame();
        expect(lineNumberHasClass(1, 'a')).toBe(false);
        expect(lineNumberHasClass(2, 'a')).toBe(false);
        expect(lineNumberHasClass(3, 'a')).toBe(false);
        expect(lineNumberHasClass(4, 'a')).toBe(false);
        return expect(marker.getSubscriptionCount('changed')).toBe(0);
      });
      it("removes decorations when their marker is invalidated", function() {
        editor.getBuffer().insert([3, 2], 'n');
        nextAnimationFrame();
        expect(marker.isValid()).toBe(false);
        expect(lineAndLineNumberHaveClass(1, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(4, 'a')).toBe(false);
        editor.undo();
        nextAnimationFrame();
        expect(marker.isValid()).toBe(true);
        expect(lineAndLineNumberHaveClass(1, 'a')).toBe(false);
        expect(lineAndLineNumberHaveClass(2, 'a')).toBe(true);
        expect(lineAndLineNumberHaveClass(3, 'a')).toBe(true);
        return expect(lineAndLineNumberHaveClass(4, 'a')).toBe(false);
      });
      it("removes decorations when their marker is destroyed", function() {
        marker.destroy();
        nextAnimationFrame();
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
          nextAnimationFrame();
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
          nextAnimationFrame();
          expect(lineAndLineNumberHaveClass(2, 'only-empty')).toBe(false);
          expect(lineAndLineNumberHaveClass(3, 'only-empty')).toBe(false);
          marker.clearTail();
          nextAnimationFrame();
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
          nextAnimationFrame();
          expect(lineAndLineNumberHaveClass(2, 'only-non-empty')).toBe(true);
          expect(lineAndLineNumberHaveClass(3, 'only-non-empty')).toBe(true);
          marker.clearTail();
          nextAnimationFrame();
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
        return nextAnimationFrame();
      });
      it("does not render highlights for off-screen lines until they come on-screen", function() {
        var regionRect, regions;
        wrapperNode.style.height = 2.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        marker = editor.displayBuffer.markBufferRange([[9, 2], [9, 4]], {
          invalidate: 'inside'
        });
        editor.decorateMarker(marker, {
          type: 'highlight',
          "class": 'some-highlight'
        });
        nextAnimationFrame();
        expect(component.getRenderedRowRange()[1]).toBeLessThan(9);
        regions = componentNode.querySelectorAll('.some-highlight .region');
        expect(regions.length).toBe(0);
        verticalScrollbarNode.scrollTop = 3.5 * lineHeightInPixels;
        verticalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        nextAnimationFrame();
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
        nextAnimationFrame();
        regions = componentNode.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(0);
      });
      it("does not render a highlight that is within a fold", function() {
        editor.foldBufferRow(1);
        nextAnimationFrame();
        return expect(componentNode.querySelectorAll('.test-highlight').length).toBe(0);
      });
      it("removes highlights when a decoration's marker is destroyed", function() {
        var regions;
        marker.destroy();
        nextAnimationFrame();
        regions = componentNode.querySelectorAll('.test-highlight .region');
        return expect(regions.length).toBe(0);
      });
      it("only renders highlights when a decoration's marker is valid", function() {
        var regions;
        editor.getBuffer().insert([3, 2], 'n');
        nextAnimationFrame();
        expect(marker.isValid()).toBe(false);
        regions = componentNode.querySelectorAll('.test-highlight .region');
        expect(regions.length).toBe(0);
        editor.getBuffer().undo();
        nextAnimationFrame();
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
          nextAnimationFrame();
          expect(highlightNode.classList.contains('flash-class')).toBe(true);
          advanceClock(10);
          return expect(highlightNode.classList.contains('flash-class')).toBe(false);
        });
        return describe("when ::flash is called again before the first has finished", function() {
          return it("removes the class from the decoration highlight before adding it for the second ::flash call", function() {
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
          nextAnimationFrame();
          regionStyle = componentNode.querySelector('.test-highlight .region').style;
          newTop = parseInt(regionStyle.top);
          return expect(newTop).toBe(originalTop + lineHeightInPixels);
        });
        return it("moves rendered highlights when the marker is manually moved", function() {
          var regionStyle;
          regionStyle = componentNode.querySelector('.test-highlight .region').style;
          expect(parseInt(regionStyle.top)).toBe(2 * lineHeightInPixels);
          marker.setBufferRange([[5, 8], [5, 13]]);
          nextAnimationFrame();
          regionStyle = componentNode.querySelector('.test-highlight .region').style;
          return expect(parseInt(regionStyle.top)).toBe(5 * lineHeightInPixels);
        });
      });
      return describe("when a decoration is updated via Decoration::update", function() {
        return it("renders the decoration's new params", function() {
          expect(componentNode.querySelector('.test-highlight')).toBeTruthy();
          decoration.setProperties({
            type: 'highlight',
            "class": 'new-test-highlight'
          });
          nextAnimationFrame();
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
        nextAnimationFrame();
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        editor.setScrollTop(3 * lineHeightInPixels);
        editor.setScrollLeft(3 * charWidth);
        nextAnimationFrame();
        expect(inputNode.offsetTop).toBe(0);
        expect(inputNode.offsetLeft).toBe(0);
        editor.setCursorBufferPosition([5, 4]);
        nextAnimationFrame();
        expect(inputNode.offsetTop).toBe(0);
        expect(inputNode.offsetLeft).toBe(0);
        inputNode.focus();
        expect(inputNode.offsetTop).toBe((5 * lineHeightInPixels) - editor.getScrollTop());
        expect(inputNode.offsetLeft).toBe((4 * charWidth) - editor.getScrollLeft());
        inputNode.blur();
        expect(inputNode.offsetTop).toBe(0);
        expect(inputNode.offsetLeft).toBe(0);
        editor.setCursorBufferPosition([1, 2]);
        nextAnimationFrame();
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
            nextAnimationFrame();
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([4, 8])));
            nextAnimationFrame();
            return expect(editor.getCursorScreenPosition()).toEqual([4, 8]);
          });
        });
        describe("when the shift key is held down", function() {
          return it("selects to the nearest screen position", function() {
            editor.setCursorScreenPosition([3, 4]);
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 6]), {
              shiftKey: true
            }));
            nextAnimationFrame();
            return expect(editor.getSelectedScreenRange()).toEqual([[3, 4], [5, 6]]);
          });
        });
        return describe("when the command key is held down", function() {
          return it("adds a cursor at the nearest screen position", function() {
            editor.setCursorScreenPosition([3, 4]);
            linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([5, 6]), {
              metaKey: true
            }));
            nextAnimationFrame();
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
          expect(nextAnimationFrame).toBe(noAnimationFrame);
          return expect(editor.getSelectedScreenRange()).toEqual([[2, 4], [6, 8]]);
        });
      });
      describe("when a line is folded", function() {
        beforeEach(function() {
          editor.foldBufferRow(4);
          return nextAnimationFrame();
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
      return describe("when the horizontal scrollbar is interacted with", function() {
        return it("clicking on the scrollbar does not move the cursor", function() {
          var target;
          target = horizontalScrollbarNode;
          linesNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenPosition([4, 8]), {
            target: target
          }));
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
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
        return it("selects the clicked row", function() {
          gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(4)));
          return expect(editor.getSelectedScreenRange()).toEqual([[4, 0], [5, 0]]);
        });
      });
      describe("when the gutter is meta-clicked", function() {
        return it("creates a new selection for the clicked row", function() {
          editor.setSelectedScreenRange([[3, 0], [3, 2]]);
          gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(4), {
            metaKey: true
          }));
          expect(editor.getSelectedScreenRanges()).toEqual([[[3, 0], [3, 2]], [[4, 0], [5, 0]]]);
          gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(6), {
            metaKey: true
          }));
          return expect(editor.getSelectedScreenRanges()).toEqual([[[3, 0], [3, 2]], [[4, 0], [5, 0]], [[6, 0], [7, 0]]]);
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
      describe("when the gutter is meta-clicked and dragged", function() {
        beforeEach(function() {
          return editor.setSelectedScreenRange([[3, 0], [3, 2]]);
        });
        describe("when dragging downward", function() {
          it("selects the rows between the start and end of the drag", function() {
            gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(4), {
              metaKey: true
            }));
            gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(6), {
              metaKey: true
            }));
            nextAnimationFrame();
            gutterNode.dispatchEvent(buildMouseEvent('mouseup', clientCoordinatesForScreenRowInGutter(6), {
              metaKey: true
            }));
            return expect(editor.getSelectedScreenRanges()).toEqual([[[3, 0], [3, 2]], [[4, 0], [7, 0]]]);
          });
          return it("merges overlapping selections", function() {
            gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(2), {
              metaKey: true
            }));
            gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(6), {
              metaKey: true
            }));
            nextAnimationFrame();
            gutterNode.dispatchEvent(buildMouseEvent('mouseup', clientCoordinatesForScreenRowInGutter(6), {
              metaKey: true
            }));
            return expect(editor.getSelectedScreenRanges()).toEqual([[[2, 0], [7, 0]]]);
          });
        });
        return describe("when dragging upward", function() {
          it("selects the rows between the start and end of the drag", function() {
            gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(6), {
              metaKey: true
            }));
            gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(4), {
              metaKey: true
            }));
            nextAnimationFrame();
            gutterNode.dispatchEvent(buildMouseEvent('mouseup', clientCoordinatesForScreenRowInGutter(4), {
              metaKey: true
            }));
            return expect(editor.getSelectedScreenRanges()).toEqual([[[3, 0], [3, 2]], [[4, 0], [7, 0]]]);
          });
          return it("merges overlapping selections", function() {
            gutterNode.dispatchEvent(buildMouseEvent('mousedown', clientCoordinatesForScreenRowInGutter(6), {
              metaKey: true
            }));
            gutterNode.dispatchEvent(buildMouseEvent('mousemove', clientCoordinatesForScreenRowInGutter(2), {
              metaKey: true
            }));
            nextAnimationFrame();
            gutterNode.dispatchEvent(buildMouseEvent('mouseup', clientCoordinatesForScreenRowInGutter(2), {
              metaKey: true
            }));
            return expect(editor.getSelectedScreenRanges()).toEqual([[[2, 0], [7, 0]]]);
          });
        });
      });
      return describe("when the gutter is shift-clicked and dragged", function() {
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
        cursor = editor.getLastCursor();
        return cursor.setScreenPosition([0, 0]);
      });
      return it("adds the 'has-selection' class to the editor when there is a selection", function() {
        expect(componentNode.classList.contains('has-selection')).toBe(false);
        editor.selectDown();
        nextAnimationFrame();
        expect(componentNode.classList.contains('has-selection')).toBe(true);
        cursor.moveDown();
        nextAnimationFrame();
        return expect(componentNode.classList.contains('has-selection')).toBe(false);
      });
    });
    describe("scrolling", function() {
      it("updates the vertical scrollbar when the scrollTop is changed in the model", function() {
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        expect(verticalScrollbarNode.scrollTop).toBe(0);
        editor.setScrollTop(10);
        nextAnimationFrame();
        return expect(verticalScrollbarNode.scrollTop).toBe(10);
      });
      it("updates the horizontal scrollbar and the x transform of the lines based on the scrollLeft of the model", function() {
        var linesNode;
        componentNode.style.width = 30 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        linesNode = componentNode.querySelector('.lines');
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(0px, 0px, 0px)");
        expect(horizontalScrollbarNode.scrollLeft).toBe(0);
        editor.setScrollLeft(100);
        nextAnimationFrame();
        expect(linesNode.style['-webkit-transform']).toBe("translate3d(-100px, 0px, 0px)");
        return expect(horizontalScrollbarNode.scrollLeft).toBe(100);
      });
      it("updates the scrollLeft of the model when the scrollLeft of the horizontal scrollbar changes", function() {
        componentNode.style.width = 30 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        expect(editor.getScrollLeft()).toBe(0);
        horizontalScrollbarNode.scrollLeft = 100;
        horizontalScrollbarNode.dispatchEvent(new UIEvent('scroll'));
        nextAnimationFrame();
        return expect(editor.getScrollLeft()).toBe(100);
      });
      it("does not obscure the last line with the horizontal scrollbar", function() {
        var bottomOfEditor, bottomOfLastLine, lastLineNode, topOfHorizontalScrollbar;
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        editor.setScrollBottom(editor.getScrollHeight());
        nextAnimationFrame();
        lastLineNode = component.lineNodeForScreenRow(editor.getLastScreenRow());
        bottomOfLastLine = lastLineNode.getBoundingClientRect().bottom;
        topOfHorizontalScrollbar = horizontalScrollbarNode.getBoundingClientRect().top;
        expect(bottomOfLastLine).toBe(topOfHorizontalScrollbar);
        wrapperNode.style.width = 100 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
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
        nextAnimationFrame();
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
        nextAnimationFrame();
        expect(verticalScrollbarNode.style.display).toBe('');
        expect(horizontalScrollbarNode.style.display).toBe('none');
        componentNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        expect(verticalScrollbarNode.style.display).toBe('');
        expect(horizontalScrollbarNode.style.display).toBe('');
        wrapperNode.style.height = 20 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        expect(verticalScrollbarNode.style.display).toBe('none');
        return expect(horizontalScrollbarNode.style.display).toBe('');
      });
      it("makes the dummy scrollbar divs only as tall/wide as the actual scrollbars", function() {
        var scrollbarCornerNode;
        wrapperNode.style.height = 4 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        atom.themes.applyStylesheet("test", "::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}");
        nextAnimationFrame();
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
        nextAnimationFrame();
        expect(verticalScrollbarNode.style.bottom).toBe('');
        expect(horizontalScrollbarNode.style.right).toBe(verticalScrollbarNode.offsetWidth + 'px');
        expect(scrollbarCornerNode.style.display).toBe('none');
        componentNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        expect(verticalScrollbarNode.style.bottom).toBe(horizontalScrollbarNode.offsetHeight + 'px');
        expect(horizontalScrollbarNode.style.right).toBe(verticalScrollbarNode.offsetWidth + 'px');
        expect(scrollbarCornerNode.style.display).toBe('');
        wrapperNode.style.height = 20 * lineHeightInPixels + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
        expect(verticalScrollbarNode.style.bottom).toBe(horizontalScrollbarNode.offsetHeight + 'px');
        expect(horizontalScrollbarNode.style.right).toBe('');
        return expect(scrollbarCornerNode.style.display).toBe('none');
      });
      return it("accounts for the width of the gutter in the scrollWidth of the horizontal scrollbar", function() {
        var gutterNode;
        gutterNode = componentNode.querySelector('.gutter');
        componentNode.style.width = 10 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
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
          return nextAnimationFrame();
        });
        it("updates the scrollLeft or scrollTop on mousewheel events depending on which delta is greater (x or y)", function() {
          expect(verticalScrollbarNode.scrollTop).toBe(0);
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -5,
            wheelDeltaY: -10
          }));
          nextAnimationFrame();
          expect(verticalScrollbarNode.scrollTop).toBe(10);
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -15,
            wheelDeltaY: -5
          }));
          nextAnimationFrame();
          expect(verticalScrollbarNode.scrollTop).toBe(10);
          return expect(horizontalScrollbarNode.scrollLeft).toBe(15);
        });
        it("updates the scrollLeft or scrollTop according to the scroll sensitivity", function() {
          atom.config.set('editor.scrollSensitivity', 50);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -5,
            wheelDeltaY: -10
          }));
          nextAnimationFrame();
          expect(horizontalScrollbarNode.scrollLeft).toBe(0);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: -15,
            wheelDeltaY: -5
          }));
          nextAnimationFrame();
          expect(verticalScrollbarNode.scrollTop).toBe(5);
          return expect(horizontalScrollbarNode.scrollLeft).toBe(7);
        });
        it("uses the previous scrollSensitivity when the value is not an int", function() {
          atom.config.set('editor.scrollSensitivity', 'nope');
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -10
          }));
          nextAnimationFrame();
          return expect(verticalScrollbarNode.scrollTop).toBe(10);
        });
        return it("parses negative scrollSensitivity values as positive", function() {
          atom.config.set('editor.scrollSensitivity', -50);
          componentNode.dispatchEvent(new WheelEvent('mousewheel', {
            wheelDeltaX: 0,
            wheelDeltaY: -10
          }));
          nextAnimationFrame();
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
          nextAnimationFrame();
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
          nextAnimationFrame();
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
          expect(nextAnimationFrame).toBe(noAnimationFrame);
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
          expect(nextAnimationFrame).toBe(noAnimationFrame);
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
          nextAnimationFrame();
          return expect(componentNode.contains(lineNumberNode)).toBe(true);
        });
      });
      return it("only prevents the default action of the mousewheel event if it actually lead to scrolling", function() {
        var maxScrollLeft, maxScrollTop;
        spyOn(WheelEvent.prototype, 'preventDefault').andCallThrough();
        wrapperNode.style.height = 4.5 * lineHeightInPixels + 'px';
        wrapperNode.style.width = 20 * charWidth + 'px';
        component.measureHeightAndWidth();
        nextAnimationFrame();
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
        nextAnimationFrame();
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
        nextAnimationFrame();
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
        nextAnimationFrame();
        expect(editor.lineTextForBufferRow(0)).toBe('xvar quicksort = function () {');
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'y',
          target: inputNode
        }));
        nextAnimationFrame();
        return expect(editor.lineTextForBufferRow(0)).toBe('xyvar quicksort = function () {');
      });
      it("replaces the last character if the length of the input's value doesn't increase, as occurs with the accented character menu", function() {
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'u',
          target: inputNode
        }));
        nextAnimationFrame();
        expect(editor.lineTextForBufferRow(0)).toBe('uvar quicksort = function () {');
        inputNode.setSelectionRange(0, 1);
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'ü',
          target: inputNode
        }));
        nextAnimationFrame();
        return expect(editor.lineTextForBufferRow(0)).toBe('üvar quicksort = function () {');
      });
      it("does not handle input events when input is disabled", function() {
        component.setInputEnabled(false);
        componentNode.dispatchEvent(buildTextInputEvent({
          data: 'x',
          target: inputNode
        }));
        expect(nextAnimationFrame).toBe(noAnimationFrame);
        return expect(editor.lineTextForBufferRow(0)).toBe('var quicksort = function () {');
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
            expect(editor.lineTextForBufferRow(0)).toBe('svar quicksort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineTextForBufferRow(0)).toBe('sdvar quicksort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildTextInputEvent({
              data: '速度',
              target: inputNode
            }));
            return expect(editor.lineTextForBufferRow(0)).toBe('速度var quicksort = function () {');
          });
          it("reverts back to the original text when the completion helper is dismissed", function() {
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineTextForBufferRow(0)).toBe('svar quicksort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineTextForBufferRow(0)).toBe('sdvar quicksort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            return expect(editor.lineTextForBufferRow(0)).toBe('var quicksort = function () {');
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
            expect(editor.lineTextForBufferRow(0)).toBe("'var quicksort = function () {");
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildTextInputEvent({
              data: 'á',
              target: inputNode
            }));
            expect(editor.lineTextForBufferRow(0)).toBe("ávar quicksort = function () {");
            inputNode.value = "'";
            inputNode.setSelectionRange(0, 1);
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: "'",
              target: inputNode
            }));
            expect(editor.lineTextForBufferRow(0)).toBe("á'var quicksort = function () {");
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildTextInputEvent({
              data: 'á',
              target: inputNode
            }));
            return expect(editor.lineTextForBufferRow(0)).toBe("áávar quicksort = function () {");
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
            expect(editor.lineTextForBufferRow(0)).toBe('var ssort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineTextForBufferRow(0)).toBe('var sdsort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildTextInputEvent({
              data: '速度',
              target: inputNode
            }));
            return expect(editor.lineTextForBufferRow(0)).toBe('var 速度sort = function () {');
          });
          return it("reverts back to the original text when the completion helper is dismissed", function() {
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: inputNode
            }));
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 's',
              target: inputNode
            }));
            expect(editor.lineTextForBufferRow(0)).toBe('var ssort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: 'sd',
              target: inputNode
            }));
            expect(editor.lineTextForBufferRow(0)).toBe('var sdsort = function () {');
            componentNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: inputNode
            }));
            return expect(editor.lineTextForBufferRow(0)).toBe('var quicksort = function () {');
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
          wrapperView = new TextEditorView(editor, {
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
          editor.getBuffer().insert([0, 0], 'a');
          wrapperView.show();
          editor.setCursorBufferPosition([0, Infinity]);
          nextAnimationFrame();
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
          nextAnimationFrame();
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
          wrapperView.show();
          editor.setCursorBufferPosition([0, Infinity]);
          nextAnimationFrame();
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
          nextAnimationFrame();
          wrapperView.show();
          return expect(componentNode.querySelector('.cursor').style['-webkit-transform']).toBe("translate(" + (9 * charWidth) + "px, 0px)");
        });
      });
    });
    describe("soft wrapping", function() {
      beforeEach(function() {
        editor.setSoftWrapped(true);
        return nextAnimationFrame();
      });
      it("updates the wrap location when the editor is resized", function() {
        var gutterWidth, newHeight;
        newHeight = 4 * editor.getLineHeightInPixels() + "px";
        expect(parseInt(newHeight)).toBeLessThan(wrapperNode.offsetHeight);
        wrapperNode.style.height = newHeight;
        advanceClock(component.domPollingInterval);
        nextAnimationFrame();
        expect(componentNode.querySelectorAll('.line')).toHaveLength(4 + lineOverdrawMargin + 1);
        gutterWidth = componentNode.querySelector('.gutter').offsetWidth;
        componentNode.style.width = gutterWidth + 14 * charWidth + editor.getVerticalScrollbarWidth() + 'px';
        advanceClock(component.domPollingInterval);
        nextAnimationFrame();
        return expect(componentNode.querySelector('.line').textContent).toBe("var quicksort ");
      });
      return it("accounts for the scroll view's padding when determining the wrap location", function() {
        var scrollViewNode;
        scrollViewNode = componentNode.querySelector('.scroll-view');
        scrollViewNode.style.paddingLeft = 20 + 'px';
        componentNode.style.width = 30 * charWidth + 'px';
        advanceClock(component.domPollingInterval);
        nextAnimationFrame();
        return expect(component.lineNodeForScreenRow(0).textContent).toBe("var quicksort = ");
      });
    });
    describe("default decorations", function() {
      it("applies .cursor-line decorations for line numbers overlapping selections", function() {
        editor.setCursorScreenPosition([4, 4]);
        nextAnimationFrame();
        expect(lineNumberHasClass(3, 'cursor-line')).toBe(false);
        expect(lineNumberHasClass(4, 'cursor-line')).toBe(true);
        expect(lineNumberHasClass(5, 'cursor-line')).toBe(false);
        editor.setSelectedScreenRange([[3, 4], [4, 4]]);
        nextAnimationFrame();
        expect(lineNumberHasClass(3, 'cursor-line')).toBe(true);
        expect(lineNumberHasClass(4, 'cursor-line')).toBe(true);
        editor.setSelectedScreenRange([[3, 4], [4, 0]]);
        nextAnimationFrame();
        expect(lineNumberHasClass(3, 'cursor-line')).toBe(true);
        return expect(lineNumberHasClass(4, 'cursor-line')).toBe(false);
      });
      it("does not apply .cursor-line to the last line of a selection if it's empty", function() {
        editor.setSelectedScreenRange([[3, 4], [5, 0]]);
        nextAnimationFrame();
        expect(lineNumberHasClass(3, 'cursor-line')).toBe(true);
        expect(lineNumberHasClass(4, 'cursor-line')).toBe(true);
        return expect(lineNumberHasClass(5, 'cursor-line')).toBe(false);
      });
      it("applies .cursor-line decorations for lines containing the cursor in non-empty selections", function() {
        editor.setCursorScreenPosition([4, 4]);
        nextAnimationFrame();
        expect(lineHasClass(3, 'cursor-line')).toBe(false);
        expect(lineHasClass(4, 'cursor-line')).toBe(true);
        expect(lineHasClass(5, 'cursor-line')).toBe(false);
        editor.setSelectedScreenRange([[3, 4], [4, 4]]);
        nextAnimationFrame();
        expect(lineHasClass(2, 'cursor-line')).toBe(false);
        expect(lineHasClass(3, 'cursor-line')).toBe(false);
        expect(lineHasClass(4, 'cursor-line')).toBe(false);
        return expect(lineHasClass(5, 'cursor-line')).toBe(false);
      });
      return it("applies .cursor-line-no-selection to line numbers for rows containing the cursor when the selection is empty", function() {
        editor.setCursorScreenPosition([4, 4]);
        nextAnimationFrame();
        expect(lineNumberHasClass(4, 'cursor-line-no-selection')).toBe(true);
        editor.setSelectedScreenRange([[3, 4], [4, 4]]);
        nextAnimationFrame();
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
      it("does not have an opaque background on lines", function() {
        return expect(component.refs.lines.getDOMNode().getAttribute('style')).not.toContain('background-color');
      });
      it("does not render invisible characters", function() {
        atom.config.set('editor.invisibles', {
          eol: 'E'
        });
        atom.config.set('editor.showInvisibles', true);
        nextAnimationFrame();
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
        editor.setPlaceholderText('Hello World');
        expect(componentNode.querySelector('.placeholder-text')).toBeNull();
        editor.setText('');
        nextAnimationFrame();
        expect(componentNode.querySelector('.placeholder-text').textContent).toBe("Hello World");
        editor.setText('hey');
        nextAnimationFrame();
        return expect(componentNode.querySelector('.placeholder-text')).toBeNull();
      });
    });
    describe("legacy editor compatibility", function() {
      it("triggers the screen-lines-changed event before the editor:display-update event", function() {
        var callingOrder;
        editor.setSoftWrapped(true);
        callingOrder = [];
        editor.onDidChange(function() {
          return callingOrder.push('screen-lines-changed');
        });
        wrapperView.on('editor:display-updated', function() {
          return callingOrder.push('editor:display-updated');
        });
        editor.insertText("HELLO! HELLO!\n HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! HELLO! ");
        nextAnimationFrame();
        return expect(callingOrder).toEqual(['screen-lines-changed', 'editor:display-updated']);
      });
      return it("works with the ::setEditorHeightInLines and ::setEditorWidthInChars helpers", function() {
        setEditorHeightInLines(wrapperView, 7);
        expect(componentNode.offsetHeight).toBe(lineHeightInPixels * 7);
        setEditorWidthInChars(wrapperView, 10);
        return expect(componentNode.querySelector('.scroll-view').offsetWidth).toBe(charWidth * 10);
      });
    });
    describe("grammar data attributes", function() {
      return it("adds and updates the grammar data attribute based on the current grammar", function() {
        expect(wrapperNode.dataset.grammar).toBe('source js');
        editor.setGrammar(atom.syntax.nullGrammar);
        return expect(wrapperNode.dataset.grammar).toBe('text plain null-grammar');
      });
    });
    describe("detaching and reattaching the editor (regression)", function() {
      return it("does not throw an exception", function() {
        wrapperView.detach();
        return wrapperView.attachToDom();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRFQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFdBQUEsTUFBRCxFQUFTLFlBQUEsT0FBVCxFQUFrQixZQUFBLE9BQWxCLEVBQTJCLFNBQUEsSUFEM0IsQ0FBQTs7QUFBQSxFQUdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHlCQUFSLENBSGpCLENBQUE7O0FBQUEsRUFJQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsOEJBQVIsQ0FKdEIsQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxNQUFNLENBQUMsWUFBUCxDQUFvQixHQUFwQixDQUxQLENBQUE7O0FBQUEsRUFPQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFFBQUEsdVpBQUE7QUFBQSxJQUFBLE9BQTRILEVBQTVILEVBQUMscUJBQUQsRUFBYyxnQkFBZCxFQUFzQixxQkFBdEIsRUFBbUMscUJBQW5DLEVBQWdELG1CQUFoRCxFQUEyRCx1QkFBM0QsRUFBMEUsK0JBQTFFLEVBQWlHLGlDQUFqRyxDQUFBO0FBQUEsSUFDQSxRQUE0RixFQUE1RixFQUFDLDZCQUFELEVBQXFCLG9CQUFyQixFQUFnQyw2QkFBaEMsRUFBb0QsMkJBQXBELEVBQXNFLDZCQUR0RSxDQUFBO0FBQUEsSUFHQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxrQkFBQSxHQUFxQixDQUFyQixDQUFBO0FBQUEsTUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixxQkFBOUIsRUFEYztNQUFBLENBQWhCLENBRkEsQ0FBQTtBQUFBLE1BS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/text-editor-component-spec.coffee