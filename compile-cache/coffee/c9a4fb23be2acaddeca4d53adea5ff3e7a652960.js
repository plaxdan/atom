(function() {
  var $, $$, AutocompleteView, Editor, FuzzyProvider, Perf, Range, SimpleSelectListView, Utils, minimatch, path, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require("atom"), Editor = _ref.Editor, $ = _ref.$, $$ = _ref.$$, Range = _ref.Range;

  _ = require("underscore-plus");

  path = require("path");

  minimatch = require("minimatch");

  SimpleSelectListView = require("./simple-select-list-view");

  FuzzyProvider = require("./fuzzy-provider");

  Perf = require("./perf");

  Utils = require("./utils");

  module.exports = AutocompleteView = (function(_super) {
    __extends(AutocompleteView, _super);

    function AutocompleteView() {
      this.onChanged = __bind(this.onChanged, this);
      this.onSaved = __bind(this.onSaved, this);
      this.cursorMoved = __bind(this.cursorMoved, this);
      this.contentsModified = __bind(this.contentsModified, this);
      this.runAutocompletion = __bind(this.runAutocompletion, this);
      this.cancel = __bind(this.cancel, this);
      return AutocompleteView.__super__.constructor.apply(this, arguments);
    }

    AutocompleteView.prototype.currentBuffer = null;

    AutocompleteView.prototype.debug = false;

    AutocompleteView.prototype.initialize = function(editorView) {
      this.editorView = editorView;
      this.editor = this.editorView.editor;
      AutocompleteView.__super__.initialize.apply(this, arguments);
      this.addClass("autocomplete-plus-async");
      this.providers = [];
      if (this.currentFileBlacklisted()) {
        return;
      }
      this.registerProvider(new FuzzyProvider(this.editorView));
      this.handleEvents();
      this.setCurrentBuffer(this.editor.getBuffer());
      this.subscribeToCommand(this.editorView, "autocomplete-plus-async:activate", this.runAutocompletion);
      this.on("autocomplete-plus-async:select-next", (function(_this) {
        return function() {
          return _this.selectNextItemView();
        };
      })(this));
      this.on("autocomplete-plus-async:select-previous", (function(_this) {
        return function() {
          return _this.selectPreviousItemView();
        };
      })(this));
      return this.on("autocomplete-plus-async:cancel", (function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
    };

    AutocompleteView.prototype.currentFileBlacklisted = function() {
      var blacklist, blacklistGlob, fileName, _i, _len;
      blacklist = (atom.config.get("autocomplete-plus-async.fileBlacklist") || "").split(",").map(function(s) {
        return s.trim();
      });
      fileName = path.basename(this.editor.getBuffer().getPath());
      for (_i = 0, _len = blacklist.length; _i < _len; _i++) {
        blacklistGlob = blacklist[_i];
        if (minimatch(fileName, blacklistGlob)) {
          return true;
        }
      }
      return false;
    };

    AutocompleteView.prototype.viewForItem = function(_arg) {
      var className, item, label, renderLabelAsHtml, word;
      word = _arg.word, label = _arg.label, renderLabelAsHtml = _arg.renderLabelAsHtml, className = _arg.className;
      item = $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.span(word, {
              "class": "word"
            });
            if (label != null) {
              return _this.span(label, {
                "class": "label"
              });
            }
          };
        })(this));
      });
      if (renderLabelAsHtml) {
        item.find(".label").html(label);
      }
      if (className != null) {
        item.addClass(className);
      }
      return item;
    };

    AutocompleteView.prototype.escapeHtml = function(string) {
      var escapedString;
      escapedString = string.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return escapedString;
    };

    AutocompleteView.prototype.handleEvents = function() {
      this.list.on("mousewheel", function(event) {
        return event.stopPropagation();
      });
      this.editor.on("title-changed-subscription-removed", this.cancel);
      this.editor.on("cursor-moved", this.cursorMoved);
      this.hiddenInput.on('compositionstart', (function(_this) {
        return function() {
          _this.compositionInProgress = true;
          return null;
        };
      })(this));
      return this.hiddenInput.on('compositionend', (function(_this) {
        return function() {
          _this.compositionInProgress = false;
          return null;
        };
      })(this));
    };

    AutocompleteView.prototype.registerProvider = function(provider) {
      if (_.findWhere(this.providers, provider) == null) {
        return this.providers.push(provider);
      }
    };

    AutocompleteView.prototype.unregisterProvider = function(provider) {
      return _.remove(this.providers, provider);
    };

    AutocompleteView.prototype.confirmed = function(match) {
      var position, replace;
      replace = match.provider.confirm(match);
      this.editor.getSelection().clear();
      this.cancel();
      if (!match) {
        return;
      }
      if (replace) {
        this.replaceTextWithMatch(match);
        position = this.editor.getCursorBufferPosition();
        return this.editor.setCursorBufferPosition([position.row, position.column]);
      }
    };

    AutocompleteView.prototype.cancel = function() {
      AutocompleteView.__super__.cancel.apply(this, arguments);
      if (!this.editorView.hasFocus()) {
        return this.editorView.focus();
      }
    };

    AutocompleteView.prototype.runAutocompletion = function() {
      var cbCount, provider, suggestions, _i, _len, _ref1, _results;
      if (this.compositionInProgress) {
        return;
      }
      suggestions = [];
      cbCount = this.providers.length;
      _ref1 = this.providers.slice().reverse();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        provider = _ref1[_i];
        _results.push(provider.buildSuggestions((function(_this) {
          return function(list) {
            if (list && list.length) {
              suggestions = suggestions.concat(list);
              _this.setItems(suggestions);
              _this.editorView.appendToLinesView(_this);
              _this.setPosition();
              _this.setActive();
            }
            cbCount--;
            if (cbCount <= 0) {
              if (suggestions && suggestions.length > 0) {
                _this.setItems(suggestions);
                _this.editorView.appendToLinesView(_this);
                _this.setPosition();
                return _this.setActive();
              } else {
                if (!suggestions.length) {
                  return _this.cancel();
                }
              }
            }
          };
        })(this)));
      }
      return _results;
    };

    AutocompleteView.prototype.contentsModified = function() {
      var delay;
      delay = parseInt(atom.config.get("autocomplete-plus-async.autoActivationDelay"));
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
      }
      return this.delayTimeout = setTimeout(this.runAutocompletion, delay);
    };

    AutocompleteView.prototype.cursorMoved = function(data) {
      if (!data.textChanged) {
        return this.cancel();
      }
    };

    AutocompleteView.prototype.onSaved = function() {
      return this.cancel();
    };

    AutocompleteView.prototype.onChanged = function(e) {
      var typedText;
      typedText = e.newText.trim();
      if (typedText.length === 1 && atom.config.get("autocomplete-plus-async.enableAutoActivation")) {
        return this.contentsModified();
      } else {
        return this.cancel();
      }
    };

    AutocompleteView.prototype.setPosition = function() {
      var abovePosition, belowLowerPosition, belowPosition, cursorLeft, cursorTop, left, top, _ref1;
      _ref1 = this.editorView.pixelPositionForScreenPosition(this.editor.getCursorScreenPosition()), left = _ref1.left, top = _ref1.top;
      cursorLeft = left;
      cursorTop = top;
      belowPosition = cursorTop + this.editorView.lineHeight;
      belowLowerPosition = belowPosition + this.outerHeight();
      abovePosition = cursorTop;
      if (belowLowerPosition > this.editorView.outerHeight() + this.editorView.scrollTop()) {
        this.css({
          left: cursorLeft,
          top: abovePosition
        });
        return this.css("-webkit-transform", "translateY(-100%)");
      } else {
        this.css({
          left: cursorLeft,
          top: belowPosition
        });
        return this.css("-webkit-transform", "");
      }
    };

    AutocompleteView.prototype.replaceTextWithMatch = function(match) {
      var buffer, cursorPosition, prefixLength, selection, startPosition, suffixLength;
      prefixLength = 0;
      if (match.prefix) {
        prefixLength = match.prefix.length;
      }
      selection = this.editor.getSelection();
      startPosition = selection.getBufferRange().start;
      buffer = this.editor.getBuffer();
      cursorPosition = this.editor.getCursorBufferPosition();
      buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -prefixLength));
      this.editor.insertText(match.word);
      suffixLength = match.word.length - prefixLength;
      return this.editor.setSelectedBufferRange([startPosition, [startPosition.row, startPosition.column + suffixLength]]);
    };

    AutocompleteView.prototype.afterAttach = function(onDom) {
      var widestCompletion;
      if (!onDom) {
        return;
      }
      widestCompletion = parseInt(this.css("min-width")) || 0;
      this.list.find("li").each(function() {
        var labelWidth, totalWidth, wordWidth;
        wordWidth = $(this).find("span.word").outerWidth();
        labelWidth = $(this).find("span.label").outerWidth();
        totalWidth = wordWidth + labelWidth + 40;
        return widestCompletion = Math.max(widestCompletion, totalWidth);
      });
      this.list.width(widestCompletion);
      return this.width(this.list.outerWidth());
    };

    AutocompleteView.prototype.populateList = function() {
      var p;
      p = new Perf("Populating list", {
        debug: this.debug
      });
      p.start();
      AutocompleteView.__super__.populateList.apply(this, arguments);
      p.stop();
      return this.setPosition();
    };

    AutocompleteView.prototype.setCurrentBuffer = function(currentBuffer) {
      this.currentBuffer = currentBuffer;
      this.currentBuffer.on("saved", this.onSaved);
      return this.currentBuffer.on("changed", this.onChanged);
    };

    AutocompleteView.prototype.getModel = function() {
      return null;
    };

    AutocompleteView.prototype.dispose = function() {
      var provider, _i, _len, _ref1, _ref2, _ref3, _results;
      if ((_ref1 = this.currentBuffer) != null) {
        _ref1.off("changed", this.onChanged);
      }
      if ((_ref2 = this.currentBuffer) != null) {
        _ref2.off("saved", this.onSaved);
      }
      this.editor.off("title-changed-subscription-removed", this.cancel);
      this.editor.off("cursor-moved", this.cursorMoved);
      _ref3 = this.providers;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        provider = _ref3[_i];
        if (provider.dispose != null) {
          _results.push(provider.dispose());
        }
      }
      return _results;
    };

    return AutocompleteView;

  })(SimpleSelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLE1BQVIsQ0FBMUIsRUFBQyxjQUFBLE1BQUQsRUFBUyxTQUFBLENBQVQsRUFBWSxVQUFBLEVBQVosRUFBZ0IsYUFBQSxLQUFoQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBSFosQ0FBQTs7QUFBQSxFQUlBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUixDQUp2QixDQUFBOztBQUFBLEVBS0EsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FMaEIsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQU5QLENBQUE7O0FBQUEsRUFPQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FQUixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHVDQUFBLENBQUE7Ozs7Ozs7Ozs7S0FBQTs7QUFBQSwrQkFBQSxhQUFBLEdBQWUsSUFBZixDQUFBOztBQUFBLCtCQUNBLEtBQUEsR0FBTyxLQURQLENBQUE7O0FBQUEsK0JBT0EsVUFBQSxHQUFZLFNBQUUsVUFBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsYUFBQSxVQUNaLENBQUE7QUFBQSxNQUFDLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxXQUFYLE1BQUYsQ0FBQTtBQUFBLE1BRUEsa0RBQUEsU0FBQSxDQUZBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxRQUFELENBQVUseUJBQVYsQ0FKQSxDQUFB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
//# sourceURL=/Users/daniel/.atom/packages/autocomplete-plus-async/lib/autocomplete-view.coffee