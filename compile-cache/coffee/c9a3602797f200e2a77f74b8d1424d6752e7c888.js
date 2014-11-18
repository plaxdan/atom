(function() {
  var CoffeeCompileView, querystring, url, util,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  url = require('url');

  querystring = require('querystring');

  CoffeeCompileView = require('./coffee-compile-view');

  util = require('./util');

  module.exports = {
    config: {
      grammars: {
        type: 'array',
        "default": ['source.coffee', 'source.litcoffee', 'text.plain', 'text.plain.null-grammar']
      },
      noTopLevelFunctionWrapper: {
        type: 'boolean',
        "default": true
      },
      compileOnSave: {
        type: 'boolean',
        "default": false
      },
      compileOnSaveWithoutPreview: {
        type: 'boolean',
        "default": false
      },
      focusEditorAfterCompile: {
        type: 'boolean',
        "default": false
      }
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
      return atom.workspace.addOpener(function(uriToOpen) {
        var pathname, protocol, _ref;
        _ref = url.parse(uriToOpen), protocol = _ref.protocol, pathname = _ref.pathname;
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
      return util.compileToFile(editor);
    },
    display: function() {
      var activePane, editor;
      editor = atom.workspace.getActiveEditor();
      activePane = atom.workspace.getActivePane();
      if (editor == null) {
        return;
      }
      if (!this.checkGrammar(editor)) {
        return console.warn("Cannot compile non-Coffeescript to Javascript");
      }
      return atom.workspace.open("coffeecompile://editor/" + editor.id, {
        searchAllPanes: true,
        split: "right"
      }).then(function(view) {
        var pathname, protocol, uriToOpen, _ref;
        uriToOpen = view.getUri();
        if (!uriToOpen) {
          return;
        }
        _ref = url.parse(uriToOpen), protocol = _ref.protocol, pathname = _ref.pathname;
        if (pathname) {
          pathname = querystring.unescape(pathname);
        }
        if (protocol !== 'coffeecompile:') {
          return;
        }
        if (atom.config.get('coffee-compile.focusEditorAfterCompile')) {
          return activePane.activate();
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQWMsT0FBQSxDQUFRLEtBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUhwQixDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFvQixPQUFBLENBQVEsUUFBUixDQUpwQixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FDUCxlQURPLEVBRVAsa0JBRk8sRUFHUCxZQUhPLEVBSVAseUJBSk8sQ0FEVDtPQURGO0FBQUEsTUFRQSx5QkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7T0FURjtBQUFBLE1BV0EsYUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FaRjtBQUFBLE1BY0EsMkJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BZkY7QUFBQSxNQWlCQSx1QkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FsQkY7S0FERjtBQUFBLElBc0JBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsd0JBQTNCLEVBQXFELENBQUEs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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile.coffee