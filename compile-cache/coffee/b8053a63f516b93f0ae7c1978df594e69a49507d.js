(function() {
  var js2coffee;

  js2coffee = require("js2coffee");

  module.exports = {
    js2coffeeView: null,
    activate: function(state) {
      return atom.workspaceView.command("js2coffee:convert", (function(_this) {
        return function() {
          return _this.convert();
        };
      })(this));
    },
    convert: function() {
      var e, editor;
      editor = atom.workspace.activePaneItem;
      try {
        return editor.setText(js2coffee.build(editor.getText()));
      } catch (_error) {
        e = _error;
        return console.error("It looks like this may not be valid JavaScript.");
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFNBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLFdBQVIsQ0FBWixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsYUFBQSxFQUFlLElBQWY7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsbUJBQTNCLEVBQWdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEQsRUFEUTtJQUFBLENBRlY7QUFBQSxJQUtBLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLFNBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQXhCLENBQUE7QUFDQTtlQUNFLE1BQU0sQ0FBQyxPQUFQLENBQWUsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFoQixDQUFmLEVBREY7T0FBQSxjQUFBO0FBR0UsUUFESSxVQUNKLENBQUE7ZUFBQSxPQUFPLENBQUMsS0FBUixDQUFjLGlEQUFkLEVBSEY7T0FGTztJQUFBLENBTFQ7R0FIRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atom-js2coffee/lib/js2coffee.coffee