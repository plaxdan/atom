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
      return setInterval(this._updateTabs, 600);
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
      return atom.workspace.getTextEditors();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxNQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUdNOzs7O0tBQ0Y7O0FBQUEsMkJBQUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxxQkFBRCxDQUFBLEVBRE07SUFBQSxDQUFWLENBQUE7O0FBQUEsMkJBR0EscUJBQUEsR0FBdUIsU0FBQSxHQUFBO2FBQ25CLFdBQUEsQ0FBWSxJQUFDLENBQUEsV0FBYixFQUEwQixHQUExQixFQURtQjtJQUFBLENBSHZCLENBQUE7O0FBQUEsMkJBTUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNULFVBQUEsZ0NBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7MEJBQUE7QUFBQSxzQkFBQSxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUF6QixFQUFBLENBQUE7QUFBQTtzQkFEUztJQUFBLENBTmIsQ0FBQTs7QUFBQSwyQkFTQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQUEsRUFBSDtJQUFBLENBVGIsQ0FBQTs7QUFBQSwyQkFXQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsRUFBSDtJQUFBLENBWFYsQ0FBQTs7QUFBQSwyQkFhQSx1QkFBQSxHQUF5QixTQUFDLElBQUQsR0FBQTtBQUNyQixVQUFBLHVDQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixDQUFIO0FBQ0ksUUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFQLENBQUE7QUFBQSxRQUNBLFVBQUEsa0JBQWEsSUFBSSxDQUFFLGNBQU4sQ0FBcUIsSUFBckIsVUFEYixDQUFBO0FBQUEsUUFFQSxLQUFBLGtCQUFRLElBQUksQ0FBRSxTQUFOLENBQWdCLElBQWhCLFVBRlIsQ0FBQTtBQUFBLFFBR0EsU0FBQSxrQkFBWSxJQUFJLENBQUUsYUFBTixDQUFvQixJQUFwQixVQUhaLENBQUE7QUFBQSxRQUlBLEdBQUEsR0FBTSxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQixDQUpOLENBQUE7QUFLQSxRQUFBLElBQUcsVUFBSDsrQkFDSSxHQUFHLENBQUUsUUFBTCxDQUFjLGlCQUFkLFdBREo7U0FBQSxNQUVLLElBQUcsS0FBSDsrQkFDRCxHQUFHLENBQUUsUUFBTCxDQUFjLGNBQWQsV0FEQztTQUFBLE1BRUEsSUFBRyxTQUFIOytCQUNELEdBQUcsQ0FBRSxRQUFMLENBQWMsZ0JBQWQsV0FEQztTQUFBLE1BQUE7K0JBR0QsR0FBRyxDQUFFLFdBQUwsQ0FBaUIsNkNBQWpCLFdBSEM7U0FWVDtPQURxQjtJQUFBLENBYnpCLENBQUE7O0FBQUEsMkJBNkJBLFdBQUEsR0FBYSxTQUFDLElBQUQsR0FBQTthQUFVLEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBZCxFQUFWO0lBQUEsQ0E3QmIsQ0FBQTs7QUFBQSwyQkErQkEsZUFBQSxHQUFpQixTQUFDLElBQUQsR0FBQTtBQUNiLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixNQUFwQixDQUFQLENBQUE7YUFDQSxDQUFBLENBQUcsbUJBQUEsR0FBa0IsSUFBbEIsR0FBd0IsSUFBM0IsRUFGYTtJQUFBLENBL0JqQixDQUFBOzt3QkFBQTs7TUFKSixDQUFBOztBQUFBLEVBdUNBLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsWUFBQSxDQUFBLENBdkNyQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/git-tab-status/lib/git-tab-status.coffee