(function() {
  var GoToDefinition, Omni, OmniSharpServer,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  OmniSharpServer = require('../../omni-sharp-server/omni-sharp-server');

  Omni = require('../../omni-sharp-server/omni');

  module.exports = GoToDefinition = (function() {
    function GoToDefinition() {
      this.activate = __bind(this.activate, this);
    }

    GoToDefinition.prototype.goToDefinition = function() {
      var _ref;
      if (OmniSharpServer.vm.isReady) {
        this.navigateToWord = (_ref = atom.workspace.getActiveEditor()) != null ? _ref.getWordUnderCursor() : void 0;
        return Omni.goToDefinition();
      }
    };

    GoToDefinition.prototype.activate = function() {
      var goToDef;
      goToDef = this.goToDefinition;
      atom.workspaceView.eachEditorView(function(editorView) {
        return editorView.on("symbols-view:go-to-declaration", function() {
          return goToDef();
        });
      });
      atom.workspaceView.command("omnisharp-atom:go-to-definition", function() {
        return goToDef();
      });
      return atom.on("omni:navigate-to", (function(_this) {
        return function(position) {
          if (position.FileName != null) {
            return atom.workspace.open(position.FileName).then(function(editor) {
              return editor.setCursorBufferPosition([position.Line && position.Line - 1, position.Column && position.Column - 1]);
            });
          } else {
            return atom.emit("omnisharp-atom:error", "Can't navigate to '" + _this.navigateToWord + "'");
          }
        };
      })(this));
    };

    return GoToDefinition;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSwyQ0FBUixDQUFsQixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSw4QkFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNROzs7S0FFSjs7QUFBQSw2QkFBQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBRyxlQUFlLENBQUMsRUFBRSxDQUFDLE9BQXRCO0FBQ0UsUUFBQSxJQUFDLENBQUEsY0FBRCwyREFBa0QsQ0FBRSxrQkFBbEMsQ0FBQSxVQUFsQixDQUFBO2VBQ0EsSUFBSSxDQUFDLGNBQUwsQ0FBQSxFQUZGO09BRGM7SUFBQSxDQUFoQixDQUFBOztBQUFBLDZCQUtBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsY0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQW5CLENBQWtDLFNBQUMsVUFBRCxHQUFBO2VBQ2hDLFVBQVUsQ0FBQyxFQUFYLENBQWMsZ0NBQWQsRUFBZ0QsU0FBQSxHQUFBO2lCQUM5QyxPQUFBLENBQUEsRUFEOEM7UUFBQSxDQUFoRCxFQURnQztNQUFBLENBQWxDLENBREEsQ0FBQTtBQUFBLE1BS0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixpQ0FBM0IsRUFBOEQsU0FBQSxHQUFBO2VBQzVELE9BQUEsQ0FBQSxFQUQ0RDtNQUFBLENBQTlELENBTEEsQ0FBQTthQVFBLElBQUksQ0FBQyxFQUFMLENBQVEsa0JBQVIsRUFBNEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsUUFBRCxHQUFBO0FBQzFCLFVBQUEsSUFBRyx5QkFBSDttQkFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBUSxDQUFDLFFBQTdCLENBQXNDLENBQUMsSUFBdkMsQ0FBNEMsU0FBQyxNQUFELEdBQUE7cUJBQzFDLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUM3QixRQUFRLENBQUMsSUFBVCxJQUFpQixRQUFRLENBQUMsSUFBVCxHQUFnQixDQURKLEVBRTdCLFFBQVEsQ0FBQyxNQUFULElBQW1CLFFBQVEsQ0FBQyxNQUFULEdBQWtCLENBRlIsQ0FBL0IsRUFEMEM7WUFBQSxDQUE1QyxFQURGO1dBQUEsTUFBQTttQkFPRSxJQUFJLENBQUMsSUFBTCxDQUFVLHNCQUFWLEVBQW1DLHFCQUFBLEdBQTVDLEtBQUMsQ0FBQSxjQUEyQyxHQUF1QyxHQUExRSxFQVBGO1dBRDBCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUIsRUFUUTtJQUFBLENBTFYsQ0FBQTs7MEJBQUE7O01BTkosQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/features/go-to-definition.coffee