(function() {
  var TodoListView;

  TodoListView = require('./todo-list-view');

  module.exports = {
    todoListView: null,
    activate: function(state) {
      return this.todoListView = new TodoListView(state.todoListViewState);
    },
    deactivate: function() {
      return this.todoListView.destroy();
    },
    serialize: function() {
      return {
        todoListViewState: this.todoListView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFlBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBQWYsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFlBQUEsRUFBYyxJQUFkO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFDLENBQUEsWUFBRCxHQUFvQixJQUFBLFlBQUEsQ0FBYSxLQUFLLENBQUMsaUJBQW5CLEVBRFo7SUFBQSxDQUZWO0FBQUEsSUFLQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQUEsRUFEVTtJQUFBLENBTFo7QUFBQSxJQVFBLFNBQUEsRUFBVyxTQUFBLEdBQUE7YUFDVDtBQUFBLFFBQUEsaUJBQUEsRUFBbUIsSUFBQyxDQUFBLFlBQVksQ0FBQyxTQUFkLENBQUEsQ0FBbkI7UUFEUztJQUFBLENBUlg7R0FIRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/todo-list/lib/todo-list.coffee