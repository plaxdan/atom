(function() {
  var child_process, jsx_bin_path;

  jsx_bin_path = "/node_modules/jsx/bin/jsx";

  child_process = require('child_process');

  module.exports = {
    activate: function(state) {
      return atom.workspaceView.command("jsx:run", (function(_this) {
        return function() {
          return _this.run();
        };
      })(this));
    },
    getExecPath: function() {
      return "ATOM_SHELL_INTERNAL_RUN_AS_NODE=1 '" + process.execPath + "'";
    },
    getNodePath: function() {
      return atom.config.get("language-jsx.nodepath");
    },
    run: function() {
      var command, editor, jsx_bin, lang_jsx_path, node_path, options, uri;
      editor = atom.workspace.getActiveEditor();
      lang_jsx_path = atom.packages.resolvePackagePath("language-jsx");
      jsx_bin = lang_jsx_path + jsx_bin_path;
      node_path = this.getNodePath() || this.getExecPath();
      uri = editor.getUri();
      command = "" + node_path + " " + jsx_bin + " --run " + uri;
      options = {
        "cwd": lang_jsx_path
      };
      child_process.exec(command, options, function(error, stdout, stderr) {
        if (error) {
          console.error(error);
        }
        if (stderr) {
          console.error(stderr);
        }
        if (stdout) {
          return console.log(stdout);
        }
      });
      return atom.openDevTools();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJCQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLDJCQUFmLENBQUE7O0FBQUEsRUFDQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxlQUFSLENBRGhCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLFNBQTNCLEVBQXNDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLEdBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEMsRUFEUTtJQUFBLENBQVY7QUFBQSxJQUdBLFdBQUEsRUFBYSxTQUFBLEdBQUE7YUFDVixxQ0FBQSxHQUFvQyxPQUFPLENBQUMsUUFBNUMsR0FBc0QsSUFENUM7SUFBQSxDQUhiO0FBQUEsSUFNQSxXQUFBLEVBQWEsU0FBQSxHQUFBO2FBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQURXO0lBQUEsQ0FOYjtBQUFBLElBU0EsR0FBQSxFQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsZ0VBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBZCxDQUFpQyxjQUFqQyxDQURoQixDQUFBO0FBQUEsTUFFQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixZQUYxQixDQUFBO0FBQUEsTUFHQSxTQUFBLEdBQVksSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLElBQWtCLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FIOUIsQ0FBQTtBQUFBLE1BS0EsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FMTixDQUFBO0FBQUEsTUFNQSxPQUFBLEdBQVUsRUFBQSxHQUFFLFNBQUYsR0FBYSxHQUFiLEdBQWUsT0FBZixHQUF3QixTQUF4QixHQUFnQyxHQU4xQyxDQUFBO0FBQUEsTUFPQSxPQUFBLEdBQVU7QUFBQSxRQUNSLEtBQUEsRUFBUSxhQURBO09BUFYsQ0FBQTtBQUFBLE1BVUEsYUFBYSxDQUFDLElBQWQsQ0FBbUIsT0FBbkIsRUFBNEIsT0FBNUIsRUFBcUMsU0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixNQUFoQixHQUFBO0FBQ2pDLFFBQUEsSUFBd0IsS0FBeEI7QUFBQSxVQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxDQUFBLENBQUE7U0FBQTtBQUNBLFFBQUEsSUFBeUIsTUFBekI7QUFBQSxVQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsTUFBZCxDQUFBLENBQUE7U0FEQTtBQUVBLFFBQUEsSUFBdUIsTUFBdkI7aUJBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBQUE7U0FIaUM7TUFBQSxDQUFyQyxDQVZBLENBQUE7YUFlQSxJQUFJLENBQUMsWUFBTCxDQUFBLEVBaEJHO0lBQUEsQ0FUTDtHQUxGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/language-jsx/lib/jsx.coffee