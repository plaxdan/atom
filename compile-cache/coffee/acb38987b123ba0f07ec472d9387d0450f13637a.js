(function() {
  var CoffeeCompileView, EditorView, coffee, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EditorView = require('atom').EditorView;

  coffee = require('coffee-script');

  path = require('path');

  fs = require('fs');

  module.exports = CoffeeCompileView = (function(_super) {
    __extends(CoffeeCompileView, _super);

    function CoffeeCompileView(_arg) {
      this.sourceEditorId = _arg.sourceEditorId, this.sourceEditor = _arg.sourceEditor;
      CoffeeCompileView.__super__.constructor.apply(this, arguments);
      this.disposables = [];
      if ((this.sourceEditorId != null) && !this.sourceEditor) {
        this.sourceEditor = this.getSourceEditor(this.sourceEditorId);
      }
      if (this.sourceEditor != null) {
        this.bindCoffeeCompileEvents();
      }
      this.editor.setGrammar(atom.syntax.selectGrammar("hello.js"));
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
      return this.getEditor().setText(text);
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

  })(EditorView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FITCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQWEsSUFBQSwyQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxzQkFBQSxnQkFBZ0IsSUFBQyxDQUFBLG9CQUFBLFlBQy9CLENBQUE7QUFBQSxNQUFBLG9EQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBSGYsQ0FBQTtBQUtBLE1BQUEsSUFBRyw2QkFBQSxJQUFxQixDQUFBLElBQUssQ0FBQSxZQUE3QjtBQUNFLFFBQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBQyxDQUFBLGNBQWxCLENBQWhCLENBREY7T0FMQTtBQVFBLE1BQUEsSUFBRyx5QkFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBQSxDQURGO09BUkE7QUFBQSxNQVlBLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsVUFBMUIsQ0FBbkIsQ0FaQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSxnQ0FlQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7QUFDdkIsVUFBQSxNQUFBO0FBQUEsTUFBQSxJQUFHLElB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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile-view.coffee