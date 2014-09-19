(function() {
  var CoffeeCompileView, querystring, url,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  url = require('url');

  querystring = require('querystring');

  CoffeeCompileView = require('./coffee-compile-view');

  module.exports = {
    configDefaults: {
      grammars: ['source.coffee', 'source.litcoffee', 'text.plain', 'text.plain.null-grammar'],
      noTopLevelFunctionWrapper: true,
      compileOnSave: false,
      compileOnSaveWithoutPreview: false,
      focusEditorAfterCompile: false
    },
    activate: function() {
      atom.workspaceView.command('coffee-compile:compile', (function(_this) {
        return function() {
          return _this.display();
        };
      })(this));
      if (atom.config.get('coffee-compile.compileOnSaveWithoutPreview')) {
        atom.workspaceView.command('core:save', (function(_this) {
          return function() {
            return _this.save();
          };
        })(this));
      }
      return atom.workspace.registerOpener(function(uriToOpen) {
        var host, pathname, protocol, _ref;
        _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
        if (pathname) {
          pathname = querystring.unescape(pathname);
        }
        if (protocol !== 'coffeecompile:') {
          return;
        }
        return new CoffeeCompileView({
          sourceEditorId: pathname.substr(1)
        });
      });
    },
    checkGrammar: function(editor) {
      var grammar, grammars, _ref;
      grammars = atom.config.get('coffee-compile.grammars') || [];
      return _ref = (grammar = editor.getGrammar().scopeName), __indexOf.call(grammars, _ref) >= 0;
    },
    save: function() {
      var editor;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      if (!this.checkGrammar(editor)) {
        return;
      }
      return CoffeeCompileView.saveCompiled(editor);
    },
    display: function() {
      var activePane, editor, grammar, grammars, uri, _ref;
      editor = atom.workspace.getActiveEditor();
      activePane = atom.workspace.getActivePane();
      if (editor == null) {
        return;
      }
      if (!this.checkGrammar(editor)) {
        return console.warn("Cannot compile non-Coffeescript to Javascript");
      }
      grammars = atom.config.get('coffee-compile.grammars') || [];
      if (_ref = (grammar = editor.getGrammar().scopeName), __indexOf.call(grammars, _ref) < 0) {
        console.warn("Cannot compile non-Coffeescript to Javascript");
        return;
      }
      uri = "coffeecompile://editor/" + editor.id;
      return atom.workspace.open(uri, {
        searchAllPanes: true,
        split: "right"
      }).done(function(coffeeCompileView) {
        if (coffeeCompileView instanceof CoffeeCompileView) {
          coffeeCompileView.renderCompiled();
          if (atom.config.get('coffee-compile.compileOnSave') || atom.config.get('coffee-compile.compileOnSaveWithoutPreview')) {
            CoffeeCompileView.saveCompiled(editor);
          }
          if (atom.config.get('coffee-compile.focusEditorAfterCompile')) {
            return activePane.activate();
          }
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQWMsT0FBQSxDQUFRLEtBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUhwQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQVUsQ0FDUixlQURRLEVBRVIsa0JBRlEsRUFHUixZQUhRLEVBSVIseUJBSlEsQ0FBVjtBQUFBLE1BTUEseUJBQUEsRUFBMkIsSUFOM0I7QUFBQSxNQU9BLGFBQUEsRUFBZSxLQVBmO0FBQUEsTUFRQSwyQkFBQSxFQUE2QixLQVI3QjtBQUFBLE1BU0EsdUJBQUEsRUFBeUIsS0FUekI7S0FERjtBQUFBLElBWUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQix3QkFBM0IsRUFBcUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyRCxDQUFBLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRDQUFoQixDQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLFdBQTNCLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxJQUFELENBQUEsRUFBSDtVQUFB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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile.coffee