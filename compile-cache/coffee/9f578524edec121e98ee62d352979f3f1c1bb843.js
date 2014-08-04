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

    ListView.prototype.initialize = function(data, mode, setUpstream, tag) {
      this.data = data;
      this.mode = mode;
      this.setUpstream = setUpstream != null ? setUpstream : false;
      this.tag = tag != null ? tag : '';
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
        args: [this.mode, remote, this.tag],
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9FQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF3QyxPQUFBLENBQVEsTUFBUixDQUF4QyxFQUFDLFVBQUEsRUFBRCxFQUFLLHVCQUFBLGVBQUwsRUFBc0Isc0JBQUEsY0FBdEIsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FIYixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx1QkFBQSxVQUFBLEdBQVksU0FBRSxJQUFGLEVBQVMsSUFBVCxFQUFnQixXQUFoQixFQUFvQyxHQUFwQyxHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsT0FBQSxJQUNaLENBQUE7QUFBQSxNQURrQixJQUFDLENBQUEsT0FBQSxJQUNuQixDQUFBO0FBQUEsTUFEeUIsSUFBQyxDQUFBLG9DQUFBLGNBQVksS0FDdEMsQ0FBQTtBQUFBLE1BRDZDLElBQUMsQ0FBQSxvQkFBQSxNQUFJLEVBQ2xELENBQUE7QUFBQSxNQUFBLDBDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLGtCQUFWLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxTQUFELENBQUEsRUFIVTtJQUFBLENBQVosQ0FBQTs7QUFBQSx1QkFLQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSw4QkFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVosQ0FBUixDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsRUFEVixDQUFBO0FBRUEsV0FBQSw0Q0FBQTt5QkFBQTtBQUNF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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/views/remote-list-view.coffee