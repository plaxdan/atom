(function() {
  var Git, fs, path, requireSpecs, runAllSpecs, setSpecDirectory, setSpecField, setSpecType, specDirectory, _;

  _ = require('underscore-plus');

  fs = require('fs-plus');

  Git = require('atom').Git;

  path = require('path');

  require('./spec-helper');

  requireSpecs = function(specDirectory, specType) {
    var specFilePath, _i, _len, _ref, _results;
    _ref = fs.listTreeSync(specDirectory);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      specFilePath = _ref[_i];
      if (!(/-spec\.(coffee|js)$/.test(specFilePath))) {
        continue;
      }
      require(specFilePath);
      _results.push(setSpecDirectory(specDirectory));
    }
    return _results;
  };

  setSpecField = function(name, value) {
    var index, specs, _i, _ref, _results;
    specs = jasmine.getEnv().currentRunner().specs();
    if (specs.length === 0) {
      return;
    }
    _results = [];
    for (index = _i = _ref = specs.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; index = _ref <= 0 ? ++_i : --_i) {
      if (specs[index][name] != null) {
        break;
      }
      _results.push(specs[index][name] = value);
    }
    return _results;
  };

  setSpecType = function(specType) {
    return setSpecField('specType', specType);
  };

  setSpecDirectory = function(specDirectory) {
    return setSpecField('specDirectory', specDirectory);
  };

  runAllSpecs = function() {
    var fixturesPackagesPath, packagePath, packagePaths, resourcePath, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
    resourcePath = atom.getLoadSettings().resourcePath;
    requireSpecs(path.join(resourcePath, 'spec'));
    setSpecType('core');
    fixturesPackagesPath = path.join(__dirname, 'fixtures', 'packages');
    packagePaths = atom.packages.getAvailablePackageNames().map(function(packageName) {
      return atom.packages.resolvePackagePath(packageName);
    });
    packagePaths = _.groupBy(packagePaths, function(packagePath) {
      if (packagePath.indexOf("" + fixturesPackagesPath + path.sep) === 0) {
        return 'fixtures';
      } else if (packagePath.indexOf("" + resourcePath + path.sep) === 0) {
        return 'bundled';
      } else {
        return 'user';
      }
    });
    _ref1 = (_ref = packagePaths.bundled) != null ? _ref : [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      packagePath = _ref1[_i];
      requireSpecs(path.join(packagePath, 'spec'));
    }
    setSpecType('bundled');
    _ref3 = (_ref2 = packagePaths.user) != null ? _ref2 : [];
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      packagePath = _ref3[_j];
      requireSpecs(path.join(packagePath, 'spec'));
    }
    return setSpecType('user');
  };

  if (specDirectory = atom.getLoadSettings().specDirectory) {
    requireSpecs(specDirectory);
    setSpecType('user');
  } else {
    runAllSpecs();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVHQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUMsTUFBTyxPQUFBLENBQVEsTUFBUixFQUFQLEdBRkQsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQSxPQUFBLENBQVEsZUFBUixDQUpBLENBQUE7O0FBQUEsRUFNQSxZQUFBLEdBQWUsU0FBQyxhQUFELEVBQWdCLFFBQWhCLEdBQUE7QUFDYixRQUFBLHNDQUFBO0FBQUE7QUFBQTtTQUFBLDJDQUFBOzhCQUFBO1lBQXdELHFCQUFxQixDQUFDLElBQXRCLENBQTJCLFlBQTNCOztPQUN0RDtBQUFBLE1BQUEsT0FBQSxDQUFRLFlBQVIsQ0FBQSxDQUFBO0FBQUEsb0JBR0EsZ0JBQUEsQ0FBaUIsYUFBakIsRUFIQSxDQURGO0FBQUE7b0JBRGE7RUFBQSxDQU5mLENBQUE7O0FBQUEsRUFhQSxZQUFBLEdBQWUsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ2IsUUFBQSxnQ0FBQTtBQUFBLElBQUEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxNQUFSLENBQUEsQ0FBZ0IsQ0FBQyxhQUFqQixDQUFBLENBQWdDLENBQUMsS0FBakMsQ0FBQSxDQUFSLENBQUE7QUFDQSxJQUFBLElBQVUsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBMUI7QUFBQSxZQUFBLENBQUE7S0FEQTtBQUVBO1NBQWEsb0dBQWIsR0FBQTtBQUNFLE1BQUEsSUFBUywwQkFBVDtBQUFBLGNBQUE7T0FBQTtBQUFBLG9CQUNBLEtBQU0sQ0FBQSxLQUFBLENBQU8sQ0FBQSxJQUFBLENBQWIsR0FBcUIsTUFEckIsQ0FERjtBQUFBO29CQUhhO0VBQUEsQ0FiZixDQUFBOztBQUFBLEVBb0JBLFdBQUEsR0FBYyxTQUFDLFFBQUQsR0FBQTtXQUNaLFlBQUEsQ0FBYSxVQUFiLEVBQXlCLFFBQXpCLEVBRFk7RUFBQSxDQXBCZCxDQUFBOztBQUFBLEVBdUJBLGdCQUFBLEdBQW1CLFNBQUMsYUFBRCxHQUFBO1dBQ2pCLFlBQUEsQ0FBYSxlQUFiLEVBQThCLGFBQTlCLEVBRGlCO0VBQUEsQ0F2Qm5CLENBQUE7O0FBQUEsRUEwQkEsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFFBQUEsNkdBQUE7QUFBQSxJQUFDLGVBQWdCLElBQUksQ0FBQyxlQUFMLENBQUEsRUFBaEIsWUFBRCxDQUFBO0FBQUEsSUFFQSxZQUFBLENBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxZQUFWLEVBQXdCLE1BQXhCLENBQWIsQ0FGQSxDQUFBO0FBQUEsSUFHQSxXQUFBLENBQVksTUFBWixDQUhBLENBQUE7QUFBQSxJQUtBLG9CQUFBLEdBQXVCLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixVQUFyQixFQUFpQyxVQUFqQyxDQUx2QixDQUFBO0FBQUEsSUFNQSxZQUFBLEdBQWUsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBZCxDQUFBLENBQXdDLENBQUMsR0FBekMsQ0FBNkMsU0FBQyxXQUFELEdBQUE7YUFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBZCxDQUFpQyxXQUFqQyxFQUQwRDtJQUFBLENBQTdDLENBTmYsQ0FBQTtBQUFBLElBUUEsWUFBQSxHQUFlLENBQUMsQ0FBQyxPQUFGLENBQVUsWUFBVixFQUF3QixTQUFDLFdBQUQsR0FBQTtBQUNyQyxNQUFBLElBQUcsV0FBVyxDQUFDLE9BQVosQ0FBb0IsRUFBQSxHQUFFLG9CQUFGLEdBQXlCLElBQUksQ0FBQyxHQUFsRCxDQUFBLEtBQTZELENBQWhFO2VBQ0UsV0FERjtPQUFBLE1BRUssSUFBRyxXQUFXLENBQUMsT0FBWixDQUFvQixFQUFBLEdBQUUsWUFBRixHQUFpQixJQUFJLENBQUMsR0FBMUMsQ0FBQSxLQUFxRCxDQUF4RDtlQUNILFVBREc7T0FBQSxNQUFBO2VBR0gsT0FIRztPQUhnQztJQUFBLENBQXhCLENBUmYsQ0FBQTtBQWlCQTtBQUFBLFNBQUEsNENBQUE7OEJBQUE7QUFBQSxNQUFBLFlBQUEsQ0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLFdBQVYsRUFBdUIsTUFBdkIsQ0FBYixDQUFBLENBQUE7QUFBQSxLQWpCQTtBQUFBLElBa0JBLFdBQUEsQ0FBWSxTQUFaLENBbEJBLENBQUE7QUFxQkE7QUFBQSxTQUFBLDhDQUFBOzhCQUFBO0FBQUEsTUFBQSxZQUFBLENBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFWLEVBQXVCLE1BQXZCLENBQWIsQ0FBQSxDQUFBO0FBQUEsS0FyQkE7V0FzQkEsV0FBQSxDQUFZLE1BQVosRUF2Qlk7RUFBQSxDQTFCZCxDQUFBOztBQW1EQSxFQUFBLElBQUcsYUFBQSxHQUFnQixJQUFJLENBQUMsZUFBTCxDQUFBLENBQXNCLENBQUMsYUFBMUM7QUFDRSxJQUFBLFlBQUEsQ0FBYSxhQUFiLENBQUEsQ0FBQTtBQUFBLElBQ0EsV0FBQSxDQUFZLE1BQVosQ0FEQSxDQURGO0dBQUEsTUFBQTtBQUlFLElBQUEsV0FBQSxDQUFBLENBQUEsQ0FKRjtHQW5EQTtBQUFBIgp9
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/spec-suite.coffee