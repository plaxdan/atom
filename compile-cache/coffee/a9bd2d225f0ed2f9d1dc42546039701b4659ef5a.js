(function() {
  var EditorView, compile, ids;

  EditorView = require('atom').EditorView;

  compile = require('coffee-script').compile;

  ids = {};

  module.exports = {
    activate: function(state) {
      return atom.workspaceView.command("coffee-compiler:compile", (function(_this) {
        return function() {
          return _this.compile();
        };
      })(this));
    },
    compile: function() {
      var coffee, e, output, selection;
      this.coffeeEditor = atom.workspace.getActiveEditor();
      selection = this.coffeeEditor.getSelection();
      coffee = selection.getText() || this.coffeeEditor.getText();
      this.view = this.getView();
      this.editor = this.view.getEditor();
      try {
        output = compile(coffee, {
          bare: true
        });
        return this.editor.setGrammar(atom.syntax.grammarForScopeName('source.js'));
      } catch (_error) {
        e = _error;
        output = e.toString();
        return this.editor.setGrammar(atom.syntax.grammarForScopeName('text.plain'));
      } finally {
        this.editor.setText(output);
        this.pane = atom.workspaceView.getActivePane();
        this.pane.addItem(this.editor);
        this.pane.activateNextItem();
      }
    },
    getView: function() {
      var editor, view;
      return ids[this.coffeeEditor.id] = (view = ids[this.coffeeEditor.id], view ? (editor = view.getEditor(), !editor.isAlive() ? view = new EditorView({
        mini: true
      }) : void 0, view) : new EditorView({
        mini: true
      }));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUUsYUFBZSxPQUFBLENBQVEsTUFBUixFQUFmLFVBQUYsQ0FBQTs7QUFBQSxFQUNFLFVBQVksT0FBQSxDQUFRLGVBQVIsRUFBWixPQURGLENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sRUFGTixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ04sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQix5QkFBM0IsRUFBc0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RCxFQURNO0lBQUEsQ0FBVjtBQUFBLElBR0EsT0FBQSxFQUFTLFNBQUEsR0FBQTtBQUNMLFVBQUEsNEJBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQWhCLENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBWSxJQUFDLENBQUEsWUFBWSxDQUFDLFlBQWQsQ0FBQSxDQURaLENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxTQUFTLENBQUMsT0FBVixDQUFBLENBQUEsSUFBdUIsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQUEsQ0FGaEMsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsT0FBRCxDQUFBLENBSlIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sQ0FBQSxDQUxWLENBQUE7QUFPQTtBQUNJLFFBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQWdCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUFoQixDQUFULENBQUE7ZUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBWixDQUFnQyxXQUFoQyxDQUFuQixFQUZKO09BQUEsY0FBQTtBQUlJLFFBREUsVUFDRixDQUFBO0FBQUEsUUFBQSxNQUFBLEdBQVMsQ0FBQyxDQUFDLFFBQUYsQ0FBQSxDQUFULENBQUE7ZUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBWixDQUFnQyxZQUFoQyxDQUFuQixFQUxKO09BQUE7QUFPSSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixNQUFoQixDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFuQixDQUFBLENBRFIsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE1BQWYsQ0FGQSxDQUFBO0FBQUEsUUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQUEsQ0FIQSxDQVBKO09BUks7SUFBQSxDQUhUO0FBQUEsSUF1QkEsT0FBQSxFQUFTLFNBQUEsR0FBQTtBQUNMLFVBQUEsWUFBQTthQUFBLEdBQUksQ0FBQSxJQUFDLENBQUEsWUFBWSxDQUFDLEVBQWQsQ0FBSixHQUF3QixDQUNwQixJQUFBLEdBQU8sR0FBSSxDQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsRUFBZCxDQUFYLEVBQ0csSUFBSCxHQUNJLENBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBVCxFQUNHLENBQUEsTUFBVSxDQUFDLE9BQVAsQ0FBQSxDQUFQLEdBQTZCLElBQUEsR0FBVyxJQUFBLFVBQUEsQ0FBVztBQUFBLFFBQUEsSUFBQSxFQUFNLElBQU47T0FBWCxDQUF4QyxHQUFBLE1BREEsRUFFQSxJQUZBLENBREosR0FJUyxJQUFBLFVBQUEsQ0FBVztBQUFBLFFBQUEsSUFBQSxFQUFNLElBQU47T0FBWCxDQU5XLEVBRG5CO0lBQUEsQ0F2QlQ7R0FMSixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/coffee-compiler/lib/coffee-compiler.coffee