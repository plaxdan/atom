(function() {
  var fs;

  fs = require('fs');

  module.exports.runSpecSuite = function(specSuite, logFile, logErrors) {
    var $, $$, AtomReporter, TerminalReporter, TimeReporter, jasmineEnv, key, log, logStream, reporter, timeReporter, value, _ref, _ref1;
    if (logErrors == null) {
      logErrors = true;
    }
    _ref = require('atom'), $ = _ref.$, $$ = _ref.$$;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLEVBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFmLEdBQThCLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsU0FBckIsR0FBQTtBQUM1QixRQUFBLGdJQUFBOztNQURpRCxZQUFVO0tBQzNEO0FBQUEsSUFBQSxPQUFVLE9BQUEsQ0FBUSxNQUFSLENBQVYsRUFBQyxTQUFBLENBQUQsRUFBSSxVQUFBLEVBQUosQ0FBQTtBQUNBO0FBQUEsU0FBQSxZQUFBO3lCQUFBO0FBQUEsTUFBQSxNQUFPLENBQUEsR0FBQSxDQUFQLEdBQWMsS0FBZCxDQUFBO0FBQUEsS0FEQTtBQUFBLElBR0MsbUJBQW9CLE9BQUEsQ0FBUSxnQkFBUixFQUFwQixnQkFIRCxDQUFBO0FBQUEsSUFLQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBTGYsQ0FBQTtBQUFBLElBTUEsWUFBQSxHQUFtQixJQUFBLFlBQUEsQ0FBQSxDQU5uQixDQUFBO0FBUUEsSUFBQSxJQUF5QyxlQUF6QztBQUFBLE1BQUEsU0FBQSxHQUFZLEVBQUUsQ0FBQyxRQUFILENBQVksT0FBWixFQUFxQixHQUFyQixDQUFaLENBQUE7S0FSQTtBQUFBLElBU0EsR0FBQSxHQUFNLFNBQUMsR0FBRCxHQUFBO0FBQ0osTUFBQSxJQUFHLGlCQUFIO2VBQ0UsRUFBRSxDQUFDLFNBQUgsQ0FBYSxTQUFiLEVBQXdCLEdBQXhCLEVBREY7T0FBQSxNQUFBO2VBR0UsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLEdBQXJCLEVBSEY7T0FESTtJQUFBLENBVE4sQ0FBQTtBQWVBLElBQUEsSUFBRyxJQUFJLENBQUMsZUFBTCxDQUFBLENBQXNCLENBQUMsWUFBMUI7QUFDRSxNQUFBLFFBQUEsR0FBZSxJQUFBLGdCQUFBLENBQ2I7QUFBQSxRQUFBLEtBQUEsRUFBTyxTQUFDLEdBQUQsR0FBQTtpQkFDTCxHQUFBLENBQUksR0FBSixFQURLO1FBQUEsQ0FBUDtBQUFBLFFBRUEsVUFBQSxFQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1YsY0FBQSxLQUFBO0FBQUEsVUFBQSxJQUEyQixpQkFBM0I7QUFBQSxZQUFBLEVBQUUsQ0FBQyxTQUFILENBQWEsU0FBYixDQUFBLENBQUE7V0FBQTtpQkFDQSxJQUFJLENBQUMsSUFBTCw4REFBNkM7QUFBQSxZQUFBLENBQUEsRUFBSSxDQUFKO1dBQTdDLEVBRlU7UUFBQSxDQUZaO09BRGEsQ0FBZixDQURGO0tBQUEsTUFBQTtBQVFFLE1BQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUFmLENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBZSxJQUFBLFlBQUEsQ0FBQSxDQURmLENBUkY7S0FmQTtBQUFBLElBMEJBLE9BQUEsQ0FBUSxTQUFSLENBMUJBLENBQUE7QUFBQSxJQTRCQSxVQUFBLEdBQWEsT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQTVCYixDQUFBO0FBQUEsSUE2QkEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsUUFBdkIsQ0E3QkEsQ0FBQTtBQUFBLElBOEJBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLFlBQXZCLENBOUJBLENBQUE7QUFBQSxJQStCQSxVQUFVLENBQUMsZUFBWCxDQUEyQixDQUFDLE9BQU8sQ0FBQyxRQUFULENBQTNCLENBL0JBLENBQUE7QUFBQSxJQWlDQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFpQixFQUFBLENBQUcsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsRUFBQSxFQUFJLGlCQUFKO09BQUwsRUFBSDtJQUFBLENBQUgsQ0FBakIsQ0FqQ0EsQ0FBQTtXQW1DQSxVQUFVLENBQUMsT0FBWCxDQUFBLEVBcEM0QjtFQUFBLENBRjlCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/jasmine-helper.coffee