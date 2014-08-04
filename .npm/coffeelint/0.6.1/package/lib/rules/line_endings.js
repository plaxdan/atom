// Generated by CoffeeScript 1.6.2
(function() {
  var LineEndings;

  module.exports = LineEndings = (function() {
    function LineEndings() {}

    LineEndings.prototype.rule = {
      name: 'line_endings',
      level: 'ignore',
      value: 'unix',
      message: 'Line contains incorrect line endings',
      description: "This rule ensures your project uses only <tt>windows</tt> or\n<tt>unix</tt> line endings. This rule is disabled by default."
    };

    LineEndings.prototype.lintLine = function(line, lineApi) {
      var ending, lastChar, valid, _ref;

      ending = (_ref = lineApi.config[this.rule.name]) != null ? _ref.value : void 0;
      if (!ending || lineApi.isLastLine() || !line) {
        return null;
      }
      lastChar = line[line.length - 1];
      valid = (function() {
        if (ending === 'windows') {
          return lastChar === '\r';
        } else if (ending === 'unix') {
          return lastChar !== '\r';
        } else {
          throw new Error("unknown line ending type: " + ending);
        }
      })();
      if (!valid) {
        return {
          context: "Expected " + ending
        };
      } else {
        return null;
      }
    };

    return LineEndings;

  })();

}).call(this);
