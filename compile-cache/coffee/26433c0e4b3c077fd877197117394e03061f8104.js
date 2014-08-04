(function() {
  var fs;

  fs = require('fs');

  module.exports.runSpecSuite = function(specSuite, logFile, logErrors) {
    var $, $$, AtomReporter, TerminalReporter, TimeReporter, jasmineEnv, key, log, logStream, reporter, timeReporter, value, _ref, _ref1;
    if (logErrors == null) {
      logErrors = true;
    }
    _ref = require('../src/space-pen-extensions'), $ = _ref.$, $$ = _ref.$$;
    _ref1 = require('../vendor/jasmine');
    for (key in _ref1) {
      value = _ref1[key];
      window[key] = value;
    }
    TerminalReporter = require('jasmine-tagged').TerminalReporter;
    TimeReporter = require('./time-reporter');
    timeReporter = new TimeReporter();
    if (logFile != null) {
      logStream = fs.openSync(logFile, 'w');
    }
    log = function(str) {
      if (logStream != null) {
        return fs.writeSync(logStream, str);
      } else {
        return process.stderr.write(str);
      }
    };
    if (atom.getLoadSettings().exitWhenDone) {
      reporter = new TerminalReporter({
        print: function(str) {
          return log(str);
        },
        onComplete: function(runner) {
          var _ref2;
          if (logStream != null) {
            fs.closeSync(logStream);
          }
          return atom.exit((_ref2 = runner.results().failedCount > 0) != null ? _ref2 : {
            1: 0
          });
        }
      });
    } else {
      AtomReporter = require('./atom-reporter');
      reporter = new AtomReporter();
    }
    require(specSuite);
    jasmineEnv = jasmine.getEnv();
    jasmineEnv.addReporter(reporter);
    jasmineEnv.addReporter(timeReporter);
    jasmineEnv.setIncludedTags([process.platform]);
    $('body').append($$(function() {
      return this.div({
        id: 'jasmine-content'
      });
    }));
    return jasmineEnv.execute();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLEVBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFmLEdBQThCLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsU0FBckIsR0FBQTtBQUM1QixRQUFBLGdJQUFBOztNQURpRCxZQUFVO0tBQzNEO0FBQUEsSUFBQSxPQUFVLE9BQUEsQ0FBUSw2QkFBUixDQUFWLEVBQUMsU0FBQSxDQUFELEVBQUksVUFBQSxFQUFKLENBQUE7QUFFQTtBQUFBLFNBQUEsWUFBQTt5QkFBQTtBQUFBLE1BQUEsTUFBTyxDQUFBLEdBQUEsQ0FBUCxHQUFjLEtBQWQsQ0FBQTtBQUFBLEtBRkE7QUFBQSxJQUlDLG1CQUFvQixPQUFBLENBQVEsZ0JBQVIsRUFBcEIsZ0JBSkQsQ0FBQTtBQUFBLElBTUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQU5mLENBQUE7QUFBQSxJQU9BLFlBQUEsR0FBbUIsSUFBQSxZQUFBLENBQUEsQ0FQbkIsQ0FBQTtBQVNBLElBQUEsSUFBeUMsZUFBekM7QUFBQSxNQUFBLFNBQUEsR0FBWSxFQUFFLENBQUMsUUFBSCxDQUFZLE9BQVosRUFBcUIsR0FBckIsQ0FBWixDQUFBO0tBVEE7QUFBQSxJQVVBLEdBQUEsR0FBTSxTQUFDLEdBQUQsR0FBQTtBQUNKLE1BQUEsSUFBRyxpQkFBSDtlQUNFLEVBQUUsQ0FBQyxTQUFILENBQWEsU0FBYixFQUF3QixHQUF4QixFQURGO09BQUEsTUFBQTtlQUdFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBZixDQUFxQixHQUFyQixFQUhGO09BREk7SUFBQSxDQVZOLENBQUE7QUFnQkEsSUFBQSxJQUFHLElBQUksQ0FBQyxlQUFMLENBQUEsQ0FBc0IsQ0FBQyxZQUExQjtBQUNFLE1BQUEsUUFBQSxHQUFlLElBQUEsZ0JBQUEsQ0FDYjtBQUFBLFFBQUEsS0FBQSxFQUFPLFNBQUMsR0FBRCxHQUFBO2lCQUNMLEdBQUEsQ0FBSSxHQUFKLEVBREs7UUFBQSxDQUFQO0FBQUEsUUFFQSxVQUFBLEVBQVksU0FBQyxNQUFELEdBQUE7QUFDVixjQUFBLEtBQUE7QUFBQSxVQUFBLElBQTJCLGlCQUEzQjtBQUFBLFlBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxTQUFiLENBQUEsQ0FBQTtXQUFBO2lCQUNBLElBQUksQ0FBQyxJQUFMLDhEQUE2QztBQUFBLFlBQUEsQ0FBQSxFQUFJLENBQUo7V0FBN0MsRUFGVTtRQUFBLENBRlo7T0FEYSxDQUFmLENBREY7S0FBQSxNQUFBO0FBUUUsTUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBQWYsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFlLElBQUEsWUFBQSxDQUFBLENBRGYsQ0FSRjtLQWhCQTtBQUFBLElBMkJBLE9BQUEsQ0FBUSxTQUFSLENBM0JBLENBQUE7QUFBQSxJQTZCQSxVQUFBLEdBQWEsT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQTdCYixDQUFBO0FBQUEsSUE4QkEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsUUFBdkIsQ0E5QkEsQ0FBQTtBQUFBLElBK0JBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLFlBQXZCLENBL0JBLENBQUE7QUFBQSxJQWdDQSxVQUFVLENBQUMsZUFBWCxDQUEyQixDQUFDLE9BQU8sQ0FBQyxRQUFULENBQTNCLENBaENBLENBQUE7QUFBQSxJQWtDQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFpQixFQUFBLENBQUcsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsRUFBQSxFQUFJLGlCQUFKO09BQUwsRUFBSDtJQUFBLENBQUgsQ0FBakIsQ0FsQ0EsQ0FBQTtXQW9DQSxVQUFVLENBQUMsT0FBWCxDQUFBLEVBckM0QjtFQUFBLENBRjlCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/jasmine-helper.coffee