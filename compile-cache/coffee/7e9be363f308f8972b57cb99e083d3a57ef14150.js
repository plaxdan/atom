(function() {
  var $, Minimap, MinimapQuickSettingsView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  $ = View.__super__.constructor;

  Minimap = require('./minimap');

  module.exports = MinimapQuickSettingsView = (function(_super) {
    __extends(MinimapQuickSettingsView, _super);

    function MinimapQuickSettingsView() {
      this.selectPreviousItem = __bind(this.selectPreviousItem, this);
      this.selectNextItem = __bind(this.selectNextItem, this);
      this.toggleSelectedItem = __bind(this.toggleSelectedItem, this);
      this.destroy = __bind(this.destroy, this);
      return MinimapQuickSettingsView.__super__.constructor.apply(this, arguments);
    }

    MinimapQuickSettingsView.content = function() {
      return this.div({
        "class": 'select-list popover-list minimap-quick-settings'
      }, (function(_this) {
        return function() {
          _this.input({
            type: 'text',
            "class": 'hidden-input',
            outlet: 'hiddenInput'
          });
          return _this.ol({
            "class": 'list-group mark-active',
            outlet: 'list'
          }, function() {
            _this.li({
              "class": 'separator',
              outlet: 'separator'
            });
            return _this.li({
              "class": (atom.config.get('minimap.displayCodeHighlights') ? 'active' : ''),
              outlet: 'codeHighlights'
            }, 'code-highlights');
          });
        };
      })(this));
    };

    MinimapQuickSettingsView.prototype.selectedItem = null;

    MinimapQuickSettingsView.prototype.initialize = function(minimapView) {
      this.minimapView = minimapView;
      this.plugins = {};
      this.subscribe(Minimap, 'plugin:added', (function(_this) {
        return function(_arg) {
          var name, plugin;
          name = _arg.name, plugin = _arg.plugin;
          return _this.addItemFor(name, plugin);
        };
      })(this));
      this.subscribe(Minimap, 'plugin:removed', (function(_this) {
        return function(_arg) {
          var name, plugin;
          name = _arg.name, plugin = _arg.plugin;
          return _this.removeItemFor(name, plugin);
        };
      })(this));
      this.subscribe(Minimap, 'plugin:activated', (function(_this) {
        return function(_arg) {
          var name, plugin;
          name = _arg.name, plugin = _arg.plugin;
          return _this.activateItem(name, plugin);
        };
      })(this));
      this.subscribe(Minimap, 'plugin:deactivated', (function(_this) {
        return function(_arg) {
          var name, plugin;
          name = _arg.name, plugin = _arg.plugin;
          return _this.deactivateItem(name, plugin);
        };
      })(this));
      this.on('core:move-up', this.selectPreviousItem);
      this.on('core:move-down', this.selectNextItem);
      this.on('core:cancel', this.destroy);
      this.on('core:validate', this.toggleSelectedItem);
      this.subscribe(this.codeHighlights, 'mousedown', (function(_this) {
        return function(e) {
          e.preventDefault();
          _this.minimapView.setDisplayCodeHighlights(!_this.minimapView.displayCodeHighlights);
          return _this.codeHighlights.toggleClass('active', _this.minimapView.displayCodeHighlights);
        };
      })(this));
      this.hiddenInput.on('focusout', this.destroy);
      return this.initList();
    };

    MinimapQuickSettingsView.prototype.attach = function() {
      atom.workspaceView.append(this);
      return this.hiddenInput.focus();
    };

    MinimapQuickSettingsView.prototype.destroy = function() {
      this.trigger('minimap:quick-settings-destroyed');
      this.off();
      this.hiddenInput.off();
      this.unsubscribe();
      return this.detach();
    };

    MinimapQuickSettingsView.prototype.initList = function() {
      var name, plugin, _ref, _results;
      _ref = Minimap.plugins;
      _results = [];
      for (name in _ref) {
        plugin = _ref[name];
        _results.push(this.addItemFor(name, plugin));
      }
      return _results;
    };

    MinimapQuickSettingsView.prototype.toggleSelectedItem = function() {
      return this.selectedItem.mousedown();
    };

    MinimapQuickSettingsView.prototype.selectNextItem = function() {
      this.selectedItem.removeClass('selected');
      if (this.selectedItem.index() !== this.list.children().length - 1) {
        this.selectedItem = this.selectedItem.next();
        if (this.selectedItem.is('.separator')) {
          this.selectedItem = this.selectedItem.next();
        }
      } else {
        this.selectedItem = this.list.children().first();
      }
      return this.selectedItem.addClass('selected');
    };

    MinimapQuickSettingsView.prototype.selectPreviousItem = function() {
      this.selectedItem.removeClass('selected');
      if (this.selectedItem.index() !== 0) {
        this.selectedItem = this.selectedItem.prev();
        if (this.selectedItem.is('.separator')) {
          this.selectedItem = this.selectedItem.prev();
        }
      } else {
        this.selectedItem = this.list.children().last();
      }
      return this.selectedItem.addClass('selected');
    };

    MinimapQuickSettingsView.prototype.addItemFor = function(name, plugin) {
      var cls, item;
      cls = plugin.isActive() ? 'active' : '';
      item = $("<li class='" + cls + "'>" + name + "</li>");
      item.on('mousedown', (function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.trigger("minimap:toggle-" + name);
        };
      })(this));
      this.plugins[name] = item;
      this.separator.before(item);
      if (this.selectedItem == null) {
        this.selectedItem = item;
        return this.selectedItem.addClass('selected');
      }
    };

    MinimapQuickSettingsView.prototype.removeItemFor = function(name, plugin) {
      this.list.remove(this.plugins[name]);
      return delete this.plugins[name];
    };

    MinimapQuickSettingsView.prototype.activateItem = function(name, plugin) {
      return this.plugins[name].addClass('active');
    };

    MinimapQuickSettingsView.prototype.deactivateItem = function(name, plugin) {
      return this.plugins[name].removeClass('active');
    };

    return MinimapQuickSettingsView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBRG5CLENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FIVixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLCtDQUFBLENBQUE7Ozs7Ozs7O0tBQUE7O0FBQUEsSUFBQSx3QkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8saURBQVA7T0FBTCxFQUErRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQzdELFVBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLFlBQUEsSUFBQSxFQUFNLE1BQU47QUFBQSxZQUFjLE9BQUEsRUFBTyxjQUFyQjtBQUFBLFlBQXFDLE1BQUEsRUFBUSxhQUE3QztXQUFQLENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsWUFBQSxPQUFBLEVBQU8sd0JBQVA7QUFBQSxZQUFpQyxNQUFBLEVBQVEsTUFBekM7V0FBSixFQUFxRCxTQUFBLEdBQUE7QUFDbkQsWUFBQSxLQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsY0FBQSxPQUFBLEVBQU8sV0FBUDtBQUFBLGNBQW9CLE1BQUEsRUFBUSxXQUE1QjthQUFKLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsY0FBQSxPQUFBLEVBQU8sQ0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCLENBQUgs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
//# sourceURL=/Users/daniel/.atom/packages/minimap/lib/minimap-quick-settings-view.coffee