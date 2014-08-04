// Generated by CoffeeScript 1.6.2
(function() {
  var NoImplicitBraces;

  module.exports = NoImplicitBraces = (function() {
    function NoImplicitBraces() {}

    NoImplicitBraces.prototype.rule = {
      name: 'no_implicit_braces',
      level: 'ignore',
      message: 'Implicit braces are forbidden',
      description: "This rule prohibits implicit braces when declaring object literals.\nImplicit braces can make code more difficult to understand,\nespecially when used in combination with optional parenthesis.\n<pre>\n<code># Do you find this code ambiguous? Is it a\n# function call with three arguments or four?\nmyFunction a, b, 1:2, 3:4\n\n# While the same code written in a more\n# explicit manner has no ambiguity.\nmyFunction(a, b, {1:2, 3:4})\n</code>\n</pre>\nImplicit braces are permitted by default, since their use is\nidiomatic CoffeeScript."
    };

    NoImplicitBraces.prototype.tokens = ["{"];

    NoImplicitBraces.prototype.lintToken = function(token, tokenApi) {
      var i, t;

      if (token.generated) {
        i = -1;
        while (true) {
          t = tokenApi.peek(i);
          if ((t == null) || t[0] === 'TERMINATOR') {
            return true;
          }
          if (t[0] === 'CLASS') {
            return null;
          }
          i -= 1;
        }
      }
    };

    return NoImplicitBraces;

  })();

}).call(this);
