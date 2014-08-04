(function() {
  var TokenizedBuffer, _;

  TokenizedBuffer = require('../src/tokenized-buffer');

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
        return tokenizedBuffer.on("changed", changeHandler = jasmine.createSpy('changeHandler'));
      });
      afterEach(function() {
        tokenizedBuffer.destroy();
        return buffer.release();
      });
      describe("on construction", function() {
        return it("initially creates un-tokenized screen lines, then tokenizes lines chunk at a time in the background", function() {
          var line0, line11;
          line0 = tokenizedBuffer.lineForScreenRow(0);
          expect(line0.tokens.length).toBe(1);
          expect(line0.tokens[0]).toEqual({
            value: line0.text,
            scopes: ['source.js']
          });
          line11 = tokenizedBuffer.lineForScreenRow(11);
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
          expect(tokenizedBuffer.lineForScreenRow(0).ruleStack).toBeUndefined();
          advanceClock();
          expect(tokenizedBuffer.lineForScreenRow(0).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.lineForScreenRow(4).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.lineForScreenRow(5).ruleStack != null).toBeFalsy();
          expect(changeHandler).toHaveBeenCalledWith({
            start: 0,
            end: 4,
            delta: 0
          });
          changeHandler.reset();
          advanceClock();
          expect(tokenizedBuffer.lineForScreenRow(5).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.lineForScreenRow(9).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.lineForScreenRow(10).ruleStack != null).toBeFalsy();
          expect(changeHandler).toHaveBeenCalledWith({
            start: 5,
            end: 9,
            delta: 0
          });
          changeHandler.reset();
          advanceClock();
          expect(tokenizedBuffer.lineForScreenRow(10).ruleStack != null).toBeTruthy();
          expect(tokenizedBuffer.lineForScreenRow(12).ruleStack != null).toBeTruthy();
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
            expect(tokenizedBuffer.lineForScreenRow(6).ruleStack != null).toBeFalsy();
            expect(tokenizedBuffer.lineForScreenRow(7).ruleStack != null).toBeFalsy();
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
              expect(tokenizedBuffer.lineForScreenRow(0).tokens[1]).toEqual({
                value: '(',
                scopes: ['source.js', 'meta.brace.round.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(1).tokens[0]).toEqual({
                value: '7',
                scopes: ['source.js', 'constant.numeric.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(2).tokens[2]).toEqual({
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
                expect(tokenizedBuffer.lineForScreenRow(3).tokens[0].scopes).toEqual(['source.js']);
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
                expect(tokenizedBuffer.lineForScreenRow(3).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
                expect(tokenizedBuffer.lineForScreenRow(4).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
                expect(tokenizedBuffer.lineForScreenRow(5).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
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
              return expect(tokenizedBuffer.lineForScreenRow(1).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
            });
          });
          describe("when lines are both updated and removed", function() {
            return it("updates tokens to reflect the change", function() {
              var event;
              buffer.setTextInRange([[1, 0], [3, 0]], "foo()");
              expect(tokenizedBuffer.lineForScreenRow(0).tokens[0]).toEqual({
                value: 'var',
                scopes: ['source.js', 'storage.modifier.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(1).tokens[0]).toEqual({
                value: 'foo',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(1).tokens[6]).toEqual({
                value: '=',
                scopes: ['source.js', 'keyword.operator.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(2).tokens[2]).toEqual({
                value: 'while',
                scopes: ['source.js', 'keyword.control.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(3).tokens[4]).toEqual({
                value: '=',
                scopes: ['source.js', 'keyword.operator.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(4).tokens[4]).toEqual({
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
              expect(tokenizedBuffer.lineForScreenRow(2).tokens[0].scopes).toEqual(['source.js', 'comment.block.js', 'punctuation.definition.comment.js']);
              expect(tokenizedBuffer.lineForScreenRow(3).tokens[0].scopes).toEqual(['source.js']);
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
              expect(tokenizedBuffer.lineForScreenRow(3).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.lineForScreenRow(4).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
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
              expect(tokenizedBuffer.lineForScreenRow(0).tokens[0]).toEqual({
                value: 'var',
                scopes: ['source.js', 'storage.modifier.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(1).tokens[0]).toEqual({
                value: 'foo',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(2).tokens[0]).toEqual({
                value: 'bar',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(3).tokens[0]).toEqual({
                value: 'baz',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(4).tokens[0]).toEqual({
                value: 'quux',
                scopes: ['source.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(4).tokens[4]).toEqual({
                value: 'if',
                scopes: ['source.js', 'keyword.control.js']
              });
              expect(tokenizedBuffer.lineForScreenRow(5).tokens[4]).toEqual({
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
              expect(tokenizedBuffer.lineForScreenRow(2).tokens[0].scopes).toEqual(['source.js', 'comment.block.js', 'punctuation.definition.comment.js']);
              expect(tokenizedBuffer.lineForScreenRow(3).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.lineForScreenRow(4).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.lineForScreenRow(5).tokens[0].scopes).toEqual(['source.js']);
              changeHandler.reset();
              advanceClock();
              expect(tokenizedBuffer.lineForScreenRow(5).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.lineForScreenRow(6).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.lineForScreenRow(7).tokens[0].scopes).toEqual(['source.js', 'comment.block.js']);
              expect(tokenizedBuffer.lineForScreenRow(8).tokens[0].scopes).not.toBe(['source.js', 'comment.block.js']);
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
            expect(tokenizedBuffer.lineForScreenRow(0).ruleStack != null).toBeTruthy();
            expect(tokenizedBuffer.lineForScreenRow(4).ruleStack != null).toBeTruthy();
            expect(tokenizedBuffer.lineForScreenRow(5).ruleStack != null).toBeFalsy();
            advanceClock();
            expect(tokenizedBuffer.lineForScreenRow(5).ruleStack != null).toBeTruthy();
            return expect(tokenizedBuffer.lineForScreenRow(6).ruleStack != null).toBeTruthy();
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
          expect(tokenizedBuffer.lineForScreenRow(5).tokens[0].isAtomic).toBeTruthy();
          expect(tokenizedBuffer.lineForScreenRow(5).tokens[0].value).toBe("  ");
          expect(tokenizedBuffer.lineForScreenRow(5).tokens[1].isAtomic).toBeTruthy();
          expect(tokenizedBuffer.lineForScreenRow(5).tokens[1].value).toBe("  ");
          tokenizedBuffer.setTabLength(4);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.lineForScreenRow(5).tokens[0].isAtomic).toBeTruthy();
          expect(tokenizedBuffer.lineForScreenRow(5).tokens[0].value).toBe("    ");
          expect(tokenizedBuffer.lineForScreenRow(5).tokens[1].isAtomic).toBeFalsy();
          return expect(tokenizedBuffer.lineForScreenRow(5).tokens[1].value).toBe("  current ");
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
          screenLine0 = tokenizedBuffer.lineForScreenRow(0);
          expect(screenLine0.text).toBe("# Econ 101" + tabAsSpaces);
          tokens = screenLine0.tokens;
          expect(tokens.length).toBe(4);
          expect(tokens[0].value).toBe("#");
          expect(tokens[1].value).toBe(" Econ 101");
          expect(tokens[2].value).toBe(tabAsSpaces);
          expect(tokens[2].scopes).toEqual(tokens[1].scopes);
          expect(tokens[2].isAtomic).toBeTruthy();
          expect(tokens[3].value).toBe("");
          return expect(tokenizedBuffer.lineForScreenRow(2).text).toBe("" + tabAsSpaces + " buy()" + tabAsSpaces + "while supply > demand");
        });
        return it("aligns the hard tabs to the correct tab stop column", function() {
          buffer.setText("1\t2 \t3\t4\n12\t3  \t4\t5\n123\t4   \t5\t6");
          tokenizedBuffer.setTabLength(4);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.lineForScreenRow(0).text).toBe("1   2   3   4");
          expect(tokenizedBuffer.lineForScreenRow(0).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(0).tokens[1].screenDelta).toBe(3);
          expect(tokenizedBuffer.lineForScreenRow(1).text).toBe("12  3   4   5");
          expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].screenDelta).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(2).text).toBe("123 4       5   6");
          expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].screenDelta).toBe(1);
          tokenizedBuffer.setTabLength(3);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.lineForScreenRow(0).text).toBe("1  2  3  4");
          expect(tokenizedBuffer.lineForScreenRow(0).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(0).tokens[1].screenDelta).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(1).text).toBe("12 3     4  5");
          expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].screenDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(2).text).toBe("123   4     5  6");
          expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].screenDelta).toBe(3);
          tokenizedBuffer.setTabLength(2);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.lineForScreenRow(0).text).toBe("1 2   3 4");
          expect(tokenizedBuffer.lineForScreenRow(0).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(0).tokens[1].screenDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(1).text).toBe("12  3   4 5");
          expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].screenDelta).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(2).text).toBe("123 4     5 6");
          expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].screenDelta).toBe(1);
          tokenizedBuffer.setTabLength(1);
          fullyTokenize(tokenizedBuffer);
          expect(tokenizedBuffer.lineForScreenRow(0).text).toBe("1 2  3 4");
          expect(tokenizedBuffer.lineForScreenRow(0).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(0).tokens[1].screenDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(1).text).toBe("12 3   4 5");
          expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].bufferDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].screenDelta).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(2).text).toBe("123 4    5 6");
          expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].bufferDelta).toBe(1);
          return expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].screenDelta).toBe(1);
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
        screenLine0 = tokenizedBuffer.lineForScreenRow(0);
        expect(screenLine0.text).toBe("'abc\uD835\uDF97def'");
        tokens = screenLine0.tokens;
        expect(tokens.length).toBe(5);
        expect(tokens[0].value).toBe("'");
        expect(tokens[1].value).toBe("abc");
        expect(tokens[2].value).toBe("\uD835\uDF97");
        expect(tokens[2].isAtomic).toBeTruthy();
        expect(tokens[3].value).toBe("def");
        expect(tokens[4].value).toBe("'");
        screenLine1 = tokenizedBuffer.lineForScreenRow(1);
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
          tokenizedBuffer.on('tokenized', tokenizedHandler);
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
          tokenizedBuffer.on('tokenized', tokenizedHandler);
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
          tokenizedBuffer.on('tokenized', tokenizedHandler);
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
          tokens = tokenizedBuffer.lineForScreenRow(0).tokens;
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
          tokens = tokenizedBuffer.lineForScreenRow(0).tokens;
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
    describe("leading and trailing whitespace", function() {
      beforeEach(function() {
        buffer = atom.project.bufferForPathSync('sample.js');
        tokenizedBuffer = new TokenizedBuffer({
          buffer: buffer
        });
        return fullyTokenize(tokenizedBuffer);
      });
      it("sets ::hasLeadingWhitespace to true on tokens that have leading whitespace", function() {
        expect(tokenizedBuffer.lineForScreenRow(0).tokens[0].hasLeadingWhitespace).toBe(false);
        expect(tokenizedBuffer.lineForScreenRow(1).tokens[0].hasLeadingWhitespace).toBe(true);
        expect(tokenizedBuffer.lineForScreenRow(1).tokens[1].hasLeadingWhitespace).toBe(false);
        expect(tokenizedBuffer.lineForScreenRow(2).tokens[0].hasLeadingWhitespace).toBe(true);
        expect(tokenizedBuffer.lineForScreenRow(2).tokens[1].hasLeadingWhitespace).toBe(true);
        expect(tokenizedBuffer.lineForScreenRow(2).tokens[2].hasLeadingWhitespace).toBe(false);
        buffer.insert([5, 0], ' ');
        expect(tokenizedBuffer.lineForScreenRow(5).tokens[3].hasLeadingWhitespace).toBe(true);
        expect(tokenizedBuffer.lineForScreenRow(5).tokens[4].hasLeadingWhitespace).toBe(false);
        buffer.insert([10, 0], '  ');
        return expect(tokenizedBuffer.lineForScreenRow(10).tokens[0].hasLeadingWhitespace).toBe(false);
      });
      it("sets ::hasTrailingWhitespace to true on tokens that have trailing whitespace", function() {
        buffer.insert([0, Infinity], '  ');
        expect(tokenizedBuffer.lineForScreenRow(0).tokens[11].hasTrailingWhitespace).toBe(false);
        expect(tokenizedBuffer.lineForScreenRow(0).tokens[12].hasTrailingWhitespace).toBe(true);
        buffer.setTextInRange([[2, 39], [2, 40]], '  ');
        expect(tokenizedBuffer.lineForScreenRow(2).tokens[14].hasTrailingWhitespace).toBe(false);
        expect(tokenizedBuffer.lineForScreenRow(2).tokens[15].hasTrailingWhitespace).toBe(true);
        buffer.insert([10, 0], '  ');
        return expect(tokenizedBuffer.lineForScreenRow(10).tokens[0].hasTrailingWhitespace).toBe(true);
      });
      return it("only marks trailing whitespace on the last segment of a soft-wrapped line", function() {
        var segment1, segment2, tokenizedLine, _ref1;
        buffer.insert([0, Infinity], '  ');
        tokenizedLine = tokenizedBuffer.lineForScreenRow(0);
        _ref1 = tokenizedLine.softWrapAt(16), segment1 = _ref1[0], segment2 = _ref1[1];
        expect(segment1.tokens[5].value).toBe(' ');
        expect(segment1.tokens[5].hasTrailingWhitespace).toBe(false);
        expect(segment2.tokens[6].value).toBe('  ');
        return expect(segment2.tokens[6].hasTrailingWhitespace).toBe(true);
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
          expect(tokenizedBuffer.lineForScreenRow(0).indentLevel).toBe(0);
          expect(tokenizedBuffer.lineForScreenRow(1).indentLevel).toBe(1);
          expect(tokenizedBuffer.lineForScreenRow(2).indentLevel).toBe(2);
          buffer.insert([2, 0], ' ');
          return expect(tokenizedBuffer.lineForScreenRow(2).indentLevel).toBe(2.5);
        });
      });
      describe("when the line is empty", function() {
        return it("assumes the indentation level of the first non-empty line below or above if one exists", function() {
          buffer.insert([12, 0], '    ');
          buffer.insert([12, Infinity], '\n\n');
          expect(tokenizedBuffer.lineForScreenRow(13).indentLevel).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(14).indentLevel).toBe(2);
          buffer.insert([1, Infinity], '\n\n');
          expect(tokenizedBuffer.lineForScreenRow(2).indentLevel).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(3).indentLevel).toBe(2);
          buffer.setText('\n\n\n');
          return expect(tokenizedBuffer.lineForScreenRow(1).indentLevel).toBe(0);
        });
      });
      return describe("when the changed lines are surrounded by whitespace-only lines", function() {
        it("updates the indentLevel of empty lines that precede the change", function() {
          expect(tokenizedBuffer.lineForScreenRow(12).indentLevel).toBe(0);
          buffer.insert([12, 0], '\n');
          buffer.insert([13, 0], '  ');
          return expect(tokenizedBuffer.lineForScreenRow(12).indentLevel).toBe(1);
        });
        it("updates empty line indent guides when the empty line is the last line", function() {
          buffer.insert([12, 2], '\n');
          buffer.insert([12, 0], '  ');
          expect(tokenizedBuffer.lineForScreenRow(13).indentLevel).toBe(1);
          buffer.insert([12, 0], '  ');
          expect(tokenizedBuffer.lineForScreenRow(13).indentLevel).toBe(2);
          return expect(tokenizedBuffer.lineForScreenRow(14)).not.toBeDefined();
        });
        it("updates the indentLevel of empty lines surrounding a change that inserts lines", function() {
          buffer.insert([7, 0], '\n\n');
          buffer.insert([5, 0], '\n\n');
          expect(tokenizedBuffer.lineForScreenRow(5).indentLevel).toBe(3);
          expect(tokenizedBuffer.lineForScreenRow(6).indentLevel).toBe(3);
          expect(tokenizedBuffer.lineForScreenRow(9).indentLevel).toBe(3);
          expect(tokenizedBuffer.lineForScreenRow(10).indentLevel).toBe(3);
          expect(tokenizedBuffer.lineForScreenRow(11).indentLevel).toBe(2);
          tokenizedBuffer.on("changed", changeHandler = jasmine.createSpy('changeHandler'));
          buffer.setTextInRange([[7, 0], [8, 65]], '        one\n        two\n        three\n        four');
          delete changeHandler.argsForCall[0][0].bufferChange;
          expect(changeHandler).toHaveBeenCalledWith({
            start: 5,
            end: 10,
            delta: 2
          });
          expect(tokenizedBuffer.lineForScreenRow(5).indentLevel).toBe(4);
          expect(tokenizedBuffer.lineForScreenRow(6).indentLevel).toBe(4);
          expect(tokenizedBuffer.lineForScreenRow(11).indentLevel).toBe(4);
          expect(tokenizedBuffer.lineForScreenRow(12).indentLevel).toBe(4);
          return expect(tokenizedBuffer.lineForScreenRow(13).indentLevel).toBe(2);
        });
        return it("updates the indentLevel of empty lines surrounding a change that removes lines", function() {
          buffer.insert([7, 0], '\n\n');
          buffer.insert([5, 0], '\n\n');
          tokenizedBuffer.on("changed", changeHandler = jasmine.createSpy('changeHandler'));
          buffer.setTextInRange([[7, 0], [8, 65]], '    ok');
          delete changeHandler.argsForCall[0][0].bufferChange;
          expect(changeHandler).toHaveBeenCalledWith({
            start: 5,
            end: 10,
            delta: -1
          });
          expect(tokenizedBuffer.lineForScreenRow(5).indentLevel).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(6).indentLevel).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(7).indentLevel).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(8).indentLevel).toBe(2);
          expect(tokenizedBuffer.lineForScreenRow(9).indentLevel).toBe(2);
          return expect(tokenizedBuffer.lineForScreenRow(10).indentLevel).toBe(2);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLDRFQUFBO0FBQUEsSUFBQSxPQUEyQyxFQUEzQyxFQUFDLHlCQUFELEVBQWtCLGdCQUFsQixFQUEwQix1QkFBMUIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUVULE1BQUEsZUFBZSxDQUFDLFNBQVMsQ0FBQyxTQUExQixHQUFzQyxDQUF0QyxDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsS0FBUixDQUFjLGVBQWUsQ0FBQyxTQUE5QixFQUF5QyxzQkFBekMsQ0FEQSxDQUFBO2FBR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7TUFBQSxDQUFoQixFQUxTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVVBLGVBQUEsR0FBa0IsU0FBQyxlQUFELEdBQUE7YUFDaEIsZUFBZSxDQUFDLFVBQWhCLENBQTJCLElBQTNCLEVBRGdCO0lBQUEsQ0FWbEIsQ0FBQTtBQUFBLElBYUEsYUFBQSxHQUFnQixTQUFDLGVBQUQsR0FBQTtBQUNkLE1BQUEsZUFBZSxDQUFDLFVBQWhCLENBQTJCLElBQTNCLENBQUEsQ0FBQTtBQUNlLGFBQU0seUNBQU4sR0FBQTtBQUFmLFFBQUEsWUFBQSxDQUFBLENBQUEsQ0FBZTtNQUFBLENBRGY7cUNBRUEsYUFBYSxDQUFFLEtBQWYsQ0FBQSxXQUhjO0lBQUEsQ0FiaEIsQ0FBQTtBQUFB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/tokenized-buffer-spec.coffee