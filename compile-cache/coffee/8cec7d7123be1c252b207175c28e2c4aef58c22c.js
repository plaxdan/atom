(function() {
  var Choice, Comment, Diagram, Group, NonTerminal, OneOrMore, Optional, Sequence, Skip, Terminal, ZeroOrMore, makeLiteral, parse, parseRegex, rx2rr, _ref;

  parse = require("regexp");

  _ref = require('./railroad-diagrams'), Diagram = _ref.Diagram, Sequence = _ref.Sequence, Choice = _ref.Choice, Optional = _ref.Optional, OneOrMore = _ref.OneOrMore, ZeroOrMore = _ref.ZeroOrMore, Terminal = _ref.Terminal, NonTerminal = _ref.NonTerminal, Comment = _ref.Comment, Skip = _ref.Skip, Group = _ref.Group;

  makeLiteral = function(text) {
    var part, parts, sequence, _i, _len;
    if (text === " ") {
      return NonTerminal("SP");
    } else {
      parts = text.split(/(^ +| {2,}| +$)/);
      sequence = [];
      for (_i = 0, _len = parts.length; _i < _len; _i++) {
        part = parts[_i];
        if (!part.length) {
          continue;
        }
        if (/^ +$/.test(part)) {
          if (part.length === 1) {
            sequence.push(NonTerminal("SP"));
          } else {
            sequence.push(OneOrMore(NonTerminal("SP"), Comment("" + part.length + " times")));
          }
        } else {
          sequence.push(Terminal(part));
        }
      }
      if (sequence.length === 1) {
        return sequence[0];
      } else {
        return new Sequence(sequence);
      }
    }
  };

  rx2rr = function(node, options) {
    var alternatives, body, char, charset, i, list, literal, max, min, n, sequence, x, _i, _j, _len, _len1, _ref1, _ref2;
    switch (node.type) {
      case "match":
        literal = null;
        sequence = [];
        _ref1 = node.body;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          n = _ref1[_i];
          if (n.type === "literal" && !n.escaped) {
            if (literal != null) {
              literal += n.body;
            } else {
              literal = n.body;
            }
          } else {
            if (literal != null) {
              sequence.push(makeLiteral(literal));
              literal = null;
            }
            sequence.push(rx2rr(n, options));
          }
        }
        if (literal != null) {
          sequence.push(makeLiteral(literal));
        }
        if (sequence.length === 1) {
          return sequence[0];
        } else {
          return new Sequence(sequence);
        }
        break;
      case "alternate":
        alternatives = [];
        while (node.type === "alternate") {
          alternatives.push(rx2rr(node.left, options));
          node = node.right;
        }
        alternatives.push(rx2rr(node, options));
        return new Choice(Math.floor(alternatives.length / 2) - 1, alternatives);
      case "quantified":
        _ref2 = node.quantifier, min = _ref2.min, max = _ref2.max;
        body = rx2rr(node.body, options);
        if (!(min <= max)) {
          throw new Error("Minimum quantifier (" + min + ") must be lower than ", +("maximum quantifier (" + max + ")"));
        }
        switch (min) {
          case 0:
            if (max === 1) {
              return Optional(body);
            } else {
              if (max === 0) {
                return ZeroOrMore(body, Comment("" + max + " times"));
              } else if (max !== Infinity) {
                return ZeroOrMore(body, Comment("0 to " + max + " times"));
              } else {
                return ZeroOrMore(body);
              }
            }
            break;
          case 1:
            if (max === 1) {
              return OneOrMore(body, Comment("once"));
            } else if (max !== Infinity) {
              return OneOrMore(body, Comment("1 to " + max + " times"));
            } else {
              return OneOrMore(body);
            }
            break;
          default:
            if (max === min) {
              return OneOrMore(body, Comment("" + max + " times"));
            } else if (max !== Infinity) {
              return OneOrMore(body, Comment("" + min + " to " + max + " times"));
            } else {
              return OneOrMore(body, Comment("at least " + min + " times"));
            }
        }
        break;
      case "capture-group":
        return Group(rx2rr(node.body, options), Comment("capture " + node.index));
      case "non-capture-group":
        return Group(rx2rr(node.body, options));
      case "positive-lookahead":
      case "negative-lookahead":
      case "positive-lookbehind":
      case "negative-lookbehind":
        return Group(rx2rr(node.body, options), Comment(node.type));
      case "back-reference":
        return NonTerminal("ref " + node.index);
      case "literal":
        if (node.escaped) {
          return Terminal("\\" + node.body);
        } else {
          return makeLiteral(node.body);
        }
        break;
      case "word":
        return NonTerminal("word-character");
      case "non-word":
        return NonTerminal("non-word-character");
      case "line-feed":
        return NonTerminal("LF");
      case "carriage-return":
        return NonTerminal("CR");
      case "form-feed":
        return NonTerminal("FF");
      case "back-space":
        return NonTerminal("BS");
      case "digit":
        return Terminal("0-9");
      case "white-space":
        return NonTerminal("WS");
      case "range":
        return Terminal(node.text);
      case "charset":
        charset = (function() {
          var _j, _len1, _ref3, _results;
          _ref3 = node.body;
          _results = [];
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            x = _ref3[_j];
            _results.push(x.text);
          }
          return _results;
        })();
        if (charset.length === 1) {
          char = charset[0];
          if (char === " ") {
            char = "SP";
          }
          if (node.invert) {
            return NonTerminal("not " + charset[0]);
          } else {
            return Terminal(charset[0]);
          }
        } else {
          list = charset.slice(0, -1).join(", ");
          for (i = _j = 0, _len1 = list.length; _j < _len1; i = ++_j) {
            x = list[i];
            if (x === " ") {
              list[i] = "SP";
            }
          }
          if (node.invert) {
            return NonTerminal("not " + list + " and " + charset.slice(-1));
          } else {
            return NonTerminal("" + list + " or " + charset.slice(-1));
          }
        }
        break;
      case "hex":
      case "octal":
      case "unicode":
        return Terminal(node.text);
      default:
        return NonTerminal(node.type);
    }
  };

  parseRegex = function(regex) {
    if (regex instanceof RegExp) {
      regex = regex.source;
    }
    return parse(regex);
  };

  module.exports = {
    Regex2RailRoadDiagram: function(regex, parent, opts) {
      return Diagram(rx2rr(parseRegex(regex), opts)).addTo(parent);
    },
    ParseRegex: parseRegex
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9KQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxRQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLE9BQ3VDLE9BQUEsQ0FBUSxxQkFBUixDQUR2QyxFQUFDLGVBQUEsT0FBRCxFQUFVLGdCQUFBLFFBQVYsRUFBb0IsY0FBQSxNQUFwQixFQUE0QixnQkFBQSxRQUE1QixFQUFzQyxpQkFBQSxTQUF0QyxFQUFpRCxrQkFBQSxVQUFqRCxFQUE2RCxnQkFBQSxRQUE3RCxFQUNDLG1CQUFBLFdBREQsRUFDYyxlQUFBLE9BRGQsRUFDdUIsWUFBQSxJQUR2QixFQUM2QixhQUFBLEtBSDdCLENBQUE7O0FBQUEsRUFLQSxXQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFFWixRQUFBLCtCQUFBO0FBQUEsSUFBQSxJQUFHLElBQUEsS0FBUSxHQUFYO2FBQ0UsV0FBQSxDQUFZLElBQVosRUFERjtLQUFBLE1BQUE7QUFHRSxNQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLGlCQUFYLENBQVIsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLEVBRFgsQ0FBQTtBQUVBLFdBQUEsNENBQUE7eUJBQUE7QUFDRSxRQUFBLElBQUEsQ0FBQSxJQUFvQixDQUFDLE1BQXJCO0FBQUEsbUJBQUE7U0FBQTtBQUNBLFFBQUEsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBSDtBQUNFLFVBQUEsSUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLENBQWxCO0FBQ0UsWUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLFdBQUEsQ0FBWSxJQUFaLENBQWQsQ0FBQSxDQURGO1dBQUEsTUFBQTtBQUdFLFlBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFBLENBQVUsV0FBQSxDQUFZLElBQVosQ0FBVixFQUE2QixPQUFBLENBQVEsRUFBQSxHQUFFLElBQUksQ0FBQyxNQUFQLEdBQWUsUUFBdkIsQ0FBN0IsQ0FBZCxDQUFBLENBSEY7V0FERjtTQUFBLE1BQUE7QUFNRSxVQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsUUFBQSxDQUFTLElBQVQsQ0FBZCxDQUFBLENBTkY7U0FGRjtBQUFBLE9BRkE7QUFZQSxNQUFBLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7ZUFDRSxRQUFTLENBQUEsQ0FBQSxFQURYO09BQUEsTUFBQTtlQUdNLElBQUEsUUFBQSxDQUFTLFFBQVQsRUFITjtPQWZGO0tBRlk7RUFBQSxDQUxkLENBQUE7O0FBQUEsRUEyQkEsS0FBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTtBQUVOLFFBQUEsZ0hBQUE7QUFBQSxZQUFPLElBQUksQ0FBQyxJQUFaO0FBQUEsV0FDTyxPQURQO0FBSUksUUFBQSxPQUFBLEdBQVUsSUFBVixDQUFBO0FBQUEsUUFDQSxRQUFBLEdBQVcsRUFEWCxDQUFBO0FBR0E7QUFBQSxhQUFBLDRDQUFBO3dCQUFBO0FBQ0UsVUFBQSxJQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVUsU0FBVixJQUF3QixDQUFBLENBQUssQ0FBQyxPQUFqQztBQUNFLFlBQUEsSUFBRyxlQUFIO0FBQ0UsY0FBQSxPQUFBLElBQVcsQ0FBQyxDQUFDLElBQWIsQ0FERjthQUFBLE1BQUE7QUFHRSxjQUFBLE9BQUEsR0FBVSxDQUFDLENBQUMsSUFBWixDQUhGO2FBREY7V0FBQSxNQUFBO0FBTUUsWUFBQSxJQUFHLGVBQUg7QUFDRSxjQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsV0FBQSxDQUFZLE9BQVosQ0FBZCxDQUFBLENBQUE7QUFBQSxjQUNBLE9BQUEsR0FBVSxJQURWLENBREY7YUFBQTtBQUFBLFlBSUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxLQUFBLENBQU0sQ0FBTixFQUFTLE9BQVQsQ0FBZCxDQUpBLENBTkY7V0FERjtBQUFBLFNBSEE7QUFnQkEsUUFBQSxJQUFHLGVBQUg7QUFDRSxVQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsV0FBQSxDQUFZLE9BQVosQ0FBZCxDQUFBLENBREY7U0FoQkE7QUFtQkEsUUFBQSxJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLENBQXRCO2lCQUNFLFFBQVMsQ0FBQSxDQUFBLEVBRFg7U0FBQSxNQUFBO2lCQUdNLElBQUEsUUFBQSxDQUFTLFFBQVQsRUFITjtTQXZCSjtBQUNPO0FBRFAsV0E0Qk8sV0E1QlA7QUE2QkksUUFBQSxZQUFBLEdBQWUsRUFBZixDQUFBO0FBQ0EsZUFBTSxJQUFJLENBQUMsSUFBTCxLQUFhLFdBQW5CLEdBQUE7QUFDRSxVQUFBLFlBQVksQ0FBQyxJQUFiLENBQWtCLEtBQUEsQ0FBTSxJQUFJLENBQUMsSUFBWCxFQUFpQixPQUFqQixDQUFsQixDQUFBLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FEWixDQURGO1FBQUEsQ0FEQTtBQUFBLFFBS0EsWUFBWSxDQUFDLElBQWIsQ0FBa0IsS0FBQSxDQUFNLElBQU4sRUFBWSxPQUFaLENBQWxCLENBTEEsQ0FBQTtlQU9JLElBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsWUFBWSxDQUFDLE1BQWIsR0FBb0IsQ0FBL0IsQ0FBQSxHQUFrQyxDQUF6QyxFQUE0QyxZQUE1QyxFQXBDUjtBQUFBLFdBc0NPLFlBdENQO0FBdUNJLFFBQUEsUUFBYSxJQUFJLENBQUMsVUFBbEIsRUFBQyxZQUFBLEdBQUQsRUFBTSxZQUFBLEdBQU4sQ0FBQTtBQUFBLFFBRUEsSUFBQSxHQUFPLEtBQUEsQ0FBTSxJQUFJLENBQUMsSUFBWCxFQUFpQixPQUFqQixDQUZQLENBQUE7QUFJQSxRQUFBLElBQUEsQ0FBQSxDQUM0QyxHQUFBLElBQU8sR0FEbkQsQ0FBQTtBQUFBLGdCQUFVLElBQUEsS0FBQSxDQUFPLHNCQUFBLEdBQXFCLEdBQXJCLEdBQTBCLHVCQUFqQyxFQUNOLENBQUEsQ0FBRyxzQkFBQSxHQUFxQixHQUFyQixHQUEwQixHQUEzQixDQURJLENBQVYsQ0FBQTtTQUpBO0FBT0EsZ0JBQU8sR0FBUDtBQUFBLGVBQ08sQ0FEUDtBQUVJLFlBQUEsSUFBRyxHQUFBLEtBQU8sQ0FBVjtxQkFDRSxRQUFBLENBQVMsSUFBVCxFQURGO2FBQUEsTUFBQTtBQUdFLGNBQUEsSUFBRyxHQUFBLEtBQU8sQ0FBVjt1QkFDRSxVQUFBLENBQVcsSUFBWCxFQUFpQixPQUFBLENBQVEsRUFBQSxHQUFFLEdBQUYsR0FBTyxRQUFmLENBQWpCLEVBREY7ZUFBQSxNQUVLLElBQUcsR0FBQSxLQUFPLFFBQVY7dUJBQ0gsVUFBQSxDQUFXLElBQVgsRUFBaUIsT0FBQSxDQUFTLE9BQUEsR0FBTSxHQUFOLEdBQVcsUUFBcEIsQ0FBakIsRUFERztlQUFBLE1BQUE7dUJBR0gsVUFBQSxDQUFXLElBQVgsRUFIRztlQUxQO2FBRko7QUFDTztBQURQLGVBV08sQ0FYUDtBQVlJLFlBQUEsSUFBRyxHQUFBLEtBQU8sQ0FBVjtxQkFDRSxTQUFBLENBQVUsSUFBVixFQUFnQixPQUFBLENBQVEsTUFBUixDQUFoQixFQURGO2FBQUEsTUFFSyxJQUFHLEdBQUEsS0FBTyxRQUFWO3FCQUNILFNBQUEsQ0FBVSxJQUFWLEVBQWdCLE9BQUEsQ0FBUyxPQUFBLEdBQU0sR0FBTixHQUFXLFFBQXBCLENBQWhCLEVBREc7YUFBQSxNQUFBO3FCQUdILFNBQUEsQ0FBVSxJQUFWLEVBSEc7YUFkVDtBQVdPO0FBWFA7QUFtQkksWUFBQSxJQUFHLEdBQUEsS0FBTyxHQUFWO3FCQUNFLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLE9BQUEsQ0FBUSxFQUFBLEdBQUUsR0FBRixHQUFPLFFBQWYsQ0FBaEIsRUFERjthQUFBLE1BRUssSUFBRyxHQUFBLEtBQU8sUUFBVjtxQkFDSCxTQUFBLENBQVUsSUFBVixFQUFnQixPQUFBLENBQVEsRUFBQSxHQUFFLEdBQUYsR0FBTyxNQUFQLEdBQVksR0FBWixHQUFpQixRQUF6QixDQUFoQixFQURHO2FBQUEsTUFBQTtxQkFHSCxTQUFBLENBQVUsSUFBVixFQUFnQixPQUFBLENBQVMsV0FBQSxHQUFVLEdBQVYsR0FBZSxRQUF4QixDQUFoQixFQUhHO2FBckJUO0FBQUEsU0E5Q0o7QUFzQ087QUF0Q1AsV0F3RU8sZUF4RVA7ZUF5RUksS0FBQSxDQUFNLEtBQUEsQ0FBTSxJQUFJLENBQUMsSUFBWCxFQUFpQixPQUFqQixDQUFOLEVBQWlDLE9BQUEsQ0FBUyxVQUFBLEdBQVMsSUFBSSxDQUFDLEtBQXZCLENBQWpDLEVBekVKO0FBQUEsV0EyRU8sbUJBM0VQO2VBNEVJLEtBQUEsQ0FBTSxLQUFBLENBQU0sSUFBSSxDQUFDLElBQVgsRUFBaUIsT0FBakIsQ0FBTixFQTVFSjtBQUFBLFdBOEVPLG9CQTlFUDtBQUFBLFdBOEU2QixvQkE5RTdCO0FBQUEsV0ErRU8scUJBL0VQO0FBQUEsV0ErRThCLHFCQS9FOUI7ZUFnRkksS0FBQSxDQUFNLEtBQUEsQ0FBTSxJQUFJLENBQUMsSUFBWCxFQUFpQixPQUFqQixDQUFOLEVBQWlDLE9BQUEsQ0FBUSxJQUFJLENBQUMsSUFBYixDQUFqQyxFQWhGSjtBQUFBLFdBa0ZPLGdCQWxGUDtlQW1GSSxXQUFBLENBQWEsTUFBQSxHQUFLLElBQUksQ0FBQyxLQUF2QixFQW5GSjtBQUFBLFdBcUZPLFNBckZQO0FBc0ZJLFFBQUEsSUFBRyxJQUFJLENBQUMsT0FBUjtpQkFDRSxRQUFBLENBQVMsSUFBQSxHQUFLLElBQUksQ0FBQyxJQUFuQixFQURGO1NBQUEsTUFBQTtpQkFHRSxXQUFBLENBQVksSUFBSSxDQUFDLElBQWpCLEVBSEY7U0F0Rko7QUFxRk87QUFyRlAsV0EyRk8sTUEzRlA7ZUE0RkksV0FBQSxDQUFZLGdCQUFaLEVBNUZKO0FBQUEsV0E4Rk8sVUE5RlA7ZUErRkksV0FBQSxDQUFZLG9CQUFaLEVBL0ZKO0FBQUEsV0FpR08sV0FqR1A7ZUFrR0ksV0FBQSxDQUFZLElBQVosRUFsR0o7QUFBQSxXQW9HTyxpQkFwR1A7ZUFxR0ksV0FBQSxDQUFZLElBQVosRUFyR0o7QUFBQSxXQXVHTyxXQXZHUDtlQXdHSSxXQUFBLENBQVksSUFBWixFQXhHSjtBQUFBLFdBMEdPLFlBMUdQO2VBMkdJLFdBQUEsQ0FBWSxJQUFaLEVBM0dKO0FBQUEsV0E2R08sT0E3R1A7ZUE4R0ksUUFBQSxDQUFTLEtBQVQsRUE5R0o7QUFBQSxXQWdITyxhQWhIUDtlQWlISSxXQUFBLENBQVksSUFBWixFQWpISjtBQUFBLFdBbUhPLE9BbkhQO2VBb0hJLFFBQUEsQ0FBUyxJQUFJLENBQUMsSUFBZCxFQXBISjtBQUFBLFdBc0hPLFNBdEhQO0FBdUhJLFFBQUEsT0FBQTs7QUFBVztBQUFBO2VBQUEsOENBQUE7MEJBQUE7QUFBQSwwQkFBQSxDQUFDLENBQUMsS0FBRixDQUFBO0FBQUE7O1lBQVgsQ0FBQTtBQUVBLFFBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixLQUFrQixDQUFyQjtBQUNFLFVBQUEsSUFBQSxHQUFPLE9BQVEsQ0FBQSxDQUFBLENBQWYsQ0FBQTtBQUVBLFVBQUEsSUFBRyxJQUFBLEtBQVEsR0FBWDtBQUNFLFlBQUEsSUFBQSxHQUFPLElBQVAsQ0FERjtXQUZBO0FBS0EsVUFBQSxJQUFHLElBQUksQ0FBQyxNQUFSO0FBQ0UsbUJBQU8sV0FBQSxDQUFhLE1BQUEsR0FBSyxPQUFRLENBQUEsQ0FBQSxDQUExQixDQUFQLENBREY7V0FBQSxNQUFBO0FBR0UsbUJBQU8sUUFBQSxDQUFTLE9BQVEsQ0FBQSxDQUFBLENBQWpCLENBQVAsQ0FIRjtXQU5GO1NBQUEsTUFBQTtBQVdFLFVBQUEsSUFBQSxHQUFPLE9BQVEsYUFBTyxDQUFDLElBQWhCLENBQXFCLElBQXJCLENBQVAsQ0FBQTtBQUVBLGVBQUEscURBQUE7d0JBQUE7QUFDRSxZQUFBLElBQUcsQ0FBQSxLQUFLLEdBQVI7QUFDRSxjQUFBLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxJQUFWLENBREY7YUFERjtBQUFBLFdBRkE7QUFNQSxVQUFBLElBQUcsSUFBSSxDQUFDLE1BQVI7QUFDRSxtQkFBTyxXQUFBLENBQWEsTUFBQSxHQUFLLElBQUwsR0FBVyxPQUFYLEdBQWlCLE9BQVEsVUFBdEMsQ0FBUCxDQURGO1dBQUEsTUFBQTtBQUdFLG1CQUFPLFdBQUEsQ0FBWSxFQUFBLEdBQUUsSUFBRixHQUFRLE1BQVIsR0FBYSxPQUFRLFVBQWpDLENBQVAsQ0FIRjtXQWpCRjtTQXpISjtBQXNITztBQXRIUCxXQStJTyxLQS9JUDtBQUFBLFdBK0ljLE9BL0lkO0FBQUEsV0ErSXVCLFNBL0l2QjtlQWdKSSxRQUFBLENBQVMsSUFBSSxDQUFDLElBQWQsRUFoSko7QUFBQTtlQW1KSSxXQUFBLENBQVksSUFBSSxDQUFDLElBQWpCLEVBbkpKO0FBQUEsS0FGTTtFQUFBLENBM0JSLENBQUE7O0FBQUEsRUF1TUEsVUFBQSxHQUFhLFNBQUMsS0FBRCxHQUFBO0FBQ1gsSUFBQSxJQUFHLEtBQUEsWUFBaUIsTUFBcEI7QUFDRSxNQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBZCxDQURGO0tBQUE7V0FHQSxLQUFBLENBQU0sS0FBTixFQUpXO0VBQUEsQ0F2TWIsQ0FBQTs7QUFBQSxFQTZNQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxxQkFBQSxFQUF1QixTQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLElBQWhCLEdBQUE7YUFDckIsT0FBQSxDQUFRLEtBQUEsQ0FBTSxVQUFBLENBQVcsS0FBWCxDQUFOLEVBQXlCLElBQXpCLENBQVIsQ0FBdUMsQ0FBQyxLQUF4QyxDQUE4QyxNQUE5QyxFQURxQjtJQUFBLENBQXZCO0FBQUEsSUFHQSxVQUFBLEVBQVksVUFIWjtHQTlNRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/regex-railroad-diagram/lib/regex-to-railroad.coffee