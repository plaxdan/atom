(function() {
  var File, UnstagedFile, git,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  File = require('./file');

  git = require('../../git').git;

  module.exports = UnstagedFile = (function(_super) {
    __extends(UnstagedFile, _super);

    function UnstagedFile() {
      this.checkout = __bind(this.checkout, this);
      return UnstagedFile.__super__.constructor.apply(this, arguments);
    }

    UnstagedFile.prototype.sort_value = 1;

    UnstagedFile.prototype.unstage = function() {
      return git.git("reset HEAD " + (this.path()), this.error_callback);
    };

    UnstagedFile.prototype.kill = function() {
      return atom.confirm({
        message: "Discard unstaged changes to \"" + (this.path()) + "\"?",
        buttons: {
          "Discard": this.checkout,
          "Cancel": function() {
            return null;
          }
        }
      });
    };

    UnstagedFile.prototype.checkout = function() {
      return git.git("checkout " + (this.path()));
    };

    UnstagedFile.prototype.loadDiff = function() {
      return git.diff(this.path(), this.setDiff);
    };

    UnstagedFile.prototype.unstagedP = function() {
      return true;
    };

    return UnstagedFile;

  })(File);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNDLE1BQU8sT0FBQSxDQUFRLFdBQVIsRUFBUCxHQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBR0osbUNBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSwyQkFBQSxVQUFBLEdBQVksQ0FBWixDQUFBOztBQUFBLDJCQUVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxHQUFHLENBQUMsR0FBSixDQUFTLGFBQUEsR0FBWSxDQUFBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBQSxDQUFyQixFQUFpQyxJQUFDLENBQUEsY0FBbEMsRUFETztJQUFBLENBRlQsQ0FBQTs7QUFBQSwyQkFLQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBSSxDQUFDLE9BQUwsQ0FDRTtBQUFBLFFBQUEsT0FBQSxFQUFVLGdDQUFBLEdBQStCLENBQUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFBLENBQS9CLEdBQXdDLEtBQWxEO0FBQUEsUUFDQSxPQUFBLEVBQ0U7QUFBQSxVQUFBLFNBQUEsRUFBVyxJQUFDLENBQUEsUUFBWjtBQUFBLFVBQ0EsUUFBQSxFQUFVLFNBQUEsR0FBQTttQkFBRyxLQUFIO1VBQUEsQ0FEVjtTQUZGO09BREYsRUFESTtJQUFBLENBTE4sQ0FBQTs7QUFBQSwyQkFZQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsR0FBRyxDQUFDLEdBQUosQ0FBUyxXQUFBLEdBQVUsQ0FBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBbkIsRUFEUTtJQUFBLENBWlYsQ0FBQTs7QUFBQSwyQkFlQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFDLENBQUEsSUFBRCxDQUFBLENBQVQsRUFBa0IsSUFBQyxDQUFBLE9BQW5CLEVBRFE7SUFBQSxDQWZWLENBQUE7O0FBQUEsMkJBa0JBLFNBQUEsR0FBVyxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FsQlgsQ0FBQTs7d0JBQUE7O0tBSHlCLEtBSjNCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/files/unstaged-file.coffee