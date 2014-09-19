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
      if (atom.config.get('coffee-compile.compileOnSave')) {
        buffer = this.sourceEditor.getBuffer();
        this.disposables.push(buffer.onDidSave((function(_this) {
          return function() {
            _this.renderCompiled();
            return _this.saveCompiled();
          };
        })(this)));
        return this.disposables.push(buffer.onDidReload((function(_this) {
          return function() {
            _this.renderCompiled();
            return _this.saveCompiled();
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
      _ref = atom.workspace.getEditors();
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

    CoffeeCompileView.prototype.compile = function(code) {
      var bare, grammarScopeName, literate;
      grammarScopeName = this.sourceEditor.getGrammar().scopeName;
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
        text = this.compile(this.sourceEditor.getText());
        srcPath = this.sourceEditor.getPath();
        srcExt = path.extname(srcPath);
        destPath = path.join(path.dirname(srcPath), "" + (path.basename(srcPath, srcExt)) + ".js");
        return fs.writeFile(destPath, text, callback);
      } catch (_error) {
        e = _error;
        return console.error("Coffee-compile: " + e.stack);
      }
    };

    CoffeeCompileView.prototype.renderCompiled = function() {
      var code, e, text;
      code = this.getSelectedCode();
      try {
        text = this.compile(code);
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

    return CoffeeCompileView;

  })(EditorView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FITCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQWEsSUFBQSwyQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxzQkFBQSxnQkFBZ0IsSUFBQyxDQUFBLG9CQUFBLFlBQy9CLENBQUE7QUFBQSxNQUFBLG9EQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBSGYsQ0FBQTtBQUtBLE1BQUEsSUFBRyw2QkFBQSxJQUFxQixDQUFBLElBQUssQ0FBQSxZQUE3QjtBQUNFLFFBQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBQyxDQUFBLGNBQWxCLENBQWhCLENBREY7T0FMQTtBQVFBLE1BQUEsSUFBRyx5QkFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBQSxDQURGO09BUkE7QUFBQSxNQVlBLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsVUFBMUIsQ0FBbkIsQ0FaQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSxnQ0FlQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7QUFDdkIsVUFBQSxNQUFBO0FBQUEsTUFBQSxJQUFHLElB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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile-view.coffee