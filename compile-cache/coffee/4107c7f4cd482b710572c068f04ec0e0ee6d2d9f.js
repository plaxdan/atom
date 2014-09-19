(function() {
  var $, GitTabStatus, fs,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require("atom").$;

  fs = require("fs");

  GitTabStatus = (function() {
    function GitTabStatus() {
      this._updateTabStylesForPath = __bind(this._updateTabStylesForPath, this);
      this._updateTabs = __bind(this._updateTabs, this);
    }

    GitTabStatus.prototype.activate = function() {
      return this._setupWatchConditions();
    };

    GitTabStatus.prototype._setupWatchConditions = function() {
      var _ref, _ref1;
      if ((_ref = atom.project.getRepo()) != null) {
        _ref.on("status-changed", this._updateTabs);
      }
      if ((_ref1 = atom.project.getRepo()) != null) {
        _ref1.on("statuses-changed", this._updateTabs);
      }
      return atom.workspace.eachEditor((function(_this) {
        return function(editor) {
          editor.on("contents-modified", _this._updateTabs);
          return editor.on("path-changed", _this._updateTabs);
        };
      })(this));
    };

    GitTabStatus.prototype._updateTabs = function() {
      var editor, _i, _len, _ref, _results;
      _ref = this._getEditors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        editor = _ref[_i];
        _results.push(this._updateTabStylesForPath(editor.getPath()));
      }
      return _results;
    };

    GitTabStatus.prototype._getEditors = function() {
      return atom.workspace.getEditors();
    };

    GitTabStatus.prototype._getRepo = function() {
      return atom.project.getRepo();
    };

    GitTabStatus.prototype._updateTabStylesForPath = function(path) {
      var isIgnored, isModified, isNew, repo, tab;
      if (this._pathExists(path)) {
        repo = this._getRepo();
        isModified = repo != null ? repo.isPathModified(path) : void 0;
        isNew = repo != null ? repo.isPathNew(path) : void 0;
        isIgnored = repo != null ? repo.isPathIgnored(path) : void 0;
        tab = this._findTabForPath(path);
        if (isModified) {
          return tab != null ? tab.addClass("status-modified") : void 0;
        } else if (isNew) {
          return tab != null ? tab.addClass("status-added") : void 0;
        } else if (isIgnored) {
          return tab != null ? tab.addClass("status-ignored") : void 0;
        } else {
          return tab != null ? tab.removeClass("status-added status-modified status-ignored") : void 0;
        }
      }
    };

    GitTabStatus.prototype._pathExists = function(path) {
      return fs.existsSync(path);
    };

    GitTabStatus.prototype._findTabForPath = function(path) {
      path = path.replace(/\\/g, '\\\\');
      return $(".tab [data-path='" + path + "']");
    };

    return GitTabStatus;

  })();

  module.exports = new GitTabStatus();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxNQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUdNOzs7O0tBQ0Y7O0FBQUEsMkJBQUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxxQkFBRCxDQUFBLEVBRE07SUFBQSxDQUFWLENBQUE7O0FBQUEsMkJBR0EscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ25CLFVBQUEsV0FBQTs7WUFBc0IsQ0FBRSxFQUF4QixDQUEyQixnQkFBM0IsRUFBNkMsSUFBQyxDQUFBLFdBQTlDO09BQUE7O2FBQ3NCLENBQUUsRUFBeEIsQ0FBMkIsa0JBQTNCLEVBQStDLElBQUMsQ0FBQSxXQUFoRDtPQURBO2FBRUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUN0QixVQUFBLE1BQU0sQ0FBQyxFQUFQLENBQVUsbUJBQVYsRUFBK0IsS0FBQyxDQUFBLFdBQWhDLENBQUEsQ0FBQTtpQkFDQSxNQUFNLENBQUMsRUFBUCxDQUFVLGNBQVYsRUFBMEIsS0FBQyxDQUFBLFdBQTNCLEVBRnNCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsRUFIbUI7SUFBQSxDQUh2QixDQUFBOztBQUFBLDJCQVVBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDVCxVQUFBLGdDQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBOzBCQUFBO0FBQUEsc0JBQUEsSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBekIsRUFBQSxDQUFBO0FBQUE7c0JBRFM7SUFBQSxDQVZiLENBQUE7O0FBQUEsMkJBYUEsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBZixDQUFBLEVBQUg7SUFBQSxDQWJiLENBQUE7O0FBQUEsMkJBZUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLEVBQUg7SUFBQSxDQWZWLENBQUE7O0FBQUEsMkJBaUJBLHVCQUFBLEdBQXlCLFNBQUMsSUFBRCxHQUFBO0FBQ3JCLFVBQUEsdUNBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLENBQUg7QUFDSSxRQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVAsQ0FBQTtBQUFBLFFBQ0EsVUFBQSxrQkFBYSxJQUFJLENBQUUsY0FBTixDQUFxQixJQUFyQixVQURiLENBQUE7QUFBQSxRQUVBLEtBQUEsa0JBQVEsSUFBSSxDQUFFLFNBQU4sQ0FBZ0IsSUFBaEIsVUFGUixDQUFBO0FBQUEsUUFHQSxTQUFBLGtCQUFZLElBQUksQ0FBRSxhQUFOLENBQW9CLElBQXBCLFVBSFosQ0FBQTtBQUFBLFFBSUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQWpCLENBSk4sQ0FBQTtBQUtBLFFBQUEsSUFBRyxVQUFIOytCQUNJLEdBQUcsQ0FBRSxRQUFMLENBQWMsaUJBQWQsV0FESjtTQUFBLE1BRUssSUFBRyxLQUFIOytCQUNELEdBQUcsQ0FBRSxRQUFMLENBQWMsY0FBZCxXQURDO1NBQUEsTUFFQSxJQUFHLFNBQUg7K0JBQ0QsR0FBRyxDQUFFLFFBQUwsQ0FBYyxnQkFBZCxXQURDO1NBQUEsTUFBQTsrQkFHRCxHQUFHLENBQUUsV0FBTCxDQUFpQiw2Q0FBakIsV0FIQztTQVZUO09BRHFCO0lBQUEsQ0FqQnpCLENBQUE7O0FBQUEsMkJBaUNBLFdBQUEsR0FBYSxTQUFDLElBQUQsR0FBQTthQUFVLEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBZCxFQUFWO0lBQUEsQ0FqQ2IsQ0FBQTs7QUFBQSwyQkFtQ0EsZUFBQSxHQUFpQixTQUFDLElBQUQsR0FBQTtBQUNiLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixNQUFwQixDQUFQLENBQUE7YUFDQSxDQUFBLENBQUcsbUJBQUEsR0FBa0IsSUFBbEIsR0FBd0IsSUFBM0IsRUFGYTtJQUFBLENBbkNqQixDQUFBOzt3QkFBQTs7TUFKSixDQUFBOztBQUFBLEVBMkNBLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsWUFBQSxDQUFBLENBM0NyQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/git-tab-status/lib/git-tab-status.coffee