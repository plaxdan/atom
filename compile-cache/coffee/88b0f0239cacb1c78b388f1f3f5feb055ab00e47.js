(function() {
  var Main, ModuleManager, Watcher, packageManager,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Watcher = require('./Watcher');

  ModuleManager = require('./ModuleManager');

  packageManager = atom.packages;

  module.exports = new (Main = (function() {
    function Main() {
      this.onDone = __bind(this.onDone, this);
      this.onRename = __bind(this.onRename, this);
      this.onDestroyed = __bind(this.onDestroyed, this);
      this.onCreated = __bind(this.onCreated, this);
    }

    Main.prototype.renameCommand = 'refactor:rename';

    Main.prototype.doneCommand = 'refactor:done';

    Main.prototype.configDefaults = {
      highlightError: true,
      highlightReference: true
    };


    /*
    Life cycle
     */

    Main.prototype.activate = function(state) {
      this.moduleManager = new ModuleManager;
      this.watchers = [];
      atom.workspaceView.eachEditorView(this.onCreated);
      atom.workspaceView.command(this.renameCommand, this.onRename);
      return atom.workspaceView.command(this.doneCommand, this.onDone);
    };

    Main.prototype.deactivate = function() {
      var watcher, _i, _len, _ref;
      this.moduleManager.destruct();
      delete this.moduleManager;
      _ref = this.watchers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        watcher = _ref[_i];
        watcher.destruct();
      }
      delete this.watchers;
      atom.workspaceView.off(this.renameCommand, this.onRename);
      return atom.workspaceView.off(this.doneCommand, this.onDone);
    };

    Main.prototype.serialize = function() {};


    /*
    Events
     */

    Main.prototype.onCreated = function(editorView) {
      var watcher;
      watcher = new Watcher(this.moduleManager, editorView);
      watcher.on('destroyed', this.onDestroyed);
      return this.watchers.push(watcher);
    };

    Main.prototype.onDestroyed = function(watcher) {
      watcher.destruct();
      return this.watchers.splice(this.watchers.indexOf(watcher), 1);
    };

    Main.prototype.onRename = function(e) {
      var isExecuted, watcher, _i, _len, _ref;
      isExecuted = false;
      _ref = this.watchers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        watcher = _ref[_i];
        isExecuted || (isExecuted = watcher.rename());
      }
      if (isExecuted) {
        return;
      }
      return e.abortKeyBinding();
    };

    Main.prototype.onDone = function(e) {
      var isExecuted, watcher, _i, _len, _ref;
      isExecuted = false;
      _ref = this.watchers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        watcher = _ref[_i];
        isExecuted || (isExecuted = watcher.done());
      }
      if (isExecuted) {
        return;
      }
      return e.abortKeyBinding();
    };

    return Main;

  })());

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FBVixDQUFBOztBQUFBLEVBQ0EsYUFBQSxHQUFnQixPQUFBLENBQVEsaUJBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxFQUVZLGlCQUFtQixLQUE3QixRQUZGLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNBLEdBQUEsQ0FBQSxDQUFVOzs7Ozs7S0FFUjs7QUFBQSxtQkFBQSxhQUFBLEdBQWUsaUJBQWYsQ0FBQTs7QUFBQSxtQkFDQSxXQUFBLEdBQWEsZUFEYixDQUFBOztBQUFBLG1CQUdBLGNBQUEsR0FDRTtBQUFBLE1BQUEsY0FBQSxFQUFvQixJQUFwQjtBQUFBLE1BQ0Esa0JBQUEsRUFBb0IsSUFEcEI7S0FKRixDQUFBOztBQVFBO0FBQUE7O09BUkE7O0FBQUEsbUJBWUEsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsYUFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxFQURaLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsSUFBQyxDQUFBLFNBQW5DLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixJQUFDLENBQUEsYUFBNUIsRUFBMkMsSUFBQyxDQUFBLFFBQTVDLENBSkEsQ0FBQTthQUtBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsSUFBQyxDQUFBLFdBQTVCLEVBQXlDLElBQUMsQ0FBQSxNQUExQyxFQU5RO0lBQUEsQ0FaVixDQUFBOztBQUFBLG1CQW9CQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSx1QkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQUEsSUFBUSxDQUFBLGFBRFIsQ0FBQTtBQUVBO0FBQUEsV0FBQSwyQ0FBQTsyQkFBQTtBQUNFLFFBQUEsT0FBTyxDQUFDLFFBQVIsQ0FBQSxDQUFBLENBREY7QUFBQSxPQUZBO0FBQUEsTUFJQSxNQUFBLENBQUEsSUFBUSxDQUFBLFFBSlIsQ0FBQTtBQUFBLE1BTUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QixJQUFDLENBQUEsYUFBeEIsRUFBdUMsSUFBQyxDQUFBLFFBQXhDLENBTkEsQ0FBQTthQU9BLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUIsSUFBQyxDQUFBLFdBQXhCLEVBQXFDLElBQUMsQ0FBQSxNQUF0QyxFQVJVO0lBQUEsQ0FwQlosQ0FBQTs7QUFBQSxtQkE4QkEsU0FBQSxHQUFXLFNBQUEsR0FBQSxDQTlCWCxDQUFBOztBQWlDQTtBQUFBOztPQWpDQTs7QUFBQSxtQkFxQ0EsU0FBQSxHQUFXLFNBQUMsVUFBRCxHQUFBO0FBQ1QsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQVEsSUFBQyxDQUFBLGFBQVQsRUFBd0IsVUFBeEIsQ0FBZCxDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsRUFBUixDQUFXLFdBQVgsRUFBd0IsSUFBQyxDQUFBLFdBQXpCLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLE9BQWYsRUFIUztJQUFBLENBckNYLENBQUE7O0FBQUEsbUJBMENBLFdBQUEsR0FBYSxTQUFDLE9BQUQsR0FBQTtBQUNYLE1BQUEsT0FBTyxDQUFDLFFBQVIsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLE9BQWxCLENBQWpCLEVBQTZDLENBQTdDLEVBRlc7SUFBQSxDQTFDYixDQUFBOztBQUFBLG1CQThDQSxRQUFBLEdBQVUsU0FBQyxDQUFELEdBQUE7QUFDUixVQUFBLG1DQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsS0FBYixDQUFBO0FBQ0E7QUFBQSxXQUFBLDJDQUFBOzJCQUFBO0FBQ0UsUUFBQSxlQUFBLGFBQWUsT0FBTyxDQUFDLE1BQVIsQ0FBQSxFQUFmLENBREY7QUFBQSxPQURBO0FBR0EsTUFBQSxJQUFVLFVBQVY7QUFBQSxjQUFBLENBQUE7T0FIQTthQUlBLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFMUTtJQUFBLENBOUNWLENBQUE7O0FBQUEsbUJBcURBLE1BQUEsR0FBUSxTQUFDLENBQUQsR0FBQTtBQUNOLFVBQUEsbUNBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxLQUFiLENBQUE7QUFDQTtBQUFBLFdBQUEsMkNBQUE7MkJBQUE7QUFDRSxRQUFBLGVBQUEsYUFBZSxPQUFPLENBQUMsSUFBUixDQUFBLEVBQWYsQ0FERjtBQUFBLE9BREE7QUFHQSxNQUFBLElBQVUsVUFBVjtBQUFBLGNBQUEsQ0FBQTtPQUhBO2FBSUEsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxFQUxNO0lBQUEsQ0FyRFIsQ0FBQTs7Z0JBQUE7O09BUEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/refactor.coffee