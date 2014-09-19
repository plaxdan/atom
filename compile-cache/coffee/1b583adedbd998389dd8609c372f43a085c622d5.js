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
    save: function() {
      var editor;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
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
          if (atom.config.get('coffee-compile.compileOnSave')) {
            coffeeCompileView.saveCompiled();
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