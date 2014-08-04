(function() {
  var fuzzy, levenshtein;

  fuzzy = {};

  module.exports = fuzzy;

  fuzzy.simpleFilter = function(pattern, array) {
    return array.filter(function(string) {
      return fuzzy.test(pattern, string);
    });
  };

  fuzzy.test = function(pattern, string) {
    return fuzzy.match(pattern, string) !== null;
  };

  fuzzy.match = function(pattern, string, opts) {
    var ch, compareChar, compareString, currScore, idx, len, patternIdx, post, pre, result, totalScore;
    if (opts == null) {
      opts = {};
    }
    patternIdx = 0;
    result = [];
    len = string.length;
    totalScore = 0;
    currScore = 0;
    pre = opts.pre || "";
    post = opts.post || "";
    compareString = opts.caseSensitive && string || string.toLowerCase();
    ch = void 0;
    compareChar = void 0;
    pattern = opts.caseSensitive && pattern || pattern.toLowerCase();
    idx = 0;
    while (idx < len) {
      if (pattern[patternIdx] === ' ') {
        patternIdx++;
      }
      ch = string[idx];
      if (compareString[idx] === pattern[patternIdx]) {
        ch = pre + ch + post;
        patternIdx += 1;
        currScore += 1 + currScore;
      } else {
        currScore = 0;
      }
      totalScore += currScore;
      result[result.length] = ch;
      idx++;
    }
    if (patternIdx === pattern.length) {
      return {
        rendered: result.join(""),
        score: totalScore
      };
    }
  };

  fuzzy.filter = function(pattern, arr, opts) {
    var highlighted;
    if (opts == null) {
      opts = {};
    }
    highlighted = arr.reduce(function(prev, element, idx, arr) {
      var rendered, str;
      str = element;
      if (opts.extract) {
        str = opts.extract(element);
      }
      rendered = fuzzy.match(pattern, str, opts);
      if (rendered != null) {
        prev[prev.length] = {
          string: rendered.rendered,
          score: rendered.score,
          index: idx,
          original: element
        };
      }
      return prev;
    }, []).sort(function(a, b) {
      var compare;
      compare = b.score - a.score;
      if (compare === 0) {
        if (opts.extract) {
          return opts.extract(a.original).length - opts.extract(b.original).length;
        }
        return a.original.length - b.original.length;
      }
      if (compare) {
        return compare;
      }
      return a.index - b.index;
    });
    if (highlighted.length < 1) {
      highlighted = arr.reduce(function(prev, element, idx, arr) {
        var str;
        str = element;
        if (opts.extract) {
          str = opts.extract(element);
        }
        prev[prev.length] = {
          string: str,
          score: levenshtein(pattern, str),
          index: idx,
          original: element
        };
        return prev;
      }, []).sort(function(a, b) {
        var compare;
        compare = a.score - b.score;
        if (compare) {
          return compare;
        }
        return b.index - a.index;
      });
    }
    return highlighted;
  };


  /*
   * Copyright (c) 2011 Andrei Mackenzie
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy of
   * this software and associated documentation files (the "Software"), to deal in
   * the Software without restriction, including without limitation the rights to
   * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
   * the Software, and to permit persons to whom the Software is furnished to do so,
   * subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
   * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
   * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
   * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */

  levenshtein = function(a, b) {
    var i, j, matrix;
    if (a.length === 0) {
      return b.length;
    }
    if (b.length === 0) {
      return a.length;
    }
    matrix = [];
    i = void 0;
    i = 0;
    while (i <= b.length) {
      matrix[i] = [i];
      i++;
    }
    j = void 0;
    j = 0;
    while (j <= a.length) {
      matrix[0][j] = j;
      j++;
    }
    i = 1;
    while (i <= b.length) {
      j = 1;
      while (j <= a.length) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
        }
        j++;
      }
      i++;
    }
    return matrix[b.length][a.length];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBTUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLEVBQVIsQ0FBQTs7QUFBQSxFQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBRGpCLENBQUE7O0FBQUEsRUFLQSxLQUFLLENBQUMsWUFBTixHQUFxQixTQUFDLE9BQUQsRUFBVSxLQUFWLEdBQUE7V0FDbkIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFDLE1BQUQsR0FBQTthQUNYLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxFQUFvQixNQUFwQixFQURXO0lBQUEsQ0FBYixFQURtQjtFQUFBLENBTHJCLENBQUE7O0FBQUEsRUFVQSxLQUFLLENBQUMsSUFBTixHQUFhLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtXQUNYLEtBQUssQ0FBQyxLQUFOLENBQVksT0FBWixFQUFxQixNQUFyQixDQUFBLEtBQWtDLEtBRHZCO0VBQUEsQ0FWYixDQUFBOztBQUFBLEVBZUEsS0FBSyxDQUFDLEtBQU4sR0FBYyxTQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLElBQWxCLEdBQUE7QUFDWixRQUFBLDhGQUFBOztNQUQ4QixPQUFLO0tBQ25DO0FBQUEsSUFBQSxVQUFBLEdBQWEsQ0FBYixDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQVMsRUFEVCxDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BRmIsQ0FBQTtBQUFBLElBR0EsVUFBQSxHQUFhLENBSGIsQ0FBQTtBQUFBLElBSUEsU0FBQSxHQUFZLENBSlosQ0FBQTtBQUFBLElBT0EsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLElBQVksRUFQbEIsQ0FBQTtBQUFBLElBVUEsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLElBQWEsRUFWcEIsQ0FBQTtBQUFBLElBY0EsYUFBQSxHQUFnQixJQUFJ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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/fuzzy.coffee