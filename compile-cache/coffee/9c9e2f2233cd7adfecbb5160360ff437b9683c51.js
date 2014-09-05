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
      if (atom.config.get('core.useReactEditor')) {
        this.editor.setGrammar(atom.syntax.selectGrammar("hello.js"));
      }
    }

    CoffeeCompileView.prototype.initialize = function(options) {
      if (!atom.config.get('core.useReactEditor')) {
        options.mini = true;
        CoffeeCompileView.__super__.initialize.call(this, options);
        this.editor.setGrammar(atom.syntax.selectGrammar("hello.js"));
        return this.css('line-height', atom.config.get('editor.lineHeight') || this.configDefaults.lineHeight);
      }
    };

    CoffeeCompileView.prototype.bindCoffeeCompileEvents = function() {
      if (atom.config.get('coffee-compile.compileOnSave')) {
        this.subscribe(this.sourceEditor.buffer, 'saved', (function(_this) {
          return function() {
            return _this.saveCompiled();
          };
        })(this));
      }
      if (!atom.config.get('core.useReactEditor')) {
        this.scrollView.on('mousewheel', (function(_this) {
          return function(e) {
            var delta;
            if (delta = e.originalEvent.wheelDeltaY) {
              _this.scrollTop(_this.scrollTop() - delta);
              return false;
            }
          };
        })(this));
        return this.verticalScrollbar.on('scroll', (function(_this) {
          return function() {
            return _this.scrollTop(_this.verticalScrollbar.scrollTop(), {
              adjustVerticalScrollbar: false
            });
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

    CoffeeCompileView.prototype.updateDisplay = function() {
      var lineHeight;
      lineHeight = atom.config.get('editor.lineHeight') || this.configDefaults.lineHeight;
      this.overlayer.find('.cursor').css('line-height', lineHeight * 0.8);
      return CoffeeCompileView.__super__.updateDisplay.apply(this, arguments);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FITCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQWEsSUFBQSwyQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxzQkFBQSxnQkFBZ0IsSUFBQyxDQUFBLG9CQUFBLFlBQy9CLENBQUE7QUFBQSxNQUFBLG9EQUFBLFNBQUEsQ0FBQSxDQUFBO0FBRUEsTUFBQSxJQUFHLDZCQUFBLElBQXFCLENBQUEsSUFBSyxDQUFBLFlBQTdCO0FBQ0UsUUFBQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFDLENBQUEsY0FBbEIsQ0FBaEIsQ0FERjtPQUZBO0FBS0EsTUFBQSxJQUFHLHlCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUFBLENBREY7T0FMQTtBQVFBLE1BQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLENBQUg7QUFFRSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsVUFBMUIsQ0FBbkIsQ0FBQSxDQUZGO09BVFc7SUFBQSxDQUFiOztBQUFBLGdDQWFBLFVBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUVWLE1BQUEsSUFBQSxDQUFBLElBQVcsQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQkFBaEIsQ0FBUDtBQUNFLFFBQUEsT0FBTyxDQUFDLElBQVIsR0FBZSxJQUFmLENBQUE7QUFBQSxRQUNBLGtEQUFNLE9BQU4sQ0FEQSxDQUFBO0FBQUEsUUFJQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFaLENBQTBCLFVBQTFCLENBQW5CLENBSkEsQ0FBQTtlQVFBLElBQUMsQ0FBQSxHQUFELENBQUssYUFBTCxFQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCLENBQUEsSUFBd0MsSUFBQyxDQUFBLGNBQWMsQ0FBQyxVQUE1RSxFQVRGO09BRlU7SUFBQSxDQWJaLENBQUE7O0FBQUEsZ0NBMEJBLHVCQUFBLEdBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBekIsRUFBaUMsT0FBakMsRUFBMEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUMsQ0FBQSxDQURGO09BQUE7QUFHQSxNQUFBLElBQUEsQ0FBQSxJQUFXLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLENBQVA7QUFFRSxRQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLFlBQWYsRUFBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLENBQUQsR0FBQTtBQUMzQixnQkFBQSxLQUFBO0FBQUEsWUFBQSxJQUFHLEtBQUEsR0FBUSxDQUFDLENBQUMsYUFBYSxDQUFDLFdBQTNCO0FBQ0UsY0FBQSxLQUFDLENBQUEsU0FBRCxDQUFXLEtBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLEtBQTFCLENBQUEsQ0FBQTtxQkFDQSxNQUZGO2FBRDJCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FBQSxDQUFBO2VBS0EsSUFBQyxDQUFBLGlCQUFpQixDQUFFLEVBQXBCLENBQXVCLFFBQXZCLEVBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUMvQixLQUFDLENBQUEsU0FBRCxDQUFXLEtBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxTQUFuQixDQUFBLENBQVgsRUFBMkM7QUFBQSxjQUFBLHVCQUFBLEVBQXlCLEtBQXpCO2FBQTNDLEVBRCtCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakMsRUFQRjtPQUp1QjtJQUFBLENBMUJ6QixDQUFBOztBQUFBLGdDQXdDQSxlQUFBLEdBQWlCLFNBQUMsRUFBRCxHQUFBO0FBQ2YsVUFBQSw2QkFBQTtBQUFBO0FBQUEsV0FBQSwyQ0FBQTswQkFBQTtBQUNFLFFBQUEsd0NBQTBCLENBQUUsUUFBWCxDQUFBLFdBQUEsS0FBeUIsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUExQztBQUFBLGlCQUFPLE1BQVAsQ0FBQTtTQURGO0FBQUEsT0FBQTtBQUdBLGFBQU8sSUFBUCxDQUplO0lBQUEsQ0F4Q2pCLENBQUE7O0FBQUEsZ0NBOENBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSxXQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQVksQ0FBQyxzQkFBZCxDQUFBLENBQVIsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUNLLEtBQUssQ0FBQyxPQUFOLENBQUEsQ0FBSCxHQUNFLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBLENBREYsR0FHRSxJQUFDLENBQUEsWUFBWSxDQUFDLG9CQUFkLENBQW1DLEtBQW5DLENBTEosQ0FBQTtBQU9BLGFBQU8sSUFBUCxDQVJlO0lBQUEsQ0E5Q2pCLENBQUE7O0FBQUEsZ0NBd0RBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUNQLFVBQUEsZ0NBQUE7QUFBQSxNQUFBLGdCQUFBLEdBQW1CLElBQUMsQ0FBQSxZQUFZLENBQUMsVUFBZCxDQUFBLENBQTBCLENBQUMsU0FBOUMsQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQ0FBaEIsQ0FBQSxJQUErRCxJQUYxRSxDQUFBO0FBQUEsTUFHQSxRQUFBLEdBQVcsZ0JBQUEsS0FBb0Isa0JBSC9CLENBQUE7QUFLQSxhQUFPLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQjtBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxVQUFBLFFBQVA7T0FBckIsQ0FBUCxDQU5PO0lBQUEsQ0F4RFQsQ0FBQTs7QUFBQSxnQ0FnRUEsWUFBQSxHQUFjLFNBQUMsUUFBRCxHQUFBO0FBQ1osVUFBQSxrQ0FBQTtBQUFBO0FBQ0UsUUFBQSxJQUFBLEdBQVcsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBQSxDQUFULENBQVgsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFXLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBLENBRFgsQ0FBQTtBQUFBLFFBRUEsTUFBQSxHQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQUZYLENBQUE7QUFBQSxRQUdBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUNULElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQURTLEVBQ2MsRUFBQSxHQUFFLENBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQUEsQ0FBRixHQUFrQyxLQURoRCxDQUhYLENBQUE7ZUFNQSxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsSUFBdkIsRUFBNkIsUUFBN0IsRUFQRjtPQUFBLGNBQUE7QUFVRSxRQURJLFVBQ0osQ0FBQTtlQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWUsa0JBQUEsR0FBaUIsQ0FBQyxDQUFDLEtBQWxDLEVBVkY7T0FEWTtJQUFBLENBaEVkLENBQUE7O0FBQUEsZ0NBNkVBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxhQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFQLENBQUE7QUFFQTtBQUNFLFFBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFQLENBREY7T0FBQSxjQUFBO0FBR0UsUUFESSxVQUNKLENBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxDQUFDLENBQUMsS0FBVCxDQUhGO09BRkE7YUFPQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBQVksQ0FBQyxPQUFiLENBQXFCLElBQXJCLEVBUmM7SUFBQSxDQTdFaEIsQ0FBQTs7QUFBQSxnQ0F1RkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUViLFVBQUEsVUFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsQ0FBQSxJQUF3QyxJQUFDLENBQUEsY0FBYyxDQUFDLFVBQXJFLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixTQUFoQixDQUEwQixDQUFDLEdBQTNCLENBQStCLGFBQS9CLEVBQThDLFVBQUEsR0FBYSxHQUEzRCxDQURBLENBQUE7YUFHQSxzREFBQSxTQUFBLEVBTGE7SUFBQSxDQXZGZixDQUFBOztBQUFBLGdDQThGQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFHLHlCQUFIO2VBQ0csV0FBQSxHQUFVLENBQUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxRQUFkLENBQUEsQ0FBQSxFQURiO09BQUEsTUFBQTtlQUdFLHNCQUhGO09BRFE7SUFBQSxDQTlGVixDQUFBOztBQUFBLGdDQW9HQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQUkseUJBQUEsR0FBd0IsSUFBQyxDQUFBLGVBQTdCO0lBQUEsQ0FwR1IsQ0FBQTs7NkJBQUE7O0tBRDhCLFdBTmhDLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile-view.coffee