(function() {
  var Task;

  Task = require('../src/task');

  describe("Task", function() {
    return describe("@once(taskPath, args..., callback)", function() {
      return it("terminates the process after it completes", function() {
        var childProcess, handlerResult, processClosed, processErrored, task;
        handlerResult = null;
        task = Task.once(require.resolve('./fixtures/task-spec-handler'), function(result) {
          return handlerResult = result;
        });
        processClosed = false;
        processErrored = false;
        childProcess = task.childProcess;
        spyOn(childProcess, 'kill').andCallThrough();
        task.childProcess.on('error', function() {
          return processErrored = true;
        });
        waitsFor(function() {
          return handlerResult != null;
        });
        return runs(function() {
          expect(handlerResult).toBe('hello');
          expect(childProcess.kill).toHaveBeenCalled();
          return expect(processErrored).toBe(false);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO1dBQ2YsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUEsR0FBQTthQUM3QyxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLFlBQUEsZ0VBQUE7QUFBQSxRQUFBLGFBQUEsR0FBZ0IsSUFBaEIsQ0FBQTtBQUFBLFFBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsOEJBQWhCLENBQVYsRUFBMkQsU0FBQyxNQUFELEdBQUE7aUJBQ2hFLGFBQUEsR0FBZ0IsT0FEZ0Q7UUFBQSxDQUEzRCxDQURQLENBQUE7QUFBQSxRQUlBLGFBQUEsR0FBZ0IsS0FKaEIsQ0FBQTtBQUFBLFFBS0EsY0FBQSxHQUFpQixLQUxqQixDQUFBO0FBQUEsUUFNQSxZQUFBLEdBQWUsSUFBSSxDQUFDLFlBTnBCLENBQUE7QUFBQSxRQU9BLEtBQUEsQ0FBTSxZQUFOLEVBQW9CLE1BQXBCLENBQTJCLENBQUMsY0FBNUIsQ0FBQSxDQVBBLENBQUE7QUFBQSxRQVFBLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBbEIsQ0FBcUIsT0FBckIsRUFBOEIsU0FBQSxHQUFBO2lCQUFHLGNBQUEsR0FBaUIsS0FBcEI7UUFBQSxDQUE5QixDQVJBLENBQUE7QUFBQSxRQVVBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7aUJBQ1Asc0JBRE87UUFBQSxDQUFULENBVkEsQ0FBQTtlQWFBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxhQUFQLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsT0FBM0IsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sWUFBWSxDQUFDLElBQXBCLENBQXlCLENBQUMsZ0JBQTFCLENBQUEsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxjQUFQLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsS0FBNUIsRUFIRztRQUFBLENBQUwsRUFkOEM7TUFBQSxDQUFoRCxFQUQ2QztJQUFBLENBQS9DLEVBRGU7RUFBQSxDQUFqQixDQUZBLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/task-spec.coffee