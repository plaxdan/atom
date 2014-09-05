(function() {
  var $$, ColumnView, GitLogView, InfoPanelView, MainPanelView, ScrollView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $$ = _ref.$$, ScrollView = _ref.ScrollView, View = _ref.View;

  module.exports = GitLogView = (function(_super) {
    __extends(GitLogView, _super);

    GitLogView.content = function() {
      return this.div({
        "class": 'git-log native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.subview('main_panel', new MainPanelView);
          return _this.subview('info_panel', new InfoPanelView);
        };
      })(this));
    };

    function GitLogView() {
      GitLogView.__super__.constructor.apply(this, arguments);
    }

    return GitLogView;

  })(View);

  MainPanelView = (function(_super) {
    __extends(MainPanelView, _super);

    function MainPanelView() {
      return MainPanelView.__super__.constructor.apply(this, arguments);
    }

    MainPanelView.content = function() {
      return this.div({
        "class": 'main panels'
      }, (function(_this) {
        return function() {
          _this.subview('graph', new ColumnView('Graph', 'graph'));
          return _this.div({
            "class": 'table',
            outlet: 'table'
          }, function() {
            _this.subview('comments', new ColumnView('Description', 'comments', true));
            _this.subview('commit', new ColumnView('Commit', 'commit', true));
            _this.subview('date', new ColumnView('Date', 'date', true));
            return _this.subview('author', new ColumnView('Author', 'author'));
          });
        };
      })(this));
    };

    return MainPanelView;

  })(ScrollView);

  InfoPanelView = (function(_super) {
    __extends(InfoPanelView, _super);

    function InfoPanelView() {
      return InfoPanelView.__super__.constructor.apply(this, arguments);
    }

    InfoPanelView.content = function() {
      return this.div({
        "class": 'info panels'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'info-data',
            outlet: 'info_data'
          });
          _this.div({
            "class": 'info-image',
            outlet: 'info_image'
          });
          return _this.div({
            "class": 'info-file',
            outlet: 'info_file'
          }, function() {
            _this.subview('status', new ColumnView('Status', 'status'));
            _this.subview('name', new ColumnView('Filename', 'file'));
            _this.subview('path', new ColumnView('Path', 'path'));
            _this.subview('addition', new ColumnView('Addition', 'add'));
            return _this.subview('deletion', new ColumnView('Deletion', 'del'));
          });
        };
      })(this));
    };

    InfoPanelView.prototype.add_content = function(head, content) {
      return this.info_data.append($$(function() {
        return this.h2((function(_this) {
          return function() {
            _this.text(head);
            return _this.span(content);
          };
        })(this));
      }));
    };

    return InfoPanelView;

  })(ScrollView);

  ColumnView = (function(_super) {
    __extends(ColumnView, _super);

    function ColumnView() {
      return ColumnView.__super__.constructor.apply(this, arguments);
    }

    ColumnView.content = function(title, class_name, resizable) {
      return this.div({
        "class": 'column ' + class_name
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'list-head'
          }, function() {
            _this.h2(title);
            if (resizable) {
              return _this.div({
                "class": 'resize-handle'
              });
            }
          });
          return _this.div({
            "class": 'list',
            outlet: 'list'
          });
        };
      })(this));
    };

    ColumnView.prototype.add_content = function(content) {
      return this.list.append($$(function() {
        return this.p((function(_this) {
          return function() {
            return _this.span(content);
          };
        })(this));
      }));
    };

    return ColumnView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdGQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF5QixPQUFBLENBQVEsTUFBUixDQUF6QixFQUFDLFVBQUEsRUFBRCxFQUFLLGtCQUFBLFVBQUwsRUFBaUIsWUFBQSxJQUFqQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUNGLGlDQUFBLENBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyw2QkFBUDtBQUFBLFFBQXNDLFFBQUEsRUFBVSxDQUFBLENBQWhEO09BQUwsRUFBeUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNyRCxVQUFBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixHQUFBLENBQUEsYUFBdkIsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixHQUFBLENBQUEsYUFBdkIsRUFGcUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6RCxFQURNO0lBQUEsQ0FBVixDQUFBOztBQUthLElBQUEsb0JBQUEsR0FBQTtBQUNULE1BQUEsNkNBQUEsU0FBQSxDQUFBLENBRFM7SUFBQSxDQUxiOztzQkFBQTs7S0FEcUIsS0FKekIsQ0FBQTs7QUFBQSxFQWNNO0FBQ0Ysb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE9BQUQsR0FBUyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sYUFBUDtPQUFMLEVBQTJCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFD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
//# sourceURL=/Users/daniel/.atom/packages/git-log/lib/git-log-class.coffee