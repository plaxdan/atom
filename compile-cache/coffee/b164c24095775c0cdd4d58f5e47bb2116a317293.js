(function() {
  var CompletionProvider, Omni, Provider, Suggestion, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Omni = require('../../../omni-sharp-server/omni');

  _ref = require('autocomplete-plus-async-plus'), Provider = _ref.Provider, Suggestion = _ref.Suggestion;

  module.exports = CompletionProvider = (function(_super) {
    __extends(CompletionProvider, _super);

    function CompletionProvider() {
      return CompletionProvider.__super__.constructor.apply(this, arguments);
    }

    CompletionProvider.prototype.buildSuggestions = function(cb) {
      var buffer, bufferPosition, data, editor, end, word, wordRegex;
      wordRegex = /[A-Z_0-9]+/i;
      editor = atom.workspace.getActiveEditor();
      buffer = editor.getBuffer();
      bufferPosition = editor.getCursorBufferPosition();
      end = bufferPosition.column;
      data = buffer.getLines()[bufferPosition.row].substring(0, end + 1);
      end--;
      while (wordRegex.test(data.charAt(end))) {
        end--;
      }
      word = data.substring(end + 1);
      return Omni.autocomplete(word).then((function(_this) {
        return function(completions) {
          var item, suggestions;
          if (completions == null) {
            completions = [];
          }
          suggestions = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = completions.length; _i < _len; _i++) {
              item = completions[_i];
              _results.push(new Suggestion(this, {
                word: item.CompletionText,
                label: item.DisplayText,
                prefix: word
              }));
            }
            return _results;
          }).call(_this);
          return cb(suggestions);
        };
      })(this));
    };

    return CompletionProvider;

  })(Provider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9EQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGlDQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUVBLE9BQXlCLE9BQUEsQ0FBUSw4QkFBUixDQUF6QixFQUFDLGdCQUFBLFFBQUQsRUFBVyxrQkFBQSxVQUZYLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNRO0FBRUoseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGlDQUFBLGdCQUFBLEdBQWtCLFNBQUMsRUFBRCxHQUFBO0FBQ2hCLFVBQUEsMERBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxhQUFaLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQURULENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxNQUFNLENBQUMsU0FBUCxDQUFBLENBRlQsQ0FBQTtBQUFBLE1BR0EsY0FBQSxHQUFpQixNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUhqQixDQUFBO0FBQUEsTUFLQSxHQUFBLEdBQU0sY0FBYyxDQUFDLE1BTHJCLENBQUE7QUFBQSxNQU9BLElBQUEsR0FBTyxNQUFNLENBQUMsUUFBUCxDQUFBLENBQWtCLENBQUEsY0FBYyxDQUFDLEdBQWYsQ0FBbUIsQ0FBQyxTQUF0QyxDQUFnRCxDQUFoRCxFQUFtRCxHQUFBLEdBQU0sQ0FBekQsQ0FQUCxDQUFBO0FBQUEsTUFRQSxHQUFBLEVBUkEsQ0FBQTtBQVVBLGFBQU0sU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQVosQ0FBZixDQUFOLEdBQUE7QUFDRSxRQUFBLEdBQUEsRUFBQSxDQURGO01BQUEsQ0FWQTtBQUFBLE1BYUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFMLENBQWUsR0FBQSxHQUFJLENBQW5CLENBYlAsQ0FBQTthQWNBLElBQUksQ0FBQyxZQUFMLENBQWtCLElBQWxCLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsV0FBRCxHQUFBO0FBQ0osY0FBQSxpQkFBQTs7WUFBQSxjQUFlO1dBQWY7QUFBQSxVQUNBLFdBQUE7O0FBQ0c7aUJBQUEsa0RBQUE7cUNBQUE7QUFBQSw0QkFBSSxJQUFBLFVBQUEsQ0FBVyxJQUFYLEVBQWlCO0FBQUEsZ0JBQUEsSUFBQSxFQUFLLElBQUksQ0FBQyxjQUFWO0FBQUEsZ0JBQTBCLEtBQUEsRUFBTSxJQUFJLENBQUMsV0FBckM7QUFBQSxnQkFBa0QsTUFBQSxFQUFPLElBQXpEO2VBQWpCLEVBQUosQ0FBQTtBQUFBOzt3QkFGSCxDQUFBO2lCQUdBLEVBQUEsQ0FBRyxXQUFILEVBSkk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBZmdCO0lBQUEsQ0FBbEIsQ0FBQTs7OEJBQUE7O0tBRitCLFNBTG5DLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/features/lib/completion-provider.coffee