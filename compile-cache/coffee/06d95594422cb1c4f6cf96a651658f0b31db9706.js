(function() {
  var $, Convert, OmniOutputPaneView, OmniSharpServer, View, Vue, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  $ = require('atom').$;

  Convert = require('ansi-to-html');

  Vue = require('vue');

  _ = require('underscore');

  OmniSharpServer = require('../../omni-sharp-server/omni-sharp-server');

  module.exports = OmniOutputPaneView = (function(_super) {
    __extends(OmniOutputPaneView, _super);

    function OmniOutputPaneView() {
      return OmniOutputPaneView.__super__.constructor.apply(this, arguments);
    }

    OmniOutputPaneView.content = function() {
      return this.div({
        "class": 'omni-output-pane-view'
      }, (function(_this) {
        return function() {
          _this.ul({
            "class": 'background-message centered',
            'v-class': 'hide: initialized'
          }, function() {
            return _this.li(function() {
              _this.span('Omnisharp server is turned off');
              return _this.kbd({
                "class": 'key-binding text-highlight'
              }, '⌃⌥O');
            });
          });
          return _this.div({
            "class": 'messages-container',
            'v-class': 'hide: uninitialized'
          }, function() {
            return _this.pre({
              'v-class': 'text-error: l.isError',
              'v-repeat': 'l :output'
            }, '{{ l.message | ansi-to-html }}');
          });
        };
      })(this));
    };

    OmniOutputPaneView.prototype.initialize = function() {
      var scrollToBottom;
      scrollToBottom = _.throttle(((function(_this) {
        return function() {
          var _ref;
          return (_ref = _this.find(".messages-container")[0].lastElementChild) != null ? _ref.scrollIntoViewIfNeeded() : void 0;
        };
      })(this)), 100);
      Vue.filter('ansi-to-html', (function(_this) {
        return function(value) {
          var v;
          scrollToBottom();
          if (_this.convert == null) {
            _this.convert = new Convert();
          }
          v = _this.convert.toHtml(value);
          return v.trim();
        };
      })(this));
      this.vm = new Vue({
        el: this[0],
        data: _.extend(OmniSharpServer.vm, {
          uninitialized: true,
          initialized: false,
          output: []
        })
      });
      atom.on("omni-sharp-server:out", (function(_this) {
        return function(data) {
          if (_this.vm.output.length >= 1000) {
            _this.vm.output.$remove(0);
          }
          return _this.vm.output.push({
            message: data
          });
        };
      })(this));
      atom.on("omni-sharp-server:err", (function(_this) {
        return function(data) {
          if (_this.vm.output.length >= 1000) {
            _this.vm.output.$remove(0);
          }
          return _this.vm.output.push({
            message: data,
            isError: true
          });
        };
      })(this));
      return atom.on("omni-sharp-server:start", (function(_this) {
        return function(pid) {
          _this.vm.uninitialized = false;
          _this.vm.initialized = true;
          _this.vm.output = [];
          return _this.vm.output.push({
            message: "Started Omnisharp server (" + pid + ")"
          });
        };
      })(this));
    };

    OmniOutputPaneView.prototype.destroy = function() {
      return this.detach();
    };

    return OmniOutputPaneView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsSUFBRCxDQUFBOztBQUFBLEVBQ0MsSUFBSyxPQUFBLENBQVEsTUFBUixFQUFMLENBREQsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsR0FBVSxPQUFBLENBQVEsY0FBUixDQUZWLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLGVBQUEsR0FBa0IsT0FBQSxDQUFRLDJDQUFSLENBTmxCLENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHVCQUFQO09BQUwsRUFBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNuQyxVQUFBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxZQUFBLE9BQUEsRUFBTyw2QkFBUDtBQUFBLFlBQXNDLFNBQUEsRUFBVyxtQkFBakQ7V0FBSixFQUEwRSxTQUFBLEdBQUE7bUJBQ3hFLEtBQUMsQ0FBQSxFQUFELENBQUksU0FBQSxHQUFBO0FBQ0YsY0FBQSxLQUFDLENBQUEsSUFBRCxDQUFNLGdDQUFOLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLDRCQUFQO2VBQUwsRUFBMEMsS0FBMUMsRUFGRTtZQUFBLENBQUosRUFEd0U7VUFBQSxD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
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/views/omni-output-pane-view.coffee