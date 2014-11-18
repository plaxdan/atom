(function() {
  var CoffeeCompileView, TextEditorView, coffee, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextEditorView = require('atom').TextEditorView;

  coffee = require('coffee-script');

  path = require('path');

  fs = require('fs');

  module.exports = CoffeeCompileView = (function(_super) {
    __extends(CoffeeCompileView, _super);

    function CoffeeCompileView(_arg) {
      this.sourceEditorId = _arg.sourceEditorId, this.sourceEditor = _arg.sourceEditor;
      this.view = CoffeeCompileView.__super__.constructor.apply(this, arguments);
      this.view.getTitle = this.getTitle.bind(this);
      this.disposables = [];
      if ((this.sourceEditorId != null) && !this.sourceEditor) {
        this.sourceEditor = this.getSourceEditor(this.sourceEditorId);
      }
      if (this.sourceEditor != null) {
        this.bindCoffeeCompileEvents();
      }
      this.view.getModel().setGrammar(atom.syntax.selectGrammar("hello.js"));
      this.renderCompiled();
      if (atom.config.get('coffee-compile.compileOnSave') || atom.config.get('coffee-compile.compileOnSaveWithoutPreview')) {
        CoffeeCompileView.saveCompiled(this.sourceEditor);
      }
      return this.view;
    }

    CoffeeCompileView.prototype.bindCoffeeCompileEvents = function() {
      var buffer;
      if (atom.config.get('coffee-compile.compileOnSave') && !atom.config.get('coffee-compile.compileOnSaveWithoutPreview')) {
        buffer = this.sourceEditor.getBuffer();
        this.disposables.push(buffer.onDidSave((function(_this) {
          return function() {
            _this.renderCompiled();
            return CoffeeCompileView.saveCompiled(_this.sourceEditor);
          };
        })(this)));
        return this.disposables.push(buffer.onDidReload((function(_this) {
          return function() {
            _this.renderCompiled();
            return CoffeeCompileView.saveCompiled(_this.sourceEditor);
          };
        })(this)));
      }
    };

    CoffeeCompileView.prototype.destroy = function() {
      var disposable, _i, _len, _ref, _results;
      _ref = this.disposables;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        disposable = _ref[_i];
        _results.push(disposable.dispose());
      }
      return _results;
    };

    CoffeeCompileView.prototype.getSourceEditor = function(id) {
      var editor, _i, _len, _ref, _ref1;
      _ref = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        editor = _ref[_i];
        if (((_ref1 = editor.id) != null ? _ref1.toString() : void 0) === id.toString()) {
          return editor;
        }
      }
      return null;
    };

    CoffeeCompileView.prototype.getSelectedCode = function() {
      var code, range;
      range = this.sourceEditor.getSelectedBufferRange();
      code = range.isEmpty() ? this.sourceEditor.getText() : this.sourceEditor.getTextInBufferRange(range);
      return code;
    };

    CoffeeCompileView.prototype.renderCompiled = function() {
      var code, e, text;
      code = this.getSelectedCode();
      try {
        text = CoffeeCompileView.compile(this.sourceEditor, code);
      } catch (_error) {
        e = _error;
        text = e.stack;
      }
      return this.view.getModel().setText(text);
    };

    CoffeeCompileView.prototype.getTitle = function() {
      if (this.sourceEditor != null) {
        return "Compiled " + (this.sourceEditor.getTitle());
      } else {
        return "Compiled Javascript";
      }
    };

    CoffeeCompileView.prototype.getUri = function() {
      return "coffeecompile://editor/" + this.sourceEditorId;
    };

    CoffeeCompileView.compile = function(editor, code) {
      var bare, grammarScopeName, literate;
      grammarScopeName = editor.getGrammar().scopeName;
      bare = atom.config.get('coffee-compile.noTopLevelFunctionWrapper') || true;
      literate = grammarScopeName === "source.litcoffee";
      return coffee.compile(code, {
        bare: bare,
        literate: literate
      });
    };

    CoffeeCompileView.saveCompiled = function(editor, callback) {
      var destPath, e, srcExt, srcPath, text;
      try {
        text = CoffeeCompileView.compile(editor, editor.getText());
        srcPath = editor.getPath();
        srcExt = path.extname(srcPath);
        destPath = path.join(path.dirname(srcPath), "" + (path.basename(srcPath, srcExt)) + ".js");
        return fs.writeFile(destPath, text, callback);
      } catch (_error) {
        e = _error;
        return console.error("Coffee-compile: " + e.stack);
      }
    };

    return CoffeeCompileView;

  })(TextEditorView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1EQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxpQkFBa0IsT0FBQSxDQUFRLE1BQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FITCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQWEsSUFBQSwyQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxzQkFBQSxnQkFBZ0IsSUFBQyxDQUFBLG9CQUFBLFlBQy9CLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsb0RBQUEsU0FBQSxDQUFSLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixHQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxJQUFmLENBSmpCLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFQZixDQUFBO0FBU0EsTUFBQSxJQUFHLDZCQUFBLElBQXFCLENBQUEsSUFBSyxDQUFBLFlBQTdCO0FBQ0UsUUFBQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFDLENBQUEsY0FBbEIsQ0FBaEIsQ0FERjtPQVRBO0FBWUEsTUFBQSxJQUFHLHlCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUFBLENBREY7T0FaQTtBQUFBLE1BZ0JBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFBLENBQWdCLENBQUMsVUFBakIsQ0FB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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile-view.coffee