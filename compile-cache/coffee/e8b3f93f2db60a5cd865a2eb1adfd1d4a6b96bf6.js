(function() {
  var $$, BufferedProcess, ListView, OutputView, SelectListView, git, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $$ = _ref.$$, BufferedProcess = _ref.BufferedProcess, SelectListView = _ref.SelectListView;

  git = require('../git');

  OutputView = require('./output-view');

  module.exports = ListView = (function(_super) {
    __extends(ListView, _super);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(data, mode, setUpstream) {
      this.data = data;
      this.mode = mode;
      this.setUpstream = setUpstream != null ? setUpstream : false;
      ListView.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      return this.parseData();
    };

    ListView.prototype.parseData = function() {
      var item, items, remotes, _i, _len;
      items = this.data.split("\n");
      remotes = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        if (item !== '') {
          remotes.push({
            name: item
          });
        }
      }
      if (remotes.length === 1) {
        return this.execute(remotes[0].name);
      } else {
        this.setItems(remotes);
        atom.workspaceView.append(this);
        return this.focusFilterEditor();
      }
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.viewForItem = function(_arg) {
      var name;
      name = _arg.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      this.execute(name);
      return this.cancel();
    };

    ListView.prototype.execute = function(remote) {
      var view;
      view = new OutputView();
      return git.cmd({
        args: [this.mode, remote],
        stdout: function(data) {
          return view.addLine(data.toString());
        },
        stderr: function(data) {
          return view.addLine(data.toString());
        },
        exit: (function(_this) {
          return function(code) {
            if (code === 128) {
              view.reset();
              return git.cmd({
                args: [_this.mode, '-u', remote, 'HEAD'],
                stdout: function(data) {
                  return view.addLine(data.toString());
                },
                stderr: function(data) {
                  return view.addLine(data.toString());
                },
                exit: function(code) {
                  return view.finish();
                }
              });
            } else {
              return view.finish();
            }
          };
        })(this)
      });
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9FQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF3QyxPQUFBLENBQVEsTUFBUixDQUF4QyxFQUFDLFVBQUEsRUFBRCxFQUFLLHVCQUFBLGVBQUwsRUFBc0Isc0JBQUEsY0FBdEIsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FIYixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx1QkFBQSxVQUFBLEdBQVksU0FBRSxJQUFGLEVBQVMsSUFBVCxFQUFnQixXQUFoQixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsT0FBQSxJQUNaLENBQUE7QUFBQSxNQURrQixJQUFDLENBQUEsT0FBQSxJQUNuQixDQUFBO0FBQUEsTUFEeUIsSUFBQyxDQUFBLG9DQUFBLGNBQVksS0FDdEMsQ0FBQTtBQUFBLE1BQUEsMENBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsa0JBQVYsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxFQUhVO0lBQUEsQ0FBWixDQUFBOztBQUFBLHVCQUtBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLDhCQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksSUFBWixDQUFSLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxFQURWLENBQUE7QUFFQSxXQUFBLDRDQUFBO3lCQUFBO0FBQ0UsUUFBQSxJQUFpQyxJQUFBLEtBQVEsRUFBekM7QUFBQSxVQUFBLE9BQU8sQ0FBQyxJQUFSLENB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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/views/remote-list-view.coffee