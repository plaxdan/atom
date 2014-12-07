(function() {
  var TaskListView;

  TaskListView = require('./task-list-view');

  module.exports = {
    taskListView: null,
    activate: function(state) {
      return new TaskListView();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFlBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBQWYsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFlBQUEsRUFBYyxJQUFkO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixhQUFXLElBQUEsWUFBQSxDQUFBLENBQVgsQ0FEUTtJQUFBLENBRlY7R0FIRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/task-list/lib/task-list.coffee