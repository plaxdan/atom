(function() {
  var Diff, File, ListItem, git, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  ListItem = require('../list-item');

  Diff = require('../diffs/diff');

  git = require('../../git').git;

  module.exports = File = (function(_super) {
    __extends(File, _super);

    function File() {
      this.commitMessage = __bind(this.commitMessage, this);
      this.setDiff = __bind(this.setDiff, this);
      return File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.initialize = function(path) {
      this.set({
        'path': path.path
      });
      this.set({
        'diffType': path.type
      });
      this.set({
        diff: false
      });
      this.loadDiff();
      return this.deselect();
    };

    File.prototype.path = function() {
      return this.get("path");
    };

    File.prototype.showDiffP = function() {
      return this.get("diff");
    };

    File.prototype.diff = function() {
      return this.sublist;
    };

    File.prototype.diffType = function() {
      return this.get("diffType");
    };

    File.prototype.stage = function() {
      return git.add(this.path(), function() {
        return null;
      });
    };

    File.prototype.setDiff = function(diff) {
      this.sublist = new Diff(diff);
      return this.trigger("change:diff");
    };

    File.prototype.toggleDiff = function() {
      return this.set({
        diff: !this.get("diff")
      });
    };

    File.prototype.useSublist = function() {
      return this.showDiffP();
    };

    File.prototype.open = function() {
      return atom.workspaceView.open(this.path());
    };

    File.prototype.commitMessage = function() {
      var switch_state;
      switch_state = function(type) {
        switch (type) {
          case "M":
            return "modified:   ";
          case "R":
            return "renamed:    ";
          case "D":
            return "deleted:    ";
          case "A":
            return "new file:   ";
          default:
            return "";
        }
      };
      return "#\t\t" + (switch_state(this.diffType())) + (this.path()) + "\n";
    };

    File.prototype.unstage = function() {
      return null;
    };

    File.prototype.kill = function() {
      return null;
    };

    File.prototype.loadDiff = function() {
      return null;
    };

    File.prototype.stagedP = function() {
      return false;
    };

    File.prototype.unstagedP = function() {
      return false;
    };

    File.prototype.untrackedP = function() {
      return false;
    };

    return File;

  })(ListItem);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsY0FBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUMsTUFBTyxPQUFBLENBQVEsV0FBUixFQUFQLEdBSkQsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwyQkFBQSxDQUFBOzs7Ozs7S0FBQTs7QUFBQSxtQkFBQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE1BQUEsRUFBUSxJQUFJLENBQUMsSUFBYjtPQUFMLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsVUFBQSxFQUFZLElBQUksQ0FBQyxJQUFqQjtPQUFMLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsSUFBQSxFQUFNLEtBQU47T0FBTCxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FIQSxDQUFBO2FBSUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUxVO0lBQUEsQ0FBWixDQUFBOztBQUFBLG1CQU9BLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFDSixJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFESTtJQUFBLENBUE4sQ0FBQTs7QUFBQSxtQkFVQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQ1QsSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMLEVBRFM7SUFBQSxDQVZYLENBQUE7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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/files/file.coffee