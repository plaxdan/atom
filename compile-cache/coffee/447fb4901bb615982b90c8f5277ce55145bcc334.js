(function() {
  var CoffeeCompileView, WorkspaceView, fs;

  CoffeeCompileView = require('../lib/coffee-compile-view');

  WorkspaceView = require('atom').WorkspaceView;

  fs = require('fs');

  describe("CoffeeCompileView", function() {
    var compiled, editor;
    compiled = null;
    editor = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      atom.workspace = atom.workspaceView.model;
      editor = atom.project.openSync('test.coffee');
      compiled = new CoffeeCompileView({
        editor: editor
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-coffee-script');
      });
    });
    afterEach(function() {
      return compiled.destroy();
    });
    describe("renderCompiled", function() {
      return it("should compile the whole file and display compiled js", function() {
        waitsFor(function() {
          var done;
          done = false;
          compiled.renderCompiled(function() {
            return done = true;
          });
          return done;
        }, "Coffeescript should be compiled", 750);
        return runs(function() {
          return expect(compiled.find('.line')).toExist();
        });
      });
    });
    return describe("saveCompiled", function() {
      var filePath;
      filePath = null;
      beforeEach(function() {
        filePath = editor.getPath();
        return filePath = filePath.replace(".coffee", ".js");
      });
      afterEach(function() {
        if (fs.existsSync(filePath)) {
          return fs.unlink(filePath);
        }
      });
      return it("should compile and create a js file", function() {
        waitsFor(function() {
          var done;
          done = false;
          compiled.saveCompiled(function() {
            return done = true;
          });
          return done;
        }, "Compile on save", 750);
        return runs(function() {
          return expect(fs.existsSync(filePath)).toBeTruthy();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBOztBQUFBLEVBQUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLDRCQUFSLENBQXBCLENBQUE7O0FBQUEsRUFDQyxnQkFBaUIsT0FBQSxDQUFRLE1BQVIsRUFBakIsYUFERCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSxnQkFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLElBQVgsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFXLElBRFgsQ0FBQTtBQUFBLElBR0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsR0FBQSxDQUFBLGFBQXJCLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FEcEMsQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixhQUF0QixDQUhYLENBQUE7QUFBQSxNQUlBLFFBQUEsR0FBZSxJQUFBLGlCQUFBLENBQWtCO0FBQUEsUUFBQyxRQUFBLE1BQUQ7T0FBbEIsQ0FKZixDQUFBO2FBTUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCLEVBRGM7TUFBQSxDQUFoQixFQVBTO0lBQUEsQ0FBWCxDQUhBLENBQUE7QUFBQSxJQWFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsT0FBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBYkEsQ0FBQTtBQUFBLElBZ0JBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7YUFDekIsRUFBQSxDQUFHLHVEQUFILEVBQTRELFNBQUEsR0FBQTtBQUMxRCxRQUFBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7QUFDUCxjQUFBLElBQUE7QUFBQSxVQUFBLElBQUEsR0FBTyxLQUFQLENBQUE7QUFBQSxVQUNBLFFBQVEsQ0FBQyxjQUFULENBQXdCLFNBQUEsR0FBQTttQkFBRyxJQUFBLEdBQU8sS0FBVjtVQUFBLENBQXhCLENBREEsQ0FBQTtBQUVBLGlCQUFPLElBQVAsQ0FITztRQUFBLENBQVQsRUFJRSxpQ0FKRixFQUlxQyxHQUpyQyxDQUFBLENBQUE7ZUFNQSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILE1BQUEsQ0FBTyxRQUFRLENBQUMsSUFBVCxDQUFjLE9BQWQsQ0FBUCxDQUE4QixDQUFDLE9BQS9CLENBQUEsRUFERztRQUFBLENBQUwsRUFQMEQ7TUFBQSxDQUE1RCxFQUR5QjtJQUFBLENBQTNCLENBaEJBLENBQUE7V0EyQkEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLFVBQUEsUUFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLElBQVgsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBWCxDQUFBO2VBQ0EsUUFBQSxHQUFXLFFBQVEsQ0FBQyxPQUFULENBQWlCLFNBQWpCLEVBQTRCLEtBQTVCLEVBRkY7TUFBQSxDQUFYLENBREEsQ0FBQTtBQUFBLE1BS0EsU0FBQSxDQUFVLFNBQUEsR0FBQTtBQUNSLFFBQUEsSUFBdUIsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLENBQXZCO2lCQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsUUFBVixFQUFBO1NBRFE7TUFBQSxDQUFWLENBTEEsQ0FBQTthQVFBLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsUUFBQSxRQUFBLENBQVMsU0FBQSxHQUFBO0FBQ1AsY0FBQSxJQUFBO0FBQUEsVUFBQSxJQUFBLEdBQU8sS0FBUCxDQUFBO0FBQUEsVUFDQSxRQUFRLENBQUMsWUFBVCxDQUFzQixTQUFBLEdBQUE7bUJBQUcsSUFBQSxHQUFPLEtBQVY7VUFBQSxDQUF0QixDQURBLENBQUE7QUFFQSxpQkFBTyxJQUFQLENBSE87UUFBQSxDQUFULEVBSUUsaUJBSkYsRUFJcUIsR0FKckIsQ0FBQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtpQkFDSCxNQUFBLENBQU8sRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLENBQVAsQ0FBK0IsQ0FBQyxVQUFoQyxDQUFBLEVBREc7UUFBQSxDQUFMLEVBUHdDO01BQUEsQ0FBMUMsRUFUdUI7SUFBQSxDQUF6QixFQTVCNEI7RUFBQSxDQUE5QixDQUpBLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/spec/coffee-compile-view-spec.coffee