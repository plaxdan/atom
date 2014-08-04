(function() {
  var $, Config, Editor, EditorComponent, EditorView, Grim, KeymapManager, Point, Project, TokenizedBuffer, Workspace, WorkspaceView, addCustomMatchers, clipboard, emitObject, ensureNoDeprecatedFunctionsCalled, ensureNoPathSubscriptions, fixturePackagesPath, fs, isCoreSpec, keyBindingsToRestore, path, pathwatcher, resourcePath, specDirectory, specPackageName, specPackagePath, specProjectPath, _, _ref, _ref1, _ref2,
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

  Editor = require('../src/editor');

  EditorView = require('../src/editor-view');

  TokenizedBuffer = require('../src/tokenized-buffer');

  EditorComponent = require('../src/editor-component');

  pathwatcher = require('pathwatcher');

  clipboard = require('clipboard');

  atom.themes.loadBaseStylesheets();

  atom.themes.requireStylesheet('../static/jasmine');

  fixturePackagesPath = path.resolve(__dirname, './fixtures/packages');

  atom.packages.packageDirPaths.unshift(fixturePackagesPath);

  atom.keymaps.loadBundledKeymaps();

  keyBindingsToRestore = atom.keymaps.getKeyBindings();

  $(window).on('core:close', function() {
    return window.close();
  });

  $(window).on('unload', function() {
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
    config.setDefaults('editor', EditorView.configDefaults);
    config.set("core.destroyEmptyPanes", false);
    config.set("editor.fontFamily", "Courier");
    config.set("editor.fontSize", 16);
    config.set("editor.autoIndent", false);
    config.set("core.disabledPackages", ["package-that-throws-an-exception", "package-with-broken-package-json", "package-with-broken-keymap"]);
    config.set("core.useReactEditor", true);
    config.save.reset();
    atom.config = config;
    spyOn(EditorView.prototype, 'requestDisplayUpdate').andCallFake(function() {
      return this.updateDisplay();
    });
    EditorComponent.performSyncUpdates = true;
    spyOn(WorkspaceView.prototype, 'setTitle').andCallFake(function(title) {
      this.title = title;
    });
    spyOn(window, "setTimeout").andCallFake(window.fakeSetTimeout);
    spyOn(window, "clearTimeout").andCallFake(window.fakeClearTimeout);
    spyOn(pathwatcher.File.prototype, "detectResurrectionAfterDelay").andCallFake(function() {
      return this.detectResurrection();
    });
    spyOn(Editor.prototype, "shouldPromptToSave").andReturn(false);
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
    delete atom.state.packageStates;
    if (!window.debugContent) {
      $('#jasmine-content').empty();
    }
    jasmine.unspy(atom, 'saveSync');
    ensureNoPathSubscriptions();
    atom.syntax.off();
    if (isCoreSpec) {
      ensureNoDeprecatedFunctionsCalled();
    }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJaQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxPQUFBLENBQVEsZUFBUixDQUFBLENBQUE7O0FBQUEsRUFDQSxJQUFJLENBQUMsVUFBTCxDQUFBLENBREEsQ0FBQTs7QUFBQSxFQUVBLElBQUksQ0FBQyx1QkFBTCxDQUFBLENBRkEsQ0FBQTs7QUFBQSxFQUlBLE9BQUEsQ0FBUSwwQkFBUixDQUpBLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQU5KLENBQUE7O0FBQUEsRUFPQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FQTCxDQUFBOztBQUFBLEVBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBUlAsQ0FBQTs7QUFBQSxFQVNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDBCQUFSLENBVGhCLENBQUE7O0FBQUEsRUFVQSxPQUFnQyxPQUFBLENBQVEsTUFBUixDQUFoQyxFQUFDLFNBQUEsQ0FBRCxFQUFJLHFCQUFBLGFBQUosRUFBbUIsaUJBQUEsU0FWbkIsQ0FBQTs7QUFBQSxFQVdBLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUixDQVhULENBQUE7O0FBQUEsRUFZQyxRQUFTLE9BQUEsQ0FBUSxhQUFSLEVBQVQsS0FaRCxDQUFBOztBQUFBLEVBYUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxnQkFBUixDQWJWLENBQUE7O0FBQUEsRUFjQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVIsQ0FkVCxDQUFBOztBQUFBLEVBZUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxvQkFBUixDQWZiLENBQUE7O0FBQUEsRUFnQkEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FoQmxC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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/spec-helper.coffee