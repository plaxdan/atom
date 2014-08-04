(function() {
  var Gist;

  Gist = require('../lib/gist');

  describe("Gist", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('gist');
    });
    return describe("when the gist:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.gist')).not.toExist();
        atom.workspaceView.trigger('gist:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.gist')).toExist();
          atom.workspaceView.trigger('gist:toggle');
          return expect(atom.workspaceView.find('.gist')).not.toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBUCxDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsUUFBQSxpQkFBQTtBQUFBLElBQUEsaUJBQUEsR0FBb0IsSUFBcEIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsR0FBQSxDQUFBLGFBQXJCLENBQUE7YUFDQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsTUFBOUIsRUFGWDtJQUFBLENBQVgsQ0FGQSxDQUFBO1dBTUEsUUFBQSxDQUFTLHlDQUFULEVBQW9ELFNBQUEsR0FBQTthQUNsRCxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFFBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsT0FBeEIsQ0FBUCxDQUF3QyxDQUFDLEdBQUcsQ0FBQyxPQUE3QyxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixhQUEzQixDQUpBLENBQUE7QUFBQSxRQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FOQSxDQUFBO2VBU0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsT0FBeEIsQ0FBUCxDQUF3QyxDQUFDLE9BQXpDLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGFBQTNCLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFuQixDQUF3QixPQUF4QixDQUFQLENBQXdDLENBQUMsR0FBRyxDQUFDLE9BQTdDLENBQUEsRUFIRztRQUFBLENBQUwsRUFWd0M7TUFBQSxDQUExQyxFQURrRDtJQUFBLENBQXBELEVBUGU7RUFBQSxDQUFqQixDQVBBLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/gist-it/spec/gist-spec.coffee