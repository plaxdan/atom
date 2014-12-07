(function() {
  var Convert, FindPaneView, OmniSharpServer, View, Vue, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  Convert = require('ansi-to-html');

  Vue = require('vue');

  _ = require('underscore');

  OmniSharpServer = require('../../omni-sharp-server/omni-sharp-server');

  module.exports = FindPaneView = (function(_super) {
    __extends(FindPaneView, _super);

    function FindPaneView() {
      return FindPaneView.__super__.constructor.apply(this, arguments);
    }

    FindPaneView.content = function() {
      return this.div({
        "class": 'error-output-pane',
        outlet: 'atomSharpFindPane'
      }, (function(_this) {
        return function() {
          _this.ul({
            "class": 'background-message centered',
            'v-class': 'hide: isLoadingOrReady'
          }, function() {
            return _this.li(function() {
              _this.span('Omnisharp server is turned off');
              return _this.kbd({
                "class": 'key-binding text-highlight'
              }, '⌃⌥O');
            });
          });
          _this.ul({
            "class": 'background-message centered',
            'v-class': 'hide: isNotLoading'
          }, function() {
            return _this.li(function() {
              return _this.progress({
                "class": 'inline-block'
              });
            });
          });
          return _this.table({
            "class": 'error-table',
            'v-class': 'hide: isNotReady'
          }, function() {
            _this.thead(function() {
              _this.th('line');
              _this.th('column');
              _this.th('message');
              return _this.th('filename');
            });
            return _this.tbody(function() {
              var data;
              return _this.tr({
                'v-repeat': 'usages',
                'v-on': 'click: gotoUsage'
              }, data = '{{$index}}', function() {
                _this.td('{{Line}}');
                _this.td('{{Column}}');
                _this.td('{{Text}}');
                return _this.td('{{FileName}}');
              });
            });
          });
        };
      })(this));
    };

    FindPaneView.prototype.initialize = function() {
      this.vm = new Vue({
        el: this[0],
        data: _.extend(OmniSharpServer.vm, {
          usages: []
        }),
        methods: {
          gotoUsage: function(_arg) {
            var targetVM;
            targetVM = _arg.targetVM;
            return atom.emit("omni:navigate-to", targetVM.$data);
          }
        }
      });
      return atom.on("omni:find-usages", (function(_this) {
        return function(data) {
          return _this.vm.usages = data.QuickFixes;
        };
      })(this));
    };

    FindPaneView.prototype.destroy = function() {
      return this.detach();
    };

    return FindPaneView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9EQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsSUFBRCxDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxjQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUZOLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVIsQ0FISixDQUFBOztBQUFBLEVBS0EsZUFBQSxHQUFrQixPQUFBLENBQVEsMkNBQVIsQ0FMbEIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFFSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxtQkFBUDtBQUFBLFFBQTRCLE1BQUEsRUFBUSxtQkFBcEM7T0FBTCxFQUE4RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQzVELFVBQUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsT0FBQSxFQUFPLDZCQUFQO0FBQUEsWUFBc0MsU0FBQSxFQUFXLHdCQUFqRDtXQUFKLEVBQStFLFNBQUEsR0FBQTttQkFDN0UsS0FBQyxDQUFBLEVBQUQsQ0FBSSxTQUFBLEdBQUE7QUFDRixjQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sZ0NBQU4sQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxnQkFBQSxPQUFBLEVBQU8sNEJBQVA7ZUFBTCxFQUEwQyxLQUExQyxFQUZFO1lBQUEsQ0FBSixFQUQ2RTtVQUFBLENBQS9FLENBQUEsQ0FBQTtBQUFB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
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/views/find-pane-view.coffee