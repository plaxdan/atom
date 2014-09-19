(function() {
  var $, Emitter, MinimapFindAndReplaceBinding, MinimapFindResultsView, PLUGIN_NAME, Subscriber, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  $ = require('atom').$;

  _ref = require('emissary'), Subscriber = _ref.Subscriber, Emitter = _ref.Emitter;

  MinimapFindResultsView = null;

  PLUGIN_NAME = 'find-and-replace';

  module.exports = MinimapFindAndReplaceBinding = (function() {
    Subscriber.includeInto(MinimapFindAndReplaceBinding);

    Emitter.includeInto(MinimapFindAndReplaceBinding);

    MinimapFindAndReplaceBinding.prototype.active = false;

    MinimapFindAndReplaceBinding.prototype.pluginActive = false;

    MinimapFindAndReplaceBinding.prototype.isActive = function() {
      return this.pluginActive;
    };

    function MinimapFindAndReplaceBinding(findAndReplacePackage, minimapPackage) {
      this.findAndReplacePackage = findAndReplacePackage;
      this.minimapPackage = minimapPackage;
      this.markersUpdated = __bind(this.markersUpdated, this);
      this.deactivate = __bind(this.deactivate, this);
      this.activate = __bind(this.activate, this);
      this.minimap = require(this.minimapPackage.path);
      this.findAndReplace = require(this.findAndReplacePackage.path);
      MinimapFindResultsView = require('./minimap-find-results-view')();
      this.minimap.registerPlugin(PLUGIN_NAME, this);
    }

    MinimapFindAndReplaceBinding.prototype.activatePlugin = function() {
      $(window).on('find-and-replace:show find-and-replace:toggle find-and-replace:show-replace', this.activate);
      atom.workspaceView.on('core:cancel core:close', this.deactivate);
      this.subscribe(this.minimap, 'activated.minimap', this.activate);
      this.subscribe(this.minimap, 'deactivated.minimap', this.deactivate);
      if (this.findViewIsVisible() && this.minimapIsActive()) {
        this.activate();
      }
      return this.pluginActive = true;
    };

    MinimapFindAndReplaceBinding.prototype.deactivatePlugin = function() {
      $(window).off('find-and-replace:show');
      atom.workspaceView.off('core:cancel core:close');
      this.unsubscribe();
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
      this.active = true;
      this.findView = this.findAndReplace.findView;
      this.findModel = this.findView.findModel;
      this.findResultsView = new MinimapFindResultsView(this.findModel);
      this.subscribe(this.findModel, 'updated', this.markersUpdated);
      return setImmediate((function(_this) {
        return function() {
          return _this.findModel.emit('updated', _.clone(_this.findModel.markers));
        };
      })(this));
    };

    MinimapFindAndReplaceBinding.prototype.deactivate = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.findResultsView.detach();
      return this.unsubscribe(this.findModel, 'updated');
    };

    MinimapFindAndReplaceBinding.prototype.destroy = function() {
      this.deactivate();
      this.findAndReplacePackage = null;
      this.findAndReplace = null;
      this.minimapPackage = null;
      return this.minimap = null;
    };

    MinimapFindAndReplaceBinding.prototype.findViewIsVisible = function() {
      return (this.findAndReplace.findView != null) && this.findAndReplace.findView.parent().length === 1;
    };

    MinimapFindAndReplaceBinding.prototype.minimapIsActive = function() {
      return this.minimap.active;
    };

    MinimapFindAndReplaceBinding.prototype.markersUpdated = function() {
      this.findResultsView.detach();
      return this.findResultsView.attach();
    };

    return MinimapFindAndReplaceBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtHQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLElBQUssT0FBQSxDQUFRLE1BQVIsRUFBTCxDQURELENBQUE7O0FBQUEsRUFFQSxPQUF3QixPQUFBLENBQVEsVUFBUixDQUF4QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxlQUFBLE9BRmIsQ0FBQTs7QUFBQSxFQUdBLHNCQUFBLEdBQXlCLElBSHpCLENBQUE7O0FBQUEsRUFLQSxXQUFBLEdBQWMsa0JBTGQsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLDRCQUF2QixDQUFBLENBQUE7O0FBQUEsSUFDQSxPQUFPLENBQUMsV0FBUixDQUFvQiw0QkFBcEIsQ0FEQSxDQUFBOztBQUFBLDJDQUdBLE1BQUEsR0FBUSxLQUhSLENBQUE7O0FBQUEsMkNBSUEsWUFBQSxHQUFjLEtBSmQsQ0FBQTs7QUFBQSwyQ0FLQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLGFBQUo7SUFBQSxDQUxWLENBQUE7O0FBT2EsSUFBQSxzQ0FBRSxxQkFBRixFQUEwQixjQUExQixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsd0JBQUEscUJBQ2IsQ0FBQTtBQUFBLE1BRG9DLElBQUMsQ0FBQSxpQkFBQSxjQUNyQyxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLE9BQUEsQ0FBUSxJQUFDLENBQUEsY0FBYyxDQUFDLElBQXhCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQUQsR0FB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
//# sourceURL=/Users/daniel/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace-binding.coffee