(function() {
  var $, $$, AtomReporter, SpecResultView, SuiteResultView, View, convertStackTrace, formatStackTrace, grim, path, sourceMaps, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  _ = require('underscore-plus');

  convertStackTrace = require('coffeestack').convertStackTrace;

  _ref = require('../src/space-pen-extensions'), View = _ref.View, $ = _ref.$, $$ = _ref.$$;

  grim = require('grim');

  sourceMaps = {};

  formatStackTrace = function(spec, message, stackTrace) {
    var convertedLines, errorMatch, firstJasmineLinePattern, index, jasminePattern, line, lines, prefixMatch, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
    if (message == null) {
      message = '';
    }
    if (!stackTrace) {
      return stackTrace;
    }
    jasminePattern = /^\s*at\s+.*\(?.*[/\\]jasmine(-[^/\\]*)?\.js:\d+:\d+\)?\s*$/;
    firstJasmineLinePattern = /^\s*at [/\\].*[/\\]jasmine(-[^/\\]*)?\.js:\d+:\d+\)?\s*$/;
    convertedLines = [];
    _ref1 = stackTrace.split('\n');
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      line = _ref1[_i];
      if (!jasminePattern.test(line)) {
        convertedLines.push(line);
      }
      if (firstJasmineLinePattern.test(line)) {
        break;
      }
    }
    stackTrace = convertStackTrace(convertedLines.join('\n'), sourceMaps);
    lines = stackTrace.split('\n');
    errorMatch = (_ref2 = lines[0]) != null ? _ref2.match(/^Error: (.*)/) : void 0;
    if (message.trim() === (errorMatch != null ? (_ref3 = errorMatch[1]) != null ? _ref3.trim() : void 0 : void 0)) {
      lines.shift();
    }
    for (index = _j = 0, _len1 = lines.length; _j < _len1; index = ++_j) {
      line = lines[index];
      prefixMatch = line.match(/at \[object Object\]\.<anonymous> \(([^)]+)\)/);
      if (prefixMatch) {
        line = "at " + prefixMatch[1];
      }
      lines[index] = line.replace("at " + spec.specDirectory + path.sep, 'at ');
    }
    lines = lines.map(function(line) {
      return line.trim();
    });
    return lines.join('\n').trim();
  };

  module.exports = AtomReporter = (function(_super) {
    __extends(AtomReporter, _super);

    function AtomReporter() {
      return AtomReporter.__super__.constructor.apply(this, arguments);
    }

    AtomReporter.content = function() {
      return this.div({
        "class": 'spec-reporter'
      }, (function(_this) {
        return function() {
          _this.div({
            outlet: "suites"
          });
          _this.div({
            outlet: 'coreArea',
            "class": 'symbol-area'
          }, function() {
            _this.div({
              outlet: 'coreHeader',
              "class": 'symbol-header'
            });
            return _this.ul({
              outlet: 'coreSummary',
              "class": 'symbol-summary list-unstyled'
            });
          });
          _this.div({
            outlet: 'bundledArea',
            "class": 'symbol-area'
          }, function() {
            _this.div({
              outlet: 'bundledHeader',
              "class": 'symbol-header'
            });
            return _this.ul({
              outlet: 'bundledSummary',
              "class": 'symbol-summary list-unstyled'
            });
          });
          _this.div({
            outlet: 'userArea',
            "class": 'symbol-area'
          }, function() {
            _this.div({
              outlet: 'userHeader',
              "class": 'symbol-header'
            });
            return _this.ul({
              outlet: 'userSummary',
              "class": 'symbol-summary list-unstyled'
            });
          });
          _this.div({
            outlet: "status",
            "class": 'status alert alert-info'
          }, function() {
            _this.div({
              outlet: "time",
              "class": 'time'
            });
            _this.div({
              outlet: "specCount",
              "class": 'spec-count'
            });
            return _this.div({
              outlet: "message",
              "class": 'message'
            });
          });
          _this.div({
            outlet: "results",
            "class": 'results'
          });
          _this.div({
            outlet: "deprecations",
            "class": 'status alert alert-warning',
            style: 'display: none'
          }, function() {
            _this.span({
              outlet: 'deprecationStatus'
            }, '0 deprecations');
            return _this.div({
              "class": 'deprecation-toggle'
            });
          });
          return _this.div({
            outlet: 'deprecationList',
            "class": 'deprecation-list'
          });
        };
      })(this));
    };

    AtomReporter.prototype.startedAt = null;

    AtomReporter.prototype.runningSpecCount = 0;

    AtomReporter.prototype.completeSpecCount = 0;

    AtomReporter.prototype.passedCount = 0;

    AtomReporter.prototype.failedCount = 0;

    AtomReporter.prototype.skippedCount = 0;

    AtomReporter.prototype.totalSpecCount = 0;

    AtomReporter.prototype.deprecationCount = 0;

    AtomReporter.timeoutId = 0;

    AtomReporter.prototype.reportRunnerStarting = function(runner) {
      var specs;
      this.handleEvents();
      this.startedAt = Date.now();
      specs = runner.specs();
      this.totalSpecCount = specs.length;
      this.addSpecs(specs);
      return $(document.body).append(this);
    };

    AtomReporter.prototype.reportRunnerResults = function(runner) {
      this.updateSpecCounts();
      if (this.failedCount === 0) {
        this.status.addClass('alert-success').removeClass('alert-info');
      }
      if (this.failedCount === 1) {
        return this.message.text("" + this.failedCount + " failure");
      } else {
        return this.message.text("" + this.failedCount + " failures");
      }
    };

    AtomReporter.prototype.reportSuiteResults = function(suite) {};

    AtomReporter.prototype.reportSpecResults = function(spec) {
      this.completeSpecCount++;
      spec.endedAt = Date.now();
      this.specComplete(spec);
      return this.updateStatusView(spec);
    };

    AtomReporter.prototype.reportSpecStarting = function(spec) {
      return this.specStarted(spec);
    };

    AtomReporter.prototype.addDeprecations = function(spec) {
      var deprecation, deprecations, _i, _len;
      deprecations = grim.getDeprecations();
      this.deprecationCount += deprecations.length;
      if (this.deprecationCount > 0) {
        this.deprecations.show();
      }
      if (this.deprecationCount === 1) {
        this.deprecationStatus.text("1 deprecation");
      } else {
        this.deprecationStatus.text("" + this.deprecationCount + " deprecations");
      }
      for (_i = 0, _len = deprecations.length; _i < _len; _i++) {
        deprecation = deprecations[_i];
        this.deprecationList.append($$(function() {
          return this.div({
            "class": 'padded'
          }, (function(_this) {
            return function() {
              var fullStack, stack, _j, _len1, _ref1, _results;
              _this.div({
                "class": 'result-message fail deprecation-message'
              }, deprecation.message);
              _ref1 = deprecation.stacks;
              _results = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                stack = _ref1[_j];
                fullStack = stack.map(function(_arg) {
                  var functionName, location;
                  functionName = _arg.functionName, location = _arg.location;
                  if (functionName === '<unknown>') {
                    return "  at " + location;
                  } else {
                    return "  at " + functionName + " (" + location + ")";
                  }
                });
                _results.push(_this.pre({
                  "class": 'stack-trace padded'
                }, formatStackTrace(spec, deprecation.message, fullStack.join('\n'))));
              }
              return _results;
            };
          })(this));
        }));
      }
      return grim.clearDeprecations();
    };

    AtomReporter.prototype.handleEvents = function() {
      $(document).on("click", ".spec-toggle", (function(_this) {
        return function(_arg) {
          var currentTarget, element, specFailures;
          currentTarget = _arg.currentTarget;
          element = $(currentTarget);
          specFailures = element.parent().find('.spec-failures');
          specFailures.toggle();
          element.toggleClass('folded');
          return false;
        };
      })(this));
      return $(document).on("click", ".deprecation-toggle", (function(_this) {
        return function(_arg) {
          var currentTarget, deprecationList, element;
          currentTarget = _arg.currentTarget;
          element = $(currentTarget);
          deprecationList = $(document).find('.deprecation-list');
          deprecationList.toggle();
          element.toggleClass('folded');
          return false;
        };
      })(this));
    };

    AtomReporter.prototype.updateSpecCounts = function() {
      var specCount;
      if (this.skippedCount) {
        specCount = "" + (this.completeSpecCount - this.skippedCount) + "/" + (this.totalSpecCount - this.skippedCount) + " (" + this.skippedCount + " skipped)";
      } else {
        specCount = "" + this.completeSpecCount + "/" + this.totalSpecCount;
      }
      return this.specCount[0].textContent = specCount;
    };

    AtomReporter.prototype.updateStatusView = function(spec) {
      var rootSuite, time;
      if (this.failedCount > 0) {
        this.status.addClass('alert-danger').removeClass('alert-info');
      }
      this.updateSpecCounts();
      rootSuite = spec.suite;
      while (rootSuite.parentSuite) {
        rootSuite = rootSuite.parentSuite;
      }
      this.message.text(rootSuite.description);
      time = "" + (Math.round((spec.endedAt - this.startedAt) / 10));
      if (time.length < 3) {
        time = "0" + time;
      }
      return this.time[0].textContent = "" + time.slice(0, -2) + "." + time.slice(-2) + "s";
    };

    AtomReporter.prototype.addSpecs = function(specs) {
      var bundledPackageSpecs, coreSpecs, packageFolderName, packageName, spec, specDirectory, symbol, userPackageSpecs, _i, _len;
      coreSpecs = 0;
      bundledPackageSpecs = 0;
      userPackageSpecs = 0;
      for (_i = 0, _len = specs.length; _i < _len; _i++) {
        spec = specs[_i];
        symbol = $$(function() {
          return this.li({
            id: "spec-summary-" + spec.id,
            "class": "spec-summary pending"
          });
        });
        switch (spec.specType) {
          case 'core':
            coreSpecs++;
            this.coreSummary.append(symbol);
            break;
          case 'bundled':
            bundledPackageSpecs++;
            this.bundledSummary.append(symbol);
            break;
          case 'user':
            userPackageSpecs++;
            this.userSummary.append(symbol);
        }
      }
      if (coreSpecs > 0) {
        this.coreHeader.text("Core Specs (" + coreSpecs + ")");
      } else {
        this.coreArea.hide();
      }
      if (bundledPackageSpecs > 0) {
        this.bundledHeader.text("Bundled Package Specs (" + bundledPackageSpecs + ")");
      } else {
        this.bundledArea.hide();
      }
      if (userPackageSpecs > 0) {
        if (coreSpecs === 0 && bundledPackageSpecs === 0) {
          specDirectory = specs[0].specDirectory;
          packageFolderName = path.basename(path.dirname(specDirectory));
          packageName = _.undasherize(_.uncamelcase(packageFolderName));
          return this.userHeader.text("" + packageName + " Specs");
        } else {
          return this.userHeader.text("User Package Specs (" + userPackageSpecs + ")");
        }
      } else {
        return this.userArea.hide();
      }
    };

    AtomReporter.prototype.specStarted = function(spec) {
      return this.runningSpecCount++;
    };

    AtomReporter.prototype.specComplete = function(spec) {
      var results, specSummaryElement, specView;
      specSummaryElement = $("#spec-summary-" + spec.id);
      specSummaryElement.removeClass('pending');
      specSummaryElement.setTooltip({
        title: spec.getFullName(),
        container: '.spec-reporter'
      });
      results = spec.results();
      if (results.skipped) {
        specSummaryElement.addClass("skipped");
        this.skippedCount++;
      } else if (results.passed()) {
        specSummaryElement.addClass("passed");
        this.passedCount++;
      } else {
        specSummaryElement.addClass("failed");
        specView = new SpecResultView(spec);
        specView.attach();
        this.failedCount++;
      }
      return this.addDeprecations(spec);
    };

    return AtomReporter;

  })(View);

  SuiteResultView = (function(_super) {
    __extends(SuiteResultView, _super);

    function SuiteResultView() {
      return SuiteResultView.__super__.constructor.apply(this, arguments);
    }

    SuiteResultView.content = function() {
      return this.div({
        "class": 'suite'
      }, (function(_this) {
        return function() {
          return _this.div({
            outlet: 'description',
            "class": 'description'
          });
        };
      })(this));
    };

    SuiteResultView.prototype.initialize = function(suite) {
      this.suite = suite;
      this.attr('id', "suite-view-" + this.suite.id);
      return this.description.text(this.suite.description);
    };

    SuiteResultView.prototype.attach = function() {
      return (this.parentSuiteView() || $('.results')).append(this);
    };

    SuiteResultView.prototype.parentSuiteView = function() {
      var suiteView;
      if (!this.suite.parentSuite) {
        return;
      }
      if (!(suiteView = $("#suite-view-" + this.suite.parentSuite.id).view())) {
        suiteView = new SuiteResultView(this.suite.parentSuite);
        suiteView.attach();
      }
      return suiteView;
    };

    return SuiteResultView;

  })(View);

  SpecResultView = (function(_super) {
    __extends(SpecResultView, _super);

    function SpecResultView() {
      return SpecResultView.__super__.constructor.apply(this, arguments);
    }

    SpecResultView.content = function() {
      return this.div({
        "class": 'spec'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'spec-toggle'
          });
          _this.div({
            outlet: 'description',
            "class": 'description'
          });
          return _this.div({
            outlet: 'specFailures',
            "class": 'spec-failures'
          });
        };
      })(this));
    };

    SpecResultView.prototype.initialize = function(spec) {
      var description, result, stackTrace, _i, _len, _ref1, _results;
      this.spec = spec;
      this.addClass("spec-view-" + this.spec.id);
      description = this.spec.description;
      if (description.indexOf('it ') !== 0) {
        description = "it " + description;
      }
      this.description.text(description);
      _ref1 = this.spec.results().getItems();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        result = _ref1[_i];
        if (!(!result.passed())) {
          continue;
        }
        stackTrace = formatStackTrace(this.spec, result.message, result.trace.stack);
        _results.push(this.specFailures.append($$(function() {
          this.div(result.message, {
            "class": 'result-message fail'
          });
          if (stackTrace) {
            return this.pre(stackTrace, {
              "class": 'stack-trace padded'
            });
          }
        })));
      }
      return _results;
    };

    SpecResultView.prototype.attach = function() {
      return this.parentSuiteView().append(this);
    };

    SpecResultView.prototype.parentSuiteView = function() {
      var suiteView;
      if (!(suiteView = $("#suite-view-" + this.spec.suite.id).view())) {
        suiteView = new SuiteResultView(this.spec.suite);
        suiteView.attach();
      }
      return suiteView;
    };

    return SpecResultView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdJQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQyxvQkFBcUIsT0FBQSxDQUFRLGFBQVIsRUFBckIsaUJBRkQsQ0FBQTs7QUFBQSxFQUdBLE9BQWdCLE9BQUEsQ0FBUSw2QkFBUixDQUFoQixFQUFDLFlBQUEsSUFBRCxFQUFPLFNBQUEsQ0FBUCxFQUFVLFVBQUEsRUFIVixDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSlAsQ0FBQTs7QUFBQSxFQU1BLFVBQUEsR0FBYSxFQU5iLENBQUE7O0FBQUEsRUFPQSxnQkFBQSxHQUFtQixTQUFDLElBQUQsRUFBTyxPQUFQLEVBQW1CLFVBQW5CLEdBQUE7QUFDakIsUUFBQSw4SUFBQTs7TUFEd0IsVUFBUTtLQUNoQztBQUFBLElBQUEsSUFBQSxDQUFBLFVBQUE7QUFBQSxhQUFPLFVBQVAsQ0FBQTtLQUFBO0FBQUEsSUFFQSxjQUFBLEdBQWlCLDREQUZqQixDQUFBO0FBQUEsSUFHQSx1QkFBQSxHQUEwQiwwREFIMUIsQ0FBQTtBQUFBLElBSUEsY0FBQSxHQUFpQixFQUpqQixDQUFBO0FBS0E7QUFBQSxTQUFBLDRDQUFBO3VCQUFBO0FBQ0UsTUFBQSxJQUFBLENBQUEsY0FBK0MsQ0FBQyxJQUFmLENBQW9CLElBQXBCLENBQWpDO0FBQUEsUUFBQSxjQUFjLENBQUMsSUFBZixDQUFvQixJQUFwQixDQUFBLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBUyx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixJQUE3QixDQUFUO0FBQUEsY0FBQTtPQUZGO0FBQUEsS0FM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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/atom-reporter.coffee