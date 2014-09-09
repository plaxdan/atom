(function() {
  var FileListView, FileView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  FileView = require('./file-view');

  module.exports = FileListView = (function(_super) {
    __extends(FileListView, _super);

    function FileListView() {
      this.repopulate = __bind(this.repopulate, this);
      return FileListView.__super__.constructor.apply(this, arguments);
    }

    FileListView.content = function() {
      return this.div({
        "class": "file-list-view list-view",
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.h2({
            outlet: "untrackedHeader"
          }, "untracked:");
          _this.div({
            "class": "untracked",
            outlet: "untracked"
          });
          _this.h2({
            outlet: "unstagedHeader"
          }, "unstaged:");
          _this.div({
            "class": "unstaged",
            outlet: "unstaged"
          });
          _this.h2({
            outlet: "stagedHeader"
          }, "staged:");
          return _this.div({
            "class": "staged",
            outlet: "staged"
          });
        };
      })(this));
    };

    FileListView.prototype.initialize = function(fileList) {
      this.model = fileList;
      return this.model.on("repopulate", this.repopulate);
    };

    FileListView.prototype.beforeRemove = function() {
      return this.model.off("repopulate", this.repopulate);
    };

    FileListView.prototype.repopulateUntracked = function() {
      var file, _i, _len, _ref, _results;
      this.untracked.empty();
      _ref = this.model.untracked();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        _results.push(this.untracked.append(new FileView(file)));
      }
      return _results;
    };

    FileListView.prototype.repopulateUnstaged = function() {
      var file, _i, _len, _ref, _results;
      this.unstaged.empty();
      _ref = this.model.unstaged();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        _results.push(this.unstaged.append(new FileView(file)));
      }
      return _results;
    };

    FileListView.prototype.repopulateStaged = function() {
      var file, _i, _len, _ref, _results;
      this.staged.empty();
      _ref = this.model.staged();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        _results.push(this.staged.append(new FileView(file)));
      }
      return _results;
    };

    FileListView.prototype.repopulate = function() {
      this.repopulateUntracked();
      this.repopulateUnstaged();
      return this.repopulateStaged();
    };

    return FileListView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osbUNBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDBCQUFQO0FBQUEsUUFBbUMsUUFBQSxFQUFVLENBQUEsQ0FBN0M7T0FBTCxFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BELFVBQUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLGlCQUFSO1dBQUosRUFBK0IsWUFBL0IsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sV0FBUDtBQUFBLFlBQW9CLE1BQUEsRUFBUSxXQUE1QjtXQUFMLENBREEsQ0FBQTtBQUFBLFVBRUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLGdCQUFSO1dBQUosRUFBOEIsV0FBOUIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sVUFBUDtBQUFBLFlBQW1CLE1BQUEsRUFBUSxVQUEzQjtXQUFMLENBSEEsQ0FBQTtBQUFBLFVBSUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLGNBQVI7V0FBSixFQUE0QixTQUE1QixDQUpBLENBQUE7aUJBS0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFFBQVA7QUFBQSxZQUFpQixNQUFBLEVBQVEsUUFBekI7V0FBTCxFQU5vRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsMkJBU0EsVUFBQSxHQUFZLFNBQUMsUUFBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLFFBQVQsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFlBQVYsRUFBd0IsSUFBQyxDQUFBLFVBQXpCLEVBRlU7SUFBQSxDQVRaLENBQUE7O0FBQUEsMkJBYUEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNaLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBeUIsSUFBQyxDQUFBLFVBQTFCLEVBRFk7SUFBQSxDQWJkLENBQUE7O0FBQUEsMkJBZ0JBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUNuQixVQUFBLDhCQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFBLENBQUE7QUFFQTtBQUFBO1dBQUEsMkNBQUE7d0JBQUE7QUFDRSxzQkFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBc0IsSUFBQSxRQUFBLENBQVMsSUFBVCxDQUF0QixFQUFBLENBREY7QUFBQTtzQkFIbUI7SUFBQSxDQWhCckIsQ0FBQTs7QUFBQSwyQkFzQkEsa0JBQUEsR0FBb0IsU0FBQSxHQUFBO0FBQ2xCLFVBQUEsOEJBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFBLENBQUEsQ0FBQTtBQUVBO0FBQUE7V0FBQSwyQ0FBQTt3QkFBQTtBQUNFLHNCQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFxQixJQUFBLFFBQUEsQ0FBUyxJQUFULENBQXJCLEVBQUEsQ0FERjtBQUFBO3NCQUhrQjtJQUFBLENBdEJwQixDQUFBOztBQUFBLDJCQTRCQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsVUFBQSw4QkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQUEsQ0FBQSxDQUFBO0FBRUE7QUFBQTtXQUFBLDJDQUFBO3dCQUFBO0FBQ0Usc0JBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQW1CLElBQUEsUUFBQSxDQUFTLElBQVQsQ0FBbkIsRUFBQSxDQURGO0FBQUE7c0JBSGdCO0lBQUEsQ0E1QmxCLENBQUE7O0FBQUEsMkJBa0NBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLGdCQUFELENBQUEsRUFIVTtJQUFBLENBbENaLENBQUE7O3dCQUFBOztLQUR5QixLQUozQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/files/file-list-view.coffee