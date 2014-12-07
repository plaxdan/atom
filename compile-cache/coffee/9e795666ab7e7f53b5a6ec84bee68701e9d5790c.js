(function() {
  var File, UntrackedFile, git,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  git = require('../../git');

  File = require('./file');

  module.exports = UntrackedFile = (function(_super) {
    __extends(UntrackedFile, _super);

    function UntrackedFile() {
      this.moveToTrash = __bind(this.moveToTrash, this);
      this.kill = __bind(this.kill, this);
      return UntrackedFile.__super__.constructor.apply(this, arguments);
    }

    UntrackedFile.prototype.sortValue = 0;

    UntrackedFile.prototype.kill = function() {
      return atom.confirm({
        message: "Move \"" + (this.path()) + "\" to trash?",
        buttons: {
          'Trash': this.moveToTrash,
          'Cancel': null
        }
      });
    };

    UntrackedFile.prototype.moveToTrash = function() {
      return this.trigger('update');
    };

    UntrackedFile.prototype.isUntracked = function() {
      return true;
    };

    UntrackedFile.prototype.toggleDiff = function() {};

    return UntrackedFile;

  })(File);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFPLE9BQUEsQ0FBUSxXQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBR0osb0NBQUEsQ0FBQTs7Ozs7O0tBQUE7O0FBQUEsNEJBQUEsU0FBQSxHQUFXLENBQVgsQ0FBQTs7QUFBQSw0QkFFQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBSSxDQUFDLE9BQUwsQ0FDRTtBQUFBLFFBQUEsT0FBQSxFQUFVLFNBQUEsR0FBUSxDQUFBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBQSxDQUFSLEdBQWlCLGNBQTNCO0FBQUEsUUFDQSxPQUFBLEVBQ0U7QUFBQSxVQUFBLE9BQUEsRUFBUyxJQUFDLENBQUEsV0FBVjtBQUFBLFVBQ0EsUUFBQSxFQUFVLElBRFY7U0FGRjtPQURGLEVBREk7SUFBQSxDQUZOLENBQUE7O0FBQUEsNEJBU0EsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUVYLElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUZXO0lBQUEsQ0FUYixDQUFBOztBQUFBLDRCQWFBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FiYixDQUFBOztBQUFBLDRCQWVBLFVBQUEsR0FBWSxTQUFBLEdBQUEsQ0FmWixDQUFBOzt5QkFBQTs7S0FIMEIsS0FKNUIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/files/untracked-file.coffee