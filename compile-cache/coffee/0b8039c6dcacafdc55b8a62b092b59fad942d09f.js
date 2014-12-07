(function() {
  var DockView, Emitter, Omni, OmniSharpServer, StatusBarView, fs, _;

  _ = require("underscore");

  fs = require('fs-plus');

  Emitter = require('event-kit').Emitter;

  StatusBarView = require('./views/status-bar-view');

  DockView = require('./views/dock-view');

  OmniSharpServer = require('../omni-sharp-server/omni-sharp-server');

  Omni = require('../omni-sharp-server/omni');

  module.exports = {
    activate: function(state) {
      atom.workspaceView.command("omnisharp-atom:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.emitter = new Emitter;
      this.loadFeatures();
      this.features.iterate('activate', state);
      return this.subscribeToEvents();
    },
    onEditor: function(callback) {
      return this.emitter.on('omnisharp-atom-editor', callback);
    },
    onEditorDestroyed: function(callback) {
      return this.emitter.on('omnisharp-atom-editor-destroyed', function(filePath) {
        return callback(filePath);
      });
    },
    getPackageDir: function() {
      return _.find(atom.packages.packageDirPaths, function(packagePath) {
        return fs.existsSync("" + packagePath + "/omnisharp-atom");
      });
    },
    loadFeatures: function() {
      var feature, featureDir, featureFiles, loadFeature, packageDir, self, _i, _len, _ref;
      self = this;
      packageDir = this.getPackageDir();
      featureDir = "" + packageDir + "/omnisharp-atom/lib/omnisharp-atom/features";
      featureFiles = _.filter(fs.readdirSync(featureDir), function(file) {
        return !fs.statSync("" + featureDir + "/" + file).isDirectory();
      });
      this.features = _.map(featureFiles, function(feature) {
        return {
          name: feature.replace('.coffee', ''),
          path: "./features/" + feature
        };
      });
      loadFeature = function(feature) {
        feature._class = require(feature.path);
        return feature._obj = new feature._class(self);
      };
      _ref = this.features;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        feature = _ref[_i];
        loadFeature(feature);
      }
      return this.features.iterate = (function(_this) {
        return function(funcName) {
          var args, _j, _len1, _ref1, _ref2, _results;
          args = Array.prototype.slice.call(arguments, 1);
          _ref1 = _this.features;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            feature = _ref1[_j];
            _results.push((_ref2 = feature._obj[funcName]) != null ? _ref2.apply(feature, args) : void 0);
          }
          return _results;
        };
      })(this);
    },
    subscribeToEvents: function() {
      if (atom.workspaceView.statusBar) {
        this.buildStatusBarAndDock();
      }
      this.observePackagesActivated = atom.packages.onDidActivateAll((function(_this) {
        return function() {
          return _this.buildStatusBarAndDock();
        };
      })(this));
      return this.observeEditors = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorFilePath;
          if (editor.getGrammar().name === 'C#') {
            _this.emitter.emit('omnisharp-atom-editor', editor);
            editorFilePath = editor.buffer.file.path;
            return editor.onDidDestroy(function() {
              return _this.emitter.emit('omnisharp-atom-editor-destroyed', editorFilePath);
            });
          }
        };
      })(this));
    },
    buildStatusBarAndDock: function() {
      this.statusBar = new StatusBarView;
      return this.outputView = new DockView;
    },
    toggle: function() {
      return OmniSharpServer.get().toggle();
    },
    deactivate: function() {
      var _ref;
      this.emitter.dispose();
      this.observeEditors.dispose();
      this.observePackagesActivated.dispose();
      this.features = null;
      if ((_ref = this.outputView) != null) {
        _ref.destroy();
      }
      this.outputView = null;
      return OmniSharpServer.get().stop();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQURMLENBQUE7O0FBQUEsRUFFQyxVQUFXLE9BQUEsQ0FBUSxXQUFSLEVBQVgsT0FGRCxDQUFBOztBQUFBLEVBSUEsYUFBQSxHQUFnQixPQUFBLENBQVEseUJBQVIsQ0FKaEIsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FMWCxDQUFBOztBQUFBLEVBT0EsZUFBQSxHQUFrQixPQUFBLENBQVEsd0NBQVIsQ0FQbEIsQ0FBQTs7QUFBQSxFQVFBLElBQUEsR0FBTyxPQUFBLENBQVEsMkJBQVIsQ0FSUCxDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHVCQUEzQixFQUFvRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBELENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FGWCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLFVBQWxCLEVBQThCLEtBQTlCLENBSkEsQ0FBQTthQUtBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBTlE7SUFBQSxDQUFWO0FB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
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/omnisharp-atom.coffee