(function() {
  var $$, SelectListView, TaskListView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), SelectListView = _ref.SelectListView, $$ = _ref.$$;

  module.exports = TaskListView = (function(_super) {
    __extends(TaskListView, _super);

    function TaskListView() {
      return TaskListView.__super__.constructor.apply(this, arguments);
    }

    TaskListView.prototype.initialize = function() {
      TaskListView.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top task-list');
      return atom.workspaceView.command('task-list:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    };

    TaskListView.prototype.attach = function() {
      var ebuffer, editor, fixmeFinder, match, matcher, todoFinder, todos, _i, _len, _ref1;
      editor = atom.workspaceView.getActivePaneItem();
      if (editor) {
        ebuffer = editor.buffer;
        if (ebuffer) {
          matcher = /TODO: (.*)|FIXME: (.*)/g;
          todoFinder = /TODO: (.*)/;
          fixmeFinder = /FIXME: (.*)/;
          todos = [];
          if (ebuffer.cachedText) {
            if (ebuffer.cachedText.match(matcher)) {
              _ref1 = ebuffer.cachedText.match(matcher);
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                match = _ref1[_i];
                if (todoFinder.exec(match)) {
                  todos.push({
                    message: todoFinder.exec(match)[1],
                    type: 'TODO'
                  });
                } else {
                  todos.push({
                    message: fixmeFinder.exec(match)[1],
                    type: 'FIXME'
                  });
                }
              }
              this.setItems(todos);
            } else {
              this.setItems([
                {
                  message: 'No Tasks Found',
                  type: ''
                }
              ]);
            }
          } else {
            this.setItems([
              {
                message: 'No Tasks Found',
                type: ''
              }
            ]);
          }
          atom.workspaceView.append(this);
          return this.focusFilterEditor();
        }
      }
    };

    TaskListView.prototype.viewForItem = function(item) {
      var markerClass;
      if (item.type === 'TODO') {
        markerClass = 'task-status status text-success';
      } else if (item.type === 'FIXME') {
        markerClass = 'task-status status text-error';
      } else {
        markerClass = 'task-status status text-error';
      }
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'pull-right'
            }, function() {
              return _this.div({
                "class": markerClass
              }, item.type);
            });
            return _this.div({
              "class": 'task-item'
            }, item.message);
          };
        })(this));
      });
    };

    TaskListView.prototype.confirmed = function(item) {
      var bufferP, ebuffer, editor, itemIndex;
      editor = atom.workspaceView.getActivePaneItem();
      ebuffer = editor.buffer;
      if (item !== "No Tasks Found") {
        itemIndex = ebuffer.cachedText.indexOf(item.message);
        bufferP = ebuffer.positionForCharacterIndex(itemIndex);
        editor.setCursorBufferPosition(bufferP);
      }
      return this.cancel();
    };

    TaskListView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.cancel();
      } else {
        return this.attach();
      }
    };

    return TaskListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFzQixPQUFBLENBQVEsTUFBUixDQUF0QixFQUFDLHNCQUFBLGNBQUQsRUFBZ0IsVUFBQSxFQUFoQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwyQkFBQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSw4Q0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSw0QkFBVixDQURBLENBQUE7QUFFQSxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsa0JBQTNCLEVBQStDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEQsaUJBQU8sS0FBQyxDQUFDLE1BQUYsQ0FBQSxDQUFQLENBRG9EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0MsQ0FBUCxDQUhVO0lBQUEsQ0FBWixDQUFBOztBQUFBLDJCQU1BLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLGdGQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBbkIsQ0FBQSxDQUFULENBQUE7QUFDQSxNQUFBLElBQUcsTUFBSDtBQUNFLFFBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxNQUFqQixDQUFBO0FBQ0EsUUFBQSxJQUFHLE9BQUg7QUFDRSxVQUFBLE9BQUEsR0FBVSx5QkFBVixDQUFBO0FBQUEsVUFDQSxVQUFBLEdBQWEsWUFEYixDQUFBO0FBQUEsVUFFQSxXQUFBLEdBQWMsYUFGZCxDQUFBO0FBQUEsVUFHQSxLQUFBLEdBQVEsRUFIUixDQUFBO0FBSUEsVUFBQSxJQUFHLE9BQU8sQ0FBQyxVQUFYO0FBQ0UsWUFBQSxJQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBbkIsQ0FBeUIsT0FBekIsQ0FBSDtBQUNFO0FBQUEsbUJBQUEsNENBQUE7a0NBQUE7QUFDRSxnQkFBQSxJQUFHLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEtBQWhCLENBQUg7QUFDRSxrQkFBQSxLQUFLLENBQUMsSUFBTixDQUFXO0FBQUEsb0JBQUMsT0FBQSxFQUFTLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEtBQWhCLENBQXVCLENBQUEsQ0FBQSxDQUFqQztBQUFBLG9CQUFxQyxJQUFBLEVBQU0sTUFBM0M7bUJBQVgsQ0FBQSxDQURGO2lCQUFBLE1BQUE7QUFHRSxrQkFBQSxLQUFLLENBQUMsSUFBTixDQUFXO0FBQUEsb0JBQUMsT0FBQSxFQUFTLFdBQVcsQ0FBQyxJQUFaLENBQWlCLEtBQWpCLENBQXdCLENBQUEsQ0FBQSxDQUFsQztBQUFBLG9CQUFzQyxJQUFBLEVBQU0sT0FBNUM7bUJBQVgsQ0FBQSxDQUhGO2lCQURGO0FBQUEsZUFBQTtBQUFBLGNBS0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxLQUFWLENBTEEsQ0FERjthQUFBLE1BQUE7QUFRRSxjQUFBLElBQUMsQ0FBQSxRQUFELENBQVU7Z0JBQUM7QUFBQSxrQkFBQyxPQUFBLEVBQVMsZ0JBQVY7QUFBQSxrQkFBNkIsSUFBQSxFQUFNLEVBQW5DO2lCQUFEO2VBQVYsQ0FBQSxDQVJGO2FBREY7V0FBQSxNQUFBO0FBV0UsWUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVO2NBQUM7QUFBQSxnQkFBQyxPQUFBLEVBQVMsZ0JBQVY7QUFBQSxnQkFBNkIsSUFBQSxFQUFNLEVBQW5DO2VBQUQ7YUFBVixDQUFBLENBWEY7V0FKQTtBQUFBLFVBZ0JBLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBbkIsQ0FBMEIsSUFBMUIsQ0FoQkEsQ0FBQTtpQkFpQkEsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFsQkY7U0FGRjtPQUZNO0lBQUEsQ0FOUixDQUFBOztBQUFBLDJCQTZCQSxXQUFBLEdBQWEsU0FBQyxJQUFELEdBQUE7QUFDWCxVQUFBLFdBQUE7QUFBQSxNQUFBLElBQUcsSUFBSSxDQUFDLElBQUwsS0FBYSxNQUFoQjtBQUNFLFFBQUEsV0FBQSxHQUFjLGlDQUFkLENBREY7T0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLElBQUwsS0FBYSxPQUFoQjtBQUNILFFBQUEsV0FBQSxHQUFjLCtCQUFkLENBREc7T0FBQSxNQUFBO0FBR0gsUUFBQSxXQUFBLEdBQWMsK0JBQWQsQ0FIRztPQUZMO2FBTUEsRUFBQSxDQUFHLFNBQUEsR0FBQTtlQUNELElBQUMsQ0FBQSxFQUFELENBQUksQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDRixZQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxZQUFQO2FBQUwsRUFBMEIsU0FBQSxHQUFBO3FCQUN4QixLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLFdBQVA7ZUFBTCxFQUEwQixJQUFJLENBQUMsSUFBL0IsRUFEd0I7WUFBQSxDQUExQixDQUFBLENBQUE7bUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLFdBQVA7YUFBTCxFQUF5QixJQUFJLENBQUMsT0FBOUIsRUFIRTtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUosRUFEQztNQUFBLENBQUgsRUFQVztJQUFBLENBN0JiLENBQUE7O0FBQUEsMkJBeUNBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUNULFVBQUEsbUNBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFuQixDQUFBLENBQVQsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFVLE1BQU0sQ0FBQyxNQURqQixDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUEsS0FBUSxnQkFBWDtBQUNFLFFBQUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBbkIsQ0FBMkIsSUFBSSxDQUFDLE9BQWhDLENBQVosQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLE9BQU8sQ0FBQyx5QkFBUixDQUFrQyxTQUFsQyxDQURWLENBQUE7QUFBQSxRQUVBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixPQUEvQixDQUZBLENBREY7T0FGQTthQU1BLElBQUksQ0FBQyxNQUFMLENBQUEsRUFQUztJQUFBLENBekNYLENBQUE7O0FBQUEsMkJBa0RBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLElBQUcsSUFBQyxDQUFDLFNBQUYsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFDLE1BQUYsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQyxNQUFGLENBQUEsRUFIRjtPQURNO0lBQUEsQ0FsRFIsQ0FBQTs7d0JBQUE7O0tBRHlCLGVBSjNCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/task-list/lib/task-list-view.coffee