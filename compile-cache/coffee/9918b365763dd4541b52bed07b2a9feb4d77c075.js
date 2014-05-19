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
      focusEditorAfterCompile: false
    },
    activate: function() {
      atom.workspaceView.command('coffee-compile:compile', (function(_this) {
        return function() {
          return _this.display();
        };
      })(this));
      return atom.workspace.registerOpener(function(uriToOpen) {
        var host, pathname, protocol, _ref;
        _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
        if (pathname) {
          pathname = querystring.unescape(pathname);
        }
        if (protocol !== 'coffeecompile:') {
          return;
        }
        return new CoffeeCompileView(pathname.substr(1));
      });
    },
    display: function() {
      var activePane, editor, grammar, grammars, pane, uri, _ref;
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
      pane = atom.workspace.paneContainer.paneForUri(uri);
      if (pane == null) {
        pane = activePane.splitRight();
      }
      return atom.workspace.openUriInPane(uri, pane, {}).done(function(coffeeCompileView) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQWMsT0FBQSxDQUFRLEtBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUhwQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQVUsQ0FDUixlQURRLEVBRVIsa0JBRlEsRUFHUixZQUhRLEVBSVIseUJBSlEsQ0FBVjtBQUFBLE1BTUEseUJBQUEsRUFBMkIsSUFOM0I7QUFBQSxNQU9BLGFBQUEsRUFBZSxLQVBmO0FBQUEsTUFRQSx1QkFBQSxFQUF5QixLQVJ6QjtLQURGO0FBQUEsSUFXQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHdCQUEzQixFQUFxRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJELENBQUEsQ0FBQTthQUVBLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QixTQUFDLFNBQUQsR0FBQTtBQUM1QixZQUFBLDhCQUFBO0FBQUEsUUFBQSxPQUE2QixHQUFHLENBQUMsS0FBSixDQUFVLFNBQVYsQ0FBN0IsRUFBQyxnQkFBQSxRQUFELEVBQVcsWUFBQSxJQUFYLEVBQWlCLGdCQUFBLFFBQWpCLENBQUE7QUFDQSxRQUFBLElBQTZDLFFBQTdDO0FBQUEsVUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVosQ0FBcUIsUUFBckIsQ0FBWCxDQUFBO1NBREE7QUFHQSxRQUFBLElBQWMsUUFBQSxLQUFZLGdCQUExQjtBQUFBLGdCQUFBLENBQUE7U0FIQTtlQUlJLElBQUEsaUJBQUEsQ0FBa0IsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsQ0FBaEIsQ0FBbEIsRUFMd0I7TUFBQSxDQUE5QixFQUhRO0lBQUEsQ0FYVjtBQUFBLElBcUJBLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHNEQUFBO0FBQUEsTUFBQSxNQUFBLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQUEsQ0FBYixDQUFBO0FBQUEsTUFDQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FEYixDQUFBO0FBR0EsTUFBQSxJQUFjLGNBQWQ7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUFBLE1BS0EsUUFBQSxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBQSxJQUE4QyxFQUx6RCxDQUFBO0FBTUEsTUFBQSxXQUFPLENBQUMsT0FBQSxHQUFVLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUEvQixDQUFBLEVBQUEsZUFBNkMsUUFBN0MsRUFBQSxJQUFBLEtBQVA7QUFDRSxRQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsK0NBQWIsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUZGO09BTkE7QUFBQSxNQVVBLEdBQUEsR0FBTyx5QkFBQSxHQUF3QixNQUFNLENBQUMsRUFWdEMsQ0FBQTtBQUFBLE1BYUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFVBQTdCLENBQXdDLEdBQXhDLENBYlAsQ0FBQTs7UUFlQSxPQUFRLFVBQVUsQ0FBQyxVQUFYLENBQUE7T0FmUjthQWlCQSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkIsR0FBN0IsRUFBa0MsSUFBbEMsRUFBd0MsRUFBeEMsQ0FBMkMsQ0FBQyxJQUE1QyxDQUFpRCxTQUFDLGlCQUFELEdBQUE7QUFDL0MsUUFBQSxJQUFHLGlCQUFBLFlBQTZCLGlCQUFoQztBQUNFLFVBQUEsaUJBQWlCLENBQUMsY0FBbEIsQ0FBQSxDQUFBLENBQUE7QUFFQSxVQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFIO0FBQ0UsWUFBQSxpQkFBaUIsQ0FBQyxZQUFsQixDQUFBLENBQUEsQ0FERjtXQUZBO0FBSUEsVUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsQ0FBSDttQkFDRSxVQUFVLENBQUMsUUFBWCxDQUFBLEVBREY7V0FMRjtTQUQrQztNQUFBLENBQWpELEVBbEJPO0lBQUEsQ0FyQlQ7R0FORixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile.coffee