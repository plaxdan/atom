(function() {
  var Debug, Emitter, Minimap, PluginManagement, ViewManagement, semver;

  Emitter = require('emissary').Emitter;

  Debug = require('prolix');

  semver = require('semver');

  ViewManagement = require('./mixins/view-management');

  PluginManagement = require('./mixins/plugin-management');

  require('../vendor/resizeend');

  Minimap = (function() {
    function Minimap() {}

    Emitter.includeInto(Minimap);

    Debug('minimap').includeInto(Minimap);

    ViewManagement.includeInto(Minimap);

    PluginManagement.includeInto(Minimap);

    Minimap.prototype.version = require('../package.json').version;

    Minimap.prototype.configDefaults = {
      plugins: {},
      autoToggle: false,
      displayMinimapOnLeft: false,
      minimapScrollIndicator: true,
      lineOverdraw: 10
    };

    Minimap.prototype.active = false;

    Minimap.prototype.activate = function() {
      if (atom.config.get('core.useReactEditor')) {
        console.warn("Minimap currently doesn't support the React Editor View experimental feature. Please turn off the `Use React Editor` option in the settings if you want to enable the minimap.");
        return this.deactivate();
      }
      atom.workspaceView.command('minimap:toggle', (function(_this) {
        return function() {
          return _this.toggleNoDebug();
        };
      })(this));
      atom.workspaceView.command('minimap:toggle-debug', (function(_this) {
        return function() {
          return _this.toggleDebug();
        };
      })(this));
      if (atom.config.get('minimap.autoToggle')) {
        this.toggleNoDebug();
      }
      atom.workspaceView.toggleClass('minimap-on-left', atom.config.get('minimap.displayMinimapOnLeft'));
      return atom.config.observe('minimap.displayMinimapOnLeft', (function(_this) {
        return function() {
          return atom.workspaceView.toggleClass('minimap-on-left', atom.config.get('minimap.displayMinimapOnLeft'));
        };
      })(this));
    };

    Minimap.prototype.deactivate = function() {
      this.destroyViews();
      return this.emit('deactivated');
    };

    Minimap.prototype.toggleDebug = function() {
      this.getChannel().activate();
      return this.toggle();
    };

    Minimap.prototype.toggleNoDebug = function() {
      this.getChannel().deactivate();
      return this.toggle();
    };

    Minimap.prototype.versionMatch = function(expectedVersion) {
      return semver.satisfies(this.version, expectedVersion);
    };

    Minimap.prototype.getCharWidthRatio = function() {
      return 0.72;
    };

    Minimap.prototype.toggle = function() {
      if (this.active) {
        this.active = false;
        return this.deactivate();
      } else {
        this.createViews();
        this.active = true;
        return this.emit('activated');
      }
    };

    return Minimap;

  })();

  module.exports = new Minimap();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsVUFBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUNBLEtBQUEsR0FBUSxPQUFBLENBQVEsUUFBUixDQURSLENBQUE7O0FBQUEsRUFFQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FGVCxDQUFBOztBQUFBLEVBSUEsY0FBQSxHQUFpQixPQUFBLENBQVEsMEJBQVIsQ0FKakIsQ0FBQTs7QUFBQSxFQUtBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSw0QkFBUixDQUxuQixDQUFBOztBQUFBLEVBT0EsT0FBQSxDQUFRLHFCQUFSLENBUEEsQ0FBQTs7QUFBQSxFQTRFTTt5QkFDSjs7QUFBQSxJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLE9BQXBCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsV0FBakIsQ0FBNkIsT0FBN0IsQ0FEQSxDQUFBOztBQUFBLElBRUEsY0FBYyxDQUFDLFdBQWYsQ0FBMkIsT0FBM0IsQ0FGQSxDQUFBOztBQUFBLElBR0EsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsT0FBN0IsQ0FIQSxDQUFBOztBQUFBLHNCQU1BLE9BQUEsR0FBUyxPQUFBLENBQVEsaUJBQVIsQ0FBMEIsQ0FBQyxPQU5wQyxDQUFBOztBQUFBLHNCQVNBLGNBQUEsR0FDRTtBQUFBLE1BQUEsT0FBQSxFQUFTLEVBQVQ7QUFBQSxNQUNBLFVBQUEsRUFBWSxLQURaO0FBQUEsTUFFQSxvQkFBQSxFQUFzQixLQUZ0QjtBQUFBLE1BR0Esc0JBQUEsRUFBd0IsSUFIeEI7QUFBQSxNQUlBLFlBQUEsRUFBYyxFQUpkO0tBVkYsQ0FBQTs7QUFBQSxzQkFrQkEsTUFBQSxHQUFRLEtBbEJSLENBQUE7O0FBQUEsc0JB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
//# sourceURL=/Users/daniel/.atom/packages/minimap/lib/minimap.coffee