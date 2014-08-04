(function() {
  var TimeReporter, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  module.exports = TimeReporter = (function(_super) {
    __extends(TimeReporter, _super);

    function TimeReporter() {
      window.timedSpecs = [];
      window.timedSuites = {};
      window.logLongestSpec = (function(_this) {
        return function() {
          return _this.logLongestSpecs(1);
        };
      })(this);
      window.logLongestSpecs = (function(_this) {
        return function(number) {
          return _this.logLongestSpecs(number);
        };
      })(this);
      window.logLongestSuite = (function(_this) {
        return function() {
          return _this.logLongestSuites(1);
        };
      })(this);
      window.logLongestSuites = (function(_this) {
        return function(number) {
          return _this.logLongestSuites(number);
        };
      })(this);
    }

    TimeReporter.prototype.logLongestSuites = function(number, log) {
      var suite, suites, time, _i, _len, _ref;
      if (number == null) {
        number = 10;
      }
      if (!(window.timedSuites.length > 0)) {
        return;
      }
      if (log == null) {
        log = function(line) {
          return console.log(line);
        };
      }
      log("Longest running suites:");
      suites = _.map(window.timedSuites, function(key, value) {
        return [value, key];
      });
      _ref = _.sortBy(suites, (function(_this) {
        return function(suite) {
          return -suite[1];
        };
      })(this)).slice(0, number);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        suite = _ref[_i];
        time = Math.round(suite[1] / 100) / 10;
        log("  " + suite[0] + " (" + time + "s)");
      }
      return void 0;
    };

    TimeReporter.prototype.logLongestSpecs = function(number, log) {
      var spec, time, _i, _len, _ref;
      if (number == null) {
        number = 10;
      }
      if (!(window.timedSpecs.length > 0)) {
        return;
      }
      if (log == null) {
        log = function(line) {
          return console.log(line);
        };
      }
      log("Longest running specs:");
      _ref = _.sortBy(window.timedSpecs, function(spec) {
        return -spec.time;
      }).slice(0, number);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spec = _ref[_i];
        time = Math.round(spec.time / 100) / 10;
        log("" + spec.description + " (" + time + "s)");
      }
      return void 0;
    };

    TimeReporter.prototype.reportSpecStarting = function(spec) {
      var reducer, stack, suite;
      stack = [spec.description];
      suite = spec.suite;
      while (suite) {
        stack.unshift(suite.description);
        this.suite = suite.description;
        suite = suite.parentSuite;
      }
      reducer = function(memo, description, index) {
        if (index === 0) {
          return "" + description;
        } else {
          return "" + memo + "\n" + (_.multiplyString('  ', index)) + description;
        }
      };
      this.description = _.reduce(stack, reducer, '');
      return this.time = Date.now();
    };

    TimeReporter.prototype.reportSpecResults = function(spec) {
      var duration;
      if (!((this.time != null) && (this.description != null))) {
        return;
      }
      duration = Date.now() - this.time;
      if (duration > 0) {
        window.timedSpecs.push({
          description: this.description,
          time: duration,
          fullName: spec.getFullName()
        });
        if (timedSuites[this.suite]) {
          window.timedSuites[this.suite] += duration;
        } else {
          window.timedSuites[this.suite] = duration;
        }
      }
      this.time = null;
      return this.description = null;
    };

    return TimeReporter;

  })(jasmine.Reporter);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLG1DQUFBLENBQUE7O0FBQWEsSUFBQSxzQkFBQSxHQUFBO0FBQ1gsTUFBQSxNQUFNLENBQUMsVUFBUCxHQUFvQixFQUFwQixDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsV0FBUCxHQUFxQixFQURyQixDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsY0FBUCxHQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxlQUFELENBQWlCLENBQWpCLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUh4QixDQUFBO0FBQUEsTUFJQSxNQUFNLENBQUMsZUFBUCxHQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQVksS0FBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakIsRUFBWjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSnpCLENBQUE7QUFBQSxNQUtBLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQWtCLENBQWxCLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUx6QixDQUFBO0FBQUEsTUFNQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUFZLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/time-reporter.coffee