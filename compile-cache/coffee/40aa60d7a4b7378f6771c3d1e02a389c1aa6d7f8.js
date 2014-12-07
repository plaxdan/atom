(function() {
  var OmniSharpServer, StatusBarView, View, Vue,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  Vue = require('vue');

  OmniSharpServer = require('../../omni-sharp-server/omni-sharp-server');

  module.exports = StatusBarView = (function(_super) {
    __extends(StatusBarView, _super);

    function StatusBarView() {
      this.toggle = __bind(this.toggle, this);
      return StatusBarView.__super__.constructor.apply(this, arguments);
    }

    StatusBarView.content = function() {
      return this.a({
        href: '#',
        'v-on': 'click: toggle',
        outlet: 'omni-meter',
        "class": 'inline-block omnisharp-atom-button'
      }, (function(_this) {
        return function() {
          _this.span({
            "class": 'icon icon-flame',
            'v-class': 'text-subtle: isOff, text-success: isReady, text-error: isError'
          }, '{{iconText}}');
          return _this.progress({
            "class": 'inline-block',
            'v-class': 'hide: isNotLoading'
          });
        };
      })(this));
    };

    StatusBarView.prototype.initialize = function() {
      this.vm = new Vue({
        el: this[0],
        data: OmniSharpServer.vm,
        methods: {
          toggle: this.toggle
        }
      });
      return atom.workspaceView.statusBar.prependLeft(this);
    };

    StatusBarView.prototype.toggle = function() {
      atom.workspaceView.trigger('omnisharp-atom:toggle-output');
      return this.vm.isOpen = !this.vm.isOpen;
    };

    StatusBarView.prototype.destroy = function() {
      return this.detach();
    };

    return StatusBarView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUROLENBQUE7O0FBQUEsRUFFQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSwyQ0FBUixDQUZsQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUdKLG9DQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxRQUFBLElBQUEsRUFBSyxHQUFMO0FBQUEsUUFBVSxNQUFBLEVBQVMsZUFBbkI7QUFBQSxRQUFvQyxNQUFBLEVBQVMsWUFBN0M7QUFBQSxRQUEyRCxPQUFBLEVBQU8sb0NBQWxFO09BQUgsRUFBMkcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN6RyxVQUFBLEtBQUMsQ0FBQSxJQUFELENBQ0U7QUFBQSxZQUFBLE9BQUEsRUFBTyxpQkFBUDtBQUFBLFlBQ0EsU0FBQSxFQUFXLGdFQURYO1dBREYsRUFHRSxjQUhGLENBQUEsQ0FBQTtpQkFJQSxLQUFDLENBQUEsUUFBRCxDQUFVO0FBQUEsWUFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLFlBQXVCLFNBQUEsRUFBVyxvQkFBbEM7V0FBVixFQUx5RztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNHLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsNEJBU0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUVWLE1BQUEsSUFBQyxDQUFBLEVBQUQsR0FBVSxJQUFBLEdBQUEsQ0FDUjtBQUFBLFFBQUEsRUFBQSxFQUFJLElBQUssQ0FBQSxDQUFBLENBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxlQUFlLENBQUMsRUFEdEI7QUFBQSxRQUVBLE9BQUEsRUFDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUFUO1NBSEY7T0FEUSxDQUFWLENBQUE7YUFLQSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxXQUE3QixDQUF5QyxJQUF6QyxFQVBVO0lBQUEsQ0FUWixDQUFBOztBQUFBLDRCQWtCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLDhCQUEzQixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsRUFBRSxDQUFDLE1BQUosR0FBYSxDQUFBLElBQUUsQ0FBQSxFQUFFLENBQUMsT0FGWjtJQUFBLENBbEJSLENBQUE7O0FBQUEsNEJBdUJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRE87SUFBQSxDQXZCVCxDQUFBOzt5QkFBQTs7S0FIMEIsS0FMNUIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/views/status-bar-view.coffee