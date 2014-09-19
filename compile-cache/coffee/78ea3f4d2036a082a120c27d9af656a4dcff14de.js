(function() {
  "use strict";
  var LoadingView, MessagePanelView, PlainMessageView, Subscriber, beautifier, beautify, defaultLanguageOptions, editorconfig, findConfig, findFile, findFileResults, fs, getConfigOptionsFromSettings, getCursors, getUserHome, handleSaveEvent, languages, path, plugin, setCursors, strip, verifyExists, yaml, _;

  plugin = module.exports;

  _ = require("lodash");

  beautifier = require("./language-options");

  languages = beautifier.languages;

  defaultLanguageOptions = beautifier.defaultLanguageOptions;

  fs = null;

  path = null;

  strip = null;

  yaml = null;

  LoadingView = null;

  MessagePanelView = null;

  PlainMessageView = null;

  editorconfig = null;

  findFileResults = {};

  getUserHome = function() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  };

  getCursors = function(editor) {
    var bufferPosition, cursor, cursors, posArray, _i, _len;
    cursors = editor.getCursors();
    posArray = [];
    for (_i = 0, _len = cursors.length; _i < _len; _i++) {
      cursor = cursors[_i];
      bufferPosition = cursor.getBufferPosition();
      posArray.push([bufferPosition.row, bufferPosition.column]);
    }
    return posArray;
  };

  setCursors = function(editor, posArray) {
    var bufferPosition, i, _i, _len;
    for (i = _i = 0, _len = posArray.length; _i < _len; i = ++_i) {
      bufferPosition = posArray[i];
      if (i === 0) {
        editor.setCursorBufferPosition(bufferPosition);
        continue;
      }
      editor.addCursorAtBufferPosition(bufferPosition);
    }
  };

  verifyExists = function(fullPath) {
    if (fs == null) {
      fs = require("fs");
    }
    if (fs.existsSync(fullPath)) {
      return fullPath;
    } else {
      return null;
    }
  };


  /*
  Searches for a file with a specified name starting with
  'dir' and going all the way up either until it finds the file
  or hits the root.
  
  @param {string} name filename to search for (e.g. .jshintrc)
  @param {string} dir directory to start search from (default:
  current working directory)
  @param {boolean} upwards should recurse upwards on failure? (default: true)
  
  @returns {string} normalized filename
   */

  findFile = function(name, dir, upwards) {
    var filename, parent;
    if (upwards == null) {
      upwards = true;
    }
    if (path == null) {
      path = require("path");
    }
    dir = dir || process.cwd();
    filename = path.normalize(path.join(dir, name));
    if (findFileResults[filename] !== undefined) {
      return findFileResults[filename];
    }
    parent = path.resolve(dir, "../");
    if (verifyExists(filename)) {
      findFileResults[filename] = filename;
      return filename;
    }
    if (dir === parent) {
      findFileResults[filename] = null;
      return null;
    }
    if (upwards) {
      return findFile(name, parent);
    } else {
      return null;
    }
  };


  /*
  Tries to find a configuration file in either project directory
  or in the home directory. Configuration files are named
  '.jsbeautifyrc'.
  
  @param {string} config name of the configuration file
  @param {string} file path to the file to be linted
  @param {boolean} upwards should recurse upwards on failure? (default: true)
  
  @returns {string} a path to the config file
   */

  findConfig = function(config, file, upwards) {
    var dir, envs, home, proj;
    if (upwards == null) {
      upwards = true;
    }
    if (path == null) {
      path = require("path");
    }
    dir = path.dirname(path.resolve(file));
    envs = getUserHome();
    home = path.normalize(path.join(envs, config));
    proj = findFile(config, dir, upwards);
    if (proj) {
      return proj;
    }
    if (verifyExists(home)) {
      return home;
    }
    return null;
  };

  getConfigOptionsFromSettings = function(langs) {
    var config, options;
    config = atom.config.getSettings()["atom-beautify"];
    options = {};
    _.every(_.keys(config), function(k) {
      var idx, lang, opt, p;
      p = k.split("_")[0];
      idx = _.indexOf(langs, p);
      if (idx >= 0) {
        lang = langs[idx];
        opt = k.replace(new RegExp("^" + lang + "_"), "");
        options[lang] = options[lang] || {};
        options[lang][opt] = config[k];
      }
      return true;
    });
    return options;
  };

  beautify = function() {
    var allOptions, beautifyCompleted, configOptions, e, editedFilePath, editor, editorConfigOptions, editorOptions, forceEntireFile, getConfig, grammarName, homeOptions, isSelection, oldText, p, pc, pf, projectOptions, showError, softTabs, tabLength, text, userHome;
    if (path == null) {
      path = require("path");
    }
    if (MessagePanelView == null) {
      MessagePanelView = require('atom-message-panel').MessagePanelView;
    }
    if (PlainMessageView == null) {
      PlainMessageView = require('atom-message-panel').PlainMessageView;
    }
    if (LoadingView == null) {
      LoadingView = require("./loading-view");
    }
    if (this.messagePanel == null) {
      this.messagePanel = new MessagePanelView({
        title: 'Atom Beautify Error Messages'
      });
    }
    if (this.loadingView == null) {
      this.loadingView = new LoadingView();
    }
    this.loadingView.show();
    forceEntireFile = atom.config.get("atom-beautify.beautifyEntireFileOnSave");
    showError = (function(_this) {
      return function(e) {
        _this.loadingView.hide();
        _this.messagePanel.attach();
        return _this.messagePanel.add(new PlainMessageView({
          message: e.message,
          className: 'text-error'
        }));
      };
    })(this);
    getConfig = function(startPath, upwards) {
      var configPath, contents, e, externalOptions;
      if (upwards == null) {
        upwards = true;
      }
      startPath = (typeof startPath === "string" ? startPath : "");
      if (!startPath) {
        return {};
      }
      configPath = findConfig(".jsbeautifyrc", startPath, upwards);
      externalOptions = void 0;
      if (configPath) {
        if (fs == null) {
          fs = require("fs");
        }
        contents = fs.readFileSync(configPath, {
          encoding: "utf8"
        });
        if (!contents) {
          externalOptions = {};
        } else {
          try {
            if (strip == null) {
              strip = require("strip-json-comments");
            }
            externalOptions = JSON.parse(strip(contents));
          } catch (_error) {
            e = _error;
            console.log("Failed parsing config as JSON: " + configPath);
            try {
              if (yaml == null) {
                yaml = require("js-yaml");
              }
              externalOptions = yaml.safeLoad(contents);
            } catch (_error) {
              e = _error;
              console.log("Failed parsing config as YAML: " + configPath);
              externalOptions = {};
            }
          }
        }
      } else {
        externalOptions = {};
      }
      return externalOptions;
    };
    beautifyCompleted = (function(_this) {
      return function(text) {
        var origScrollTop, posArray, selectedBufferRange;
        if (text instanceof Error) {
          showError(text);
        } else if (oldText !== text) {
          posArray = getCursors(editor);
          origScrollTop = editor.getScrollTop();
          if (!forceEntireFile && isSelection) {
            selectedBufferRange = editor.getSelectedBufferRange();
            editor.setTextInBufferRange(selectedBufferRange, text);
          } else {
            editor.setText(text);
          }
          setCursors(editor, posArray);
          setTimeout((function() {
            editor.setScrollTop(origScrollTop);
          }), 0);
        }
        _this.loadingView.hide();
      };
    })(this);
    editor = atom.workspace.getActiveEditor();
    isSelection = !!editor.getSelectedText();
    softTabs = editor.softTabs;
    tabLength = editor.getTabLength();
    editorOptions = {
      indent_size: (softTabs ? tabLength : 1),
      indent_char: (softTabs ? " " : "\t"),
      indent_with_tabs: !softTabs
    };
    configOptions = getConfigOptionsFromSettings(languages);
    editedFilePath = editor.getPath();
    userHome = getUserHome();
    homeOptions = getConfig(path.join(userHome, "FAKEFILENAME"), false);
    if (editedFilePath != null) {
      if (editorconfig == null) {
        editorconfig = require('editorconfig');
      }
      editorConfigOptions = editorconfig.parse(editedFilePath);
      if (editorConfigOptions.indent_style === 'space') {
        editorConfigOptions.indent_char = " ";
      } else if (editorConfigOptions.indent_style === 'tab') {
        editorConfigOptions.indent_char = "\t";
        editorConfigOptions.indent_with_tabs = true;
        if (editorConfigOptions.tab_width) {
          editorConfigOptions.indent_size = editorConfigOptions.tab_width;
        }
      }
      projectOptions = [];
      p = path.dirname(editedFilePath);
      while (p !== path.resolve(p, "../")) {
        pf = path.join(p, "FAKEFILENAME");
        pc = getConfig(pf, false);
        projectOptions.push(pc);
        p = path.resolve(p, "../");
      }
    } else {
      editorConfigOptions = {};
      projectOptions = [];
    }
    allOptions = [editorOptions, configOptions, homeOptions, editorConfigOptions];
    allOptions = allOptions.concat(projectOptions);
    text = void 0;
    if (!forceEntireFile && isSelection) {
      text = editor.getSelectedText();
    } else {
      text = editor.getText();
    }
    oldText = text;
    grammarName = editor.getGrammar().name;
    try {
      beautifier.beautify(text, grammarName, allOptions, beautifyCompleted);
    } catch (_error) {
      e = _error;
      showError(e);
    }
  };

  handleSaveEvent = (function(_this) {
    return function() {
      atom.workspace.eachEditor(function(editor) {
        var buffer, events;
        buffer = editor.getBuffer();
        plugin.unsubscribe(buffer);
        if (atom.config.get("atom-beautify.beautifyOnSave")) {
          events = "will-be-saved";
          plugin.subscribe(buffer, events, beautify.bind(_this));
        }
      });
    };
  })(this);

  Subscriber = require("emissary").Subscriber;

  Subscriber.extend(plugin);

  plugin.configDefaults = _.merge({
    analytics: true,
    beautifyOnSave: false,
    beautifyEntireFileOnSave: true
  }, defaultLanguageOptions);

  plugin.activate = function() {
    handleSaveEvent();
    plugin.subscribe(atom.config.observe("atom-beautify.beautifyOnSave", handleSaveEvent));
    return atom.workspaceView.command("beautify", beautify);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBRUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsNlNBQUE7O0FBQUEsRUFFQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BRmhCLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxvQkFBUixDQUpiLENBQUE7O0FBQUEsRUFLQSxTQUFBLEdBQVksVUFBVSxDQUFDLFNBTHZCLENBQUE7O0FBQUEsRUFNQSxzQkFBQSxHQUF5QixVQUFVLENBQUMsc0JBTnBDLENBQUE7O0FBQUEsRUFRQSxFQUFBLEdBQUssSUFSTCxDQUFBOztBQUFBLEVBU0EsSUFBQSxHQUFPLElBVFAsQ0FBQTs7QUFBQSxFQVVBLEtBQUEsR0FBUSxJQVZSLENBQUE7O0FBQUEsRUFXQSxJQUFBLEdBQU8sSUFYUCxDQUFBOztBQUFBLEVBWUEsV0FBQSxHQUFjLElBWmQsQ0FBQTs7QUFBQSxFQWFBLGdCQUFBLEdBQW1CLElBYm5CLENBQUE7O0FBQUEsRUFjQSxnQkFBQSxHQUFtQixJQWRuQixDQUFBOztBQUFBLEVBZUEsWUFBQSxHQUFlLElBZmYsQ0FBQTs7QUFBQSxFQWlCQSxlQUFBLEdBQWtCLEVBakJsQixDQUFBOztBQUFBLEVBb0JBLFdBQUEsR0FBYyxTQUFBLEdBQUE7V0FDWixPQUFPLENBQUMsR0FBRyxDQUFDLElBQVosSUFBb0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFoQyxJQUE0QyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBRDVDO0VBQUEsQ0FwQmQsQ0FBQTs7QUFBQSxFQTJCQSxVQUFBLEdBQWEsU0FBQyxNQUFELEdBQUE7QUFDWCxRQUFBLG1EQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFW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
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/beautify.coffee