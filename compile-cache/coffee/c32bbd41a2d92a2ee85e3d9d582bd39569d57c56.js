(function() {
  var getSameIndentationRange, getTokenizedAlignCharacter, operatorConfig, parseTokenizedLine,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  operatorConfig = require('./operator-config');


  /*
  @function
  @name parseTokenizedLine
  @description
  Parsing line with operator
  @param {Object} tokenizedLine Tokenized line object from editor display buffer
  @param {String} character Character to align
  @returns {Object} Information about the tokenized line including text before character,
                    text after character, character prefix, offset and if the line is
                    valid
   */

  parseTokenizedLine = function(tokenizedLine, character) {
    var addToParsed, afterCharacter, config, parsed, section, token, tokenValue, variable, _i, _len, _ref;
    afterCharacter = false;
    config = operatorConfig[character];
    parsed = [];
    parsed.prefix = null;
    section = {
      before: "",
      after: ""
    };
    addToParsed = function() {
      var lastChar;
      if ((lastChar = section.before.substr(-1)) !== " " && __indexOf.call(config.prefixes, lastChar) >= 0) {
        parsed.prefix = lastChar;
        section.before = section.before.slice(0, -1);
      }
      section.before = section.before.trimRight();
      section.after = section.after.trimLeft();
      section.offset = section.before.length;
      parsed.push(section);
      return section = {
        before: "",
        after: ""
      };
    };
    _ref = tokenizedLine.tokens;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      token = _ref[_i];
      tokenValue = token.value.trim();
      if (tokenValue === character && (!afterCharacter || config.multiple)) {
        if (config.multiple) {
          addToParsed();
        }
        afterCharacter = true;
        continue;
      }
      variable = afterCharacter && !config.multiple ? "after" : "before";
      section[variable] += token.value;
    }
    addToParsed();
    parsed.valid = afterCharacter;
    return parsed;
  };


  /*
  @function
  @name getSameIndentationRange
  @description To get the start and end line number of the same indentation
  @param {Editor} editor Active editor
  @param {Integer} row Row to match
  @returns {Object} An object with the start and end line
   */

  getSameIndentationRange = function(editor, row, character) {
    var checkOffset, end, endLine, grammar, hasPrefix, indent, output, parsed, start, startLine, tokenized, total;
    start = row - 1;
    end = row + 1;
    grammar = editor.getGrammar();
    tokenized = grammar.tokenizeLine(editor.lineTextForBufferRow(row));
    parsed = parseTokenizedLine(tokenized, character);
    indent = editor.indentationForBufferRow(row);
    total = editor.getLineCount();
    hasPrefix = parsed.prefix != null;
    output = {
      start: row,
      end: row,
      offset: []
    };
    checkOffset = function(parsedObjs) {
      var i, parsedItem, _base, _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = parsedObjs.length; _i < _len; i = ++_i) {
        parsedItem = parsedObjs[i];
        if ((_base = output.offset)[i] == null) {
          _base[i] = parsedItem.offset;
        }
        if (parsedItem.offset > output.offset[i]) {
          _results.push(output.offset[i] = parsedItem.offset);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    checkOffset(parsed);
    while (start > -1 || end < total) {
      if (start > -1) {
        startLine = grammar.tokenizeLine(editor.lineTextForBufferRow(start));
        if ((startLine != null) && editor.indentationForBufferRow(start) === indent && (parsed = parseTokenizedLine(startLine, character)) && parsed.valid) {
          checkOffset(parsed);
          output.start = start;
          if (!hasPrefix && (parsed.prefix != null)) {
            hasPrefix = true;
          }
          start -= 1;
        } else {
          start = -1;
        }
      }
      if (end < total + 1) {
        endLine = grammar.tokenizeLine(editor.lineTextForBufferRow(end));
        if ((endLine != null) && editor.indentationForBufferRow(end) === indent && (parsed = parseTokenizedLine(endLine, character)) && parsed.valid) {
          checkOffset(parsed);
          output.end = end;
          if (!hasPrefix && (parsed.prefix != null)) {
            hasPrefix = true;
          }
          end += 1;
        } else {
          end = total + 1;
        }
      }
    }
    if (hasPrefix) {
      output.offset = output.offset.map(function(item) {
        return item + 1;
      });
    }
    return output;
  };


  /*
  @function
  @name getTokenizedAlignCharacter
  @description
  Get the character to align based on text
  @param {Array} tokens Line tokens
  @returns {String} Alignment character
   */

  getTokenizedAlignCharacter = function(tokens) {
    var config, i, scope, token, tokenValue, _i, _j, _len, _len1, _ref;
    for (i = _i = 0, _len = tokens.length; _i < _len; i = ++_i) {
      token = tokens[i];
      tokenValue = token.value.trim();
      config = operatorConfig[tokenValue];
      if (!config) {
        continue;
      }
      _ref = token.scopes;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        scope = _ref[_j];
        if (scope.match(config.scope) != null) {
          return tokenValue;
        }
      }
    }
  };

  module.exports = {
    getSameIndentationRange: getSameIndentationRange,
    parseTokenizedLine: parseTokenizedLine,
    getTokenizedAlignCharacter: getTokenizedAlignCharacter
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVGQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUixDQUFqQixDQUFBOztBQUVBO0FBQUE7Ozs7Ozs7Ozs7S0FGQTs7QUFBQSxFQWFBLGtCQUFBLEdBQXFCLFNBQUMsYUFBRCxFQUFnQixTQUFoQixHQUFBO0FBQ25CLFFBQUEsaUdBQUE7QUFBQSxJQUFBLGNBQUEsR0FBaUIsS0FBakIsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFpQixjQUFlLENBQUEsU0FBQSxDQURoQyxDQUFBO0FBQUEsSUFFQSxNQUFBLEdBQWlCLEVBRmpCLENBQUE7QUFBQSxJQUdBLE1BQU0sQ0FBQyxNQUFQLEdBQWlCLElBSGpCLENBQUE7QUFBQSxJQUlBLE9BQUEsR0FDRTtBQUFBLE1BQUEsTUFBQSxFQUFRLEVBQVI7QUFBQSxNQUNBLEtBQUEsRUFBUSxFQURSO0tBTEYsQ0FBQTtBQUFBLElBUUEsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUVaLFVBQUEsUUFBQTtBQUFBLE1BQUEsSUFBRyxDQUFDLFFBQUEsR0FBVyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQWYsQ0FBc0IsQ0FBQSxDQUF0QixDQUFaLENBQUEsS0FBNEMsR0FBNUMsSUFBb0QsZUFBWSxNQUFNLENBQUMsUUFBbkIsRUFBQSxRQUFBLE1BQXZEO0FBQ0UsUUFBQSxNQUFNLENBQUMsTUFBUCxHQUFpQixRQUFqQixDQUFBO0FBQUEsUUFDQSxPQUFPLENBQUMsTUFBUixHQUFpQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBQSxDQUF4QixDQURqQixDQURGO09BQUE7QUFBQSxNQUlBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBZixDQUFB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
//# sourceURL=/Users/daniel/.atom/packages/vertical-align/lib/helper.coffee