(function() {
  var PathsProvider, Provider, Range, Suggestion, fs, fuzzaldrin, path, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require("atom").Range;

  _ref = require("autocomplete-plus"), Provider = _ref.Provider, Suggestion = _ref.Suggestion;

  fuzzaldrin = require("fuzzaldrin");

  _ = require("underscore-plus");

  path = require("./utils/path");

  fs = require("fs");

  module.exports = PathsProvider = (function(_super) {
    __extends(PathsProvider, _super);

    function PathsProvider() {
      return PathsProvider.__super__.constructor.apply(this, arguments);
    }

    PathsProvider.prototype.wordRegex = /[a-zA-Z0-9\.\/_-]*\/[a-zA-Z0-9\.\/_-]*/g;

    PathsProvider.prototype.exclusive = true;

    PathsProvider.prototype.buildSuggestions = function() {
      var prefix, selection, suggestions;
      selection = this.editor.getSelection();
      prefix = this.prefixOfSelection(selection);
      if (!prefix.length) {
        return;
      }
      suggestions = this.findSuggestionsForPrefix(prefix);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };

    PathsProvider.prototype.findSuggestionsForPrefix = function(prefix) {
      var basePath, body, directory, e, editorPath, exists, files, label, prefixDirectory, prefixFilename, prefixPath, result, resultPath, results, stat, suggestions;
      editorPath = this.editor.getPath();
      if (!editorPath) {
        return [];
      }
      basePath = path.dirname(editorPath);
      prefixPath = path.resolve(basePath, prefix);
      directory = path.dirname(prefixPath);
      exists = fs.existsSync(directory);
      if (!exists) {
        return [];
      }
      stat = fs.statSync(directory);
      if (!stat.isDirectory()) {
        return [];
      }
      try {
        files = fs.readdirSync(directory);
      } catch (_error) {
        e = _error;
        return [];
      }
      prefixFilename = path.basename(prefixPath);
      results = fuzzaldrin.filter(files, prefixFilename);
      suggestions = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          resultPath = path.resolve(directory, result);
          stat = fs.statSync(resultPath);
          if (stat.isDirectory()) {
            label = "Dir";
            result += "/";
          } else if (stat.isFile()) {
            label = "File";
          } else {
            continue;
          }
          prefixDirectory = path.dirname(prefix);
          body = path.join(prefixDirectory, result);
          body = path.normalize(body);
          if (body === prefix) {
            continue;
          }
          _results.push(new Suggestion(this, {
            word: result,
            prefix: prefix,
            label: label,
            data: {
              body: body
            }
          }));
        }
        return _results;
      }).call(this);
      return suggestions;
    };

    PathsProvider.prototype.confirm = function(suggestion) {
      var buffer, cursorPosition, selection, startPosition, suffixLength;
      selection = this.editor.getSelection();
      startPosition = selection.getBufferRange().start;
      buffer = this.editor.getBuffer();
      cursorPosition = this.editor.getCursorBufferPosition();
      buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -suggestion.prefix.length));
      this.editor.insertText(suggestion.data.body);
      suffixLength = suggestion.data.body.length - suggestion.prefix.length;
      this.editor.setSelectedBufferRange([startPosition, [startPosition.row, startPosition.column + suffixLength]]);
      setTimeout((function(_this) {
        return function() {
          return _this.editorView.trigger("autocomplete-plus:activate");
        };
      })(this), 100);
      return false;
    };

    return PathsProvider;

  })(Provider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxRQUFVLE9BQUEsQ0FBUSxNQUFSLEVBQVYsS0FBRCxDQUFBOztBQUFBLEVBQ0EsT0FBeUIsT0FBQSxDQUFRLG1CQUFSLENBQXpCLEVBQUMsZ0JBQUEsUUFBRCxFQUFXLGtCQUFBLFVBRFgsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSEosQ0FBQTs7QUFBQSxFQUlBLElBQUEsR0FBTyxPQUFBLENBQVEsY0FBUixDQUpQLENBQUE7O0FBQUEsRUFLQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FMTCxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw0QkFBQSxTQUFBLEdBQVcseUNBQVgsQ0FBQTs7QUFBQSw0QkFDQSxTQUFBLEdBQVcsSUFEWCxDQUFBOztBQUFBLDRCQUVBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLDhCQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUEsQ0FBWixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGlCQUFELENBQW1CLFNBQW5CLENBRFQsQ0FBQTtBQUVBLE1BQUEsSUFBQSxDQUFBLE1BQW9CLENBQUMsTUFBckI7QUFBQSxjQUFBLENBQUE7T0FGQTtBQUFBLE1BSUEsV0FBQSxHQUFjLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixNQUExQixDQUpkLENBQUE7QUFLQSxNQUFBLElBQUEsQ0FBQSxXQUF5QixDQUFDLE1BQTFCO0FBQUEsY0FBQSxD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
//# sourceURL=/Users/daniel/.atom/packages/autocomplete-paths/lib/paths-provider.coffee