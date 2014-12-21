(function() {
  var $, CompositeDisposable, Emitter, MinimapFindAndReplaceBinding, MinimapFindResultsView, PLUGIN_NAME, Subscriber, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  $ = require('atom').$;

  _ref = require('emissary'), Subscriber = _ref.Subscriber, Emitter = _ref.Emitter;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  MinimapFindResultsView = null;

  PLUGIN_NAME = 'find-and-replace';

  module.exports = MinimapFindAndReplaceBinding = (function() {
    Emitter.includeInto(MinimapFindAndReplaceBinding);

    MinimapFindAndReplaceBinding.prototype.active = false;

    MinimapFindAndReplaceBinding.prototype.pluginActive = false;

    MinimapFindAndReplaceBinding.prototype.isActive = function() {
      return this.pluginActive;
    };

    function MinimapFindAndReplaceBinding(findAndReplace, minimap) {
      this.findAndReplace = findAndReplace;
      this.minimap = minimap;
      this.deactivate = __bind(this.deactivate, this);
      this.activate = __bind(this.activate, this);
      this.subscriptions = new CompositeDisposable;
      this.minimap.registerPlugin(PLUGIN_NAME, this);
    }

    MinimapFindAndReplaceBinding.prototype.activatePlugin = function() {
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'find-and-replace:show': this.activate,
        'find-and-replace:toggle': this.activate,
        'find-and-replace:show-replace': this.activate,
        'core:cancel': this.deactivate,
        'core:close': this.deactivate
      }));
      this.subscriptions.add(this.minimap.onDidActivate(this.activate));
      this.subscriptions.add(this.minimap.onDidDeactivate(this.deactivate));
      if (this.findViewIsVisible() && this.minimapIsActive()) {
        this.activate();
      }
      return this.pluginActive = true;
    };

    MinimapFindAndReplaceBinding.prototype.deactivatePlugin = function() {
      this.subscriptions.dispose();
      this.deactivate();
      return this.pluginActive = false;
    };

    MinimapFindAndReplaceBinding.prototype.activate = function() {
      if (!(this.findViewIsVisible() && this.minimapIsActive())) {
        return this.deactivate();
      }
      if (this.active) {
        return;
      }
      MinimapFindResultsView || (MinimapFindResultsView = require('./minimap-find-results-view')());
      this.active = true;
      this.findView = this.findAndReplace.findView;
      this.findModel = this.findView.findModel;
      this.findResultsView = new MinimapFindResultsView(this.findModel);
      return setImmediate((function(_this) {
        return function() {
          return _this.findModel.emitter.emit('did-update', _.clone(_this.findModel.markers));
        };
      })(this));
    };

    MinimapFindAndReplaceBinding.prototype.deactivate = function() {
      var _ref1;
      if (!this.active) {
        return;
      }
      if ((_ref1 = this.findResultsView) != null) {
        _ref1.destroy();
      }
      return this.active = false;
    };

    MinimapFindAndReplaceBinding.prototype.destroy = function() {
      this.deactivate();
      this.findAndReplacePackage = null;
      this.findAndReplace = null;
      this.minimapPackage = null;
      this.findResultsView = null;
      return this.minimap = null;
    };

    MinimapFindAndReplaceBinding.prototype.findViewIsVisible = function() {
      return (this.findAndReplace.findView != null) && this.findAndReplace.findView.parent().length === 1;
    };

    MinimapFindAndReplaceBinding.prototype.minimapIsActive = function() {
      return this.minimap.active;
    };

    return MinimapFindAndReplaceBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVIQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLElBQUssT0FBQSxDQUFRLE1BQVIsRUFBTCxDQURELENBQUE7O0FBQUEsRUFFQSxPQUF3QixPQUFBLENBQVEsVUFBUixDQUF4QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxlQUFBLE9BRmIsQ0FBQTs7QUFBQSxFQUdDLHNCQUF1QixPQUFBLENBQVEsV0FBUixFQUF2QixtQkFIRCxDQUFBOztBQUFBLEVBSUEsc0JBQUEsR0FBeUIsSUFKekIsQ0FBQTs7QUFBQSxFQU1BLFdBQUEsR0FBYyxrQkFOZCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsNEJBQXBCLENBQUEsQ0FBQTs7QUFBQSwyQ0FFQSxNQUFBLEdBQVEsS0FGUixDQUFBOztBQUFBLDJDQUdBLFlBQUEsR0FBYyxLQUhkLENBQUE7O0FBQUEsMkNBSUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxhQUFKO0lBQUEsQ0FKVixDQUFBOztBQU1hLElBQUEsc0NBQUUsY0FBRixFQUFtQixPQUFuQixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsaUJBQUEsY0FDYixDQUFBO0FBQUEsTUFENkIsSUFBQyxDQUFBLFVBQUEsT0FDOUIsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixXQUF4QixFQUFxQyxJQUFyQyxDQUZBLENBRFc7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
//# sourceURL=/Users/daniel/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace-binding.coffee