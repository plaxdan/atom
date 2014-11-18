(function() {
  var $, Config, Grim, KeymapManager, Point, Project, TextEditor, TextEditorComponent, TextEditorView, TokenizedBuffer, Workspace, WorkspaceView, addCustomMatchers, clipboard, commandsToRestore, emitObject, ensureNoDeprecatedFunctionsCalled, ensureNoPathSubscriptions, fixturePackagesPath, fs, isCoreSpec, keyBindingsToRestore, path, pathwatcher, resourcePath, specDirectory, specPackageName, specPackagePath, specProjectPath, _, _ref, _ref1, _ref2,
    __slice = [].slice;

  require('../src/window');

  atom.initialize();

  atom.restoreWindowDimensions();

  require('../vendor/jasmine-jquery');

  path = require('path');

  _ = require('underscore-plus');

  fs = require('fs-plus');

  Grim = require('grim');

  KeymapManager = require('../src/keymap-extensions');

  _ref = require('atom'), $ = _ref.$, WorkspaceView = _ref.WorkspaceView, Workspace = _ref.Workspace;

  Config = require('../src/config');

  Point = require('text-buffer').Point;

  Project = require('../src/project');

  TextEditor = require('../src/text-editor');

  TextEditorView = require('../src/text-editor-view');

  TokenizedBuffer = require('../src/tokenized-buffer');

  TextEditorComponent = require('../src/text-editor-component');

  pathwatcher = require('pathwatcher');

  clipboard = require('clipboard');

  atom.themes.loadBaseStylesheets();

  atom.themes.requireStylesheet('../static/jasmine');

  atom.themes.initialLoadComplete = true;

  fixturePackagesPath = path.resolve(__dirname, './fixtures/packages');

  atom.packages.packageDirPaths.unshift(fixturePackagesPath);

  atom.keymaps.loadBundledKeymaps();

  keyBindingsToRestore = atom.keymaps.getKeyBindings();

  commandsToRestore = atom.commands.getSnapshot();

  $(window).on('core:close', function() {
    return window.close();
  });

  $(window).on('beforeunload', function() {
    atom.storeWindowDimensions();
    return atom.saveSync();
  });

  $('html,body').css('overflow', 'auto');

  jasmine.getEnv().addEqualityTester(_.isEqual);

  if (process.platform === 'win32' && process.env.JANKY_SHA1) {
    jasmine.getEnv().defaultTimeoutInterval = 60000;
  } else {
    jasmine.getEnv().defaultTimeoutInterval = 5000;
  }

  specPackageName = null;

  specPackagePath = null;

  specProjectPath = null;

  isCoreSpec = false;

  _ref1 = atom.getLoadSettings(), specDirectory = _ref1.specDirectory, resourcePath = _ref1.resourcePath;

  if (specDirectory) {
    specPackagePath = path.resolve(specDirectory, '..');
    try {
      specPackageName = (_ref2 = JSON.parse(fs.readFileSync(path.join(specPackagePath, 'package.json')))) != null ? _ref2.name : void 0;
    } catch (_error) {}
    specProjectPath = path.join(specDirectory, 'fixtures');
  }

  isCoreSpec = specDirectory === fs.realpathSync(__dirname);

  beforeEach(function() {
    var clipboardContent, config, projectPath, resolvePackagePath, serializedWindowState, spy;
    if (isCoreSpec) {
      Grim.clearDeprecations();
    }
    $.fx.off = true;
    projectPath = specProjectPath != null ? specProjectPath : path.join(this.specDirectory, 'fixtures');
    atom.project = new Project({
      path: projectPath
    });
    atom.workspace = new Workspace();
    atom.keymaps.keyBindings = _.clone(keyBindingsToRestore);
    atom.commands.setRootNode(document.body);
    atom.commands.restoreSnapshot(commandsToRestore);
    window.resetTimeouts();
    atom.packages.packageStates = {};
    serializedWindowState = null;
    spyOn(atom, 'saveSync');
    atom.syntax.clearGrammarOverrides();
    atom.syntax.clearProperties();
    spy = spyOn(atom.packages, 'resolvePackagePath').andCallFake(function(packageName) {
      if (specPackageName && packageName === specPackageName) {
        return resolvePackagePath(specPackagePath);
      } else {
        return resolvePackagePath(packageName);
      }
    });
    resolvePackagePath = _.bind(spy.originalValue, atom.packages);
    spyOn(atom.menu, 'sendToBrowserProcess');
    config = new Config({
      resourcePath: resourcePath,
      configDirPath: atom.getConfigDirPath()
    });
    spyOn(config, 'load');
    spyOn(config, 'save');
    config.setDefaults('core', WorkspaceView.configDefaults);
    config.setDefaults('editor', TextEditorView.configDefaults);
    config.set("core.destroyEmptyPanes", false);
    config.set("editor.fontFamily", "Courier");
    config.set("editor.fontSize", 16);
    config.set("editor.autoIndent", false);
    config.set("core.disabledPackages", ["package-that-throws-an-exception", "package-with-broken-package-json", "package-with-broken-keymap"]);
    config.save.reset();
    atom.config = config;
    spyOn(TextEditorView.prototype, 'requestDisplayUpdate').andCallFake(function() {
      return this.updateDisplay();
    });
    TextEditorComponent.performSyncUpdates = true;
    spyOn(WorkspaceView.prototype, 'setTitle').andCallFake(function(title) {
      this.title = title;
    });
    spyOn(window, "setTimeout").andCallFake(window.fakeSetTimeout);
    spyOn(window, "clearTimeout").andCallFake(window.fakeClearTimeout);
    spyOn(pathwatcher.File.prototype, "detectResurrectionAfterDelay").andCallFake(function() {
      return this.detectResurrection();
    });
    spyOn(TextEditor.prototype, "shouldPromptToSave").andReturn(false);
    TokenizedBuffer.prototype.chunkSize = Infinity;
    spyOn(TokenizedBuffer.prototype, "tokenizeInBackground").andCallFake(function() {
      return this.tokenizeNextChunk();
    });
    clipboardContent = 'initial clipboard content';
    spyOn(clipboard, 'writeText').andCallFake(function(text) {
      return clipboardContent = text;
    });
    spyOn(clipboard, 'readText').andCallFake(function() {
      return clipboardContent;
    });
    return addCustomMatchers(this);
  });

  afterEach(function() {
    var _ref3, _ref4;
    atom.packages.deactivatePackages();
    atom.menu.template = [];
    if ((_ref3 = atom.workspaceView) != null) {
      if (typeof _ref3.remove === "function") {
        _ref3.remove();
      }
    }
    atom.workspaceView = null;
    delete atom.state.workspace;
    if ((_ref4 = atom.project) != null) {
      _ref4.destroy();
    }
    atom.project = null;
    atom.themes.removeStylesheet('global-editor-styles');
    delete atom.state.packageStates;
    if (!window.debugContent) {
      $('#jasmine-content').empty();
    }
    jasmine.unspy(atom, 'saveSync');
    ensureNoPathSubscriptions();
    atom.syntax.clearObservers();
    return waits(0);
  });

  ensureNoPathSubscriptions = function() {
    var watchedPaths;
    watchedPaths = pathwatcher.getWatchedPaths();
    pathwatcher.closeAllWatchers();
    if (watchedPaths.length > 0) {
      throw new Error("Leaking subscriptions for paths: " + watchedPaths.join(", "));
    }
  };

  ensureNoDeprecatedFunctionsCalled = function() {
    var deprecations, error, originalPrepareStackTrace;
    deprecations = Grim.getDeprecations();
    if (deprecations.length > 0) {
      originalPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = function(error, stack) {
        var deprecation, functionName, location, output, _i, _j, _k, _len, _len1, _len2, _ref3, _ref4;
        output = [];
        for (_i = 0, _len = deprecations.length; _i < _len; _i++) {
          deprecation = deprecations[_i];
          output.push("" + deprecation.originName + " is deprecated. " + deprecation.message);
          output.push(_.multiplyString("-", output[output.length - 1].length));
          _ref3 = deprecation.getStacks();
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            stack = _ref3[_j];
            for (_k = 0, _len2 = stack.length; _k < _len2; _k++) {
              _ref4 = stack[_k], functionName = _ref4.functionName, location = _ref4.location;
              output.push("" + functionName + " -- " + location);
            }
          }
          output.push("");
        }
        return output.join("\n");
      };
      error = new Error("Deprecated function(s) " + (deprecations.map(function(_arg) {
        var originName;
        originName = _arg.originName;
        return originName;
      }).join(', ')) + ") were called.");
      error.stack;
      Error.prepareStackTrace = originalPrepareStackTrace;
      throw error;
    }
  };

  emitObject = jasmine.StringPrettyPrinter.prototype.emitObject;

  jasmine.StringPrettyPrinter.prototype.emitObject = function(obj) {
    if (obj.inspect) {
      return this.append(obj.inspect());
    } else {
      return emitObject.call(this, obj);
    }
  };

  jasmine.unspy = function(object, methodName) {
    if (!object[methodName].hasOwnProperty('originalValue')) {
      throw new Error("Not a spy");
    }
    return object[methodName] = object[methodName].originalValue;
  };

  addCustomMatchers = function(spec) {
    return spec.addMatchers({
      toBeInstanceOf: function(expected) {
        var notText;
        notText = this.isNot ? " not" : "";
        this.message = (function(_this) {
          return function() {
            return "Expected " + (jasmine.pp(_this.actual)) + " to" + notText + " be instance of " + expected.name + " class";
          };
        })(this);
        return this.actual instanceof expected;
      },
      toHaveLength: function(expected) {
        var notText;
        if (this.actual == null) {
          this.message = (function(_this) {
            return function() {
              return "Expected object " + _this.actual + " has no length method";
            };
          })(this);
          return false;
        } else {
          notText = this.isNot ? " not" : "";
          this.message = (function(_this) {
            return function() {
              return "Expected object with length " + _this.actual.length + " to" + notText + " have length " + expected;
            };
          })(this);
          return this.actual.length === expected;
        }
      },
      toExistOnDisk: function(expected) {
        var notText;
        notText = this.isNot && " not" || "";
        this.message = function() {
          return "Expected path '" + this.actual + "'" + notText + " to exist.";
        };
        return fs.existsSync(this.actual);
      },
      toHaveFocus: function() {
        var element, notText;
        notText = this.isNot && " not" || "";
        if (!document.hasFocus()) {
          console.error("Specs will fail because the Dev Tools have focus. To fix this close the Dev Tools or click the spec runner.");
        }
        this.message = function() {
          return "Expected element '" + this.actual + "' or its descendants" + notText + " to have focus.";
        };
        element = this.actual;
        if (element.jquery) {
          element = element.get(0);
        }
        return element.webkitMatchesSelector(":focus") || element.querySelector(":focus");
      },
      toShow: function() {
        var element, notText, _ref3;
        notText = this.isNot ? " not" : "";
        element = this.actual;
        if (element.jquery) {
          element = element.get(0);
        }
        this.message = function() {
          return "Expected element '" + element + "' or its descendants " + notText + " to show.";
        };
        return (_ref3 = element.style.display) === 'block' || _ref3 === 'inline-block' || _ref3 === 'static' || _ref3 === 'fixed';
      }
    });
  };

  window.keyIdentifierForKey = function(key) {
    var charCode;
    if (key.length > 1) {
      return key;
    } else {
      charCode = key.toUpperCase().charCodeAt(0);
      return "U+00" + charCode.toString(16);
    }
  };

  window.keydownEvent = function(key, properties) {
    var originalEvent, originalEventProperties, _ref3, _ref4;
    if (properties == null) {
      properties = {};
    }
    originalEventProperties = {};
    originalEventProperties.ctrl = properties.ctrlKey;
    originalEventProperties.alt = properties.altKey;
    originalEventProperties.shift = properties.shiftKey;
    originalEventProperties.cmd = properties.metaKey;
    originalEventProperties.target = (_ref3 = (_ref4 = properties.target) != null ? _ref4[0] : void 0) != null ? _ref3 : properties.target;
    originalEventProperties.which = properties.which;
    originalEvent = KeymapManager.keydownEvent(key, originalEventProperties);
    properties = $.extend({
      originalEvent: originalEvent
    }, properties);
    return $.Event("keydown", properties);
  };

  window.mouseEvent = function(type, properties) {
    var editorView, left, point, top, _ref3;
    if (properties.point) {
      point = properties.point, editorView = properties.editorView;
      _ref3 = this.pagePixelPositionForPoint(editorView, point), top = _ref3.top, left = _ref3.left;
      properties.pageX = left + 1;
      properties.pageY = top + 1;
    }
    if (properties.originalEvent == null) {
      properties.originalEvent = {
        detail: 1
      };
    }
    return $.Event(type, properties);
  };

  window.clickEvent = function(properties) {
    if (properties == null) {
      properties = {};
    }
    return window.mouseEvent("click", properties);
  };

  window.mousedownEvent = function(properties) {
    if (properties == null) {
      properties = {};
    }
    return window.mouseEvent('mousedown', properties);
  };

  window.mousemoveEvent = function(properties) {
    if (properties == null) {
      properties = {};
    }
    return window.mouseEvent('mousemove', properties);
  };

  window.waitsForPromise = function() {
    var args, fn, shouldReject, timeout, _ref3;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (args.length > 1) {
      _ref3 = args[0], shouldReject = _ref3.shouldReject, timeout = _ref3.timeout;
    } else {
      shouldReject = false;
    }
    fn = _.last(args);
    return window.waitsFor(timeout, function(moveOn) {
      var promise;
      promise = fn();
      if (shouldReject) {
        promise.fail(moveOn);
        return promise.done(function() {
          jasmine.getEnv().currentSpec.fail("Expected promise to be rejected, but it was resolved");
          return moveOn();
        });
      } else {
        promise.done(moveOn);
        return promise.fail(function(error) {
          jasmine.getEnv().currentSpec.fail("Expected promise to be resolved, but it was rejected with " + (jasmine.pp(error)));
          return moveOn();
        });
      }
    });
  };

  window.resetTimeouts = function() {
    window.now = 0;
    window.timeoutCount = 0;
    window.intervalCount = 0;
    window.timeouts = [];
    return window.intervalTimeouts = {};
  };

  window.fakeSetTimeout = function(callback, ms) {
    var id;
    id = ++window.timeoutCount;
    window.timeouts.push([id, window.now + ms, callback]);
    return id;
  };

  window.fakeClearTimeout = function(idToClear) {
    return window.timeouts = window.timeouts.filter(function(_arg) {
      var id;
      id = _arg[0];
      return id !== idToClear;
    });
  };

  window.fakeSetInterval = function(callback, ms) {
    var action, id;
    id = ++window.intervalCount;
    action = function() {
      callback();
      return window.intervalTimeouts[id] = window.fakeSetTimeout(action, ms);
    };
    window.intervalTimeouts[id] = window.fakeSetTimeout(action, ms);
    return id;
  };

  window.fakeClearInterval = function(idToClear) {
    return window.fakeClearTimeout(this.intervalTimeouts[idToClear]);
  };

  window.advanceClock = function(delta) {
    var callback, callbacks, _i, _len, _results;
    if (delta == null) {
      delta = 1;
    }
    window.now += delta;
    callbacks = [];
    window.timeouts = window.timeouts.filter(function(_arg) {
      var callback, id, strikeTime;
      id = _arg[0], strikeTime = _arg[1], callback = _arg[2];
      if (strikeTime <= window.now) {
        callbacks.push(callback);
        return false;
      } else {
        return true;
      }
    });
    _results = [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      callback = callbacks[_i];
      _results.push(callback());
    }
    return _results;
  };

  window.pagePixelPositionForPoint = function(editorView, point) {
    var left, top;
    point = Point.fromObject(point);
    top = editorView.renderedLines.offset().top + point.row * editorView.lineHeight;
    left = editorView.renderedLines.offset().left + point.column * editorView.charWidth - editorView.renderedLines.scrollLeft();
    return {
      top: top,
      left: left
    };
  };

  window.tokensText = function(tokens) {
    return _.pluck(tokens, 'value').join('');
  };

  window.setEditorWidthInChars = function(editorView, widthInChars, charWidth) {
    if (charWidth == null) {
      charWidth = editorView.charWidth;
    }
    editorView.width(charWidth * widthInChars + editorView.gutter.outerWidth());
    return $(window).trigger('resize');
  };

  window.setEditorHeightInLines = function(editorView, heightInLines, lineHeight) {
    var _ref3;
    if (lineHeight == null) {
      lineHeight = editorView.lineHeight;
    }
    if (editorView.hasClass('react')) {
      editorView.height(editorView.getEditor().getLineHeightInPixels() * heightInLines);
      return (_ref3 = editorView.component) != null ? _ref3.measureHeightAndWidth() : void 0;
    } else {
      editorView.height(lineHeight * heightInLines + editorView.renderedLines.position().top);
      return $(window).trigger('resize');
    }
  };

  $.fn.resultOfTrigger = function(type) {
    var event;
    event = $.Event(type);
    this.trigger(event);
    return event.result;
  };

  $.fn.enableKeymap = function() {
    return this.on('keydown', function(e) {
      var originalEvent, _ref3;
      originalEvent = (_ref3 = e.originalEvent) != null ? _ref3 : e;
      if (originalEvent.target == null) {
        Object.defineProperty(originalEvent, 'target', {
          get: function() {
            return e.target;
          }
        });
      }
      atom.keymaps.handleKeyboardEvent(originalEvent);
      return !e.originalEvent.defaultPrevented;
    });
  };

  $.fn.attachToDom = function() {
    return this.appendTo($('#jasmine-content'));
  };

  $.fn.simulateDomAttachment = function() {
    return $('<html>').append(this);
  };

  $.fn.textInput = function(data) {
    return this.each(function() {
      var event;
      event = document.createEvent('TextEvent');
      event.initTextEvent('textInput', true, true, window, data);
      event = $.event.fix(event);
      return $(this).trigger(event);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBiQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxPQUFBLENBQVEsZUFBUixDQUFBLENBQUE7O0FBQUEsRUFDQSxJQUFJLENBQUMsVUFBTCxDQUFBLENBREEsQ0FBQTs7QUFBQSxFQUVBLElBQUksQ0FBQyx1QkFBTCxDQUFBLENBRkEsQ0FBQTs7QUFBQSxFQUlBLE9BQUEsQ0FBUSwwQkFBUixDQUpBLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQU5KLENBQUE7O0FBQUEsRUFPQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FQTCxDQUFBOztBQUFBLEVBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBUlAsQ0FBQTs7QUFBQSxFQVNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDBCQUFSLENBVGhCLENBQUE7O0FBQUEsRUFVQSxPQUFnQyxPQUFBLENBQVEsTUFBUixDQUFoQyxFQUFDLFNBQUEsQ0FBRCxFQUFJLHFCQUFBLGFBQUosRUFBbUIsaUJBQUEsU0FWbkIsQ0FBQTs7QUFBQSxFQVdBLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUixDQVhULENBQUE7O0FBQUEsRUFZQyxRQUFTLE9BQUEsQ0FBUSxhQUFSLEVBQVQsS0FaRCxDQUFBOztBQUFBLEVBYUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxnQkFBUixDQWJWLENBQUE7O0FBQUEsRUFjQSxVQUFBLEdBQWEsT0FBQSxDQUFRLG9CQUFSLENBZGIsQ0FBQTs7QUFBQSxFQWVBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHlCQUFSLENBZmpCLENBQUE7O0FBQUEsRUFnQkEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0Fo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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/spec-helper.coffee