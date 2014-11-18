(function() {
  var CoffeeCompileView, TextEditorView, util,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextEditorView = require('atom').TextEditorView;

  util = require('./util');

  module.exports = CoffeeCompileView = (function(_super) {
    __extends(CoffeeCompileView, _super);

    function CoffeeCompileView(_arg) {
      this.sourceEditorId = _arg.sourceEditorId, this.sourceEditor = _arg.sourceEditor;
      this.view = CoffeeCompileView.__super__.constructor.apply(this, arguments);
      this.disposables = [];
      if ((this.sourceEditorId != null) && !this.sourceEditor) {
        this.sourceEditor = util.getTextEditorById(this.sourceEditorId);
      }
      if (this.sourceEditor != null) {
        this.bindCoffeeCompileEvents();
      }
      this.bindMethods();
      this.view.getModel().setGrammar(atom.syntax.selectGrammar("hello.js"));
      this.renderCompiled();
      if (atom.config.get('coffee-compile.compileOnSave') || atom.config.get('coffee-compile.compileOnSaveWithoutPreview')) {
        util.compileToFile(this.sourceEditor);
      }
      return this.view;
    }

    CoffeeCompileView.prototype.bindMethods = function() {
      this.view.getTitle = this.getTitle.bind(this);
      this.view.beforeRemove = this.destroy.bind(this);
      return this.view.getUri = this.getUri.bind(this);
    };

    CoffeeCompileView.prototype.bindCoffeeCompileEvents = function() {
      var buffer;
      if (atom.config.get('coffee-compile.compileOnSave') && !atom.config.get('coffee-compile.compileOnSaveWithoutPreview')) {
        buffer = this.sourceEditor.getBuffer();
        this.disposables.push(buffer.onDidSave((function(_this) {
          return function() {
            _this.renderCompiled();
            return util.compileToFile(_this.sourceEditor);
          };
        })(this)));
        return this.disposables.push(buffer.onDidReload((function(_this) {
          return function() {
            _this.renderCompiled();
            return util.compileToFile(_this.sourceEditor);
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

    CoffeeCompileView.prototype.renderCompiled = function() {
      var code, e, literate, text;
      code = util.getSelectedCode(this.sourceEditor);
      try {
        literate = util.isLiterate(this.sourceEditor);
        text = util.compile(code, literate);
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

    return CoffeeCompileView;

  })(TextEditorView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxpQkFBa0IsT0FBQSxDQUFRLE1BQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix3Q0FBQSxDQUFBOztBQUFhLElBQUEsMkJBQUMsSUFBRCxHQUFBO0FBQ1gsTUFEYSxJQUFDLENBQUEsc0JBQUEsZ0JBQWdCLElBQUMsQ0FBQSxvQkFBQSxZQUMvQixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLG9EQUFBLFNBQUEsQ0FBUixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBSGYsQ0FBQTtBQUtBLE1BQUEsSUFBRyw2QkFBQSxJQUFxQixDQUFBLElBQUssQ0FBQSxZQUE3QjtBQUNFLFFBQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSSxDQUFDLGlCQUFMLENBQXVCLElBQUMsQ0FBQSxjQUF4QixDQUFoQixDQURGO09BTEE7QUFRQSxNQUFBLElBQUcseUJBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQUEsQ0FERjtPQVJBO0FBQUEsTUFXQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBWEEsQ0FBQTtBQUFBLE1BY0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLENBQUEsQ0FBZ0IsQ0FBQyxVQUFqQixDQUE0QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsVUFBMUIsQ0FBNUIsQ0FkQSxDQUFBO0FBQUEsTUFnQkEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQWhCQSxDQUFBO0FBa0JBLE1BQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVos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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile-view.coffee