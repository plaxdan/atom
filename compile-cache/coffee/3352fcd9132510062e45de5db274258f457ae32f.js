(function() {
  var DeserializerManager;

  DeserializerManager = require('../src/deserializer-manager');

  describe(".deserialize(state)", function() {
    var Foo, deserializer;
    deserializer = null;
    Foo = (function() {
      Foo.deserialize = function(_arg) {
        var name;
        name = _arg.name;
        return new Foo(name);
      };

      function Foo(name) {
        this.name = name;
      }

      return Foo;

    })();
    beforeEach(function() {
      deserializer = new DeserializerManager();
      return deserializer.add(Foo);
    });
    it("calls deserialize on the deserializer for the given state object, or returns undefined if one can't be found", function() {
      var object;
      spyOn(console, 'warn');
      object = deserializer.deserialize({
        deserializer: 'Foo',
        name: 'Bar'
      });
      expect(object.name).toBe('Bar');
      return expect(deserializer.deserialize({
        deserializer: 'Bogus'
      })).toBeUndefined();
    });
    return describe("when the deserializer has a version", function() {
      beforeEach(function() {
        return Foo.version = 2;
      });
      describe("when the deserialized state has a matching version", function() {
        return it("attempts to deserialize the state", function() {
          var object;
          object = deserializer.deserialize({
            deserializer: 'Foo',
            version: 2,
            name: 'Bar'
          });
          return expect(object.name).toBe('Bar');
        });
      });
      return describe("when the deserialized state has a non-matching version", function() {
        return it("returns undefined", function() {
          expect(deserializer.deserialize({
            deserializer: 'Foo',
            version: 3,
            name: 'Bar'
          })).toBeUndefined();
          expect(deserializer.deserialize({
            deserializer: 'Foo',
            version: 1,
            name: 'Bar'
          })).toBeUndefined();
          return expect(deserializer.deserialize({
            deserializer: 'Foo',
            name: 'Bar'
          })).toBeUndefined();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDZCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFFBQUEsaUJBQUE7QUFBQSxJQUFBLFlBQUEsR0FBZSxJQUFmLENBQUE7QUFBQSxJQUVNO0FBQ0osTUFBQSxHQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsSUFBRCxHQUFBO0FBQVksWUFBQSxJQUFBO0FBQUEsUUFBVixPQUFELEtBQUMsSUFBVSxDQUFBO2VBQUksSUFBQSxHQUFBLENBQUksSUFBSixFQUFoQjtNQUFBLENBQWQsQ0FBQTs7QUFDYSxNQUFBLGFBQUUsSUFBRixHQUFBO0FBQVMsUUFBUixJQUFDLENBQUEsT0FBQSxJQUFPLENBQVQ7TUFBQSxDQURiOztpQkFBQTs7UUFIRixDQUFBO0FBQUEsSUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxZQUFBLEdBQW1CLElBQUEsbUJBQUEsQ0FBQSxDQUFuQixDQUFBO2FBQ0EsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsR0FBakIsRUFGUztJQUFBLENBQVgsQ0FOQSxDQUFBO0FBQUEsSUFVQSxFQUFBLENBQUcsOEdBQUgsRUFBbUgsU0FBQSxHQUFBO0FBQ2pILFVBQUEsTUFBQTtBQUFBLE1BQUEsS0FBQSxDQUFNLE9BQU4sRUFBZSxNQUFmLENBQUEsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLFlBQVksQ0FBQyxXQUFiLENBQXlCO0FBQUEsUUFBRSxZQUFBLEVBQWMsS0FBaEI7QUFBQSxRQUF1QixJQUFBLEVBQU0sS0FBN0I7T0FBekIsQ0FEVCxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLElBQWQsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixLQUF6QixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sWUFBWSxDQUFDLFdBQWIsQ0FBeUI7QUFBQSxRQUFFLFlBQUEsRUFBYyxPQUFoQjtPQUF6QixDQUFQLENBQTJELENBQUMsYUFBNUQsQ0FBQSxFQUppSDtJQUFBLENBQW5ILENBVkEsQ0FBQTtXQWdCQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEdBQUcsQ0FBQyxPQUFKLEdBQWMsRUFETDtNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFHQSxRQUFBLENBQVMsb0RBQVQsRUFBK0QsU0FBQSxHQUFBO2VBQzdELEVBQUEsQ0FBRyxtQ0FBSCxFQUF3QyxTQUFBLEdBQUE7QUFDdEMsY0FBQSxNQUFBO0FBQUEsVUFBQSxNQUFBLEdBQVMsWUFBWSxDQUFDLFdBQWIsQ0FBeUI7QUFBQSxZQUFFLFlBQUEsRUFBYyxLQUFoQjtBQUFBLFlBQXVCLE9BQUEsRUFBUyxDQUFoQztBQUFBLFlBQW1DLElBQUEsRUFBTSxLQUF6QztXQUF6QixDQUFULENBQUE7aUJBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxJQUFkLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsS0FBekIsRUFGc0M7UUFBQSxDQUF4QyxFQUQ2RDtNQUFBLENBQS9ELENBSEEsQ0FBQTthQVFBLFFBQUEsQ0FBUyx3REFBVCxFQUFtRSxTQUFBLEdBQUE7ZUFDakUsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUEsR0FBQTtBQUN0QixVQUFBLE1BQUEsQ0FBTyxZQUFZLENBQUMsV0FBYixDQUF5QjtBQUFBLFlBQUUsWUFBQSxFQUFjLEtBQWhCO0FBQUEsWUFBdUIsT0FBQSxFQUFTLENBQWhDO0FBQUEsWUFBbUMsSUFBQSxFQUFNLEtBQXpDO1dBQXpCLENBQVAsQ0FBa0YsQ0FBQyxhQUFuRixDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLFlBQVksQ0FBQyxXQUFiLENBQXlCO0FBQUEsWUFBRSxZQUFBLEVBQWMsS0FBaEI7QUFBQSxZQUF1QixPQUFBLEVBQVMsQ0FBaEM7QUFBQSxZQUFtQyxJQUFBLEVBQU0sS0FBekM7V0FBekIsQ0FBUCxDQUFrRixDQUFDLGFBQW5GLENBQUEsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxZQUFZLENBQUMsV0FBYixDQUF5QjtBQUFBLFlBQUUsWUFBQSxFQUFjLEtBQWhCO0FBQUEsWUFBdUIsSUFBQSxFQUFNLEtBQTdCO1dBQXpCLENBQVAsQ0FBc0UsQ0FBQyxhQUF2RSxDQUFBLEVBSHNCO1FBQUEsQ0FBeEIsRUFEaUU7TUFBQSxDQUFuRSxFQVQ4QztJQUFBLENBQWhELEVBakI4QjtFQUFBLENBQWhDLENBRkEsQ0FBQTtBQUFBIgp9
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/deserializer-manager-spec.coffee