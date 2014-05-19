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

    function CoffeeCompileView(editorId) {
      var _ref1;
      this.editorId = editorId;
      CoffeeCompileView.__super__.constructor.apply(this, arguments);
      this.editor = this.getEditor(this.editorId);
      if (this.editor != null) {
        this.trigger('title-changed');
        this.bindEvents();
      } else {
        if ((_ref1 = this.parents('.pane').view()) != null) {
          _ref1.destroyItem(this);
        }
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
      if (this.editor.getPath()) {
        return "Compiled " + (path.basename(this.editor.getPath()));
      } else if (this.editor) {
        return "Compiled " + (this.editor.getTitle());
      } else {
        return "Compiled Javascript";
      }
    };

    CoffeeCompileView.prototype.getUri = function() {
      return "coffeecompile://editor/" + this.editorId;
    };

    CoffeeCompileView.prototype.getPath = function() {
      return this.editor.getPath();
    };

    return CoffeeCompileView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFtQyxPQUFBLENBQVEsTUFBUixDQUFuQyxFQUFDLFNBQUEsQ0FBRCxFQUFJLFdBQUEsR0FBSixFQUFTLGtCQUFBLFVBQVQsRUFBcUIsa0JBQUEsVUFBckIsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUixDQURULENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FKTCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQUEsSUFBQSxpQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sb0NBQVA7QUFBQSxRQUE2QyxRQUFBLEVBQVUsQ0FBQSxDQUF2RDtPQUFMLEVBQWdFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzlELEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxzQkFBUDtXQUFMLEVBQW9DLFNBQUEsR0FBQTttQkFDbEMsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsTUFBQSxFQUFRLGNBQVI7QUFBQSxjQUF3QixPQUFBLEVBQU8sdUJBQS9CO2FBQUwsRUFEa0M7VUFBQSxDQUFwQyxFQUQ4RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhFLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBS2Es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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile-view.coffee