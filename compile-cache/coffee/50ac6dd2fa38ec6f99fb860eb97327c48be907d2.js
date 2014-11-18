(function() {
  var TextBuffer, TokenizedBuffer, _;

  TokenizedBuffer = require('../src/tokenized-buffer');

  TextBuffer = require('text-buffer');

  _ = require('underscore-plus');

  describe("TokenizedBuffer", function() {
    var buffer, changeHandler, fullyTokenize, startTokenizing, tokenizedBuffer, _ref;
    _ref = [], tokenizedBuffer = _ref[0], buffer = _ref[1], changeHandler = _ref[2];
    beforeEach(function() {
      TokenizedBuffer.prototype.chunkSize = 5;
      jasmine.unspy(TokenizedBuffer.prototype, 'tokenizeInBackground');
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
    });
    afterEach(function() {
      return tokenizedBuffer != null ? tokenizedBuffer.destroy() : void 0;
    });
    startTokenizing = function(tokenizedBuffer) {
      return tokenizedBuffer.setVisible(true);
    };
    fullyTokenize = function(tokenizedBuffer) {
      tokenizedBuffer.setVisible(true);
      while (tokenizedBuffer.firstInvalidRow() != null) {
        advanceClock();
      }
      return changeHandler != null ? changeHandler.reset() : void 0;
    };
    describe("when the buffer is destroyed", function() {
      beforeEach(function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        return startTokenizing(tokenizedBuffer);
      });
      return it("stops tokenization", function() {
        tokenizedBuffer.destroy();
        spyOn(tokenizedBuffer, 'tokenizeNextChunk');
        advanceClock();
        return expect(tokenizedBuffer.tokenizeNextChunk).not.toHaveBeenCalled();
      });
    });
    describe("when the buffer contains soft-tabs", function() {
      beforeEach(function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        startTokenizing(tokenizedBuffer);
        return tokenizedBuffer.onDidChange(changeHandler = jasmine.createSpy('changeHandler'));
      });
      afterEach(function() {
        tokenizedBuffer.destroy();
        return buffer.release();
      });
      describe("on construction", function() {
        return it("initially creates un-tokenized screen lines, then tokenizes lines chunk at a time in the background", function() {
          var line0, line11;
          line0 = tokenizedBuffer.tokenizedLineForRow(0);
          expect(line0.tokens.length).toBe(1);
          expect(line0.tokens[0]).toEqual({
            value: line0.text,
            scopes: ['source.js']
          });
          line11 = tokenizedBuffer.tokenizedLineForRow(11);
          expect(line11.tokens.length).toBe(2);
          expect(line11.tokens[0]).toEqual({
            value: "  ",
            scopes: ['source.js'],
            isAtomic: true
          });
          expect(line11.tokens[1]).toEqual({
            value: "return sort(Array.apply(this, arguments));",
            scopes: ['source.js']
          });
          expect(tokenizedBuffer.tokenizedLineForRow(0).ruleStack).toBeUndefined();
          advanceClock();
          expect(tokenizedBuffer.tokenizedLineForRow(0).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.tokenizedLineForRow(4).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.tokenizedLineForRow(5).ruleStack != null).toBeFalsy();
          expect(changeHandler).toHaveBeenCalledWith({
            start: 0,
            end: 4,
            delta: 0
          });
          changeHandler.reset();
          advanceClock();
          expect(tokenizedBuffer.tokenizedLineForRow(5).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.tokenizedLineForRow(9).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.tokenizedLineForRow(10).ruleStack != null).toBeFalsy();
          expect(changeHandler).toHaveBeenCalledWith({
            start: 5,
            end: 9,
            delta: 0
          });
          changeHandler.reset();
          advanceClock();
          expect(tokenizedBuffer.tokenizedLineForRow(10).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.tokenizedLineForRow(12).ruleStack != null).toBeTruthy();
          return expect(changeHandler).toHaveBeenCalledWith({
            start: 10,
            end: 12,
            delta: 0
          });
        });
      });
      describe("when the buffer is partially tokenized", function() {
        beforeEach(function() {
          advanceClock();
          return changeHandler.reset();
        });
        describe("when there is a buffer change inside the tokenized region", function() {
          describe("when lines are added", function() {
            return it("pushes the invalid rows down", function() {
              expect(tokenizedBuffer.firstInvalidRow()).toBe(5);
              buffer.insert([1, 0], '\n\n');
              changeHandler.reset();
              expect(tokenizedBuffer.firstInvalidRow()).toBe(7);
              advanceClock();
              return expect(changeHandler).toHaveBeenCalledWith({
                start: 7,
                end: 11,
                delta: 0
              });
            });
          });
          describe("when lines are removed", function() {
            return it("pulls the invalid rows up", function() {
              expect(tokenizedBuffer.firstInvalidRow()).toBe(5);
              buffer["delete"]([[1, 0], [3, 0]]);
              changeHandler.reset();
              expect(tokenizedBuffer.firstInvalidRow()).toBe(3);
              advanceClock();
              return expect(changeHandler).toHaveBeenCalledWith({
                start: 3,
                end: 7,
                delta: 0
              });
            });
          });
          return describe("when the change invalidates all the lines before the current invalid region", function() {
            return it("retokenizes the invalidated lines and continues into the valid region", function() {
              expect(tokenizedBuffer.firstInvalidRow()).toBe(5);
              buffer.insert([2, 0], '/*');
              changeHandler.reset();
              expect(tokenizedBuffer.firstInvalidRow()).toBe(3);
              advanceClock();
              expect(changeHandler).toHaveBeenCalledWith({
                start: 3,
                end: 7,
                delta: 0
              });
              return expect(tokenizedBuffer.firstInvalidRow()).toBe(8);
            });
          });
        });
        describe("when there is a buffer change surrounding an invalid row", function() {
          return it("pushes the invalid row to the end of the change", function() {
            buffer.setTextInRange([[4, 0], [6, 0]], "\n\n\n");
            changeHandler.reset();
            expect(tokenizedBuffer.firstInvalidRow()).toBe(8);
            return advanceClock();
          });
        });
        return describe("when there is a buffer change inside an invalid region", function() {
          return it("does not attempt to tokenize the lines in the change, and preserves the existing invalid row", function() {
            expect(tokenizedBuffer.firstInvalidRow()).toBe(5);
            buffer.setTextInRange([[6, 0], [7, 0]], "\n\n\n");
            expect(tokenizedBuffer.tokenizedLineForRow(6).ruleStack != null).toBeFalsy();
            expect(tokenizedBuffer.tokenizedLineForRow(7).ruleStack != null).toBeFalsy();
            changeHandler.reset();
            return expect(tokenizedBuffer.firstInvalidRow()).toBe(5);
          });
        });
      });
      return describe("when the buffer is fully tokenized", function() {
        beforeEach(function() {
          return fullyTokenize(tokenizedBuffer);
        });
        describe("when there is a buffer change that is smaller than the chunk size", function() {
          describe("when lines are updated, but none are added or removed", function() {
            it("updates tokens to reflect the change", function() {
              var event;
              buffer.setTextInRange([[0, 0], [2, 0]], "foo()\n7\n");
              expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1]).toEqual({
                value: '(',
                scopes: ['source.js', 'meta.brace.round.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[0]).toEqual({
                value: '7',
                scopes: ['source.js', 'constant.numeric.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[2]).toEqual({
                value: 'if',
                scopes: ['source.js', 'keyword.control.js']
              });
              expect(changeHandler).toHaveBeenCalled();
              event = changeHandler.argsForCall[0][0];
              delete event.bufferChange;
              return expect(event).toEqual({
                start: 0,
                end: 2,
                delta: 0
              });
            });
            describe("when the change invalidates the tokenization of subsequent lines", function() {
              return it("schedules the invalidated lines to be tokenized in the background", function() {
                var event;
                buffer.insert([5, 30], '/* */');
                changeHandler.reset();
                buffer.insert([2, 0], '/*');
                expect(tokenizedBuffer.tokenizedLineForRow(3).tokens[0].scopes).toEqual(['source.js']);
                expect(changeHandler).toHaveBeenCalled();
                event = changeHandler.argsForCall[0][0];
                delete event.bufferChange;
                expect(event).toEqual({
                  start: 2,
                  end: 2,
                  delta: 0
                });
                changeHandler.reset();
                advanceClock();
                expect(tokenizedBuffer.tokenizedLineForRow(3).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
                expect(tokenizedBuffer.tokenizedLineForRow(4).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
                expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
                expect(changeHandler).toHaveBeenCalled();
                event = changeHandler.argsForCall[0][0];
                delete event.bufferChange;
                return expect(event).toEqual({
                  start: 3,
                  end: 5,
                  delta: 0
                });
              });
            });
            return it("resumes highlighting with the state of the previous line", function() {
              buffer.insert([0, 0], '/*');
              buffer.insert([5, 0], '*/');
              buffer.insert([1, 0], 'var ');
              return expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
            });
          });
          describe("when lines are both updated and removed", function() {
            return it("updates tokens to reflect the change", function() {
              var event;
              buffer.setTextInRange([[1, 0], [3, 0]], "foo()");
              expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[0]).toEqual({
                value: 'var',
                scopes: ['source.js', 'storage.modifier.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[0]).toEqual({
                value: 'foo',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[6]).toEqual({
                value: '=',
                scopes: ['source.js', 'keyword.operator.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[2]).toEqual({
                value: 'while',
                scopes: ['source.js', 'keyword.control.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(3).tokens[4]).toEqual({
                value: '=',
                scopes: ['source.js', 'keyword.operator.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(4).tokens[4]).toEqual({
                value: '<',
                scopes: ['source.js', 'keyword.operator.js']
              });
              expect(changeHandler).toHaveBeenCalled();
              event = changeHandler.argsForCall[0][0];
              delete event.bufferChange;
              return expect(event).toEqual({
                start: 1,
                end: 3,
                delta: -2
              });
            });
          });
          describe("when the change invalidates the tokenization of subsequent lines", function() {
            return it("schedules the invalidated lines to be tokenized in the background", function() {
              var event;
              buffer.insert([5, 30], '/* */');
              changeHandler.reset();
              buffer.setTextInRange([[2, 0], [3, 0]], '/*');
              expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[0].scopes).toEqual(['source.js', 'comment.block.js', 'punctuation.definition.comment.js']);
              expect(tokenizedBuffer.tokenizedLineForRow(3).tokens[0].scopes).toEqual(['source.js']);
              expect(changeHandler).toHaveBeenCalled();
              event = changeHandler.argsForCall[0][0];
              delete event.bufferChange;
              expect(event).toEqual({
                start: 2,
                end: 3,
                delta: -1
              });
              changeHandler.reset();
              advanceClock();
              expect(tokenizedBuffer.tokenizedLineForRow(3).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.tokenizedLineForRow(4).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(changeHandler).toHaveBeenCalled();
              event = changeHandler.argsForCall[0][0];
              delete event.bufferChange;
              return expect(event).toEqual({
                start: 3,
                end: 4,
                delta: 0
              });
            });
          });
          describe("when lines are both updated and inserted", function() {
            return it("updates tokens to reflect the change", function() {
              var event;
              buffer.setTextInRange([[1, 0], [2, 0]], "foo()\nbar()\nbaz()\nquux()");
              expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[0]).toEqual({
                value: 'var',
                scopes: ['source.js', 'storage.modifier.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[0]).toEqual({
                value: 'foo',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[0]).toEqual({
                value: 'bar',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(3).tokens[0]).toEqual({
                value: 'baz',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(4).tokens[0]).toEqual({
                value: 'quux',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(4).tokens[4]).toEqual({
                value: 'if',
                scopes: ['source.js', 'keyword.control.js']
              });
              expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[4]).toEqual({
                value: '=',
                scopes: ['source.js', 'keyword.operator.js']
              });
              expect(changeHandler).toHaveBeenCalled();
              event = changeHandler.argsForCall[0][0];
              delete event.bufferChange;
              return expect(event).toEqual({
                start: 1,
                end: 2,
                delta: 2
              });
            });
          });
          return describe("when the change invalidates the tokenization of subsequent lines", function() {
            return it("schedules the invalidated lines to be tokenized in the background", function() {
              var event;
              buffer.insert([5, 30], '/* */');
              changeHandler.reset();
              buffer.insert([2, 0], '/*\nabcde\nabcder');
              expect(changeHandler).toHaveBeenCalled();
              event = changeHandler.argsForCall[0][0];
              delete event.bufferChange;
              expect(event).toEqual({
                start: 2,
                end: 2,
                delta: 2
              });
              expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[0].scopes).toEqual(['source.js', 'comment.block.js', 'punctuation.definition.comment.js']);
              expect(tokenizedBuffer.tokenizedLineForRow(3).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.tokenizedLineForRow(4).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[0].scopes).toEqual(['source.js']);
              changeHandler.reset();
              advanceClock();
              expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.tokenizedLineForRow(6).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.tokenizedLineForRow(7).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.tokenizedLineForRow(8).tokens[0].scopes).not.toBe(['source.js', 'comment.block.js']);
              expect(changeHandler).toHaveBeenCalled();
              event = changeHandler.argsForCall[0][0];
              delete event.bufferChange;
              return expect(event).toEqual({
                start: 5,
                end: 7,
                delta: 0
              });
            });
          });
        });
        describe("when there is an insertion that is larger than the chunk size", function() {
          return it("tokenizes the initial chunk synchronously, then tokenizes the remaining lines in the background", function() {
            var commentBlock;
            commentBlock = _.multiplyString("// a comment\n", tokenizedBuffer.chunkSize + 2);
            buffer.insert([0, 0], commentBlock);
            expect(tokenizedBuffer.tokenizedLineForRow(0).ruleStack != null).toBeTruthy();
            expect(tokenizedBuffer.tokenizedLineForRow(4).ruleStack != null).toBeTruthy();
            expect(tokenizedBuffer.tokenizedLineForRow(5).ruleStack != null).toBeFalsy();
            advanceClock();
            expect(tokenizedBuffer.tokenizedLineForRow(5).ruleStack != null).toBeTruthy();
            return expect(tokenizedBuffer.tokenizedLineForRow(6).ruleStack != null).toBeTruthy();
          });
        });
        describe(".findOpeningBracket(closingBufferPosition)", function() {
          return it("returns the position of the matching bracket, skipping any nested brackets", function() {
            return expect(tokenizedBuffer.findOpeningBracket([9, 2])).toEqual([1, 29]);
          });
        });
        describe(".findClosingBracket(startBufferPosition)", function() {
          return it("returns the position of the matching bracket, skipping any nested brackets", function() {
            return expect(tokenizedBuffer.findClosingBracket([1, 29])).toEqual([9, 2]);
          });
        });
        return it("tokenizes leading whitespace based on the new tab length", function() {
          expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[0].isAtomic).toBeTruthy();
          expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[0].value).toBe("  ");
          expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[1].isAtomic).toBeTruthy();
          expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[1].value).toBe("  ");
          tokenizedBuffer.setTabLength(4);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[0].isAtomic).toBeTruthy();
          expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[0].value).toBe("    ");
          expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[1].isAtomic).toBeFalsy();
          return expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[1].value).toBe("  current ");
        });
      });
    });
    describe("when the buffer contains hard-tabs", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          buffer = atom.project.bufferForPathSync('sample-with-tabs.coffee');
          tokenizedBuffer = new TokenizedBuffer({
            buffer: buffer
          });
          return startTokenizing(tokenizedBuffer);
        });
      });
      afterEach(function() {
        tokenizedBuffer.destroy();
        return buffer.release();
      });
      return describe("when the buffer is fully tokenized", function() {
        beforeEach(function() {
          return fullyTokenize(tokenizedBuffer);
        });
        it("renders each tab as its own atomic token with a value of size tabLength", function() {
          var screenLine0, tabAsSpaces, tokens;
          tabAsSpaces = _.multiplyString(' ', tokenizedBuffer.getTabLength());
          screenLine0 = tokenizedBuffer.tokenizedLineForRow(0);
          expect(screenLine0.text).toBe("# Econ 101" + tabAsSpaces);
          tokens = screenLine0.tokens;
          expect(tokens.length).toBe(4);
          expect(tokens[0].value).toBe("#");
          expect(tokens[1].value).toBe(" Econ 101");
          expect(tokens[2].value).toBe(tabAsSpaces);
          expect(tokens[2].scopes).toEqual(tokens[1].scopes);
          expect(tokens[2].isAtomic).toBeTruthy();
          expect(tokens[3].value).toBe("");
          return expect(tokenizedBuffer.tokenizedLineForRow(2).text).toBe("" + tabAsSpaces + " buy()" + tabAsSpaces + "while supply > demand");
        });
        return it("aligns the hard tabs to the correct tab stop column", function() {
          buffer.setText("1\t2 \t3\t4\n12\t3  \t4\t5\n123\t4   \t5\t6");
          tokenizedBuffer.setTabLength(4);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.tokenizedLineForRow(0).text).toBe("1   2   3   4");
          expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1].screenDelta).toBe(3);
          expect(tokenizedBuffer.tokenizedLineForRow(1).text).toBe("12  3   4   5");
          expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].screenDelta).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(2).text).toBe("123 4       5   6");
          expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].screenDelta).toBe(1);
          tokenizedBuffer.setTabLength(3);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.tokenizedLineForRow(0).text).toBe("1  2  3  4");
          expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1].screenDelta).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(1).text).toBe("12 3     4  5");
          expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].screenDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(2).text).toBe("123   4     5  6");
          expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].screenDelta).toBe(3);
          tokenizedBuffer.setTabLength(2);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.tokenizedLineForRow(0).text).toBe("1 2   3 4");
          expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1].screenDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(1).text).toBe("12  3   4 5");
          expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].screenDelta).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(2).text).toBe("123 4     5 6");
          expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].screenDelta).toBe(1);
          tokenizedBuffer.setTabLength(1);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.tokenizedLineForRow(0).text).toBe("1 2  3 4");
          expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[1].screenDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(1).text).toBe("12 3   4 5");
          expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].screenDelta).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(2).text).toBe("123 4    5 6");
          expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].bufferDelta).toBe(1);
          return expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].screenDelta).toBe(1);
        });
      });
    });
    describe("when the buffer contains UTF-8 surrogate pairs", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        return runs(function() {
          buffer = atom.project.bufferForPathSync('sample-with-pairs.js');
          buffer.setText("'abc\uD835\uDF97def'\n//\uD835\uDF97xyz");
          tokenizedBuffer = new TokenizedBuffer({
            buffer: buffer
          });
          return fullyTokenize(tokenizedBuffer);
        });
      });
      afterEach(function() {
        tokenizedBuffer.destroy();
        return buffer.release();
      });
      return it("renders each UTF-8 surrogate pair as its own atomic token", function() {
        var screenLine0, screenLine1, tokens;
        screenLine0 = tokenizedBuffer.tokenizedLineForRow(0);
        expect(screenLine0.text).toBe("'abc\uD835\uDF97def'");
        tokens = screenLine0.tokens;
        expect(tokens.length).toBe(5);
        expect(tokens[0].value).toBe("'");
        expect(tokens[1].value).toBe("abc");
        expect(tokens[2].value).toBe("\uD835\uDF97");
        expect(tokens[2].isAtomic).toBeTruthy();
        expect(tokens[3].value).toBe("def");
        expect(tokens[4].value).toBe("'");
        screenLine1 = tokenizedBuffer.tokenizedLineForRow(1);
        expect(screenLine1.text).toBe("//\uD835\uDF97xyz");
        tokens = screenLine1.tokens;
        expect(tokens.length).toBe(4);
        expect(tokens[0].value).toBe('//');
        expect(tokens[1].value).toBe('\uD835\uDF97');
        expect(tokens[1].value).toBeTruthy();
        expect(tokens[2].value).toBe('xyz');
        return expect(tokens[3].value).toBe('');
      });
    });
    describe("when the grammar is tokenized", function() {
      it("emits the `tokenized` event", function() {
        var editor, tokenizedHandler;
        editor = null;
        tokenizedHandler = jasmine.createSpy("tokenized handler");
        waitsForPromise(function() {
          return atom.project.open('sample.js').then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          tokenizedBuffer = editor.displayBuffer.tokenizedBuffer;
          tokenizedBuffer.onDidTokenize(tokenizedHandler);
          fullyTokenize(tokenizedBuffer);
          return expect(tokenizedHandler.callCount).toBe(1);
        });
      });
      return it("doesn't re-emit the `tokenized` event when it is re-tokenized", function() {
        var editor, tokenizedHandler;
        editor = null;
        tokenizedHandler = jasmine.createSpy("tokenized handler");
        waitsForPromise(function() {
          return atom.project.open('sample.js').then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          tokenizedBuffer = editor.displayBuffer.tokenizedBuffer;
          fullyTokenize(tokenizedBuffer);
          tokenizedBuffer.onDidTokenize(tokenizedHandler);
          editor.getBuffer().insert([0, 0], "'");
          fullyTokenize(tokenizedBuffer);
          return expect(tokenizedHandler).not.toHaveBeenCalled();
        });
      });
    });
    describe("when the grammar is updated because a grammar it includes is activated", function() {
      it("re-emits the `tokenized` event", function() {
        var editor, tokenizedHandler;
        editor = null;
        tokenizedBuffer = null;
        tokenizedHandler = jasmine.createSpy("tokenized handler");
        waitsForPromise(function() {
          return atom.project.open('coffee.coffee').then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          tokenizedBuffer = editor.displayBuffer.tokenizedBuffer;
          tokenizedBuffer.onDidTokenize(tokenizedHandler);
          fullyTokenize(tokenizedBuffer);
          return tokenizedHandler.reset();
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          fullyTokenize(tokenizedBuffer);
          return expect(tokenizedHandler.callCount).toBe(1);
        });
      });
      return it("retokenizes the buffer", function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-ruby-on-rails');
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-ruby');
        });
        runs(function() {
          var tokens;
          buffer = atom.project.bufferForPathSync();
          buffer.setText("<div class='name'><%= User.find(2).full_name %></div>");
          tokenizedBuffer = new TokenizedBuffer({
            buffer: buffer
          });
          tokenizedBuffer.setGrammar(atom.syntax.selectGrammar('test.erb'));
          fullyTokenize(tokenizedBuffer);
          tokens = tokenizedBuffer.tokenizedLineForRow(0).tokens;
          return expect(tokens[0]).toEqual({
            value: "<div class='name'>",
            scopes: ["text.html.ruby"]
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-html');
        });
        return runs(function() {
          var tokens;
          fullyTokenize(tokenizedBuffer);
          tokens = tokenizedBuffer.tokenizedLineForRow(0).tokens;
          return expect(tokens[0]).toEqual({
            value: '<',
            scopes: ["text.html.ruby", "meta.tag.block.any.html", "punctuation.definition.tag.begin.html"]
          });
        });
      });
    });
    describe(".tokenForPosition(position)", function() {
      afterEach(function() {
        tokenizedBuffer.destroy();
        return buffer.release();
      });
      return it("returns the correct token (regression)", function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        fullyTokenize(tokenizedBuffer);
        expect(tokenizedBuffer.tokenForPosition([1, 0]).scopes).toEqual(["source.js"]);
        expect(tokenizedBuffer.tokenForPosition([1, 1]).scopes).toEqual(["source.js"]);
        return expect(tokenizedBuffer.tokenForPosition([1, 2]).scopes).toEqual(["source.js", "storage.modifier.js"]);
      });
    });
    describe(".bufferRangeForScopeAtPosition(selector, position)", function() {
      beforeEach(function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        return fullyTokenize(tokenizedBuffer);
      });
      describe("when the selector does not match the token at the position", function() {
        return it("returns a falsy value", function() {
          return expect(tokenizedBuffer.bufferRangeForScopeAtPosition('.bogus', [0, 1])).toBeFalsy();
        });
      });
      describe("when the selector matches a single token at the position", function() {
        return it("returns the range covered by the token", function() {
          return expect(tokenizedBuffer.bufferRangeForScopeAtPosition('.storage.modifier.js', [0, 1])).toEqual([[0, 0], [0, 3]]);
        });
      });
      return describe("when the selector matches a run of multiple tokens at the position", function() {
        return it("returns the range covered by all contigous tokens (within a single line)", function() {
          return expect(tokenizedBuffer.bufferRangeForScopeAtPosition('.function', [1, 18])).toEqual([[1, 6], [1, 28]]);
        });
      });
    });
    describe("when the editor.tabLength config value changes", function() {
      it("updates the tab length of the tokenized lines", function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        buffer.setText('\ttest');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        fullyTokenize(tokenizedBuffer);
        expect(tokenizedBuffer.tokenForPosition([0, 0]).value).toBe('  ');
        atom.config.set('editor.tabLength', 6);
        return expect(tokenizedBuffer.tokenForPosition([0, 0]).value).toBe('      ');
      });
      return it("does not allow the tab length to be less than 1", function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        buffer.setText('\ttest');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        fullyTokenize(tokenizedBuffer);
        expect(tokenizedBuffer.tokenForPosition([0, 0]).value).toBe('  ');
        atom.config.set('editor.tabLength', 1);
        expect(tokenizedBuffer.tokenForPosition([0, 0]).value).toBe(' ');
        atom.config.set('editor.tabLength', 0);
        return expect(tokenizedBuffer.tokenForPosition([0, 0]).value).toBe('  ');
      });
    });
    describe("when the invisibles value changes", function() {
      beforeEach(function() {});
      it("updates the tokens with the appropriate invisible characters", function() {
        buffer = new TextBuffer({
          text: "  \t a line with tabs\tand \tspaces \t "
        });
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        fullyTokenize(tokenizedBuffer);
        tokenizedBuffer.setInvisibles({
          space: 'S',
          tab: 'T'
        });
        fullyTokenize(tokenizedBuffer);
        expect(tokenizedBuffer.tokenizedLineForRow(0).text).toBe("SST Sa line with tabsTand T spacesSTS");
        return expect(tokenizedBuffer.tokenizedLineForRow(0).copy().text).toBe("SST Sa line with tabsTand T spacesSTS");
      });
      return it("assigns endOfLineInvisibles to tokenized lines", function() {
        var left, right, _ref1;
        buffer = new TextBuffer({
          text: "a line that ends in a carriage-return-line-feed \r\na line that ends in just a line-feed\na line with no ending"
        });
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        atom.config.set('editor.showInvisibles', true);
        tokenizedBuffer.setInvisibles({
          cr: 'R',
          eol: 'N'
        });
        fullyTokenize(tokenizedBuffer);
        expect(tokenizedBuffer.tokenizedLineForRow(0).endOfLineInvisibles).toEqual(['R', 'N']);
        expect(tokenizedBuffer.tokenizedLineForRow(1).endOfLineInvisibles).toEqual(['N']);
        _ref1 = tokenizedBuffer.tokenizedLineForRow(0).softWrapAt(20), left = _ref1[0], right = _ref1[1];
        expect(left.endOfLineInvisibles).toBe(null);
        expect(right.endOfLineInvisibles).toEqual(['R', 'N']);
        tokenizedBuffer.setInvisibles({
          cr: 'R',
          eol: false
        });
        expect(tokenizedBuffer.tokenizedLineForRow(0).endOfLineInvisibles).toEqual(['R']);
        return expect(tokenizedBuffer.tokenizedLineForRow(1).endOfLineInvisibles).toEqual([]);
      });
    });
    describe("leading and trailing whitespace", function() {
      beforeEach(function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        return fullyTokenize(tokenizedBuffer);
      });
      it("assigns ::firstNonWhitespaceIndex on tokens that have leading whitespace", function() {
        expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[0].firstNonWhitespaceIndex).toBe(null);
        expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[0].firstNonWhitespaceIndex).toBe(2);
        expect(tokenizedBuffer.tokenizedLineForRow(1).tokens[1].firstNonWhitespaceIndex).toBe(null);
        expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[0].firstNonWhitespaceIndex).toBe(2);
        expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[1].firstNonWhitespaceIndex).toBe(2);
        expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[2].firstNonWhitespaceIndex).toBe(null);
        buffer.insert([5, 0], ' ');
        expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[3].firstNonWhitespaceIndex).toBe(1);
        expect(tokenizedBuffer.tokenizedLineForRow(5).tokens[4].firstNonWhitespaceIndex).toBe(null);
        buffer.insert([10, 0], '  ');
        return expect(tokenizedBuffer.tokenizedLineForRow(10).tokens[0].firstNonWhitespaceIndex).toBe(null);
      });
      it("assigns ::firstTrailingWhitespaceIndex on tokens that have trailing whitespace", function() {
        buffer.insert([0, Infinity], '  ');
        expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[11].firstTrailingWhitespaceIndex).toBe(null);
        expect(tokenizedBuffer.tokenizedLineForRow(0).tokens[12].firstTrailingWhitespaceIndex).toBe(0);
        buffer.setTextInRange([[2, 39], [2, 40]], '  ');
        expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[14].firstTrailingWhitespaceIndex).toBe(null);
        expect(tokenizedBuffer.tokenizedLineForRow(2).tokens[15].firstTrailingWhitespaceIndex).toBe(6);
        buffer.insert([10, 0], '  ');
        return expect(tokenizedBuffer.tokenizedLineForRow(10).tokens[0].firstTrailingWhitespaceIndex).toBe(0);
      });
      it("only marks trailing whitespace on the last segment of a soft-wrapped line", function() {
        var segment1, segment2, tokenizedLine, _ref1;
        buffer.insert([0, Infinity], '  ');
        tokenizedLine = tokenizedBuffer.tokenizedLineForRow(0);
        _ref1 = tokenizedLine.softWrapAt(16), segment1 = _ref1[0], segment2 = _ref1[1];
        expect(segment1.tokens[5].value).toBe(' ');
        expect(segment1.tokens[5].firstTrailingWhitespaceIndex).toBe(null);
        expect(segment2.tokens[6].value).toBe('  ');
        return expect(segment2.tokens[6].firstTrailingWhitespaceIndex).toBe(0);
      });
      it("sets leading and trailing whitespace correctly on a line with invisible characters that is copied", function() {
        var line;
        buffer.setText("  \t a line with tabs\tand \tspaces \t ");
        tokenizedBuffer.setInvisibles({
          space: 'S',
          tab: 'T'
        });
        fullyTokenize(tokenizedBuffer);
        line = tokenizedBuffer.tokenizedLineForRow(0).copy();
        expect(line.tokens[0].firstNonWhitespaceIndex).toBe(2);
        return expect(line.tokens[line.tokens.length - 1].firstTrailingWhitespaceIndex).toBe(0);
      });
      return it("sets the ::firstNonWhitespaceIndex and ::firstTrailingWhitespaceIndex correctly when tokens are split for soft-wrapping", function() {
        var leftToken, rightToken, token, _ref1;
        tokenizedBuffer.setInvisibles({
          space: 'S'
        });
        buffer.setText(" token ");
        fullyTokenize(tokenizedBuffer);
        token = tokenizedBuffer.tokenizedLines[0].tokens[0];
        _ref1 = token.splitAt(1), leftToken = _ref1[0], rightToken = _ref1[1];
        expect(leftToken.hasInvisibleCharacters).toBe(true);
        expect(leftToken.firstNonWhitespaceIndex).toBe(1);
        expect(leftToken.firstTrailingWhitespaceIndex).toBe(null);
        expect(leftToken.hasInvisibleCharacters).toBe(true);
        expect(rightToken.firstNonWhitespaceIndex).toBe(null);
        return expect(rightToken.firstTrailingWhitespaceIndex).toBe(5);
      });
    });
    return describe("indent level", function() {
      beforeEach(function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        return fullyTokenize(tokenizedBuffer);
      });
      describe("when the line is non-empty", function() {
        return it("has an indent level based on the leading whitespace on the line", function() {
          expect(tokenizedBuffer.tokenizedLineForRow(0).indentLevel).toBe(0);
          expect(tokenizedBuffer.tokenizedLineForRow(1).indentLevel).toBe(1);
          expect(tokenizedBuffer.tokenizedLineForRow(2).indentLevel).toBe(2);
          buffer.insert([2, 0], ' ');
          return expect(tokenizedBuffer.tokenizedLineForRow(2).indentLevel).toBe(2.5);
        });
      });
      describe("when the line is empty", function() {
        return it("assumes the indentation level of the first non-empty line below or above if one exists", function() {
          buffer.insert([12, 0], '    ');
          buffer.insert([12, Infinity], '\n\n');
          expect(tokenizedBuffer.tokenizedLineForRow(13).indentLevel).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(14).indentLevel).toBe(2);
          buffer.insert([1, Infinity], '\n\n');
          expect(tokenizedBuffer.tokenizedLineForRow(2).indentLevel).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(3).indentLevel).toBe(2);
          buffer.setText('\n\n\n');
          return expect(tokenizedBuffer.tokenizedLineForRow(1).indentLevel).toBe(0);
        });
      });
      return describe("when the changed lines are surrounded by whitespace-only lines", function() {
        it("updates the indentLevel of empty lines that precede the change", function() {
          expect(tokenizedBuffer.tokenizedLineForRow(12).indentLevel).toBe(0);
          buffer.insert([12, 0], '\n');
          buffer.insert([13, 0], '  ');
          return expect(tokenizedBuffer.tokenizedLineForRow(12).indentLevel).toBe(1);
        });
        it("updates empty line indent guides when the empty line is the last line", function() {
          buffer.insert([12, 2], '\n');
          buffer.insert([12, 0], '  ');
          expect(tokenizedBuffer.tokenizedLineForRow(13).indentLevel).toBe(1);
          buffer.insert([12, 0], '  ');
          expect(tokenizedBuffer.tokenizedLineForRow(13).indentLevel).toBe(2);
          return expect(tokenizedBuffer.tokenizedLineForRow(14)).not.toBeDefined();
        });
        it("updates the indentLevel of empty lines surrounding a change that inserts lines", function() {
          buffer.insert([7, 0], '\n\n');
          buffer.insert([5, 0], '\n\n');
          expect(tokenizedBuffer.tokenizedLineForRow(5).indentLevel).toBe(3);
          expect(tokenizedBuffer.tokenizedLineForRow(6).indentLevel).toBe(3);
          expect(tokenizedBuffer.tokenizedLineForRow(9).indentLevel).toBe(3);
          expect(tokenizedBuffer.tokenizedLineForRow(10).indentLevel).toBe(3);
          expect(tokenizedBuffer.tokenizedLineForRow(11).indentLevel).toBe(2);
          tokenizedBuffer.onDidChange(changeHandler = jasmine.createSpy('changeHandler'));
          buffer.setTextInRange([[7, 0], [8, 65]], '        one\n        two\n        three\n        four');
          delete changeHandler.argsForCall[0][0].bufferChange;
          expect(changeHandler).toHaveBeenCalledWith({
            start: 5,
            end: 10,
            delta: 2
          });
          expect(tokenizedBuffer.tokenizedLineForRow(5).indentLevel).toBe(4);
          expect(tokenizedBuffer.tokenizedLineForRow(6).indentLevel).toBe(4);
          expect(tokenizedBuffer.tokenizedLineForRow(11).indentLevel).toBe(4);
          expect(tokenizedBuffer.tokenizedLineForRow(12).indentLevel).toBe(4);
          return expect(tokenizedBuffer.tokenizedLineForRow(13).indentLevel).toBe(2);
        });
        return it("updates the indentLevel of empty lines surrounding a change that removes lines", function() {
          buffer.insert([7, 0], '\n\n');
          buffer.insert([5, 0], '\n\n');
          tokenizedBuffer.onDidChange(changeHandler = jasmine.createSpy('changeHandler'));
          buffer.setTextInRange([[7, 0], [8, 65]], '    ok');
          delete changeHandler.argsForCall[0][0].bufferChange;
          expect(changeHandler).toHaveBeenCalledWith({
            start: 5,
            end: 10,
            delta: -1
          });
          expect(tokenizedBuffer.tokenizedLineForRow(5).indentLevel).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(6).indentLevel).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(7).indentLevel).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(8).indentLevel).toBe(2);
          expect(tokenizedBuffer.tokenizedLineForRow(9).indentLevel).toBe(2);
          return expect(tokenizedBuffer.tokenizedLineForRow(10).indentLevel).toBe(2);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUixDQURiLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSw0RUFBQTtBQUFBLElBQUEsT0FBMkMsRUFBM0MsRUFBQyx5QkFBRCxFQUFrQixnQkFBbEIsRUFBMEIsdUJBQTFCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFFVCxNQUFBLGVBQWUsQ0FBQyxTQUFTLENBQUMsU0FBMUIsR0FBc0MsQ0FBdEMsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxlQUFlLENBQUMsU0FBOUIsRUFBeUMsc0JBQXpDLENBREEsQ0FBQTthQUdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHFCQUE5QixFQURjO01BQUEsQ0FBaEIsRUFMUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFVQSxTQUFBLENBQVUsU0FBQSxHQUFBO3VDQUNSLGVBQWUsQ0FBRSxPQUFqQixDQUFBLFdBRFE7SUFBQSxDQUFWLENBVkEsQ0FBQTtBQUFBLElBYUEsZUFBQSxHQUFrQixTQUFDLGVBQUQsR0FBQTthQUNoQixlQUFlLENBQUMsVUFBaEIsQ0FBMkIsSUFBM0IsRUFEZ0I7SUFBQSxDQWJsQixDQUFBO0FBQUEsSUFnQkEsYUFBQSxHQUFnQixTQUFDLGVBQUQsR0FBQTtBQUNkLE1BQUEsZUFBZSxDQUFDLFVBQWhCLENBQTJCLElBQTNCLENBQUEsQ0FBQTtBQUNlLGFBQU0seUNBQU4sR0FBQTtBQUFmLFFBQUEsWUFBQSxDQUFBLENBQUEsQ0FBZTtNQUFBLENBRGY7cUNBRUEsYUFBYSxDQUFFLEtBQWYsQ0FBQSxXQUhjO0lBQUEsQ0FoQmhCLENBQUE7QUFBQSxJQXFCQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQSxHQUFBO0FBQ3ZDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBK0IsV0FBL0IsQ0FBVCxDQUFBO0FBQUEsUUFDQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQjtBQUFBLFVBQUMsUUFBQSxNQUFEO1NBQWhCLENBRHRCLENBQUE7ZUFFQSxlQUFBLENBQWdCLGVBQWhCLEVBSFM7TUFBQSxDQUFYLENBQUEsQ0FBQTthQUtBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSxlQUFlLENBQUMsT0FBaEIsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBTSxlQUFOLEVBQXVCLG1CQUF2QixDQURBLENBQUE7QUFBQSxRQUVBLFlBQUEsQ0FBQSxDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sZUFBZSxDQUFDLGlCQUF2QixDQUF5QyxDQUFDLEdBQUcsQ0FBQyxnQkFBOUMsQ0FBQSxFQUp1QjtNQUFBLENBQXpCLEVBTnVDO0lBQUEsQ0FBekMsQ0FyQkEsQ0FBQTtBQUFBLElBaUNBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBYixDQUErQixXQUEvQixDQUFULENBQUE7QUFBQSxRQUNBLGVBQUEsR0FBc0IsSUFBQSxlQUFBLENBQWdCO0FBQUEsVUFBQyxRQUFBLE1BQUQ7U0FBaEIsQ0FEdEIsQ0FBQTtBQUFBLFFBRUEsZUFBQSxDQUFnQixlQUFoQixDQUZBLENBQUE7ZUFHQSxlQUFlLENBQUMsV0FBaEIsQ0FBNEIsYUFBQSxHQUFnQixPQUFPLENBQUMsU0FBUixDQUFrQixlQUFsQixDQUE1QyxFQUpTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQU1BLFNBQUEsQ0FBVSxTQUFBLEdBQUE7QUFDUixRQUFBLGVBQWUsQ0FBQyxPQUFoQixDQUFBLENBQUEsQ0FBQTtlQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUEsRUFGUTtNQUFBLENBQVYsQ0FOQSxDQUFBO0FBQUEsTUFVQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO2VBQzFCLEVBQUEsQ0FBRyxxR0FBSCxFQUEwRyxTQUFBLEdBQUE7QUFDeEcsY0FBQSxhQUFBO0FBQUEsVUFBQSxLQUFBLEdBQVEsZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFSLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQXBCLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsQ0FBakMsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sS0FBSyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQXBCLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0M7QUFBQSxZQUFBLEtBQUEsRUFBTyxLQUFLLENBQUMsSUFBYjtBQUFBLFlBQW1CLE1BQUEsRUFBUSxDQUFDLFdBQUQsQ0FBM0I7V0FBaEMsQ0FGQSxDQUFBO0FBQUEsVUFJQSxNQUFBLEdBQVMsZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxFQUFwQyxDQUpULENBQUE7QUFBQSxVQUtBLE1BQUEsQ0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQXJCLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsQ0FBbEMsQ0FMQSxDQUFBO0FBQUEsVUFNQSxNQUFBLENBQU8sTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQXJCLENBQXdCLENBQUMsT0FBekIsQ0FBaUM7QUFBQSxZQUFBLEtBQUEsRUFBTyxJQUFQO0FBQUEsWUFBYSxNQUFBLEVBQVEsQ0FBQyxXQUFELENBQXJCO0FBQUEsWUFBb0MsUUFBQSxFQUFVLElBQTlDO1dBQWpDLENBTkEsQ0FBQTtBQUFBLFVBT0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyQixDQUF3QixDQUFDLE9BQXpCLENBQWlDO0FBQUEsWUFBQSxLQUFBLEVBQU8sNENBQVA7QUFBQSxZQUFxRCxNQUFBLEVBQVEsQ0FBQyxXQUFELENBQTdEO1dBQWpDLENBUEEsQ0FBQTtBQUFBLFVBVUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxTQUE5QyxDQUF3RCxDQUFDLGFBQXpELENBQUEsQ0FWQSxDQUFBO0FBQUEsVUFhQSxZQUFBLENBQUEsQ0FiQSxDQUFBO0FBQUEsVUFjQSxNQUFBLENBQU8sd0RBQVAsQ0FBeUQsQ0FBQyxVQUExRCxDQUFBLENBZEEsQ0FBQTtBQUFBLFVBZUEsTUFBQSxDQUFPLHdEQUFQLENBQXlELENBQUMsVUFBMUQsQ0FBQSxDQWZBLENBQUE7QUFBQSxVQWdCQSxNQUFBLENBQU8sd0RBQVAsQ0FBeUQsQ0FBQyxTQUExRCxDQUFBLENBaEJBLENBQUE7QUFBQSxVQWlCQSxNQUFBLENBQU8sYUFBUCxDQUFxQixDQUFDLG9CQUF0QixDQUEyQztBQUFBLFlBQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxZQUFVLEdBQUEsRUFBSyxDQUFmO0FBQUEsWUFBa0IsS0FBQSxFQUFPLENBQXpCO1dBQTNDLENBakJBLENBQUE7QUFBQSxVQWtCQSxhQUFhLENBQUMsS0FBZCxDQUFBLENBbEJBLENBQUE7QUFBQSxVQXFCQSxZQUFBLENBQUEsQ0FyQkEsQ0FBQTtBQUFBLFVBc0JBLE1BQUEsQ0FBTyx3REFBUCxDQUF5RCxDQUFDLFVBQTFELENBQUEsQ0F0QkEsQ0FBQTtBQUFBLFVBdUJBLE1BQUEsQ0FBTyx3REFBUCxDQUF5RCxDQUFDLFVBQTFELENBQUEsQ0F2QkEsQ0FBQTtBQUFBLFVBd0JBLE1BQUEsQ0FBTyx5REFBUCxDQUEwRCxDQUFDLFNBQTNELENBQUEsQ0F4QkEsQ0FBQTtBQUFBLFVBeUJBLE1BQUEsQ0FBTyxhQUFQLENBQXFCLENBQUMsb0JBQXRCLENBQTJDO0FBQUEsWUFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLFlBQVUsR0FBQSxFQUFLLENBQWY7QUFBQSxZQUFrQixLQUFBLEVBQU8sQ0FBekI7V0FBM0MsQ0F6QkEsQ0FBQTtBQUFBLFVBMEJBLGFBQWEsQ0FBQyxLQUFkLENBQUEsQ0ExQkEsQ0FBQTtBQUFBLFVBNkJBLFlBQUEsQ0FBQSxDQTdCQSxDQUFBO0FBQUEsVUE4QkEsTUFBQSxDQUFPLHlEQUFQLENBQTBELENBQUMsVUFBM0QsQ0FBQSxDQTlCQSxDQUFBO0FBQUEsVUErQkEsTUFBQSxDQUFPLHlEQUFQLENBQTBELENBQUMsVUFBM0QsQ0FBQSxDQS9CQSxDQUFBO2lCQWdDQSxNQUFBLENBQU8sYUFBUCxDQUFxQixDQUFDLG9CQUF0QixDQUEyQztBQUFBLFlBQUEsS0FBQSxFQUFPLEVBQVA7QUFBQSxZQUFXLEdBQUEsRUFBSyxFQUFoQjtBQUFBLFlBQW9CLEtBQUEsRUFBTyxDQUEzQjtXQUEzQyxFQWpDd0c7UUFBQSxDQUExRyxFQUQwQjtNQUFBLENBQTVCLENBVkEsQ0FBQTtBQUFBLE1BOENBLFFBQUEsQ0FBUyx3Q0FBVCxFQUFtRCxTQUFBLEdBQUE7QUFDakQsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBRVQsVUFBQSxZQUFBLENBQUEsQ0FBQSxDQUFBO2lCQUNBLGFBQWEsQ0FBQyxLQUFkLENBQUEsRUFIUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFLQSxRQUFBLENBQVMsMkRBQVQsRUFBc0UsU0FBQSxHQUFBO0FBQ3BFLFVBQUEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTttQkFDL0IsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxjQUFBLE1BQUEsQ0FBTyxlQUFlLENBQUMsZUFBaEIsQ0FBQSxDQUFQLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsQ0FBL0MsQ0FBQSxDQUFBO0FBQUEsY0FDQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZCxFQUFzQixNQUF0QixDQURBLENBQUE7QUFBQSxjQUVBLGFBQWEsQ0FBQyxLQUFkLENBQUEsQ0FGQSxDQUFBO0FBQUEsY0FJQSxNQUFBLENBQU8sZUFBZSxDQUFDLGVBQWhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLENBQS9DLENBSkEsQ0FBQTtBQUFBLGNBS0EsWUFBQSxDQUFBLENBTEEsQ0FBQTtxQkFNQSxNQUFBLENBQU8sYUFBUCxDQUFxQixDQUFDLG9CQUF0QixDQUEyQztBQUFBLGdCQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsZ0JBQVUsR0FBQSxFQUFLLEVBQWY7QUFBQSxnQkFBbUIsS0FBQSxFQUFPLENBQTFCO2VBQTNDLEVBUGlDO1lBQUEsQ0FBbkMsRUFEK0I7VUFBQSxDQUFqQyxDQUFBLENBQUE7QUFBQSxVQVVBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7bUJBQ2pDLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsY0FBQSxNQUFBLENBQU8sZUFBZSxDQUFDLGVBQWhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLENBQS9DLENBQUEsQ0FBQTtBQUFBLGNBQ0EsTUFBTSxDQUFDLFFBQUQsQ0FBTixDQUFjLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBQWQsQ0FEQSxDQUFBO0FBQUEsY0FFQSxhQUFhLENBQUMsS0FBZCxDQUFBLENBRkEsQ0FBQTtBQUFBLGNBSUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxlQUFoQixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxDQUEvQyxDQUpBLENBQUE7QUFBQSxjQUtBLFlBQUEsQ0FBQSxDQUxBLENBQUE7cUJBTUEsTUFBQSxDQUFPLGFBQVAsQ0FBcUIsQ0FBQyxvQkFBdEIsQ0FBMkM7QUFBQSxnQkFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLGdCQUFVLEdBQUEsRUFBSyxDQUFmO0FBQUEsZ0JBQWtCLEtBQUEsRUFBTyxDQUF6QjtlQUEzQyxFQVA4QjtZQUFBLENBQWhDLEVBRGlDO1VBQUEsQ0FBbkMsQ0FWQSxDQUFBO2lCQW9CQSxRQUFBLENBQVMsNkVBQVQsRUFBd0YsU0FBQSxHQUFBO21CQUN0RixFQUFBLENBQUcsdUVBQUgsRUFBNEUsU0FBQSxHQUFBO0FBQzFFLGNBQUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxlQUFoQixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxDQUEvQyxDQUFBLENBQUE7QUFBQSxjQUNBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkLEVBQXNCLElBQXRCLENBREEsQ0FBQTtBQUFBLGNBRUEsYUFBYSxDQUFDLEtBQWQsQ0FBQSxDQUZBLENBQUE7QUFBQSxjQUdBLE1BQUEsQ0FBTyxlQUFlLENBQUMsZUFBaEIsQ0FBQSxDQUFQLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsQ0FBL0MsQ0FIQSxDQUFBO0FBQUEsY0FLQSxZQUFBLENBQUEsQ0FMQSxDQUFBO0FBQUEsY0FNQSxNQUFBLENBQU8sYUFBUCxDQUFxQixDQUFDLG9CQUF0QixDQUEyQztBQUFBLGdCQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsZ0JBQVUsR0FBQSxFQUFLLENBQWY7QUFBQSxnQkFBa0IsS0FBQSxFQUFPLENBQXpCO2VBQTNDLENBTkEsQ0FBQTtxQkFPQSxNQUFBLENBQU8sZUFBZSxDQUFDLGVBQWhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLENBQS9DLEVBUjBFO1lBQUEsQ0FBNUUsRUFEc0Y7VUFBQSxDQUF4RixFQXJCb0U7UUFBQSxDQUF0RSxDQUxBLENBQUE7QUFBQSxRQXFDQSxRQUFBLENBQVMsMERBQVQsRUFBcUUsU0FBQSxHQUFBO2lCQUNuRSxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQSxHQUFBO0FBQ3BELFlBQUEsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBdEIsRUFBd0MsUUFBeEMsQ0FBQSxDQUFBO0FBQUEsWUFDQSxhQUFhLENBQUMsS0FBZCxDQUFBLENBREEsQ0FBQTtBQUFBLFlBR0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxlQUFoQixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxDQUEvQyxDQUhBLENBQUE7bUJBSUEsWUFBQSxDQUFBLEVBTG9EO1VBQUEsQ0FBdEQsRUFEbUU7UUFBQSxDQUFyRSxDQXJDQSxDQUFBO2VBNkNBLFFBQUEsQ0FBUyx3REFBVCxFQUFtRSxTQUFBLEdBQUE7aUJBQ2pFLEVBQUEsQ0FBRyw4RkFBSCxFQUFtRyxTQUFBLEdBQUE7QUFDakcsWUFBQSxNQUFBLENBQU8sZUFBZSxDQUFDLGVBQWhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLENBQS9DLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBdEIsRUFBd0MsUUFBeEMsQ0FEQSxDQUFBO0FBQUEsWUFHQSxNQUFBLENBQU8sd0RBQVAsQ0FBeUQsQ0FBQyxTQUExRCxDQUFBLENBSEEsQ0FBQTtBQUFBLFlBSUEsTUFBQSxDQUFPLHdEQUFQLENBQXlELENBQUMsU0FBMUQsQ0FBQSxDQUpBLENBQUE7QUFBQSxZQU1BLGFBQWEsQ0FBQyxLQUFkLENBQUEsQ0FOQSxDQUFBO21CQU9BLE1BQUEsQ0FBTyxlQUFlLENBQUMsZUFBaEIsQ0FBQSxDQUFQLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsQ0FBL0MsRUFSaUc7VUFBQSxDQUFuRyxFQURpRTtRQUFBLENBQW5FLEVBOUNpRDtNQUFBLENBQW5ELENBOUNBLENBQUE7YUF1R0EsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUEsR0FBQTtBQUM3QyxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsYUFBQSxDQUFjLGVBQWQsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxRQUFBLENBQVMsbUVBQVQsRUFBOEUsU0FBQSxHQUFBO0FBQzVFLFVBQUEsUUFBQSxDQUFTLHVEQUFULEVBQWtFLFNBQUEsR0FBQTtBQUNoRSxZQUFBLEVBQUEsQ0FBRyxzQ0FBSCxFQUEyQyxTQUFBLEdBQUE7QUFDekMsa0JBQUEsS0FBQTtBQUFBLGNBQUEsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBdEIsRUFBd0MsWUFBeEMsQ0FBQSxDQUFBO0FBQUEsY0FFQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQXJELENBQXdELENBQUMsT0FBekQsQ0FBaUU7QUFBQSxnQkFBQSxLQUFBLEVBQU8sR0FBUDtBQUFBLGdCQUFZLE1BQUEsRUFBUSxDQUFDLFdBQUQsRUFBYyxxQkFBZCxDQUFwQjtlQUFqRSxDQUZBLENBQUE7QUFBQSxjQUdBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBckQsQ0FBd0QsQ0FBQyxPQUF6RCxDQUFpRTtBQUFBLGdCQUFBLEtBQUEsRUFBTyxHQUFQO0FBQUEsZ0JBQVksTUFBQSxFQUFRLENBQUMsV0FBRCxFQUFjLHFCQUFkLENBQXBCO2VBQWpFLENBSEEsQ0FBQTtBQUFBLGNBS0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLElBQVA7QUFBQSxnQkFBYSxNQUFBLEVBQVEsQ0FBQyxXQUFELEVBQWMsb0JBQWQsQ0FBckI7ZUFBakUsQ0FMQSxDQUFBO0FBQUEsY0FPQSxNQUFBLENBQU8sYUFBUCxDQUFxQixDQUFDLGdCQUF0QixDQUFBLENBUEEsQ0FBQTtBQUFBLGNBUUMsUUFBUyxhQUFhLENBQUMsV0FBWSxDQUFBLENBQUEsSUFScEMsQ0FBQTtBQUFBLGNBU0EsTUFBQSxDQUFBLEtBQVksQ0FBQyxZQVRiLENBQUE7cUJBVUEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLE9BQWQsQ0FBc0I7QUFBQSxnQkFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLGdCQUFVLEdBQUEsRUFBSyxDQUFmO0FBQUEsZ0JBQWtCLEtBQUEsRUFBTyxDQUF6QjtlQUF0QixFQVh5QztZQUFBLENBQTNDLENBQUEsQ0FBQTtBQUFBLFlBYUEsUUFBQSxDQUFTLGtFQUFULEVBQTZFLFNBQUEsR0FBQTtxQkFDM0UsRUFBQSxDQUFHLG1FQUFILEVBQXdFLFNBQUEsR0FBQTtBQUN0RSxvQkFBQSxLQUFBO0FBQUEsZ0JBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQWQsRUFBdUIsT0FBdkIsQ0FBQSxDQUFBO0FBQUEsZ0JBQ0EsYUFBYSxDQUFDLEtBQWQsQ0FBQSxDQURBLENBQUE7QUFBQSxnQkFFQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZCxFQUFzQixJQUF0QixDQUZBLENBQUE7QUFBQSxnQkFHQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUF4RCxDQUErRCxDQUFDLE9BQWhFLENBQXdFLENBQUMsV0FBRCxDQUF4RSxDQUhBLENBQUE7QUFBQSxnQkFJQSxNQUFBLENBQU8sYUFBUCxDQUFxQixDQUFDLGdCQUF0QixDQUFBLENBSkEsQ0FBQTtBQUFBLGdCQUtDLFFBQVMsYUFBYSxDQUFDLFdBQVksQ0FBQSxDQUFBLElBTHBDLENBQUE7QUFBQSxnQkFNQSxNQUFBLENBQUEsS0FBWSxDQUFDLFlBTmIsQ0FBQTtBQUFBLGdCQU9BLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCO0FBQUEsa0JBQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxrQkFBVSxHQUFBLEVBQUssQ0FBZjtBQUFBLGtCQUFrQixLQUFBLEVBQU8sQ0FBekI7aUJBQXRCLENBUEEsQ0FBQTtBQUFBLGdCQVFBLGFBQWEsQ0FBQyxLQUFkLENBQUEsQ0FSQSxDQUFBO0FBQUEsZ0JBVUEsWUFBQSxDQUFBLENBVkEsQ0FBQTtBQUFBLGdCQVdBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXhELENBQStELENBQUMsT0FBaEUsQ0FBd0UsQ0FBQyxXQUFELEVBQWMsa0JBQWQsQ0FBeEUsQ0FYQSxDQUFBO0FBQUEsZ0JBWUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBeEQsQ0FBK0QsQ0FBQyxPQUFoRSxDQUF3RSxDQUFDLFdBQUQsRUFBYyxrQkFBZCxDQUF4RSxDQVpBLENBQUE7QUFBQSxnQkFhQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUF4RCxDQUErRCxDQUFDLE9BQWhFLENBQXdFLENBQUMsV0FBRCxFQUFjLGtCQUFkLENBQXhFLENBYkEsQ0FBQTtBQUFBLGdCQWNBLE1BQUEsQ0FBTyxhQUFQLENBQXFCLENBQUMsZ0JBQXRCLENBQUEsQ0FkQSxDQUFBO0FBQUEsZ0JBZUMsUUFBUyxhQUFhLENBQUMsV0FBWSxDQUFBLENBQUEsSUFmcEMsQ0FBQTtBQUFBLGdCQWdCQSxNQUFBLENBQUEsS0FBWSxDQUFDLFlBaEJiLENBQUE7dUJBaUJBLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCO0FBQUEsa0JBQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxrQkFBVSxHQUFBLEVBQUssQ0FBZjtBQUFBLGtCQUFrQixLQUFBLEVBQU8sQ0FBekI7aUJBQXRCLEVBbEJzRTtjQUFBLENBQXhFLEVBRDJFO1lBQUEsQ0FBN0UsQ0FiQSxDQUFBO21CQWtDQSxFQUFBLENBQUcsMERBQUgsRUFBK0QsU0FBQSxHQUFBO0FBQzdELGNBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQsRUFBc0IsSUFBdEIsQ0FBQSxDQUFBO0FBQUEsY0FDQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZCxFQUFzQixJQUF0QixDQURBLENBQUE7QUFBQSxjQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkLEVBQXNCLE1BQXRCLENBSEEsQ0FBQTtxQkFJQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUF4RCxDQUErRCxDQUFDLE9BQWhFLENBQXdFLENBQUMsV0FBRCxFQUFjLGtCQUFkLENBQXhFLEVBTDZEO1lBQUEsQ0FBL0QsRUFuQ2dFO1VBQUEsQ0FBbEUsQ0FBQSxDQUFBO0FBQUEsVUEwQ0EsUUFBQSxDQUFTLHlDQUFULEVBQW9ELFNBQUEsR0FBQTttQkFDbEQsRUFBQSxDQUFHLHNDQUFILEVBQTJDLFNBQUEsR0FBQTtBQUN6QyxrQkFBQSxLQUFBO0FBQUEsY0FBQSxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUF0QixFQUF3QyxPQUF4QyxDQUFBLENBQUE7QUFBQSxjQUdBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBckQsQ0FBd0QsQ0FBQyxPQUF6RCxDQUFpRTtBQUFBLGdCQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsZ0JBQWMsTUFBQSxFQUFRLENBQUMsV0FBRCxFQUFjLHFCQUFkLENBQXRCO2VBQWpFLENBSEEsQ0FBQTtBQUFBLGNBTUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxnQkFBYyxNQUFBLEVBQVEsQ0FBQyxXQUFELENBQXRCO2VBQWpFLENBTkEsQ0FBQTtBQUFBLGNBT0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxnQkFBWSxNQUFBLEVBQVEsQ0FBQyxXQUFELEVBQWMscUJBQWQsQ0FBcEI7ZUFBakUsQ0FQQSxDQUFBO0FBQUEsY0FVQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQXJELENBQXdELENBQUMsT0FBekQsQ0FBaUU7QUFBQSxnQkFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLGdCQUFnQixNQUFBLEVBQVEsQ0FBQyxXQUFELEVBQWMsb0JBQWQsQ0FBeEI7ZUFBakUsQ0FWQSxDQUFBO0FBQUEsY0FXQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQXJELENBQXdELENBQUMsT0FBekQsQ0FBaUU7QUFBQSxnQkFBQSxLQUFBLEVBQU8sR0FBUDtBQUFBLGdCQUFZLE1BQUEsRUFBUSxDQUFDLFdBQUQsRUFBYyxxQkFBZCxDQUFwQjtlQUFqRSxDQVhBLENBQUE7QUFBQSxjQVlBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBckQsQ0FBd0QsQ0FBQyxPQUF6RCxDQUFpRTtBQUFBLGdCQUFBLEtBQUEsRUFBTyxHQUFQO0FBQUEsZ0JBQVksTUFBQSxFQUFRLENBQUMsV0FBRCxFQUFjLHFCQUFkLENBQXBCO2VBQWpFLENBWkEsQ0FBQTtBQUFBLGNBY0EsTUFBQSxDQUFPLGFBQVAsQ0FBcUIsQ0FBQyxnQkFBdEIsQ0FBQSxDQWRBLENBQUE7QUFBQSxjQWVDLFFBQVMsYUFBYSxDQUFDLFdBQVksQ0FBQSxDQUFBLElBZnBDLENBQUE7QUFBQSxjQWdCQSxNQUFBLENBQUEsS0FBWSxDQUFDLFlBaEJiLENBQUE7cUJBaUJBLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxnQkFBVSxHQUFBLEVBQUssQ0FBZjtBQUFBLGdCQUFrQixLQUFBLEVBQU8sQ0FBQSxDQUF6QjtlQUF0QixFQWxCeUM7WUFBQSxDQUEzQyxFQURrRDtVQUFBLENBQXBELENBMUNBLENBQUE7QUFBQSxVQStEQSxRQUFBLENBQVMsa0VBQVQsRUFBNkUsU0FBQSxHQUFBO21CQUMzRSxFQUFBLENBQUcsbUVBQUgsRUFBd0UsU0FBQSxHQUFBO0FBQ3RFLGtCQUFBLEtBQUE7QUFBQSxjQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFkLEVBQXVCLE9BQXZCLENBQUEsQ0FBQTtBQUFBLGNBQ0EsYUFBYSxDQUFDLEtBQWQsQ0FBQSxDQURBLENBQUE7QUFBQSxjQUdBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBQXRCLEVBQXdDLElBQXhDLENBSEEsQ0FBQTtBQUFBLGNBSUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBeEQsQ0FBK0QsQ0FBQyxPQUFoRSxDQUF3RSxDQUFDLFdBQUQsRUFBYyxrQkFBZCxFQUFrQyxtQ0FBbEMsQ0FBeEUsQ0FKQSxDQUFBO0FBQUEsY0FLQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUF4RCxDQUErRCxDQUFDLE9BQWhFLENBQXdFLENBQUMsV0FBRCxDQUF4RSxDQUxBLENBQUE7QUFBQSxjQU1BLE1BQUEsQ0FBTyxhQUFQLENBQXFCLENBQUMsZ0JBQXRCLENBQUEsQ0FOQSxDQUFBO0FBQUEsY0FPQyxRQUFTLGFBQWEsQ0FBQyxXQUFZLENBQUEsQ0FBQSxJQVBwQyxDQUFBO0FBQUEsY0FRQSxNQUFBLENBQUEsS0FBWSxDQUFDLFlBUmIsQ0FBQTtBQUFBLGNBU0EsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLE9BQWQsQ0FBc0I7QUFBQSxnQkFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLGdCQUFVLEdBQUEsRUFBSyxDQUFmO0FBQUEsZ0JBQWtCLEtBQUEsRUFBTyxDQUFBLENBQXpCO2VBQXRCLENBVEEsQ0FBQTtBQUFBLGNBVUEsYUFBYSxDQUFDLEtBQWQsQ0FBQSxDQVZBLENBQUE7QUFBQSxjQVlBLFlBQUEsQ0FBQSxDQVpBLENBQUE7QUFBQSxjQWFBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXhELENBQStELENBQUMsT0FBaEUsQ0FBd0UsQ0FBQyxXQUFELEVBQWMsa0JBQWQsQ0FBeEUsQ0FiQSxDQUFBO0FBQUEsY0FjQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUF4RCxDQUErRCxDQUFDLE9BQWhFLENBQXdFLENBQUMsV0FBRCxFQUFjLGtCQUFkLENBQXhFLENBZEEsQ0FBQTtBQUFBLGNBZUEsTUFBQSxDQUFPLGFBQVAsQ0FBcUIsQ0FBQyxnQkFBdEIsQ0FBQSxDQWZBLENBQUE7QUFBQSxjQWdCQyxRQUFTLGFBQWEsQ0FBQyxXQUFZLENBQUEsQ0FBQSxJQWhCcEMsQ0FBQTtBQUFBLGNBaUJBLE1BQUEsQ0FBQSxLQUFZLENBQUMsWUFqQmIsQ0FBQTtxQkFrQkEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLE9BQWQsQ0FBc0I7QUFBQSxnQkFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLGdCQUFVLEdBQUEsRUFBSyxDQUFmO0FBQUEsZ0JBQWtCLEtBQUEsRUFBTyxDQUF6QjtlQUF0QixFQW5Cc0U7WUFBQSxDQUF4RSxFQUQyRTtVQUFBLENBQTdFLENBL0RBLENBQUE7QUFBQSxVQXFGQSxRQUFBLENBQVMsMENBQVQsRUFBcUQsU0FBQSxHQUFBO21CQUNuRCxFQUFBLENBQUcsc0NBQUgsRUFBMkMsU0FBQSxHQUFBO0FBQ3pDLGtCQUFBLEtBQUE7QUFBQSxjQUFBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBQXRCLEVBQXdDLDZCQUF4QyxDQUFBLENBQUE7QUFBQSxjQUdBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBckQsQ0FBd0QsQ0FBQyxPQUF6RCxDQUFrRTtBQUFBLGdCQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsZ0JBQWMsTUFBQSxFQUFRLENBQUMsV0FBRCxFQUFjLHFCQUFkLENBQXRCO2VBQWxFLENBSEEsQ0FBQTtBQUFBLGNBTUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxnQkFBYyxNQUFBLEVBQVEsQ0FBQyxXQUFELENBQXRCO2VBQWpFLENBTkEsQ0FBQTtBQUFBLGNBT0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxnQkFBYyxNQUFBLEVBQVEsQ0FBQyxXQUFELENBQXRCO2VBQWpFLENBUEEsQ0FBQTtBQUFBLGNBUUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxnQkFBYyxNQUFBLEVBQVEsQ0FBQyxXQUFELENBQXRCO2VBQWpFLENBUkEsQ0FBQTtBQUFBLGNBV0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxnQkFBZSxNQUFBLEVBQVEsQ0FBQyxXQUFELENBQXZCO2VBQWpFLENBWEEsQ0FBQTtBQUFBLGNBWUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLElBQVA7QUFBQSxnQkFBYSxNQUFBLEVBQVEsQ0FBQyxXQUFELEVBQWMsb0JBQWQsQ0FBckI7ZUFBakUsQ0FaQSxDQUFBO0FBQUEsY0FlQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQXJELENBQXdELENBQUMsT0FBekQsQ0FBaUU7QUFBQSxnQkFBQSxLQUFBLEVBQU8sR0FBUDtBQUFBLGdCQUFZLE1BQUEsRUFBUSxDQUFDLFdBQUQsRUFBYyxxQkFBZCxDQUFwQjtlQUFqRSxDQWZBLENBQUE7QUFBQSxjQWlCQSxNQUFBLENBQU8sYUFBUCxDQUFxQixDQUFDLGdCQUF0QixDQUFBLENBakJBLENBQUE7QUFBQSxjQWtCQyxRQUFTLGFBQWEsQ0FBQyxXQUFZLENBQUEsQ0FBQSxJQWxCcEMsQ0FBQTtBQUFBLGNBbUJBLE1BQUEsQ0FBQSxLQUFZLENBQUMsWUFuQmIsQ0FBQTtxQkFvQkEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLE9BQWQsQ0FBc0I7QUFBQSxnQkFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLGdCQUFVLEdBQUEsRUFBSyxDQUFmO0FBQUEsZ0JBQWtCLEtBQUEsRUFBTyxDQUF6QjtlQUF0QixFQXJCeUM7WUFBQSxDQUEzQyxFQURtRDtVQUFBLENBQXJELENBckZBLENBQUE7aUJBNkdBLFFBQUEsQ0FBUyxrRUFBVCxFQUE2RSxTQUFBLEdBQUE7bUJBQzNFLEVBQUEsQ0FBRyxtRUFBSCxFQUF3RSxTQUFBLEdBQUE7QUFDdEUsa0JBQUEsS0FBQTtBQUFBLGNBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQWQsRUFBdUIsT0FBdkIsQ0FBQSxDQUFBO0FBQUEsY0FDQSxhQUFhLENBQUMsS0FBZCxDQUFBLENBREEsQ0FBQTtBQUFBLGNBR0EsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQsRUFBc0IsbUJBQXRCLENBSEEsQ0FBQTtBQUFBLGNBSUEsTUFBQSxDQUFPLGFBQVAsQ0FBcUIsQ0FBQyxnQkFBdEIsQ0FBQSxDQUpBLENBQUE7QUFBQSxjQUtDLFFBQVMsYUFBYSxDQUFDLFdBQVksQ0FBQSxDQUFBLElBTHBDLENBQUE7QUFBQSxjQU1BLE1BQUEsQ0FBQSxLQUFZLENBQUMsWUFOYixDQUFBO0FBQUEsY0FPQSxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsT0FBZCxDQUFzQjtBQUFBLGdCQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsZ0JBQVUsR0FBQSxFQUFLLENBQWY7QUFBQSxnQkFBa0IsS0FBQSxFQUFPLENBQXpCO2VBQXRCLENBUEEsQ0FBQTtBQUFBLGNBUUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBeEQsQ0FBK0QsQ0FBQyxPQUFoRSxDQUF3RSxDQUFDLFdBQUQsRUFBYyxrQkFBZCxFQUFrQyxtQ0FBbEMsQ0FBeEUsQ0FSQSxDQUFBO0FBQUEsY0FTQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUF4RCxDQUErRCxDQUFDLE9BQWhFLENBQXdFLENBQUMsV0FBRCxFQUFjLGtCQUFkLENBQXhFLENBVEEsQ0FBQTtBQUFBLGNBVUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBeEQsQ0FBK0QsQ0FBQyxPQUFoRSxDQUF3RSxDQUFDLFdBQUQsRUFBYyxrQkFBZCxDQUF4RSxDQVZBLENBQUE7QUFBQSxjQVdBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXhELENBQStELENBQUMsT0FBaEUsQ0FBd0UsQ0FBQyxXQUFELENBQXhFLENBWEEsQ0FBQTtBQUFBLGNBWUEsYUFBYSxDQUFDLEtBQWQsQ0FBQSxDQVpBLENBQUE7QUFBQSxjQWNBLFlBQUEsQ0FBQSxDQWRBLENBQUE7QUFBQSxjQWVBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXhELENBQStELENBQUMsT0FBaEUsQ0FBd0UsQ0FBQyxXQUFELEVBQWMsa0JBQWQsQ0FBeEUsQ0FmQSxDQUFBO0FBQUEsY0FnQkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBeEQsQ0FBK0QsQ0FBQyxPQUFoRSxDQUF3RSxDQUFDLFdBQUQsRUFBYyxrQkFBZCxDQUF4RSxDQWhCQSxDQUFBO0FBQUEsY0FpQkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBeEQsQ0FBK0QsQ0FBQyxPQUFoRSxDQUF3RSxDQUFDLFdBQUQsRUFBYyxrQkFBZCxDQUF4RSxDQWpCQSxDQUFBO0FBQUEsY0FrQkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBeEQsQ0FBK0QsQ0FBQyxHQUFHLENBQUMsSUFBcEUsQ0FBeUUsQ0FBQyxXQUFELEVBQWMsa0JBQWQsQ0FBekUsQ0FsQkEsQ0FBQTtBQUFBLGNBb0JBLE1BQUEsQ0FBTyxhQUFQLENBQXFCLENBQUMsZ0JBQXRCLENBQUEsQ0FwQkEsQ0FBQTtBQUFBLGNBcUJDLFFBQVMsYUFBYSxDQUFDLFdBQVksQ0FBQSxDQUFBLElBckJwQyxDQUFBO0FBQUEsY0FzQkEsTUFBQSxDQUFBLEtBQVksQ0FBQyxZQXRCYixDQUFBO3FCQXVCQSxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsT0FBZCxDQUFzQjtBQUFBLGdCQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsZ0JBQVUsR0FBQSxFQUFLLENBQWY7QUFBQSxnQkFBa0IsS0FBQSxFQUFPLENBQXpCO2VBQXRCLEVBeEJzRTtZQUFBLENBQXhFLEVBRDJFO1VBQUEsQ0FBN0UsRUE5RzRFO1FBQUEsQ0FBOUUsQ0FIQSxDQUFBO0FBQUEsUUE0SUEsUUFBQSxDQUFTLCtEQUFULEVBQTBFLFNBQUEsR0FBQTtpQkFDeEUsRUFBQSxDQUFHLGlHQUFILEVBQXNHLFNBQUEsR0FBQTtBQUNwRyxnQkFBQSxZQUFBO0FBQUEsWUFBQSxZQUFBLEdBQWUsQ0FBQyxDQUFDLGNBQUYsQ0FBaUIsZ0JBQWpCLEVBQW1DLGVBQWUsQ0FBQyxTQUFoQixHQUE0QixDQUEvRCxDQUFmLENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFkLEVBQXFCLFlBQXJCLENBREEsQ0FBQTtBQUFBLFlBRUEsTUFBQSxDQUFPLHdEQUFQLENBQXlELENBQUMsVUFBMUQsQ0FBQSxDQUZBLENBQUE7QUFBQSxZQUdBLE1BQUEsQ0FBTyx3REFBUCxDQUF5RCxDQUFDLFVBQTFELENBQUEsQ0FIQSxDQUFBO0FBQUEsWUFJQSxNQUFBLENBQU8sd0RBQVAsQ0FBeUQsQ0FBQyxTQUExRCxDQUFBLENBSkEsQ0FBQTtBQUFBLFlBTUEsWUFBQSxDQUFBLENBTkEsQ0FBQTtBQUFBLFlBT0EsTUFBQSxDQUFPLHdEQUFQLENBQXlELENBQUMsVUFBMUQsQ0FBQSxDQVBBLENBQUE7bUJBUUEsTUFBQSxDQUFPLHdEQUFQLENBQXlELENBQUMsVUFBMUQsQ0FBQSxFQVRvRztVQUFBLENBQXRHLEVBRHdFO1FBQUEsQ0FBMUUsQ0E1SUEsQ0FBQTtBQUFBLFFBd0pBLFFBQUEsQ0FBUyw0Q0FBVCxFQUF1RCxTQUFBLEdBQUE7aUJBQ3JELEVBQUEsQ0FBRyw0RUFBSCxFQUFpRixTQUFBLEdBQUE7bUJBQy9FLE1BQUEsQ0FBTyxlQUFlLENBQUMsa0JBQWhCLENBQW1DLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBbkMsQ0FBUCxDQUFrRCxDQUFDLE9BQW5ELENBQTJELENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBM0QsRUFEK0U7VUFBQSxDQUFqRixFQURxRDtRQUFBLENBQXZELENBeEpBLENBQUE7QUFBQSxRQTRKQSxRQUFBLENBQVMsMENBQVQsRUFBcUQsU0FBQSxHQUFBO2lCQUNuRCxFQUFBLENBQUcsNEVBQUgsRUFBaUYsU0FBQSxHQUFBO21CQUMvRSxNQUFBLENBQU8sZUFBZSxDQUFDLGtCQUFoQixDQUFtQyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQW5DLENBQVAsQ0FBbUQsQ0FBQyxPQUFwRCxDQUE0RCxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTVELEVBRCtFO1VBQUEsQ0FBakYsRUFEbUQ7UUFBQSxDQUFyRCxDQTVKQSxDQUFBO2VBZ0tBLEVBQUEsQ0FBRywwREFBSCxFQUErRCxTQUFBLEdBQUE7QUFDN0QsVUFBQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUF4RCxDQUFpRSxDQUFDLFVBQWxFLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUF4RCxDQUE4RCxDQUFDLElBQS9ELENBQW9FLElBQXBFLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBeEQsQ0FBaUUsQ0FBQyxVQUFsRSxDQUFBLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBeEQsQ0FBOEQsQ0FBQyxJQUEvRCxDQUFvRSxJQUFwRSxDQUhBLENBQUE7QUFBQSxVQUtBLGVBQWUsQ0FBQyxZQUFoQixDQUE2QixDQUE3QixDQUxBLENBQUE7QUFBQSxVQU1BLGFBQUEsQ0FBYyxlQUFkLENBTkEsQ0FBQTtBQUFBLFVBUUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBeEQsQ0FBaUUsQ0FBQyxVQUFsRSxDQUFBLENBUkEsQ0FBQTtBQUFBLFVBU0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBeEQsQ0FBOEQsQ0FBQyxJQUEvRCxDQUFvRSxNQUFwRSxDQVRBLENBQUE7QUFBQSxVQVVBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQXhELENBQWlFLENBQUMsU0FBbEUsQ0FBQSxDQVZBLENBQUE7aUJBV0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBeEQsQ0FBOEQsQ0FBQyxJQUEvRCxDQUFvRSxZQUFwRSxFQVo2RDtRQUFBLENBQS9ELEVBaks2QztNQUFBLENBQS9DLEVBeEc2QztJQUFBLENBQS9DLENBakNBLENBQUE7QUFBQSxJQXdUQSxRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQSxHQUFBO0FBQzdDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixFQURjO1FBQUEsQ0FBaEIsQ0FBQSxDQUFBO2VBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBK0IseUJBQS9CLENBQVQsQ0FBQTtBQUFBLFVBQ0EsZUFBQSxHQUFzQixJQUFBLGVBQUEsQ0FBZ0I7QUFBQSxZQUFDLFFBQUEsTUFBRDtXQUFoQixDQUR0QixDQUFBO2lCQUVBLGVBQUEsQ0FBZ0IsZUFBaEIsRUFIRztRQUFBLENBQUwsRUFKUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFTQSxTQUFBLENBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSxlQUFlLENBQUMsT0FBaEIsQ0FBQSxDQUFBLENBQUE7ZUFDQSxNQUFNLENBQUMsT0FBUCxDQUFBLEVBRlE7TUFBQSxDQUFWLENBVEEsQ0FBQTthQWFBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULGFBQUEsQ0FBYyxlQUFkLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBR0EsRUFBQSxDQUFHLHlFQUFILEVBQThFLFNBQUEsR0FBQTtBQUM1RSxjQUFBLGdDQUFBO0FBQUEsVUFBQSxXQUFBLEdBQWMsQ0FBQyxDQUFDLGNBQUYsQ0FBaUIsR0FBakIsRUFBc0IsZUFBZSxDQUFDLFlBQWhCLENBQUEsQ0FBdEIsQ0FBZCxDQUFBO0FBQUEsVUFDQSxXQUFBLEdBQWMsZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQURkLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxXQUFXLENBQUMsSUFBbkIsQ0FBd0IsQ0FBQyxJQUF6QixDQUErQixZQUFBLEdBQVcsV0FBMUMsQ0FGQSxDQUFBO0FBQUEsVUFHRSxTQUFXLFlBQVgsTUFIRixDQUFBO0FBQUEsVUFLQSxNQUFBLENBQU8sTUFBTSxDQUFDLE1BQWQsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixDQUEzQixDQUxBLENBQUE7QUFBQSxVQU1BLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBakIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixHQUE3QixDQU5BLENBQUE7QUFBQSxVQU9BLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBakIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixXQUE3QixDQVBBLENBQUE7QUFBQSxVQVFBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBakIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixXQUE3QixDQVJBLENBQUE7QUFBQSxVQVNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBakIsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBM0MsQ0FUQSxDQUFBO0FBQUEsVUFVQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQWpCLENBQTBCLENBQUMsVUFBM0IsQ0FBQSxDQVZBLENBQUE7QUFBQSxVQVdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBakIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixFQUE3QixDQVhBLENBQUE7aUJBYUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxJQUE5QyxDQUFtRCxDQUFDLElBQXBELENBQXlELEVBQUEsR0FBRSxXQUFGLEdBQWUsUUFBZixHQUFzQixXQUF0QixHQUFtQyx1QkFBNUYsRUFkNEU7UUFBQSxDQUE5RSxDQUhBLENBQUE7ZUFtQkEsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUEsR0FBQTtBQUN4RCxVQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsNkNBQWYsQ0FBQSxDQUFBO0FBQUEsVUFNQSxlQUFlLENBQUMsWUFBaEIsQ0FBNkIsQ0FBN0IsQ0FOQSxDQUFBO0FBQUEsVUFPQSxhQUFBLENBQWMsZUFBZCxDQVBBLENBQUE7QUFBQSxVQVNBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsSUFBOUMsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxlQUF6RCxDQVRBLENBQUE7QUFBQSxVQVVBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0FWQSxDQUFBO0FBQUEsVUFXQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF4RCxDQUFvRSxDQUFDLElBQXJFLENBQTBFLENBQTFFLENBWEEsQ0FBQTtBQUFBLFVBYUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxJQUE5QyxDQUFtRCxDQUFDLElBQXBELENBQXlELGVBQXpELENBYkEsQ0FBQTtBQUFBLFVBY0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEQsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxDQUExRSxDQWRBLENBQUE7QUFBQSxVQWVBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0FmQSxDQUFBO0FBQUEsVUFpQkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxJQUE5QyxDQUFtRCxDQUFDLElBQXBELENBQXlELG1CQUF6RCxDQWpCQSxDQUFBO0FBQUEsVUFrQkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEQsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxDQUExRSxDQWxCQSxDQUFBO0FBQUEsVUFtQkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEQsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxDQUExRSxDQW5CQSxDQUFBO0FBQUEsVUFxQkEsZUFBZSxDQUFDLFlBQWhCLENBQTZCLENBQTdCLENBckJBLENBQUE7QUFBQSxVQXNCQSxhQUFBLENBQWMsZUFBZCxDQXRCQSxDQUFBO0FBQUEsVUF3QkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxJQUE5QyxDQUFtRCxDQUFDLElBQXBELENBQXlELFlBQXpELENBeEJBLENBQUE7QUFBQSxVQXlCQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF4RCxDQUFvRSxDQUFDLElBQXJFLENBQTBFLENBQTFFLENBekJBLENBQUE7QUFBQSxVQTBCQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF4RCxDQUFvRSxDQUFDLElBQXJFLENBQTBFLENBQTFFLENBMUJBLENBQUE7QUFBQSxVQTRCQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLElBQTlDLENBQW1ELENBQUMsSUFBcEQsQ0FBeUQsZUFBekQsQ0E1QkEsQ0FBQTtBQUFBLFVBNkJBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0E3QkEsQ0FBQTtBQUFBLFVBOEJBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0E5QkEsQ0FBQTtBQUFBLFVBZ0NBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsSUFBOUMsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxrQkFBekQsQ0FoQ0EsQ0FBQTtBQUFBLFVBaUNBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0FqQ0EsQ0FBQTtBQUFBLFVBa0NBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0FsQ0EsQ0FBQTtBQUFBLFVBb0NBLGVBQWUsQ0FBQyxZQUFoQixDQUE2QixDQUE3QixDQXBDQSxDQUFBO0FBQUEsVUFxQ0EsYUFBQSxDQUFjLGVBQWQsQ0FyQ0EsQ0FBQTtBQUFBLFVBdUNBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsSUFBOUMsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxXQUF6RCxDQXZDQSxDQUFBO0FBQUEsVUF3Q0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEQsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxDQUExRSxDQXhDQSxDQUFBO0FBQUEsVUF5Q0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEQsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxDQUExRSxDQXpDQSxDQUFBO0FBQUEsVUEyQ0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxJQUE5QyxDQUFtRCxDQUFDLElBQXBELENBQXlELGFBQXpELENBM0NBLENBQUE7QUFBQSxVQTRDQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF4RCxDQUFvRSxDQUFDLElBQXJFLENBQTBFLENBQTFFLENBNUNBLENBQUE7QUFBQSxVQTZDQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF4RCxDQUFvRSxDQUFDLElBQXJFLENBQTBFLENBQTFFLENBN0NBLENBQUE7QUFBQSxVQStDQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLElBQTlDLENBQW1ELENBQUMsSUFBcEQsQ0FBeUQsZUFBekQsQ0EvQ0EsQ0FBQTtBQUFBLFVBZ0RBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0FoREEsQ0FBQTtBQUFBLFVBaURBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0FqREEsQ0FBQTtBQUFBLFVBbURBLGVBQWUsQ0FBQyxZQUFoQixDQUE2QixDQUE3QixDQW5EQSxDQUFBO0FBQUEsVUFvREEsYUFBQSxDQUFjLGVBQWQsQ0FwREEsQ0FBQTtBQUFBLFVBc0RBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsSUFBOUMsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxVQUF6RCxDQXREQSxDQUFBO0FBQUEsVUF1REEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEQsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxDQUExRSxDQXZEQSxDQUFBO0FBQUEsVUF3REEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEQsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxDQUExRSxDQXhEQSxDQUFBO0FBQUEsVUEwREEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxJQUE5QyxDQUFtRCxDQUFDLElBQXBELENBQXlELFlBQXpELENBMURBLENBQUE7QUFBQSxVQTJEQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF4RCxDQUFvRSxDQUFDLElBQXJFLENBQTBFLENBQTFFLENBM0RBLENBQUE7QUFBQSxVQTREQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF4RCxDQUFvRSxDQUFDLElBQXJFLENBQTBFLENBQTFFLENBNURBLENBQUE7QUFBQSxVQThEQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLElBQTlDLENBQW1ELENBQUMsSUFBcEQsQ0FBeUQsY0FBekQsQ0E5REEsQ0FBQTtBQUFBLFVBK0RBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXhELENBQW9FLENBQUMsSUFBckUsQ0FBMEUsQ0FBMUUsQ0EvREEsQ0FBQTtpQkFnRUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEQsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxDQUExRSxFQWpFd0Q7UUFBQSxDQUExRCxFQXBCNkM7TUFBQSxDQUEvQyxFQWQ2QztJQUFBLENBQS9DLENBeFRBLENBQUE7QUFBQSxJQTZaQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHFCQUE5QixFQURjO1FBQUEsQ0FBaEIsQ0FBQSxDQUFBO2VBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBK0Isc0JBQS9CLENBQVQsQ0FBQTtBQUFBLFVBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSx5Q0FBZixDQURBLENBQUE7QUFBQSxVQUtBLGVBQUEsR0FBc0IsSUFBQSxlQUFBLENBQWdCO0FBQUEsWUFBQyxRQUFBLE1BQUQ7V0FBaEIsQ0FMdEIsQ0FBQTtpQkFNQSxhQUFBLENBQWMsZUFBZCxFQVBHO1FBQUEsQ0FBTCxFQUpTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQWFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7QUFDUixRQUFBLGVBQWUsQ0FBQyxPQUFoQixDQUFBLENBQUEsQ0FBQTtlQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUEsRUFGUTtNQUFBLENBQVYsQ0FiQSxDQUFBO2FBaUJBLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBLEdBQUE7QUFDOUQsWUFBQSxnQ0FBQTtBQUFBLFFBQUEsV0FBQSxHQUFjLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBZCxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sV0FBVyxDQUFDLElBQW5CLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsc0JBQTlCLENBREEsQ0FBQTtBQUFBLFFBRUUsU0FBVyxZQUFYLE1BRkYsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxNQUFkLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsQ0FBM0IsQ0FKQSxDQUFBO0FBQUEsUUFLQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWpCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsR0FBN0IsQ0FMQSxDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWpCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsS0FBN0IsQ0FOQSxDQUFBO0FBQUEsUUFPQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWpCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsY0FBN0IsQ0FQQSxDQUFBO0FBQUEsUUFRQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQWpCLENBQTBCLENBQUMsVUFBM0IsQ0FBQSxDQVJBLENBQUE7QUFBQSxRQVNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBakIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixLQUE3QixDQVRBLENBQUE7QUFBQSxRQVVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBakIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixHQUE3QixDQVZBLENBQUE7QUFBQSxRQVlBLFdBQUEsR0FBYyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBWmQsQ0FBQTtBQUFBLFFBYUEsTUFBQSxDQUFPLFdBQVcsQ0FBQyxJQUFuQixDQUF3QixDQUFDLElBQXpCLENBQThCLG1CQUE5QixDQWJBLENBQUE7QUFBQSxRQWNFLFNBQVcsWUFBWCxNQWRGLENBQUE7QUFBQSxRQWdCQSxNQUFBLENBQU8sTUFBTSxDQUFDLE1BQWQsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixDQUEzQixDQWhCQSxDQUFBO0FBQUEsUUFpQkEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFqQixDQUF1QixDQUFDLElBQXhCLENBQTZCLElBQTdCLENBakJBLENBQUE7QUFBQSxRQWtCQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWpCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsY0FBN0IsQ0FsQkEsQ0FBQTtBQUFBLFFBbUJBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBakIsQ0FBdUIsQ0FBQyxVQUF4QixDQUFBLENBbkJBLENBQUE7QUFBQSxRQW9CQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWpCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsS0FBN0IsQ0FwQkEsQ0FBQTtlQXFCQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWpCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsRUFBN0IsRUF0QjhEO01BQUEsQ0FBaEUsRUFsQnlEO0lBQUEsQ0FBM0QsQ0E3WkEsQ0FBQTtBQUFBLElBdWNBLFFBQUEsQ0FBUywrQkFBVCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsTUFBQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLFlBQUEsd0JBQUE7QUFBQSxRQUFBLE1BQUEsR0FBUyxJQUFULENBQUE7QUFBQSxRQUNBLGdCQUFBLEdBQW1CLE9BQU8sQ0FBQyxTQUFSLENBQWtCLG1CQUFsQixDQURuQixDQUFBO0FBQUEsUUFHQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWIsQ0FBa0IsV0FBbEIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxTQUFDLENBQUQsR0FBQTttQkFBTyxNQUFBLEdBQVMsRUFBaEI7VUFBQSxDQUFwQyxFQURjO1FBQUEsQ0FBaEIsQ0FIQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsZUFBQSxHQUFrQixNQUFNLENBQUMsYUFBYSxDQUFDLGVBQXZDLENBQUE7QUFBQSxVQUNBLGVBQWUsQ0FBQyxhQUFoQixDQUE4QixnQkFBOUIsQ0FEQSxDQUFBO0FBQUEsVUFFQSxhQUFBLENBQWMsZUFBZCxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLGdCQUFnQixDQUFDLFNBQXhCLENBQWtDLENBQUMsSUFBbkMsQ0FBd0MsQ0FBeEMsRUFKRztRQUFBLENBQUwsRUFQZ0M7TUFBQSxDQUFsQyxDQUFBLENBQUE7YUFhQSxFQUFBLENBQUcsK0RBQUgsRUFBb0UsU0FBQSxHQUFBO0FBQ2xFLFlBQUEsd0JBQUE7QUFBQSxRQUFBLE1BQUEsR0FBUyxJQUFULENBQUE7QUFBQSxRQUNBLGdCQUFBLEdBQW1CLE9BQU8sQ0FBQyxTQUFSLENBQWtCLG1CQUFsQixDQURuQixDQUFBO0FBQUEsUUFHQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWIsQ0FBa0IsV0FBbEIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxTQUFDLENBQUQsR0FBQTttQkFBTyxNQUFBLEdBQVMsRUFBaEI7VUFBQSxDQUFwQyxFQURjO1FBQUEsQ0FBaEIsQ0FIQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsZUFBQSxHQUFrQixNQUFNLENBQUMsYUFBYSxDQUFDLGVBQXZDLENBQUE7QUFBQSxVQUNBLGFBQUEsQ0FBYyxlQUFkLENBREEsQ0FBQTtBQUFBLFVBR0EsZUFBZSxDQUFDLGFBQWhCLENBQThCLGdCQUE5QixDQUhBLENBQUE7QUFBQSxVQUlBLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBa0IsQ0FBQyxNQUFuQixDQUEwQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQTFCLEVBQWtDLEdBQWxDLENBSkEsQ0FBQTtBQUFBLFVBS0EsYUFBQSxDQUFjLGVBQWQsQ0FMQSxDQUFBO2lCQU1BLE1BQUEsQ0FBTyxnQkFBUCxDQUF3QixDQUFDLEdBQUcsQ0FBQyxnQkFBN0IsQ0FBQSxFQVBHO1FBQUEsQ0FBTCxFQVBrRTtNQUFBLENBQXBFLEVBZHdDO0lBQUEsQ0FBMUMsQ0F2Y0EsQ0FBQTtBQUFBLElBcWVBLFFBQUEsQ0FBUyx3RUFBVCxFQUFtRixTQUFBLEdBQUE7QUFDakYsTUFBQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFlBQUEsd0JBQUE7QUFBQSxRQUFBLE1BQUEsR0FBUyxJQUFULENBQUE7QUFBQSxRQUNBLGVBQUEsR0FBa0IsSUFEbEIsQ0FBQTtBQUFBLFFBRUEsZ0JBQUEsR0FBbUIsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsbUJBQWxCLENBRm5CLENBQUE7QUFBQSxRQUlBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixlQUFsQixDQUFrQyxDQUFDLElBQW5DLENBQXdDLFNBQUMsQ0FBRCxHQUFBO21CQUFPLE1BQUEsR0FBUyxFQUFoQjtVQUFBLENBQXhDLEVBRGM7UUFBQSxDQUFoQixDQUpBLENBQUE7QUFBQSxRQU9BLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGFBQWEsQ0FBQyxlQUF2QyxDQUFBO0FBQUEsVUFDQSxlQUFlLENBQUMsYUFBaEIsQ0FBOEIsZ0JBQTlCLENBREEsQ0FBQTtBQUFBLFVBRUEsYUFBQSxDQUFjLGVBQWQsQ0FGQSxDQUFBO2lCQUdBLGdCQUFnQixDQUFDLEtBQWpCLENBQUEsRUFKRztRQUFBLENBQUwsQ0FQQSxDQUFBO0FBQUEsUUFhQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCLEVBRGM7UUFBQSxDQUFoQixDQWJBLENBQUE7ZUFnQkEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsYUFBQSxDQUFjLGVBQWQsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxTQUF4QixDQUFrQyxDQUFDLElBQW5DLENBQXdDLENBQXhDLEVBRkc7UUFBQSxDQUFMLEVBakJtQztNQUFBLENBQXJDLENBQUEsQ0FBQTthQXFCQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO0FBRTNCLFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixFQURjO1FBQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsUUFHQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFEYztRQUFBLENBQWhCLENBSEEsQ0FBQTtBQUFBLFFBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBQSxDQUFULENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsdURBQWYsQ0FEQSxDQUFBO0FBQUEsVUFFQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQjtBQUFBLFlBQUMsUUFBQSxNQUFEO1dBQWhCLENBRnRCLENBQUE7QUFBQSxVQUdBLGVBQWUsQ0FBQyxVQUFoQixDQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsVUFBMUIsQ0FBM0IsQ0FIQSxDQUFBO0FBQUEsVUFJQSxhQUFBLENBQWMsZUFBZCxDQUpBLENBQUE7QUFBQSxVQU1DLFNBQVUsZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxFQUFWLE1BTkQsQ0FBQTtpQkFPQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsWUFBQSxLQUFBLEVBQU8sb0JBQVA7QUFBQSxZQUE2QixNQUFBLEVBQVEsQ0FBQyxnQkFBRCxDQUFyQztXQUExQixFQVJHO1FBQUEsQ0FBTCxDQU5BLENBQUE7QUFBQSxRQWdCQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFEYztRQUFBLENBQWhCLENBaEJBLENBQUE7ZUFtQkEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsTUFBQTtBQUFBLFVBQUEsYUFBQSxDQUFjLGVBQWQsQ0FBQSxDQUFBO0FBQUEsVUFDQyxTQUFVLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsRUFBVixNQURELENBQUE7aUJBRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFlBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxZQUFZLE1BQUEsRUFBUSxDQUFDLGdCQUFELEVBQWtCLHlCQUFsQixFQUE0Qyx1Q0FBNUMsQ0FBcEI7V0FBMUIsRUFIRztRQUFBLENBQUwsRUFyQjJCO01BQUEsQ0FBN0IsRUF0QmlGO0lBQUEsQ0FBbkYsQ0FyZUEsQ0FBQTtBQUFBLElBcWhCQSxRQUFBLENBQVMsNkJBQVQsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLE1BQUEsU0FBQSxDQUFVLFNBQUEsR0FBQTtBQUNSLFFBQUEsZUFBZSxDQUFDLE9BQWhCLENBQUEsQ0FBQSxDQUFBO2VBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUZRO01BQUEsQ0FBVixDQUFBLENBQUE7YUFJQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBK0IsV0FBL0IsQ0FBVCxDQUFBO0FBQUEsUUFDQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQjtBQUFBLFVBQUMsUUFBQSxNQUFEO1NBQWhCLENBRHRCLENBQUE7QUFBQSxRQUVBLGFBQUEsQ0FBYyxlQUFkLENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxnQkFBaEIsQ0FBaUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFqQyxDQUF1QyxDQUFDLE1BQS9DLENBQXNELENBQUMsT0FBdkQsQ0FBK0QsQ0FBQyxXQUFELENBQS9ELENBSEEsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxnQkFBaEIsQ0FBaUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFqQyxDQUF1QyxDQUFDLE1BQS9DLENBQXNELENBQUMsT0FBdkQsQ0FBK0QsQ0FBQyxXQUFELENBQS9ELENBSkEsQ0FBQTtlQUtBLE1BQUEsQ0FBTyxlQUFlLENBQUMsZ0JBQWhCLENBQWlDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBakMsQ0FBdUMsQ0FBQyxNQUEvQyxDQUFzRCxDQUFDLE9BQXZELENBQStELENBQUMsV0FBRCxFQUFjLHFCQUFkLENBQS9ELEVBTjJDO01BQUEsQ0FBN0MsRUFMc0M7SUFBQSxDQUF4QyxDQXJoQkEsQ0FBQTtBQUFBLElBa2lCQSxRQUFBLENBQVMsb0RBQVQsRUFBK0QsU0FBQSxHQUFBO0FBQzdELE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBK0IsV0FBL0IsQ0FBVCxDQUFBO0FBQUEsUUFDQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQjtBQUFBLFVBQUMsUUFBQSxNQUFEO1NBQWhCLENBRHRCLENBQUE7ZUFFQSxhQUFBLENBQWMsZUFBZCxFQUhTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUtBLFFBQUEsQ0FBUyw0REFBVCxFQUF1RSxTQUFBLEdBQUE7ZUFDckUsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUEsR0FBQTtpQkFDMUIsTUFBQSxDQUFPLGVBQWUsQ0FBQyw2QkFBaEIsQ0FBOEMsUUFBOUMsRUFBd0QsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4RCxDQUFQLENBQXVFLENBQUMsU0FBeEUsQ0FBQSxFQUQwQjtRQUFBLENBQTVCLEVBRHFFO01BQUEsQ0FBdkUsQ0FMQSxDQUFBO0FBQUEsTUFTQSxRQUFBLENBQVMsMERBQVQsRUFBcUUsU0FBQSxHQUFBO2VBQ25FLEVBQUEsQ0FBRyx3Q0FBSCxFQUE2QyxTQUFBLEdBQUE7aUJBQzNDLE1BQUEsQ0FBTyxlQUFlLENBQUMsNkJBQWhCLENBQThDLHNCQUE5QyxFQUFzRSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXRFLENBQVAsQ0FBcUYsQ0FBQyxPQUF0RixDQUE4RixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUE5RixFQUQyQztRQUFBLENBQTdDLEVBRG1FO01BQUEsQ0FBckUsQ0FUQSxDQUFBO2FBYUEsUUFBQSxDQUFTLG9FQUFULEVBQStFLFNBQUEsR0FBQTtlQUM3RSxFQUFBLENBQUcsMEVBQUgsRUFBK0UsU0FBQSxHQUFBO2lCQUM3RSxNQUFBLENBQU8sZUFBZSxDQUFDLDZCQUFoQixDQUE4QyxXQUE5QyxFQUEyRCxDQUFDLENBQUQsRUFBSSxFQUFKLENBQTNELENBQVAsQ0FBMkUsQ0FBQyxPQUE1RSxDQUFvRixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBVCxDQUFwRixFQUQ2RTtRQUFBLENBQS9FLEVBRDZFO01BQUEsQ0FBL0UsRUFkNkQ7SUFBQSxDQUEvRCxDQWxpQkEsQ0FBQTtBQUFBLElBb2pCQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELE1BQUEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtBQUNsRCxRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFiLENBQStCLFdBQS9CLENBQVQsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxRQUFmLENBREEsQ0FBQTtBQUFBLFFBRUEsZUFBQSxHQUFzQixJQUFBLGVBQUEsQ0FBZ0I7QUFBQSxVQUFDLFFBQUEsTUFBRDtTQUFoQixDQUZ0QixDQUFBO0FBQUEsUUFHQSxhQUFBLENBQWMsZUFBZCxDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxlQUFlLENBQUMsZ0JBQWhCLENBQWlDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBakMsQ0FBdUMsQ0FBQyxLQUEvQyxDQUFxRCxDQUFDLElBQXRELENBQTJELElBQTNELENBSkEsQ0FBQTtBQUFBLFFBS0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQyxDQUFwQyxDQUxBLENBQUE7ZUFNQSxNQUFBLENBQU8sZUFBZSxDQUFDLGdCQUFoQixDQUFpQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQWpDLENBQXVDLENBQUMsS0FBL0MsQ0FBcUQsQ0FBQyxJQUF0RCxDQUEyRCxRQUEzRCxFQVBrRDtNQUFBLENBQXBELENBQUEsQ0FBQTthQVNBLEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBLEdBQUE7QUFDcEQsUUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBYixDQUErQixXQUEvQixDQUFULENBQUE7QUFBQSxRQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZixDQURBLENBQUE7QUFBQSxRQUVBLGVBQUEsR0FBc0IsSUFBQSxlQUFBLENBQWdCO0FBQUEsVUFBQyxRQUFBLE1BQUQ7U0FBaEIsQ0FGdEIsQ0FBQTtBQUFBLFFBR0EsYUFBQSxDQUFjLGVBQWQsQ0FIQSxDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sZUFBZSxDQUFDLGdCQUFoQixDQUFpQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQWpDLENBQXVDLENBQUMsS0FBL0MsQ0FBcUQsQ0FBQyxJQUF0RCxDQUEyRCxJQUEzRCxDQUpBLENBQUE7QUFBQSxRQUtBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0MsQ0FBcEMsQ0FMQSxDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sZUFBZSxDQUFDLGdCQUFoQixDQUFpQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQWpDLENBQXVDLENBQUMsS0FBL0MsQ0FBcUQsQ0FBQyxJQUF0RCxDQUEyRCxHQUEzRCxDQU5BLENBQUE7QUFBQSxRQU9BLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0MsQ0FBcEMsQ0FQQSxDQUFBO2VBUUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxnQkFBaEIsQ0FBaUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFqQyxDQUF1QyxDQUFDLEtBQS9DLENBQXFELENBQUMsSUFBdEQsQ0FBMkQsSUFBM0QsRUFUb0Q7TUFBQSxDQUF0RCxFQVZ5RDtJQUFBLENBQTNELENBcGpCQSxDQUFBO0FBQUEsSUF5a0JBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFFQSxFQUFBLENBQUcsOERBQUgsRUFBbUUsU0FBQSxHQUFBO0FBQ2pFLFFBQUEsTUFBQSxHQUFhLElBQUEsVUFBQSxDQUFXO0FBQUEsVUFBQSxJQUFBLEVBQU0seUNBQU47U0FBWCxDQUFiLENBQUE7QUFBQSxRQUNBLGVBQUEsR0FBc0IsSUFBQSxlQUFBLENBQWdCO0FBQUEsVUFBQyxRQUFBLE1BQUQ7U0FBaEIsQ0FEdEIsQ0FBQTtBQUFBLFFBRUEsYUFBQSxDQUFjLGVBQWQsQ0FGQSxDQUFBO0FBQUEsUUFJQSxlQUFlLENBQUMsYUFBaEIsQ0FBOEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxHQUFQO0FBQUEsVUFBWSxHQUFBLEVBQUssR0FBakI7U0FBOUIsQ0FKQSxDQUFBO0FBQUEsUUFLQSxhQUFBLENBQWMsZUFBZCxDQUxBLENBQUE7QUFBQSxRQU9BLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsSUFBOUMsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCx1Q0FBekQsQ0FQQSxDQUFBO2VBU0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxJQUF2QyxDQUFBLENBQTZDLENBQUMsSUFBckQsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSx1Q0FBaEUsRUFWaUU7TUFBQSxDQUFuRSxDQUZBLENBQUE7YUFjQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFlBQUEsa0JBQUE7QUFBQSxRQUFBLE1BQUEsR0FBYSxJQUFBLFVBQUEsQ0FBVztBQUFBLFVBQUEsSUFBQSxFQUFNLGlIQUFOO1NBQVgsQ0FBYixDQUFBO0FBQUEsUUFDQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQjtBQUFBLFVBQUMsUUFBQSxNQUFEO1NBQWhCLENBRHRCLENBQUE7QUFBQSxRQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsSUFBekMsQ0FIQSxDQUFBO0FBQUEsUUFJQSxlQUFlLENBQUMsYUFBaEIsQ0FBOEI7QUFBQSxVQUFBLEVBQUEsRUFBSSxHQUFKO0FBQUEsVUFBUyxHQUFBLEVBQUssR0FBZDtTQUE5QixDQUpBLENBQUE7QUFBQSxRQUtBLGFBQUEsQ0FBYyxlQUFkLENBTEEsQ0FBQTtBQUFBLFFBT0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxtQkFBOUMsQ0FBa0UsQ0FBQyxPQUFuRSxDQUEyRSxDQUFDLEdBQUQsRUFBTSxHQUFOLENBQTNFLENBUEEsQ0FBQTtBQUFBLFFBUUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxtQkFBOUMsQ0FBa0UsQ0FBQyxPQUFuRSxDQUEyRSxDQUFDLEdBQUQsQ0FBM0UsQ0FSQSxDQUFBO0FBQUEsUUFXQSxRQUFnQixlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsVUFBdkMsQ0FBa0QsRUFBbEQsQ0FBaEIsRUFBQyxlQUFELEVBQU8sZ0JBWFAsQ0FBQTtBQUFBLFFBWUEsTUFBQSxDQUFPLElBQUksQ0FBQyxtQkFBWixDQUFnQyxDQUFDLElBQWpDLENBQXNDLElBQXRDLENBWkEsQ0FBQTtBQUFBLFFBYUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxtQkFBYixDQUFpQyxDQUFDLE9BQWxDLENBQTBDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBMUMsQ0FiQSxDQUFBO0FBQUEsUUFlQSxlQUFlLENBQUMsYUFBaEIsQ0FBOEI7QUFBQSxVQUFBLEVBQUEsRUFBSSxHQUFKO0FBQUEsVUFBUyxHQUFBLEVBQUssS0FBZDtTQUE5QixDQWZBLENBQUE7QUFBQSxRQWdCQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLG1CQUE5QyxDQUFrRSxDQUFDLE9BQW5FLENBQTJFLENBQUMsR0FBRCxDQUEzRSxDQWhCQSxDQUFBO2VBaUJBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsbUJBQTlDLENBQWtFLENBQUMsT0FBbkUsQ0FBMkUsRUFBM0UsRUFsQm1EO01BQUEsQ0FBckQsRUFmNEM7SUFBQSxDQUE5QyxDQXprQkEsQ0FBQTtBQUFBLElBNG1CQSxRQUFBLENBQVMsaUNBQVQsRUFBNEMsU0FBQSxHQUFBO0FBQzFDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWIsQ0FBK0IsV0FBL0IsQ0FBVCxDQUFBO0FBQUEsUUFDQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQjtBQUFBLFVBQUMsUUFBQSxNQUFEO1NBQWhCLENBRHRCLENBQUE7ZUFFQSxhQUFBLENBQWMsZUFBZCxFQUhTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUtBLEVBQUEsQ0FBRywwRUFBSCxFQUErRSxTQUFBLEdBQUE7QUFDN0UsUUFBQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyx1QkFBeEQsQ0FBZ0YsQ0FBQyxJQUFqRixDQUFzRixJQUF0RixDQUFBLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLHVCQUF4RCxDQUFnRixDQUFDLElBQWpGLENBQXNGLENBQXRGLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQXhELENBQWdGLENBQUMsSUFBakYsQ0FBc0YsSUFBdEYsQ0FGQSxDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyx1QkFBeEQsQ0FBZ0YsQ0FBQyxJQUFqRixDQUFzRixDQUF0RixDQUpBLENBQUE7QUFBQSxRQUtBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLHVCQUF4RCxDQUFnRixDQUFDLElBQWpGLENBQXNGLENBQXRGLENBTEEsQ0FBQTtBQUFBLFFBTUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQXhELENBQWdGLENBQUMsSUFBakYsQ0FBc0YsSUFBdEYsQ0FOQSxDQUFBO0FBQUEsUUFTQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZCxFQUFzQixHQUF0QixDQVRBLENBQUE7QUFBQSxRQVVBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLHVCQUF4RCxDQUFnRixDQUFDLElBQWpGLENBQXNGLENBQXRGLENBVkEsQ0FBQTtBQUFBLFFBV0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQXhELENBQWdGLENBQUMsSUFBakYsQ0FBc0YsSUFBdEYsQ0FYQSxDQUFBO0FBQUEsUUFjQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBZCxFQUF1QixJQUF2QixDQWRBLENBQUE7ZUFlQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxFQUFwQyxDQUF1QyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyx1QkFBekQsQ0FBaUYsQ0FBQyxJQUFsRixDQUF1RixJQUF2RixFQWhCNkU7TUFBQSxDQUEvRSxDQUxBLENBQUE7QUFBQSxNQXVCQSxFQUFBLENBQUcsZ0ZBQUgsRUFBcUYsU0FBQSxHQUFBO0FBQ25GLFFBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUQsRUFBSSxRQUFKLENBQWQsRUFBNkIsSUFBN0IsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxFQUFBLENBQUcsQ0FBQyw0QkFBekQsQ0FBc0YsQ0FBQyxJQUF2RixDQUE0RixJQUE1RixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLEVBQUEsQ0FBRyxDQUFDLDRCQUF6RCxDQUFzRixDQUFDLElBQXZGLENBQTRGLENBQTVGLENBRkEsQ0FBQTtBQUFBLFFBS0EsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQUQsRUFBVSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVYsQ0FBdEIsRUFBMEMsSUFBMUMsQ0FMQSxDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLE1BQU8sQ0FBQSxFQUFBLENBQUcsQ0FBQyw0QkFBekQsQ0FBc0YsQ0FBQyxJQUF2RixDQUE0RixJQUE1RixDQU5BLENBQUE7QUFBQSxRQU9BLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsTUFBTyxDQUFBLEVBQUEsQ0FBRyxDQUFDLDRCQUF6RCxDQUFzRixDQUFDLElBQXZGLENBQTRGLENBQTVGLENBUEEsQ0FBQTtBQUFBLFFBVUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQWQsRUFBdUIsSUFBdkIsQ0FWQSxDQUFBO2VBV0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsRUFBcEMsQ0FBdUMsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsNEJBQXpELENBQXNGLENBQUMsSUFBdkYsQ0FBNEYsQ0FBNUYsRUFabUY7TUFBQSxDQUFyRixDQXZCQSxDQUFBO0FBQUEsTUFxQ0EsRUFBQSxDQUFHLDJFQUFILEVBQWdGLFNBQUEsR0FBQTtBQUM5RSxZQUFBLHdDQUFBO0FBQUEsUUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLFFBQUosQ0FBZCxFQUE2QixJQUE3QixDQUFBLENBQUE7QUFBQSxRQUNBLGFBQUEsR0FBZ0IsZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQURoQixDQUFBO0FBQUEsUUFFQSxRQUF1QixhQUFhLENBQUMsVUFBZCxDQUF5QixFQUF6QixDQUF2QixFQUFDLG1CQUFELEVBQVcsbUJBRlgsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBMUIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxHQUF0QyxDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxRQUFRLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLDRCQUExQixDQUF1RCxDQUFDLElBQXhELENBQTZELElBQTdELENBSkEsQ0FBQTtBQUFBLFFBS0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBMUIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxJQUF0QyxDQUxBLENBQUE7ZUFNQSxNQUFBLENBQU8sUUFBUSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyw0QkFBMUIsQ0FBdUQsQ0FBQyxJQUF4RCxDQUE2RCxDQUE3RCxFQVA4RTtNQUFBLENBQWhGLENBckNBLENBQUE7QUFBQSxNQThDQSxFQUFBLENBQUcsbUdBQUgsRUFBd0csU0FBQSxHQUFBO0FBQ3RHLFlBQUEsSUFBQTtBQUFBLFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSx5Q0FBZixDQUFBLENBQUE7QUFBQSxRQUVBLGVBQWUsQ0FBQyxhQUFoQixDQUE4QjtBQUFBLFVBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxVQUFZLEdBQUEsRUFBSyxHQUFqQjtTQUE5QixDQUZBLENBQUE7QUFBQSxRQUdBLGFBQUEsQ0FBYyxlQUFkLENBSEEsQ0FBQTtBQUFBLFFBS0EsSUFBQSxHQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxJQUF2QyxDQUFBLENBTFAsQ0FBQTtBQUFBLFFBTUEsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQXRCLENBQThDLENBQUMsSUFBL0MsQ0FBb0QsQ0FBcEQsQ0FOQSxDQUFBO2VBT0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFPLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFaLEdBQXFCLENBQXJCLENBQXVCLENBQUMsNEJBQTNDLENBQXdFLENBQUMsSUFBekUsQ0FBOEUsQ0FBOUUsRUFSc0c7TUFBQSxDQUF4RyxDQTlDQSxDQUFBO2FBd0RBLEVBQUEsQ0FBRyx5SEFBSCxFQUE4SCxTQUFBLEdBQUE7QUFDNUgsWUFBQSxtQ0FBQTtBQUFBLFFBQUEsZUFBZSxDQUFDLGFBQWhCLENBQThCO0FBQUEsVUFBQSxLQUFBLEVBQU8sR0FBUDtTQUE5QixDQUFBLENBQUE7QUFBQSxRQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsU0FBZixDQURBLENBQUE7QUFBQSxRQUVBLGFBQUEsQ0FBYyxlQUFkLENBRkEsQ0FBQTtBQUFBLFFBR0EsS0FBQSxHQUFRLGVBQWUsQ0FBQyxjQUFlLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FIakQsQ0FBQTtBQUFBLFFBS0EsUUFBMEIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLENBQTFCLEVBQUMsb0JBQUQsRUFBWSxxQkFMWixDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sU0FBUyxDQUFDLHNCQUFqQixDQUF3QyxDQUFDLElBQXpDLENBQThDLElBQTlDLENBTkEsQ0FBQTtBQUFBLFFBT0EsTUFBQSxDQUFPLFNBQVMsQ0FBQyx1QkFBakIsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxDQUEvQyxDQVBBLENBQUE7QUFBQSxRQVFBLE1BQUEsQ0FBTyxTQUFTLENBQUMsNEJBQWpCLENBQThDLENBQUMsSUFBL0MsQ0FBb0QsSUFBcEQsQ0FSQSxDQUFBO0FBQUEsUUFVQSxNQUFBLENBQU8sU0FBUyxDQUFDLHNCQUFqQixDQUF3QyxDQUFDLElBQXpDLENBQThDLElBQTlDLENBVkEsQ0FBQTtBQUFBLFFBV0EsTUFBQSxDQUFPLFVBQVUsQ0FBQyx1QkFBbEIsQ0FBMEMsQ0FBQyxJQUEzQyxDQUFnRCxJQUFoRCxDQVhBLENBQUE7ZUFZQSxNQUFBLENBQU8sVUFBVSxDQUFDLDRCQUFsQixDQUErQyxDQUFDLElBQWhELENBQXFELENBQXJELEVBYjRIO01BQUEsQ0FBOUgsRUF6RDBDO0lBQUEsQ0FBNUMsQ0E1bUJBLENBQUE7V0FvckJBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFiLENBQStCLFdBQS9CLENBQVQsQ0FBQTtBQUFBLFFBQ0EsZUFBQSxHQUFzQixJQUFBLGVBQUEsQ0FBZ0I7QUFBQSxVQUFDLFFBQUEsTUFBRDtTQUFoQixDQUR0QixDQUFBO2VBRUEsYUFBQSxDQUFjLGVBQWQsRUFIUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFLQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO2VBQ3JDLEVBQUEsQ0FBRyxpRUFBSCxFQUFzRSxTQUFBLEdBQUE7QUFDcEUsVUFBQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLFdBQTlDLENBQTBELENBQUMsSUFBM0QsQ0FBZ0UsQ0FBaEUsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLFdBQTlDLENBQTBELENBQUMsSUFBM0QsQ0FBZ0UsQ0FBaEUsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLFdBQTlDLENBQTBELENBQUMsSUFBM0QsQ0FBZ0UsQ0FBaEUsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZCxFQUFzQixHQUF0QixDQUhBLENBQUE7aUJBSUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxXQUE5QyxDQUEwRCxDQUFDLElBQTNELENBQWdFLEdBQWhFLEVBTG9FO1FBQUEsQ0FBdEUsRUFEcUM7TUFBQSxDQUF2QyxDQUxBLENBQUE7QUFBQSxNQWFBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7ZUFDakMsRUFBQSxDQUFHLHdGQUFILEVBQTZGLFNBQUEsR0FBQTtBQUMzRixVQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFkLEVBQXVCLE1BQXZCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLEVBQUQsRUFBSyxRQUFMLENBQWQsRUFBOEIsTUFBOUIsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxFQUFwQyxDQUF1QyxDQUFDLFdBQS9DLENBQTJELENBQUMsSUFBNUQsQ0FBaUUsQ0FBakUsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxFQUFwQyxDQUF1QyxDQUFDLFdBQS9DLENBQTJELENBQUMsSUFBNUQsQ0FBaUUsQ0FBakUsQ0FIQSxDQUFBO0FBQUEsVUFLQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLFFBQUosQ0FBZCxFQUE2QixNQUE3QixDQUxBLENBQUE7QUFBQSxVQU1BLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsV0FBOUMsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxDQUFoRSxDQU5BLENBQUE7QUFBQSxVQU9BLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsV0FBOUMsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxDQUFoRSxDQVBBLENBQUE7QUFBQSxVQVNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZixDQVRBLENBQUE7aUJBVUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxXQUE5QyxDQUEwRCxDQUFDLElBQTNELENBQWdFLENBQWhFLEVBWDJGO1FBQUEsQ0FBN0YsRUFEaUM7TUFBQSxDQUFuQyxDQWJBLENBQUE7YUEyQkEsUUFBQSxDQUFTLGdFQUFULEVBQTJFLFNBQUEsR0FBQTtBQUN6RSxRQUFBLEVBQUEsQ0FBRyxnRUFBSCxFQUFxRSxTQUFBLEdBQUE7QUFDbkUsVUFBQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxFQUFwQyxDQUF1QyxDQUFDLFdBQS9DLENBQTJELENBQUMsSUFBNUQsQ0FBaUUsQ0FBakUsQ0FBQSxDQUFBO0FBQUEsVUFFQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBZCxFQUF1QixJQUF2QixDQUZBLENBQUE7QUFBQSxVQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFkLEVBQXVCLElBQXZCLENBSEEsQ0FBQTtpQkFJQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxFQUFwQyxDQUF1QyxDQUFDLFdBQS9DLENBQTJELENBQUMsSUFBNUQsQ0FBaUUsQ0FBakUsRUFMbUU7UUFBQSxDQUFyRSxDQUFBLENBQUE7QUFBQSxRQU9BLEVBQUEsQ0FBRyx1RUFBSCxFQUE0RSxTQUFBLEdBQUE7QUFDMUUsVUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBZCxFQUF1QixJQUF2QixDQUFBLENBQUE7QUFBQSxVQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFkLEVBQXVCLElBQXZCLENBSEEsQ0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsRUFBcEMsQ0FBdUMsQ0FBQyxXQUEvQyxDQUEyRCxDQUFDLElBQTVELENBQWlFLENBQWpFLENBSkEsQ0FBQTtBQUFBLFVBTUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQWQsRUFBdUIsSUFBdkIsQ0FOQSxDQUFBO0FBQUEsVUFPQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxFQUFwQyxDQUF1QyxDQUFDLFdBQS9DLENBQTJELENBQUMsSUFBNUQsQ0FBaUUsQ0FBakUsQ0FQQSxDQUFBO2lCQVFBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLEVBQXBDLENBQVAsQ0FBK0MsQ0FBQyxHQUFHLENBQUMsV0FBcEQsQ0FBQSxFQVQwRTtRQUFBLENBQTVFLENBUEEsQ0FBQTtBQUFBLFFBa0JBLEVBQUEsQ0FBRyxnRkFBSCxFQUFxRixTQUFBLEdBQUE7QUFFbkYsVUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZCxFQUFzQixNQUF0QixDQUFBLENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkLEVBQXNCLE1BQXRCLENBREEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxXQUE5QyxDQUEwRCxDQUFDLElBQTNELENBQWdFLENBQWhFLENBSEEsQ0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxXQUE5QyxDQUEwRCxDQUFDLElBQTNELENBQWdFLENBQWhFLENBSkEsQ0FBQTtBQUFBLFVBS0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsQ0FBcEMsQ0FBc0MsQ0FBQyxXQUE5QyxDQUEwRCxDQUFDLElBQTNELENBQWdFLENBQWhFLENBTEEsQ0FBQTtBQUFBLFVBTUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsRUFBcEMsQ0FBdUMsQ0FBQyxXQUEvQyxDQUEyRCxDQUFDLElBQTVELENBQWlFLENBQWpFLENBTkEsQ0FBQTtBQUFBLFVBT0EsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsRUFBcEMsQ0FBdUMsQ0FBQyxXQUEvQyxDQUEyRCxDQUFDLElBQTVELENBQWlFLENBQWpFLENBUEEsQ0FBQTtBQUFBLFVBU0EsZUFBZSxDQUFDLFdBQWhCLENBQTRCLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsZUFBbEIsQ0FBNUMsQ0FUQSxDQUFBO0FBQUEsVUFXQSxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBVCxDQUF0QixFQUF5Qyx1REFBekMsQ0FYQSxDQUFBO0FBQUEsVUFhQSxNQUFBLENBQUEsYUFBb0IsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFFLENBQUMsWUFidkMsQ0FBQTtBQUFBLFVBY0EsTUFBQSxDQUFPLGFBQVAsQ0FBcUIsQ0FBQyxvQkFBdEIsQ0FBMkM7QUFBQSxZQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsWUFBVSxHQUFBLEVBQUssRUFBZjtBQUFBLFlBQW1CLEtBQUEsRUFBTyxDQUExQjtXQUEzQyxDQWRBLENBQUE7QUFBQSxVQWdCQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxDQUFwQyxDQUFzQyxDQUFDLFdBQTlDLENBQTBELENBQUMsSUFBM0QsQ0FBZ0UsQ0FBaEUsQ0FoQkEsQ0FBQTtBQUFBLFVBaUJBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsV0FBOUMsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxDQUFoRSxDQWpCQSxDQUFBO0FBQUEsVUFrQkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsRUFBcEMsQ0FBdUMsQ0FBQyxXQUEvQyxDQUEyRCxDQUFDLElBQTVELENBQWlFLENBQWpFLENBbEJBLENBQUE7QUFBQSxVQW1CQSxNQUFBLENBQU8sZUFBZSxDQUFDLG1CQUFoQixDQUFvQyxFQUFwQyxDQUF1QyxDQUFDLFdBQS9DLENBQTJELENBQUMsSUFBNUQsQ0FBaUUsQ0FBakUsQ0FuQkEsQ0FBQTtpQkFvQkEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsRUFBcEMsQ0FBdUMsQ0FBQyxXQUEvQyxDQUEyRCxDQUFDLElBQTVELENBQWlFLENBQWpFLEVBdEJtRjtRQUFBLENBQXJGLENBbEJBLENBQUE7ZUEwQ0EsRUFBQSxDQUFHLGdGQUFILEVBQXFGLFNBQUEsR0FBQTtBQUVuRixVQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkLEVBQXNCLE1BQXRCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQsRUFBc0IsTUFBdEIsQ0FEQSxDQUFBO0FBQUEsVUFHQSxlQUFlLENBQUMsV0FBaEIsQ0FBNEIsYUFBQSxHQUFnQixPQUFPLENBQUMsU0FBUixDQUFrQixlQUFsQixDQUE1QyxDQUhBLENBQUE7QUFBQSxVQUtBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFULENBQXRCLEVBQXlDLFFBQXpDLENBTEEsQ0FBQTtBQUFBLFVBT0EsTUFBQSxDQUFBLGFBQW9CLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBRSxDQUFDLFlBUHZDLENBQUE7QUFBQSxVQVFBLE1BQUEsQ0FBTyxhQUFQLENBQXFCLENBQUMsb0JBQXRCLENBQTJDO0FBQUEsWUFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLFlBQVUsR0FBQSxFQUFLLEVBQWY7QUFBQSxZQUFtQixLQUFBLEVBQU8sQ0FBQSxDQUExQjtXQUEzQyxDQVJBLENBQUE7QUFBQSxVQVVBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsV0FBOUMsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxDQUFoRSxDQVZBLENBQUE7QUFBQSxVQVdBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsV0FBOUMsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxDQUFoRSxDQVhBLENBQUE7QUFBQSxVQVlBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsV0FBOUMsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxDQUFoRSxDQVpBLENBQUE7QUFBQSxVQWFBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsV0FBOUMsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxDQUFoRSxDQWJBLENBQUE7QUFBQSxVQWNBLE1BQUEsQ0FBTyxlQUFlLENBQUMsbUJBQWhCLENBQW9DLENBQXBDLENBQXNDLENBQUMsV0FBOUMsQ0FBMEQsQ0FBQyxJQUEzRCxDQUFnRSxDQUFoRSxDQWRBLENBQUE7aUJBZUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxtQkFBaEIsQ0FBb0MsRUFBcEMsQ0FBdUMsQ0FBQyxXQUEvQyxDQUEyRCxDQUFDLElBQTVELENBQWlFLENBQWpFLEVBakJtRjtRQUFBLENBQXJGLEVBM0N5RTtNQUFBLENBQTNFLEVBNUJ1QjtJQUFBLENBQXpCLEVBcnJCMEI7RUFBQSxDQUE1QixDQUpBLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/tokenized-buffer-spec.coffee