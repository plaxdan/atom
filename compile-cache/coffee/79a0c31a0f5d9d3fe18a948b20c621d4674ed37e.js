(function() {
  var align, helper, operatorConfig;

  operatorConfig = require('./operator-config');

  helper = require('./helper');

  align = function(editor) {
    var alignment, character, config, grammar, i, indentRange, j, leftSpace, newSpace, offset, origRow, parsed, parsedItem, rightSpace, row, textBlock, tokenized, tokenizedLine, type, _i, _j, _k, _len, _ref, _ref1, _ref2;
    if (!editor.hasMultipleCursors()) {
      origRow = editor.getCursorBufferPosition().row;
      grammar = editor.getGrammar();
      tokenized = grammar.tokenizeLine(editor.lineTextForBufferRow(origRow));
      character = helper.getTokenizedAlignCharacter(tokenized.tokens);
      if (character) {
        indentRange = helper.getSameIndentationRange(editor, origRow, character);
        config = operatorConfig[character];
        textBlock = "";
        for (row = _i = _ref = indentRange.start, _ref1 = indentRange.end; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
          tokenizedLine = grammar.tokenizeLine(editor.lineTextForBufferRow(row));
          parsed = helper.parseTokenizedLine(tokenizedLine, character);
          for (i = _j = 0, _len = parsed.length; _j < _len; i = ++_j) {
            parsedItem = parsed[i];
            offset = parsedItem.offset + (parsed.prefix != null ? 1 : 0);
            newSpace = "";
            for (j = _k = 1, _ref2 = indentRange.offset[i] - offset; _k <= _ref2; j = _k += 1) {
              newSpace += " ";
            }
            if (config.multiple) {
              type = isNaN(+parsedItem.before) ? "string" : "number";
              alignment = config.multiple[type].alignment;
            } else {
              alignment = config.alignment;
            }
            leftSpace = alignment === "left" ? newSpace : "";
            if (config.leftSpace) {
              leftSpace += " ";
            }
            if (parsed.prefix != null) {
              leftSpace += parsed.prefix;
            }
            rightSpace = alignment === "right" ? newSpace : "";
            if (config.rightSpace) {
              rightSpace += " ";
            }
            if (config.multiple) {
              textBlock += (i === 0 ? "" : leftSpace) + parsedItem.before;
              if (i !== parsed.length - 1) {
                textBlock += rightSpace + character;
              }
            } else {
              textBlock += parsedItem.before;
              textBlock += leftSpace + character + rightSpace;
              textBlock += parsedItem.after;
            }
          }
          textBlock += "\n";
        }
        editor.setTextInBufferRange([[indentRange.start, 0], [indentRange.end + 1, 0]], textBlock);
        return editor.setCursorBufferPosition([origRow, editor.lineTextForBufferRow(origRow).length]);
      }
    }
  };

  module.exports = {
    align: align,
    activate: function() {
      return atom.workspaceView.command('vertical-align:align', '.editor', function() {
        var editor;
        editor = atom.workspace.getActivePaneItem();
        return align(editor);
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBaUIsT0FBQSxDQUFRLFVBQVIsQ0FEakIsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxTQUFDLE1BQUQsR0FBQTtBQUNOLFFBQUEsb05BQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxNQUFPLENBQUMsa0JBQVAsQ0FBQSxDQUFKO0FBRUUsTUFBQSxPQUFBLEdBQVUsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBZ0MsQ0FBQyxHQUEzQyxDQUFBO0FBQUEsTUFFQSxPQUFBLEdBQVUsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUZWLENBQUE7QUFBQSxNQUlBLFNBQUEsR0FBWSxPQUFPLENBQUMsWUFBUixDQUFxQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsT0FBNUIsQ0FBckIsQ0FKWixDQUFBO0FBQUEsTUFPQSxTQUFBLEdBQVksTUFBTSxDQUFDLDBCQUFQLENBQWtDLFNBQVMsQ0FBQyxNQUE1QyxDQVBaLENBQUE7QUFTQSxNQUFBLElBQUcsU0FBSDtBQUNFLFFBQUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixNQUEvQixFQUF1QyxPQUF2QyxFQUFnRCxTQUFoRCxDQUFkLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBYyxjQUFlLENBQUEsU0FBQSxDQUQ3QixDQUFBO0FBQUEsUUFFQSxTQUFBLEdBQVksRUFGWixDQUFBO0FBSUEsYUFBVywwSUFBWCxHQUFBO0FBQ0UsVUFBQSxhQUFBLEdBQWdCLE9BQU8sQ0FBQyxZQUFSLENBQXFCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUFyQixDQUFoQixDQUFBO0FBQUEsVUFDQSxNQUFBLEdBQWdCLE1B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
//# sourceURL=/Users/daniel/.atom/packages/vertical-align/lib/vertical-align.coffee