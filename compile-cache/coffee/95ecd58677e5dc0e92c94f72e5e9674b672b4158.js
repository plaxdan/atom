(function() {
  var CoffeeCompileView, WorkspaceView;

  CoffeeCompileView = require('../lib/coffee-compile-view');

  WorkspaceView = require('atom').WorkspaceView;

  describe("CoffeeCompile", function() {
    beforeEach(function() {
      jasmine.unspy(window, "setTimeout");
      atom.workspaceView = new WorkspaceView;
      atom.workspace = atom.workspaceView.model;
      spyOn(CoffeeCompileView.prototype, "renderCompiled");
      waitsForPromise("coffee-compile package to activate", function() {
        return atom.packages.activatePackage('coffee-compile');
      });
      waitsForPromise("language-coffee-script to activate", function() {
        return atom.packages.activatePackage('language-coffee-script');
      });
      atom.config.set('coffee-compile.grammars', ['source.coffee', 'source.litcoffee', 'text.plain', 'text.plain.null-grammar']);
      return atom.workspaceView.attachToDom();
    });
    describe("should open a new pane", function() {
      beforeEach(function() {
        atom.workspaceView.attachToDom();
        waitsForPromise("fixture file to open", function() {
          return atom.workspace.open("coffee-compile-fixtures.coffee");
        });
        runs(function() {
          return atom.workspaceView.getActiveView().trigger("coffee-compile:compile");
        });
        return waitsFor("renderCompiled to be called", function() {
          return CoffeeCompileView.prototype.renderCompiled.callCount > 0;
        });
      });
      it("should always split to the right", function() {
        return runs(function() {
          var compiled, compiledPane, editorPane, _ref;
          expect(atom.workspaceView.getPanes()).toHaveLength(2);
          _ref = atom.workspaceView.getPanes(), editorPane = _ref[0], compiledPane = _ref[1];
          expect(editorPane.items).toHaveLength(1);
          return compiled = compiledPane.getActiveItem();
        });
      });
      it("should have the same instance", function() {
        return runs(function() {
          var compiled, compiledPane, editorPane, _ref;
          _ref = atom.workspaceView.getPanes(), editorPane = _ref[0], compiledPane = _ref[1];
          compiled = compiledPane.getActiveItem();
          return expect(compiled).toBeInstanceOf(CoffeeCompileView);
        });
      });
      it("should have the same path as active pane", function() {
        return runs(function() {
          var compiled, compiledPane, editorPane, _ref;
          _ref = atom.workspaceView.getPanes(), editorPane = _ref[0], compiledPane = _ref[1];
          compiled = compiledPane.getActiveItem();
          return expect(compiled.getPath()).toBe(atom.workspaceView.getActivePaneItem().getPath());
        });
      });
      return it("should focus on compiled pane", function() {
        return runs(function() {
          var compiledPane, editorPane, _ref;
          _ref = atom.workspaceView.getPanes(), editorPane = _ref[0], compiledPane = _ref[1];
          return expect(compiledPane).toHaveFocus();
        });
      });
    });
    describe("focus editor after compile", function() {
      beforeEach(function() {
        atom.config.set("coffee-compile.focusEditorAfterCompile", true);
        atom.workspaceView.attachToDom();
        waitsForPromise(function() {
          return atom.workspace.open("test.coffee");
        });
        runs(function() {
          return atom.workspaceView.getActiveView().trigger("coffee-compile:compile");
        });
        return waitsFor(function() {
          return CoffeeCompileView.prototype.renderCompiled.callCount > 0;
        });
      });
      return it("should focus editor when option is set", function() {
        return runs(function() {
          var compiledPane, editorPane, _ref;
          _ref = atom.workspaceView.getPanes(), editorPane = _ref[0], compiledPane = _ref[1];
          return expect(editorPane).toHaveFocus();
        });
      });
    });
    return describe("when the editor's grammar is not coffeescript", function() {
      return it("should not preview compiled js", function() {
        atom.config.set("coffee-compile.grammars", []);
        atom.workspaceView.attachToDom();
        waitsForPromise(function() {
          return atom.workspace.open("coffee-compile-fixtures.coffee");
        });
        return runs(function() {
          spyOn(atom.workspace, "open").andCallThrough();
          atom.workspaceView.getActiveView().trigger('markdown-preview:show');
          return expect(atom.workspace.open).not.toHaveBeenCalled();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBOztBQUFBLEVBQUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLDRCQUFSLENBQXBCLENBQUE7O0FBQUEsRUFDQyxnQkFBaUIsT0FBQSxDQUFRLE1BQVIsRUFBakIsYUFERCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxNQUFkLEVBQXNCLFlBQXRCLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsR0FBQSxDQUFBLGFBRnJCLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxTQUFMLEdBQXFCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FIeEMsQ0FBQTtBQUFBLE1BSUEsS0FBQSxDQUFNLGlCQUFpQixDQUFDLFNBQXhCLEVBQW1DLGdCQUFuQyxDQUpBLENBQUE7QUFBQSxNQU1BLGVBQUEsQ0FBZ0Isb0NBQWhCLEVBQXNELFNBQUEsR0FBQTtlQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZ0JBQTlCLEVBRG9EO01BQUEsQ0FBdEQsQ0FOQSxDQUFBO0FBQUEsTUFTQSxlQUFBLENBQWdCLG9DQUFoQixFQUFzRCxTQUFBLEdBQUE7ZUFDcEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixFQURvRDtNQUFBLENBQXRELENBVEEsQ0FBQTtBQUFBLE1BWUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixFQUEyQyxDQUN6QyxlQUR5QyxFQUV6QyxrQkFGeUMsRUFHekMsWUFIeUMsRUFJekMseUJBSnlDLENBQTNDLENBWkEsQ0FBQTthQW1CQSxJQUFJLENBQUMs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
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/spec/coffee-compile-spec.coffee