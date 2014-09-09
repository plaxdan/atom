(function() {
  var File, UntrackedFile, git, shell,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  shell = require('shell');

  File = require('./file');

  git = require('../../git').git;

  module.exports = UntrackedFile = (function(_super) {
    __extends(UntrackedFile, _super);

    function UntrackedFile() {
      this.moveToTrash = __bind(this.moveToTrash, this);
      this.kill = __bind(this.kill, this);
      return UntrackedFile.__super__.constructor.apply(this, arguments);
    }

    UntrackedFile.prototype.sort_value = 0;

    UntrackedFile.prototype.kill = function() {
      return atom.confirm({
        message: "Move \"" + (this.path()) + "\" to trash?",
        buttons: {
          "Trash": this.moveToTrash,
          "Cancel": null
        }
      });
    };

    UntrackedFile.prototype.moveToTrash = function() {
      shell.moveItemToTrash(git.path + "/" + this.path());
      return git.trigger("reload");
    };

    UntrackedFile.prototype.untrackedP = function() {
      return true;
    };

    UntrackedFile.prototype.toggleDiff = function() {
      return null;
    };

    return UntrackedFile;

  })(File);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQUZQLENBQUE7O0FBQUEsRUFJQyxNQUFPLE9BQUEsQ0FBUSxXQUFSLEVBQVAsR0FKRCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUdKLG9DQUFBLENBQUE7Ozs7OztLQUFBOztBQUFBLDRCQUFBLFVBQUEsR0FBWSxDQUFaLENBQUE7O0FBQUEsNEJBRUEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUksQ0FBQyxPQUFMLENBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBVSxTQUFBLEdBQVEsQ0FBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBUixHQUFpQixjQUEzQjtBQUFBLFFBQ0EsT0FBQSxFQUNFO0FBQUEsVUFBQSxPQUFBLEVBQVMsSUFBQyxDQUFBLFdBQVY7QUFBQSxVQUNBLFFBQUEsRUFBVSxJQURWO1NBRkY7T0FERixFQURJO0lBQUEsQ0FGTixDQUFBOztBQUFBLDRCQVNBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxNQUFBLEtBQUssQ0FBQyxlQUFOLENBQXNCLEdBQUcsQ0FBQyxJQUFKLEdBQVcsR0FBWCxHQUFpQixJQUFDLENBQUEsSUFBRCxDQUFBLENBQXZDLENBQUEsQ0FBQTthQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixFQUZXO0lBQUEsQ0FUYixDQUFBOztBQUFBLDRCQWFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FiWixDQUFBOztBQUFBLDRCQWVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FmWixDQUFBOzt5QkFBQTs7S0FIMEIsS0FQNUIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/files/untracked-file.coffee