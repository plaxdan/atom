(function() {
  var $, $$$, CoffeeCompileView, EditorView, ScrollView, coffee, fs, path, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, $$$ = _ref.$$$, EditorView = _ref.EditorView, ScrollView = _ref.ScrollView;

  coffee = require('coffee-script');

  _ = require('underscore-plus');

  path = require('path');

  fs = require('fs');

  module.exports = CoffeeCompileView = (function(_super) {
    __extends(CoffeeCompileView, _super);

    CoffeeCompileView.content = function() {
      return this.div({
        "class": 'coffee-compile native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'editor editor-colors'
          }, function() {
            return _this.div({
              outlet: 'compiledCode',
              "class": 'lang-javascript lines'
            });
          });
        };
      })(this));
    };

    function CoffeeCompileView(_arg) {
      this.editorId = _arg.editorId, this.editor = _arg.editor;
      CoffeeCompileView.__super__.constructor.apply(this, arguments);
      if ((this.editorId != null) && !this.editor) {
        this.editor = this.getEditor(this.editorId);
      }
      if (this.editor != null) {
        this.trigger('title-changed');
        this.bindEvents();
      }
    }

    CoffeeCompileView.prototype.destroy = function() {
      return this.unsubscribe();
    };

    CoffeeCompileView.prototype.bindEvents = function() {
      this.subscribe(atom.syntax, 'grammar-updated', _.debounce(((function(_this) {
        return function() {
          return _this.renderCompiled();
        };
      })(this)), 250));
      this.subscribe(this, 'core:move-up', (function(_this) {
        return function() {
          return _this.scrollUp();
        };
      })(this));
      this.subscribe(this, 'core:move-down', (function(_this) {
        return function() {
          return _this.scrollDown();
        };
      })(this));
      if (atom.config.get('coffee-compile.compileOnSave')) {
        return this.subscribe(this.editor.buffer, 'saved', (function(_this) {
          return function() {
            return _this.saveCompiled();
          };
        })(this));
      }
    };

    CoffeeCompileView.prototype.getEditor = function(id) {
      var editor, _i, _len, _ref1, _ref2;
      _ref1 = atom.workspace.getEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        if (((_ref2 = editor.id) != null ? _ref2.toString() : void 0) === id.toString()) {
          return editor;
        }
      }
      return null;
    };

    CoffeeCompileView.prototype.getSelectedCode = function() {
      var code, range;
      range = this.editor.getSelectedBufferRange();
      code = range.isEmpty() ? this.editor.getText() : this.editor.getTextInBufferRange(range);
      return code;
    };

    CoffeeCompileView.prototype.compile = function(code) {
      var bare, grammarScopeName, literate;
      grammarScopeName = this.editor.getGrammar().scopeName;
      bare = atom.config.get('coffee-compile.noTopLevelFunctionWrapper') || true;
      literate = grammarScopeName === "source.litcoffee";
      return coffee.compile(code, {
        bare: bare,
        literate: literate
      });
    };

    CoffeeCompileView.prototype.saveCompiled = function(callback) {
      var destPath, e, srcExt, srcPath, text;
      try {
        text = this.compile(this.editor.getText());
        srcPath = this.editor.getPath();
        srcExt = path.extname(srcPath);
        destPath = path.join(path.dirname(srcPath), "" + (path.basename(srcPath, srcExt)) + ".js");
        fs.writeFileSync(destPath, text);
      } catch (_error) {
        e = _error;
        console.error("Coffee-compile: " + e.stack);
      }
      return typeof callback === "function" ? callback() : void 0;
    };

    CoffeeCompileView.prototype.renderCompiled = function(callback) {
      var attributes, code, e, grammar, text, tokens, _i, _len, _ref1;
      code = this.getSelectedCode();
      try {
        text = this.compile(code);
      } catch (_error) {
        e = _error;
        text = e.stack;
      }
      grammar = atom.syntax.selectGrammar("hello.js", text);
      this.compiledCode.empty();
      _ref1 = grammar.tokenizeLines(text);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        tokens = _ref1[_i];
        attributes = {
          "class": "line"
        };
        this.compiledCode.append(EditorView.buildLineHtml({
          tokens: tokens,
          text: text,
          attributes: attributes
        }));
      }
      this.compiledCode.css({
        fontSize: atom.config.get('editor.fontSize') || 12,
        fontFamily: atom.config.get('editor.fontFamily')
      });
      return typeof callback === "function" ? callback() : void 0;
    };

    CoffeeCompileView.prototype.getTitle = function() {
      if (this.editor != null) {
        return "Compiled " + (this.editor.getTitle());
      } else {
        return "Compiled Javascript";
      }
    };

    CoffeeCompileView.prototype.getUri = function() {
      return "coffeecompile://editor/" + this.editorId;
    };

    CoffeeCompileView.prototype.getPath = function() {
      var _ref1;
      return ((_ref1 = this.editor) != null ? _ref1.getPath() : void 0) || "";
    };

    return CoffeeCompileView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFtQyxPQUFBLENBQVEsTUFBUixDQUFuQyxFQUFDLFNBQUEsQ0FBRCxFQUFJLFdBQUEsR0FBSixFQUFTLGtCQUFBLFVBQVQsRUFBcUIsa0JBQUEsVUFBckIsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUixDQURULENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FKTCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQUEsSUFBQSxpQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sb0NBQVA7QUFBQSxRQUE2QyxRQUFBLEVBQVUsQ0FBQSxDQUF2RDtPQUFMLEVBQWdFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzlELEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxzQkFBUDtXQUFMLEVBQW9DLFNBQUEsR0FBQTttQkFDbEMsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsTUFBQSxFQUFRLGNBQVI7QUFBQSxjQUF3QixPQUFBLEVBQU8sdUJBQS9CO2FBQUwsRUFEa0M7VUFBQSxDQUFwQyxFQUQ4RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhFLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBS2Es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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile-view.coffee