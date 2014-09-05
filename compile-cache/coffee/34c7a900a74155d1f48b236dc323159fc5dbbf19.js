(function() {
  "use strict";
  var Subscriber, beautifier, beautify, defaultLanguageOptions, findConfig, findFile, findFileResults, fs, getConfigOptionsFromSettings, getCursors, getUserHome, handleSaveEvent, languages, path, plugin, setCursors, strip, verifyExists, yaml, _;

  plugin = module.exports;

  fs = require("fs");

  path = require("path");

  _ = require("lodash");

  strip = require("strip-json-comments");

  yaml = require("js-yaml");

  beautifier = require("./language-options");

  languages = beautifier.languages;

  defaultLanguageOptions = beautifier.defaultLanguageOptions;

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
  
  @returns {string} normalized filename
   */

  findFile = function(name, dir) {
    var filename, parent;
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
    return findFile(name, parent);
  };


  /*
  Tries to find a configuration file in either project directory
  or in the home directory. Configuration files are named
  '.jsbeautifyrc'.
  
  @param {string} config name of the configuration file
  @param {string} file path to the file to be linted
  @returns {string} a path to the config file
   */

  findConfig = function(config, file) {
    var dir, envs, home, proj;
    dir = path.dirname(path.resolve(file));
    envs = getUserHome();
    home = path.normalize(path.join(envs, config));
    proj = findFile(config, dir);
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
    var allOptions, beautifyCompleted, configOptions, editedFilePath, editor, editorOptions, getConfig, grammarName, homeOptions, isSelection, oldText, projectOptions, softTabs, tabLength, text;
    getConfig = function(startPath) {
      var configPath, contents, e, externalOptions;
      startPath = (typeof startPath === "string" ? startPath : "");
      if (!startPath) {
        return {};
      }
      configPath = findConfig(".jsbeautifyrc", startPath);
      externalOptions = void 0;
      if (configPath) {
        contents = fs.readFileSync(configPath, {
          encoding: "utf8"
        });
        if (!contents) {
          externalOptions = {};
        } else {
          try {
            externalOptions = JSON.parse(strip(contents));
          } catch (_error) {
            e = _error;
            console.log("Failed parsing config as JSON: " + configPath);
            try {
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
    beautifyCompleted = function(text) {
      var origScrollTop, posArray, selectedBufferRange;
      if (oldText !== text) {
        posArray = getCursors(editor);
        origScrollTop = editor.getScrollTop();
        if (isSelection) {
          selectedBufferRange = editor.getSelectedBufferRange();
          editor.setTextInBufferRange(selectedBufferRange, text);
        } else {
          editor.setText(text);
        }
        setCursors(editor, posArray);
        setTimeout((function() {
          editor.setScrollTop(origScrollTop);
        }), 0);
      } else {

      }
    };
    text = void 0;
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
    projectOptions = getConfig(editedFilePath);
    homeOptions = getConfig(getUserHome());
    if (isSelection) {
      text = editor.getSelectedText();
    } else {
      text = editor.getText();
    }
    oldText = text;
    allOptions = [editorOptions, configOptions, homeOptions, projectOptions];
    grammarName = editor.getGrammar().name;
    beautifier.beautify(text, grammarName, allOptions, beautifyCompleted);
  };

  handleSaveEvent = function() {
    atom.workspace.eachEditor(function(editor) {
      var buffer, events;
      buffer = editor.getBuffer();
      plugin.unsubscribe(buffer);
      if (atom.config.get("atom-beautify.beautifyOnSave")) {
        events = "will-be-saved";
        plugin.subscribe(buffer, events, beautify);
      }
    });
  };

  Subscriber = require("emissary").Subscriber;

  Subscriber.extend(plugin);

  plugin.configDefaults = _.merge({
    analytics: true,
    beautifyOnSave: false
  }, defaultLanguageOptions);

  plugin.activate = function() {
    handleSaveEvent();
    plugin.subscribe(atom.config.observe("atom-beautify.beautifyOnSave", handleSaveEvent));
    return atom.workspaceView.command("beautify", beautify);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBRUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsOE9BQUE7O0FBQUEsRUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BRGhCLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUpKLENBQUE7O0FBQUEsRUFLQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBTFIsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQU5QLENBQUE7O0FBQUEsRUFPQSxVQUFBLEdBQWEsT0FBQSxDQUFRLG9CQUFSLENBUGIsQ0FBQTs7QUFBQSxFQVFBLFNBQUEsR0FBWSxVQUFVLENBQUMsU0FSdkIsQ0FBQTs7QUFBQSxFQVNBLHNCQUFBLEdBQXlCLFVBQVUsQ0FBQyxzQkFUcEMsQ0FBQTs7QUFBQSxFQVdBLGVBQUEsR0FBa0IsRUFYbEIsQ0FBQTs7QUFBQSxFQWNBLFdBQUEsR0FBYyxTQUFBLEdBQUE7V0FDWixPQUFPLENBQUMsR0FBRyxDQUFDLElBQVosSUFBb0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFoQyxJQUE0QyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBRDVDO0VBQUEsQ0FkZCxDQUFBOztBQUFBLEVBcUJBLFVBQUEsR0FBYSxTQUFDLE1BQUQsR0FBQTtBQUNYLFFBQUEsbURBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsVUFBUCxDQUFBLENBQVYsQ0FBQTtBQUFBLElBQ0EsUUFBQSxHQUFXLEVBRFgsQ0FBQTtBQUdBLFNBQUEsOENBQUE7MkJBQUE7QUFDRSxNQUFBLGNBQUEs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
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/beautify.coffee