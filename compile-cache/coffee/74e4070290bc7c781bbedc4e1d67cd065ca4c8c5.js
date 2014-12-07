(function() {
  var Convert, ErrorPaneView, OmniSharpServer, View, Vue, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  Convert = require('ansi-to-html');

  Vue = require('vue');

  _ = require('underscore');

  OmniSharpServer = require('../../omni-sharp-server/omni-sharp-server');

  module.exports = ErrorPaneView = (function(_super) {
    __extends(ErrorPaneView, _super);

    function ErrorPaneView() {
      this.displayQuickFixes = __bind(this.displayQuickFixes, this);
      this.removeErrorsFor = __bind(this.removeErrorsFor, this);
      this.initialize = __bind(this.initialize, this);
      return ErrorPaneView.__super__.constructor.apply(this, arguments);
    }

    ErrorPaneView.content = function() {
      return this.div({
        "class": 'error-output-pane',
        outlet: 'atomSharpErrorPane'
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
                'v-repeat': 'errors',
                'v-on': 'click: gotoError'
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

    ErrorPaneView.prototype.initialize = function() {
      this.vm = new Vue({
        el: this[0],
        data: _.extend(OmniSharpServer.vm, {
          errors: []
        }),
        methods: {
          gotoError: function(_arg) {
            var targetVM;
            targetVM = _arg.targetVM;
            return atom.emit("omni:navigate-to", targetVM.$data);
          }
        }
      });
      atom.on("omni:quick-fixes", (function(_this) {
        return function(data) {
          return _this.displayQuickFixes(data.QuickFixes);
        };
      })(this));
      return atom.on('omnisharp-atom:clear-syntax-errors', (function(_this) {
        return function(filePath) {
          return _this.removeErrorsFor(filePath);
        };
      })(this));
    };

    ErrorPaneView.prototype.removeErrorsFor = function(filePath) {
      var existingErrorsCount, _results;
      existingErrorsCount = this.vm.errors.length;
      _results = [];
      while (existingErrorsCount--) {
        if (this.vm.errors[existingErrorsCount].FileName === filePath) {
          _results.push(this.vm.errors.splice(existingErrorsCount, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ErrorPaneView.prototype.displayQuickFixes = function(quickFixes) {
      var quickFix, _i, _len, _ref, _results;
      this.removeErrorsFor((_ref = quickFixes[0]) != null ? _ref.FileName : void 0);
      _results = [];
      for (_i = 0, _len = quickFixes.length; _i < _len; _i++) {
        quickFix = quickFixes[_i];
        _results.push(this.vm.errors.unshift(quickFix));
      }
      return _results;
    };

    ErrorPaneView.prototype.destroy = function() {
      return this.detach();
    };

    return ErrorPaneView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUyxPQUFBLENBQVEsTUFBUixFQUFULElBQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxPQUFBLENBQVEsY0FBUixDQURWLENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsQ0FGTixDQUFBOztBQUFBLEVBR0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBSEosQ0FBQTs7QUFBQSxFQUtBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLDJDQUFSLENBTGxCLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBRUosb0NBQUEsQ0FBQTs7Ozs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sbUJBQVA7QUFBQSxRQUE0QixNQUFBLEVBQVEsb0JBQXBDO09BQUwsRUFBK0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUM3RCxVQUFBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxZQUFBLE9BQUEsRUFBTyw2QkFBUDtBQUFBLFlBQXNDLFNBQUEsRUFBVyx3QkFBakQ7V0FBSixFQUErRSxTQUFBLEdBQUE7bUJBQzdFLEtBQUMsQ0FBQSxFQUFELENBQUksU0FBQSxHQUFBO0FBQ0YsY0FBQSxLQUFDLENBQUEsSUFBRCxDQUFNLGdDQUFOLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLDRCQUFQO2VBQUwsRUFBMEMsS0FBMUMsRUFGRTtZQUFBLENBQUosRUFENkU7VUFBQSxDQUEvRSxDQUFBLENBQUE7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
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/views/error-pane-view.coffee