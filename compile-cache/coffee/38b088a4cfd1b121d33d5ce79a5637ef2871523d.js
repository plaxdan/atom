(function() {
  describe("Clipboard", function() {
    return describe("write(text, metadata) and read()", function() {
      it("writes and reads text to/from the native clipboard", function() {
        expect(atom.clipboard.read()).toBe('initial clipboard content');
        atom.clipboard.write('next');
        return expect(atom.clipboard.read()).toBe('next');
      });
      return it("returns metadata if the item on the native clipboard matches the last written item", function() {
        atom.clipboard.write('next', {
          meta: 'data'
        });
        expect(atom.clipboard.read()).toBe('next');
        expect(atom.clipboard.readWithMetadata().text).toBe('next');
        return expect(atom.clipboard.readWithMetadata().metadata).toEqual({
          meta: 'data'
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtXQUNwQixRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLE1BQUEsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUEsR0FBQTtBQUN2RCxRQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxDQUFQLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsMkJBQW5DLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLE1BQXJCLENBREEsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxDQUFQLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsTUFBbkMsRUFIdUQ7TUFBQSxDQUF6RCxDQUFBLENBQUE7YUFLQSxFQUFBLENBQUcsb0ZBQUgsRUFBeUYsU0FBQSxHQUFBO0FBQ3ZGLFFBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLE1BQXJCLEVBQTZCO0FBQUEsVUFBQyxJQUFBLEVBQU0sTUFBUDtTQUE3QixDQUFBLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxDQUFQLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsTUFBbkMsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZixDQUFBLENBQWlDLENBQUMsSUFBekMsQ0FBOEMsQ0FBQyxJQUEvQyxDQUFvRCxNQUFwRCxDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZixDQUFBLENBQWlDLENBQUMsUUFBekMsQ0FBa0QsQ0FBQyxPQUFuRCxDQUEyRDtBQUFBLFVBQUMsSUFBQSxFQUFNLE1BQVA7U0FBM0QsRUFKdUY7TUFBQSxDQUF6RixFQU4yQztJQUFBLENBQTdDLEVBRG9CO0VBQUEsQ0FBdEIsQ0FBQSxDQUFBO0FBQUEiCn0=
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/clipboard-spec.coffee