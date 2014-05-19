(function() {
  var blockTravel;

  blockTravel = function(editor, direction, select) {
    var count, lineCount, row, rowIndex, up;
    up = direction === "up";
    lineCount = editor.getScreenLineCount();
    row = editor.getCursorScreenPosition().row;
    count = 0;
    while (true) {
      count += 1;
      if (up) {
        rowIndex = row - count;
      } else {
        rowIndex = row + count;
      }
      if (rowIndex < 0) {
        count = row;
        break;
      } else if (rowIndex >= lineCount) {
        count = lineCount - row;
        break;
      }
      if (editor.lineForScreenRow(rowIndex).text.replace(/^\s+|\s+$/g, "") === "") {
        break;
      }
    }
    if (select) {
      if (up) {
        return editor.selectUp(count);
      } else {
        return editor.selectDown(count);
      }
    } else {
      if (up) {
        return editor.moveCursorUp(count);
      } else {
        return editor.moveCursorDown(count);
      }
    }
  };

  module.exports = {
    activate: function() {
      atom.workspaceView.command('block-travel:move-up', function() {
        return blockTravel(atom.workspaceView.getActivePaneItem(), "up", false);
      });
      atom.workspaceView.command('block-travel:move-down', function() {
        return blockTravel(atom.workspaceView.getActivePaneItem(), "down", false);
      });
      atom.workspaceView.command('block-travel:select-up', function() {
        return blockTravel(atom.workspaceView.getActivePaneItem(), "up", true);
      });
      return atom.workspaceView.command('block-travel:select-down', function() {
        return blockTravel(atom.workspaceView.getActivePaneItem(), "down", true);
      });
    },
    blockTravel: blockTravel
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxXQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixNQUFwQixHQUFBO0FBQ1osUUFBQSxtQ0FBQTtBQUFBLElBQUEsRUFBQSxHQUFZLFNBQUEsS0FBYSxJQUF6QixDQUFBO0FBQUEsSUFDQSxTQUFBLEdBQVksTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FEWixDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQVksTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBZ0MsQ0FBQyxHQUY3QyxDQUFBO0FBQUEsSUFHQSxLQUFBLEdBQVksQ0FIWixDQUFBO0FBS0EsV0FBQSxJQUFBLEdBQUE7QUFDRSxNQUFBLEtBQUEsSUFBUyxDQUFULENBQUE7QUFFQSxNQUFBLElBQUcsRUFBSDtBQUNFLFFBQUEsUUFBQSxHQUFXLEdBQUEsR0FBTSxLQUFqQixDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsUUFBQSxHQUFXLEdBQUEsR0FBTSxLQUFqQixDQUhGO09BRkE7QUFPQSxNQUFBLElBQUcsUUFBQSxHQUFXLENBQWQ7QUFDRSxRQUFBLEtBQUEsR0FBUSxHQUFSLENBQUE7QUFDQSxjQUZGO09BQUEsTUFHSyxJQUFHLFFBQUEsSUFBWSxTQUFmO0FBQ0gsUUFBQSxLQUFBLEdBQVEsU0FBQSxHQUFZLEdBQXBCLENBQUE7QUFDQSxjQUZHO09BVkw7QUFjQSxNQUFBLElBQUcsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFFBQXhCLENBQWlDLENBQUMsSUFBSSxDQUFDLE9BQXZDLENBQStDLFlBQS9DLEVBQTZELEVBQTdELENBQUEsS0FBb0UsRUFBdkU7QUFDRSxjQURGO09BZkY7SUFBQSxDQUxBO0FBdUJBLElBQUEsSUFBRyxNQUFIO0FBQ0UsTUFBQSxJQUFHLEVBQUg7ZUFDRSxNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFoQixFQURGO09BQUEsTUFBQTtlQUdFLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLEVBSEY7T0FERjtLQUFBLE1BQUE7QUFNRSxNQUFBLElBQUcsRUFBSDtlQUNFLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEtBQXBCLEVBREY7T0FBQSxNQUFBO2VBR0UsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsS0FBdEIsRUFIRjtPQU5GO0tBeEJZO0VBQUEsQ0FBZCxDQUFBOztBQUFBLEVBbUNBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsc0JBQTNCLEVBQW1ELFNBQUEsR0FBQTtlQUNqRCxXQUFBLENBQVksSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBbkIsQ0FBQSxDQUFaLEVBQW9ELElBQXBELEVBQTBELEtBQTFELEVBRGlEO01BQUEsQ0FBbkQsQ0FBQSxDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHdCQUEzQixFQUFxRCxTQUFBLEdBQUE7ZUFDbkQsV0FBQSxDQUFZLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQW5CLENBQUEsQ0FBWixFQUFvRCxNQUFwRCxFQUE0RCxLQUE1RCxFQURtRDtNQUFBLENBQXJELENBSEEsQ0FBQTtBQUFBLE1BTUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQix3QkFBM0IsRUFBcUQsU0FBQSxHQUFBO2VBQ25ELFdBQUEsQ0FBWSxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFuQixDQUFBLENBQVosRUFBb0QsSUFBcEQsRUFBMEQsSUFBMUQsRUFEbUQ7TUFBQSxDQUFyRCxDQU5BLENBQUE7YUFTQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLDBCQUEzQixFQUF1RCxTQUFBLEdBQUE7ZUFDckQsV0FBQSxDQUFZLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQW5CLENBQUEsQ0FBWixFQUFvRCxNQUFwRCxFQUE0RCxJQUE1RCxFQURxRDtNQUFBLENBQXZELEVBVlE7SUFBQSxDQUFWO0FBQUEsSUFhQSxXQUFBLEVBQWEsV0FiYjtHQXBDRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/block-travel/lib/block-travel.coffee