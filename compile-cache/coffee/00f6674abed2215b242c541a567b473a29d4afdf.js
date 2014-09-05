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
      if ((this.sourceEditorId != null) && !this.sourceEditor) {
        this.sourceEditor = this.getSourceEditor(this.sourceEditorId);
      }
      if (this.sourceEditor != null) {
        this.bindCoffeeCompileEvents();
      }
      this.editor.setGrammar(atom.syntax.selectGrammar("hello.js"));
    }

    CoffeeCompileView.prototype.bindCoffeeCompileEvents = function() {
      if (atom.config.get('coffee-compile.compileOnSave')) {
        return this.subscribe(this.sourceEditor.buffer, 'saved', (function(_this) {
          return function() {
            return _this.saveCompiled();
          };
        })(this));
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FITCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQWEsSUFBQSwyQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxzQkFBQSxnQkFBZ0IsSUFBQyxDQUFBLG9CQUFBLFlBQy9CLENBQUE7QUFBQSxNQUFBLG9EQUFBLFNBQUEsQ0FBQSxDQUFBO0FBRUEsTUFBQSxJQUFHLDZCQUFBLElBQXFCLENBQUEsSUFBSyxDQUFBLFlBQTdCO0FBQ0UsUUFBQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFDLENBQUEsY0FBbEIsQ0FBaEIsQ0FERjtPQUZBO0FBS0EsTUFBQSxJQUFHLHlCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUFBLENBREY7T0FMQTtBQUFBLE1BU0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixVQUExQixDQUFuQixDQVRBLENBRFc7SUFBQSxDQUFiOztBQUFBLGdDQVlBLHVCQUFBLEdBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFIO2VBQ0UsSUFBQyxDQUFB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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile-view.coffee