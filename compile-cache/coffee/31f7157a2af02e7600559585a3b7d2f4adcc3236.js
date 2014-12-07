(function() {
  var $, Convert, DockView, ErrorPaneView, FindPaneView, OmniOutputPaneView, View, Vue,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  $ = require('atom').$;

  Convert = require('ansi-to-html');

  Vue = require('vue');

  ErrorPaneView = require('./error-pane-view');

  FindPaneView = require('./find-pane-view');

  OmniOutputPaneView = require('./omni-output-pane-view');

  module.exports = DockView = (function(_super) {
    __extends(DockView, _super);

    function DockView() {
      this.resizePane = __bind(this.resizePane, this);
      this.resizeStopped = __bind(this.resizeStopped, this);
      this.resizeStarted = __bind(this.resizeStarted, this);
      this.selectPane = __bind(this.selectPane, this);
      return DockView.__super__.constructor.apply(this, arguments);
    }

    DockView.content = function() {
      var btn;
      btn = (function(_this) {
        return function(view, text) {
          return _this.button({
            'v-attr': "class: selected | btn-selected " + view,
            'v-on': "click: selectPane",
            'pane': view
          }, text);
        };
      })(this);
      return this.div({
        "class": 'tool-panel panel-bottom omnisharp-atom-pane',
        outlet: 'pane'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'omnisharp-atom-output-resizer',
            outlet: 'resizeHandle'
          });
          return _this.div({
            "class": "inset-panel"
          }, function() {
            _this.div({
              "class": "panel-heading clearfix"
            }, function() {
              return _this.div({
                "class": 'btn-toolbar pull-left'
              }, function() {
                return _this.div({
                  "class": 'btn-group btn-toggle'
                }, function() {
                  btn("errors", "Errors");
                  btn("find", "Find");
                  btn("build", "Build output");
                  return btn("omni", "Omnisharp output");
                });
              });
            });
            _this.div({
              'v-attr': 'class: selected | content-selected omni',
              outlet: 'omniOutput'
            });
            _this.div({
              'v-attr': 'class: selected | content-selected errors',
              outlet: 'errorsOutput'
            });
            _this.div({
              'v-attr': 'class: selected | content-selected find',
              outlet: 'findOutput'
            });
            return _this.div({
              'v-attr': 'class: selected | content-selected build'
            });
          });
        };
      })(this));
    };

    DockView.prototype.initialize = function() {
      Vue.filter('btn-selected', (function(_this) {
        return function(value, expectedValue) {
          var selected;
          selected = value === expectedValue ? "selected" : "";
          return "btn btn-default btn-fix " + selected;
        };
      })(this));
      Vue.filter('content-selected', (function(_this) {
        return function(value, expectedValue) {
          var selected;
          selected = value === expectedValue ? "" : "hide";
          return "omnisharp-atom-output " + expectedValue + "-output " + selected;
        };
      })(this));
      this.errorsOutput.append(new ErrorPaneView());
      this.findOutput.append(new FindPaneView());
      this.omniOutput.append(new OmniOutputPaneView());
      this.vm = new Vue({
        el: this[0],
        data: {
          selected: "omni"
        },
        methods: {
          selectPane: (function(_this) {
            return function(_arg) {
              var target;
              target = _arg.target;
              return _this.selectPane($(target).attr("pane"));
            };
          })(this)
        }
      });
      atom.workspaceView.command("omnisharp-atom:toggle-output", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      atom.workspaceView.command("omnisharp-atom:hide", (function(_this) {
        return function() {
          return _this.hide();
        };
      })(this));
      atom.workspaceView.command("omnisharp-atom:show-errors", (function(_this) {
        return function() {
          return _this.selectPane("errors");
        };
      })(this));
      atom.workspaceView.command("omnisharp-atom:show-find", (function(_this) {
        return function() {
          return _this.selectPane("find");
        };
      })(this));
      atom.workspaceView.command("omnisharp-atom:show-build", (function(_this) {
        return function() {
          return _this.selectPane("build");
        };
      })(this));
      atom.workspaceView.command("omnisharp-atom:show-omni", (function(_this) {
        return function() {
          return _this.selectPane("omni");
        };
      })(this));
      this.on('core:cancel core:close', (function(_this) {
        return function() {
          return _this.hide();
        };
      })(this));
      return this.on('mousedown', '.omnisharp-atom-output-resizer', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
    };

    DockView.prototype.selectPane = function(pane) {
      this.vm.selected = pane;
      this.show();
      return this.find("button.selected").focus();
    };

    DockView.prototype.resizeStarted = function() {
      this.fixedTop = this.resizeHandle.offset().top;
      this.fixedHeight = $(".omnisharp-atom-pane").height();
      this.fixedButtonBarHeight = this.find(".btn-group").height();
      this.statusBarHeight = atom.workspaceView.statusBar.height();
      $(document).on('mousemove', this.resizePane);
      return $(document).on('mouseup', this.resizeStopped);
    };

    DockView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePane);
      return $(document).off('mouseup', this.resizeStopped);
    };

    DockView.prototype.resizePane = function(_arg) {
      var h, pageY, which;
      pageY = _arg.pageY, which = _arg.which;
      if (which !== 1) {
        return this.resizeStopped();
      }
      h = this.fixedHeight + (this.fixedTop - pageY);
      $(".omnisharp-atom-pane").height(h);
      this.find(".omnisharp-atom-output").height(h - this.fixedButtonBarHeight - this.statusBarHeight);
      return this.find(".messages-container").height(h - this.fixedButtonBarHeight - this.statusBarHeight);
    };

    DockView.prototype.destroy = function() {
      return this.detach();
    };

    DockView.prototype.show = function() {
      if (!this.hasParent()) {
        return atom.workspaceView.prependToBottom(this);
      }
    };

    DockView.prototype.hide = function() {
      return this.detach();
    };

    DockView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.hide();
      } else {
        return this.show();
      }
    };

    return DockView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdGQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUyxPQUFBLENBQVEsTUFBUixFQUFULElBQUQsQ0FBQTs7QUFBQSxFQUNDLElBQUssT0FBQSxDQUFRLE1BQVIsRUFBTCxDQURELENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGNBQVIsQ0FGVixDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUtBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSLENBTGhCLENBQUE7O0FBQUEsRUFNQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBTmYsQ0FBQTs7QUFBQSxFQU9BLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx5QkFBUixDQVByQixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUdKLCtCQUFBLENBQUE7Ozs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsR0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7aUJBQ0osS0FBQyxDQUFBLE1BQUQsQ0FDRTtBQUFBLFlBQUEsUUFBQSxFQUFZLGlDQUFBLEdBQWdDLElBQTVDO0FBQUEsWUFDQSxNQUFBLEVBQVMsbUJBRFQ7QUFBQSxZQUVBLE1BQUEsRUFBUyxJQUZUO1dBREYsRUFJRSxJQUpGLEVBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOLENBQUE7YUFPQSxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sNkNBQVA7QUFBQSxRQUFzRCxN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
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/views/dock-view.coffee