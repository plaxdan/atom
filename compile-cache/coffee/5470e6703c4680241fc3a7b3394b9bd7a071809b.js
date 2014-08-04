(function() {
  var $$, GitShow, SelectListView, StatusView, TagView, git, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  git = require('../git');

  GitShow = require('../models/git-show');

  StatusView = require('./status-view');

  module.exports = TagView = (function(_super) {
    __extends(TagView, _super);

    function TagView() {
      return TagView.__super__.constructor.apply(this, arguments);
    }

    TagView.prototype.initialize = function(tag) {
      this.tag = tag;
      TagView.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      return this.parseData();
    };

    TagView.prototype.parseData = function() {
      var items;
      items = [];
      items.push({
        tag: this.tag,
        cmd: 'Show',
        description: 'git show'
      });
      items.push({
        tag: this.tag,
        cmd: 'Checkout',
        description: 'git checkout'
      });
      items.push({
        tag: this.tag,
        cmd: 'Verify',
        description: 'git tag --verify'
      });
      items.push({
        tag: this.tag,
        cmd: 'Delete',
        description: 'git tag --delete'
      });
      this.setItems(items);
      atom.workspaceView.append(this);
      return this.focusFilterEditor();
    };

    TagView.prototype.viewForItem = function(_arg) {
      var cmd, description, tag;
      tag = _arg.tag, cmd = _arg.cmd, description = _arg.description;
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'text-highlight'
            }, cmd);
            return _this.div({
              "class": 'text-warning'
            }, "" + description + " " + tag);
          };
        })(this));
      });
    };

    TagView.prototype.getFilterKey = function() {
      return 'cmd';
    };

    TagView.prototype.confirmed = function(_arg) {
      var args, cmd, tag;
      tag = _arg.tag, cmd = _arg.cmd;
      this.cancel();
      switch (cmd) {
        case 'Show':
          GitShow(tag);
          return;
        case 'Checkout':
          args = ['checkout', tag];
          break;
        case 'Verify':
          args = ['tag', '--verify', tag];
          break;
        case 'Delete':
          args = ['tag', '--delete', tag];
      }
      return git.cmd({
        args: args,
        stdout: function(data) {
          return new StatusView({
            type: 'success',
            message: data.toString()
          });
        }
      });
    };

    return TagView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF1QixPQUFBLENBQVEsTUFBUixDQUF2QixFQUFDLFVBQUEsRUFBRCxFQUFLLHNCQUFBLGNBQUwsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLG9CQUFSLENBSFYsQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUpiLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHNCQUFBLFVBQUEsR0FBWSxTQUFFLEdBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLE1BQUEsR0FDWixDQUFBO0FBQUEsTUFBQSx5Q0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxrQkFBVixDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsU0FBRCxDQUFBLEVBSFU7SUFBQSxDQUFaLENBQUE7O0FBQUEsc0JBS0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLEVBQVIsQ0FBQTtBQUFBLE1BQ0EsS0FBSyxDQUFDLElBQU4sQ0FBVztBQUFBLFFBQUMsR0FBQSxFQUFLLElBQUMsQ0FBQSxHQUFQO0FBQUEsUUFBWSxHQUFBLEVBQUssTUFBakI7QUFBQSxRQUF5QixXQUFBLEVBQWEsVUFBdEM7T0FBWCxDQURBLENBQUE7QUFBQSxNQUVBLEtBQUssQ0FBQyxJQUFOLENBQVc7QUFBQSxRQUFDLEdBQUEsRUFBSyxJQUFDLENBQUEsR0FBUDtBQUFBLFFBQVksR0FBQSxFQUFLLFVB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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/views/tag-view.coffee