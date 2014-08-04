(function() {
  var fs, path;

  path = require('path');

  fs = require('fs-plus');

  module.exports = {
    isWindows: function() {
      return !!process.platform.match(/^win/);
    },
    generateEvilFiles: function() {
      var evilFilesPath, filename, filenames, _i, _len, _results;
      evilFilesPath = path.join(__dirname, 'fixtures', 'evil-files');
      if (fs.existsSync(evilFilesPath)) {
        fs.removeSync(evilFilesPath);
      }
      fs.mkdirSync(evilFilesPath);
      if (this.isWindows()) {
        filenames = ["a_file_with_utf8.txt", "file with spaces.txt", "utfa\u0306.md"];
      } else {
        filenames = ["a_file_with_utf8.txt", "file with spaces.txt", "goddam\nnewlines", "quote\".txt", "utfa\u0306.md"];
      }
      _results = [];
      for (_i = 0, _len = filenames.length; _i < _len; _i++) {
        filename = filenames[_i];
        _results.push(fs.writeFileSync(path.join(evilFilesPath, filename), 'evil file!', {
          flag: 'w'
        }));
      }
      return _results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFFBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBREwsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLFNBQUEsRUFBVyxTQUFBLEdBQUE7YUFDVCxDQUFBLENBQUMsT0FBUSxDQUFDLFFBQVEsQ0FBQyxLQUFqQixDQUF1QixNQUF2QixFQURPO0lBQUEsQ0FBWDtBQUFBLElBT0EsaUJBQUEsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFVBQUEsc0RBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLFVBQXJCLEVBQWlDLFlBQWpDLENBQWhCLENBQUE7QUFDQSxNQUFBLElBQWdDLEVBQUUsQ0FBQyxVQUFILENBQWMsYUFBZCxDQUFoQztBQUFBLFFBQUEsRUFBRSxDQUFDLFVBQUgsQ0FBYyxhQUFkLENBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxFQUFFLENBQUMsU0FBSCxDQUFhLGFBQWIsQ0FGQSxDQUFBO0FBSUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtBQUNFLFFBQUEsU0FBQSxHQUFZLENBQ1Ysc0JBRFUsRUFFVixzQkFGVSxFQUdWLGVBSFUsQ0FBWixDQURGO09BQUEsTUFBQTtBQU9FLFFBQUEsU0FBQSxHQUFZLENBQ1Ysc0JBRFUsRUFFVixzQkFGVSxFQUdWLGtCQUhVLEVBSVYsYUFKVSxFQUtWLGVBTFUsQ0FBWixDQVBGO09BSkE7QUFtQkE7V0FBQSxnREFBQTtpQ0FBQTtBQUNFLHNCQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixFQUF5QixRQUF6QixDQUFqQixFQUFxRCxZQUFyRCxFQUFtRTtBQUFBLFVBQUEsSUFBQSxFQUFNLEdBQU47U0FBbkUsRUFBQSxDQURGO0FBQUE7c0JBcEJpQjtJQUFBLENBUG5CO0dBTkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/spec-helper-platform.coffee