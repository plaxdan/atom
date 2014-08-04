(function() {
  var fs, installer, path, temp;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp');

  installer = require('../src/command-installer');

  describe("install(commandPath, callback)", function() {
    var commandFilePath, commandName, installationFilePath, installationPath;
    commandFilePath = temp.openSync("atom-command").path;
    commandName = path.basename(commandFilePath);
    installationPath = temp.mkdirSync("atom-bin");
    installationFilePath = path.join(installationPath, commandName);
    beforeEach(function() {
      fs.chmodSync(commandFilePath, '755');
      return spyOn(installer, 'getInstallDirectory').andReturn(installationPath);
    });
    return describe("on #darwin", function() {
      return it("symlinks the command and makes it executable", function() {
        var installDone, installError;
        expect(fs.isFileSync(commandFilePath)).toBeTruthy();
        expect(fs.isFileSync(installationFilePath)).toBeFalsy();
        installDone = false;
        installError = null;
        installer.install(commandFilePath, false, function(error) {
          installDone = true;
          return installError = error;
        });
        waitsFor(function() {
          return installDone;
        });
        return runs(function() {
          expect(installError).toBeNull();
          expect(fs.isFileSync(installationFilePath)).toBeTruthy();
          expect(fs.realpathSync(installationFilePath)).toBe(fs.realpathSync(commandFilePath));
          return expect(fs.isExecutableSync(installationFilePath)).toBeTruthy();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSwwQkFBUixDQUhaLENBQUE7O0FBQUEsRUFLQSxRQUFBLENBQVMsZ0NBQVQsRUFBMkMsU0FBQSxHQUFBO0FBQ3pDLFFBQUEsb0VBQUE7QUFBQSxJQUFBLGVBQUEsR0FBa0IsSUFBSSxDQUFDLFFBQUwsQ0FBYyxjQUFkLENBQTZCLENBQUMsSUFBaEQsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLElBQUksQ0FBQyxRQUFMLENBQWMsZUFBZCxDQURkLENBQUE7QUFBQSxJQUVBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxTQUFMLENBQWUsVUFBZixDQUZuQixDQUFBO0FBQUEsSUFHQSxvQkFBQSxHQUF1QixJQUFJLENBQUMsSUFBTCxDQUFVLGdCQUFWLEVBQTRCLFdBQTVCLENBSHZCLENBQUE7QUFBQSxJQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLEVBQUUsQ0FBQyxTQUFILENBQWEsZUFBYixFQUE4QixLQUE5QixDQUFBLENBQUE7YUFDQSxLQUFBLENBQU0sU0FBTixFQUFpQixxQkFBakIsQ0FBdUMsQ0FBQyxTQUF4QyxDQUFrRCxnQkFBbEQsRUFGUztJQUFBLENBQVgsQ0FMQSxDQUFBO1dBU0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO2FBQ3JCLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBLEdBQUE7QUFDakQsWUFBQSx5QkFBQTtBQUFBLFFBQUEsTUFBQSxDQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsZUFBZCxDQUFQLENBQXNDLENBQUMsVUFBdkMsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxFQUFFLENBQUMsVUFBSCxDQUFjLG9CQUFkLENBQVAsQ0FBMkMsQ0FBQyxTQUE1QyxDQUFBLENBREEsQ0FBQTtBQUFBLFFBR0EsV0FBQSxHQUFjLEtBSGQsQ0FBQTtBQUFBLFFBSUEsWUFBQSxHQUFlLElBSmYsQ0FBQTtBQUFBLFFBS0EsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsZUFBbEIsRUFBbUMsS0FBbkMsRUFBMEMsU0FBQyxLQUFELEdBQUE7QUFDeEMsVUFBQSxXQUFBLEdBQWMsSUFBZCxDQUFBO2lCQUNBLFlBQUEsR0FBZSxNQUZ5QjtRQUFBLENBQTFDLENBTEEsQ0FBQTtBQUFBLFFBU0EsUUFBQSxDQUFTLFNBQUEsR0FBQTtpQkFDUCxZQURPO1FBQUEsQ0FBVCxDQVRBLENBQUE7ZUFZQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFBLENBQU8sWUFBUCxDQUFvQixDQUFDLFFBQXJCLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sRUFBRSxDQUFDLFVBQUgsQ0FBYyxvQkFBZCxDQUFQLENBQTJDLENBQUMsVUFBNUMsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxFQUFFLENBQUMsWUFBSCxDQUFnQixvQkFBaEIsQ0FBUCxDQUE2QyxDQUFDLElBQTlDLENBQW1ELEVBQUUsQ0FBQyxZQUFILENBQWdCLGVBQWhCLENBQW5ELENBRkEsQ0FBQTtpQkFHQSxNQUFBLENBQU8sRUFBRSxDQUFDLGdCQUFILENBQW9CLG9CQUFwQixDQUFQLENBQWlELENBQUMsVUFBbEQsQ0FBQSxFQUpHO1FBQUEsQ0FBTCxFQWJpRDtNQUFBLENBQW5ELEVBRHFCO0lBQUEsQ0FBdkIsRUFWeUM7RUFBQSxDQUEzQyxDQUxBLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/command-installer-spec.coffee