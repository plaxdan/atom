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
      this.addClass("autocomplete-plus");
      this.providers = [];
      if (this.currentFileBlacklisted()) {
        return;
      }
      this.registerProvider(new FuzzyProvider(this.editorView));
      this.handleEvents();
      this.setCurrentBuffer(this.editor.getBuffer());
      this.subscribeToCommand(this.editorView, "autocomplete-plus:activate", this.runAutocompletion);
      this.on("autocomplete-plus:select-next", (function(_this) {
        return function() {
          return _this.selectNextItemView();
        };
      })(this));
      this.on("autocomplete-plus:select-previous", (function(_this) {
        return function() {
          return _this.selectPreviousItemView();
        };
      })(this));
      return this.on("autocomplete-plus:cancel", (function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
    };

    AutocompleteView.prototype.currentFileBlacklisted = function() {
      var blacklist, blacklistGlob, fileName, _i, _len;
      blacklist = (atom.config.get("autocomplete-plus.fileBlacklist") || "").split(",").map(function(s) {
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
      var replace;
      replace = match.provider.confirm(match);
      this.editor.getSelections().forEach(function(selection) {
        return selection.clear();
      });
      this.cancel();
      if (!replace) {
        return;
      }
      this.replaceTextWithMatch(match);
      return this.editor.getCursors().forEach(function(cursor) {
        var position;
        position = cursor.getBufferPosition();
        return cursor.setBufferPosition([position.row, position.column]);
      });
    };

    AutocompleteView.prototype.cancel = function() {
      if (!this.active) {
        return;
      }
      AutocompleteView.__super__.cancel.apply(this, arguments);
      if (!this.editorView.hasFocus()) {
        return this.editorView.focus();
      }
    };

    AutocompleteView.prototype.runAutocompletion = function() {
      var provider, providerSuggestions, suggestions, _i, _len, _ref1;
      if (this.compositionInProgress) {
        return;
      }
      suggestions = [];
      _ref1 = this.providers.slice().reverse();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        provider = _ref1[_i];
        providerSuggestions = provider.buildSuggestions();
        if (!(providerSuggestions != null ? providerSuggestions.length : void 0)) {
          continue;
        }
        if (provider.exclusive) {
          suggestions = providerSuggestions;
          break;
        } else {
          suggestions = suggestions.concat(providerSuggestions);
        }
      }
      if (!suggestions.length) {
        return this.cancel();
      }
      this.setItems(suggestions);
      this.editorView.appendToLinesView(this);
      this.setPosition();
      return this.setActive();
    };

    AutocompleteView.prototype.contentsModified = function() {
      var delay;
      delay = parseInt(atom.config.get("autocomplete-plus.autoActivationDelay"));
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
      if (typedText.length === 1 && atom.config.get("autocomplete-plus.enableAutoActivation")) {
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
      var newSelectedBufferRanges, selections;
      newSelectedBufferRanges = [];
      selections = this.editor.getSelections();
      selections.forEach((function(_this) {
        return function(selection, i) {
          var buffer, cursorPosition, infixLength, startPosition;
          startPosition = selection.getBufferRange().start;
          buffer = _this.editor.getBuffer();
          selection.deleteSelectedText();
          cursorPosition = _this.editor.getCursors()[i].getBufferPosition();
          buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
          infixLength = match.word.length - match.prefix.length;
          return newSelectedBufferRanges.push([startPosition, [startPosition.row, startPosition.column + infixLength]]);
        };
      })(this));
      this.editor.insertText(match.word);
      return this.editor.setSelectedBufferRanges(newSelectedBufferRanges);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLE1BQVIsQ0FBMUIsRUFBQyxjQUFBLE1BQUQsRUFBUyxTQUFBLENBQVQsRUFBWSxVQUFBLEVBQVosRUFBZ0IsYUFBQSxLQUFoQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBSFosQ0FBQTs7QUFBQSxFQUlBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUixDQUp2QixDQUFBOztBQUFBLEVBS0EsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FMaEIsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQU5QLENBQUE7O0FBQUEsRUFPQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FQUixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHVDQUFBLENBQUE7Ozs7Ozs7Ozs7S0FBQTs7QUFBQSwrQkFBQSxhQUFBLEdBQWUsSUFBZixDQUFBOztBQUFBLCtCQUNBLEtBQUEsR0FBTyxLQURQLENBQUE7O0FBQUEsK0JBT0EsVUFBQSxHQUFZLFNBQUUsVUFBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsYUFBQSxVQUNaLENBQUE7QUFBQSxNQUFDLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxXQUFYLE1BQUYsQ0FBQTtBQUFBLE1BRUEsa0RBQUEsU0FBQSxDQUZBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxRQUFELENBQVUsbUJBQVYsQ0FKQSxDQUFB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
//# sourceURL=/Users/daniel/.atom/packages/autocomplete-paths/node_modules/autocomplete-plus/lib/autocomplete-view.coffee