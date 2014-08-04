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
        return new CoffeeCompileView({
          editorId: pathname.substr(1)
        });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQWMsT0FBQSxDQUFRLEtBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUhwQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQVUsQ0FDUixlQURRLEVBRVIsa0JBRlEsRUFHUixZQUhRLEVBSVIseUJBSlEsQ0FBVjtBQUFBLE1BTUEseUJBQUEsRUFBMkIsSUFOM0I7QUFBQSxNQU9BLGFBQUEsRUFBZSxLQVBmO0FBQUEsTUFRQSx1QkFBQSxFQUF5QixLQVJ6QjtLQURGO0FBQUEsSUFXQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHdCQUEzQixFQUFxRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJELENBQUEsQ0FBQTthQUVBLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QixTQUFDLFNBQUQsR0FBQTtBQUM1QixZQUFBLDhCQUFBO0FBQUEsUUFBQSxPQUE2QixHQUFHLENBQUMsS0FBSixDQUFVLFNBQVYsQ0FBN0IsRUFBQyxnQkFBQSxRQUFELEVBQVcsWUFBQSxJQUFYLEVBQWlCLGdCQUFBLFFBQWpCLENBQUE7QUFDQSxRQUFBLElBQTZDLFFBQTdDO0FBQUEsVUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVosQ0FBcUIsUUFBckIsQ0FBWCxDQUFBO1NBREE7QUFHQSxRQUFBLElBQWMsUUFBQSxLQUFZLGdCQUExQjtBQUFBLGdCQUFBLENBQUE7U0FIQTtlQUlJLElBQUEsaUJBQUEsQ0FBa0I7QUFBQSxVQUFBLFFBQUEsRUFBVSxRQUFRLENBQUMsTUFBVCxDQUFnQixDQUFoQixDQUFWO1NBQWxCLEVBTHdCO01BQUEsQ0FBOUIsRUFIUTtJQUFBLENBWFY7QUFBQSxJQXFCQSxPQUFBLEVBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxzREFBQTtBQUFBLE1BQUEsTUFBQSxHQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQWIsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxHQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBRGIsQ0FBQTtBQUdBLE1BQUEsSUFBYyxjQUFkO0FBQUEsY0FBQSxDQUFBO09BSEE7QUFBQSxNQUtBLFFBQUEsR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLENBQUEsSUFBOEMsRUFMekQsQ0FBQTtBQU1BLE1BQUEsV0FBTyxDQUFDLE9BQUEsR0FBVSxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBL0IsQ0FBQSxFQUFBLGVBQTZDLFFBQTdDLEVBQUEsSUFBQSxLQUFQO0FBQ0UsUUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLCtDQUFiLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGRjtPQU5BO0FBQUEsTUFVQSxHQUFBLEdBQU8seUJBQUEsR0FBd0IsTUFBTSxDQUFDLEVBVnRDLENBQUE7QUFBQSxNQWFBLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxVQUE3QixDQUF3QyxHQUF4QyxDQWJQLENBQUE7O1FBZUEsT0FBUSxVQUFVLENBQUMsVUFBWCxDQUFBO09BZlI7YUFpQkEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCLEdBQTdCLEVBQWtDLElBQWxDLEVBQXdDLEVBQXhDLENBQTJDLENBQUMsSUFBNUMsQ0FBaUQsU0FBQyxpQkFBRCxHQUFBO0FBQy9DLFFBQUEsSUFBRyxpQkFBQSxZQUE2QixpQkFBaEM7QUFDRSxVQUFBLGlCQUFpQixDQUFDLGNBQWxCLENBQUEsQ0FBQSxDQUFBO0FBRUEsVUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw4QkFBaEIsQ0FBSDtBQUNFLFlBQUEsaUJBQWlCLENBQUMsWUFBbEIsQ0FBQSxDQUFBLENBREY7V0FGQTtBQUlBLFVBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBQUg7bUJBQ0UsVUFBVSxDQUFDLFFBQVgsQ0FBQSxFQURGO1dBTEY7U0FEK0M7TUFBQSxDQUFqRCxFQWxCTztJQUFBLENBckJUO0dBTkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/coffee-compile.coffee