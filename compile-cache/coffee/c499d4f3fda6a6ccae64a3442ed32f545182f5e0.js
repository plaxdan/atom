(function() {
  var Branch, Commit, ListItem, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ListItem = require('../list-item');

  Commit = require('../commits/commit');

  git = require('../../git').git;

  module.exports = Branch = (function(_super) {
    __extends(Branch, _super);

    function Branch() {
      return Branch.__super__.constructor.apply(this, arguments);
    }

    Branch.prototype.name = function() {
      return decodeURIComponent(escape(this.get("name")));
    };

    Branch.prototype.localName = function() {
      return this.name();
    };

    Branch.prototype.head = function() {
      return this.get("commit").id;
    };

    Branch.prototype.commit = function() {
      return new Commit(this.get("commit"));
    };

    Branch.prototype.remoteName = function() {
      return "";
    };

    Branch.prototype.unpushed = function() {
      return false;
    };

    Branch.prototype.kill = function() {
      return atom.confirm({
        message: "Delete branch " + (this.name()) + "?",
        buttons: {
          "Delete": this["delete"],
          "Cancel": null
        }
      });
    };

    Branch.prototype.open = function() {
      return this.checkout();
    };

    Branch.prototype.checkout = function(callback) {
      return git.git("checkout " + (this.localName()));
    };

    Branch.prototype.push = function() {
      return null;
    };

    Branch.prototype["delete"] = function() {
      return null;
    };

    return Branch;

  })(ListItem);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGNBQVIsQ0FBWCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxtQkFBUixDQURULENBQUE7O0FBQUEsRUFFQyxNQUFPLE9BQUEsQ0FBUSxXQUFSLEVBQVAsR0FGRCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDZCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxxQkFBQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBR0osa0JBQUEsQ0FBbUIsTUFBQSxDQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxDQUFQLENBQW5CLEVBSEk7SUFBQSxDQUFOLENBQUE7O0FBQUEscUJBS0EsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNULElBQUMsQ0FBQSxJQUFELENBQUEsRUFEUztJQUFBLENBTFgsQ0FBQTs7QUFBQSxxQkFRQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMLENBQWMsQ0FBQyxHQURYO0lBQUEsQ0FSTixDQUFBOztBQUFBLHFCQVdBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDRixJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsQ0FBUCxFQURFO0lBQUEsQ0FYUixDQUFBOztBQUFBLHFCQWNBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxHQUFIO0lBQUEsQ0FkWixDQUFBOztBQUFBLHFCQWdCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQUcsTUFBSDtJQUFBLENBaEJWLENBQUE7O0FBQUEscUJBa0JBLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFDSixJQUFJLENBQUMsT0FBTCxDQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVUsZ0JBQUEsR0FBZSxDQUFBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBQSxDQUFmLEdBQXdCLEdBQWxDO0FBQUEsUUFDQSxPQUFBLEVBQ0U7QUFBQSxVQUFBLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFBQSxDQUFYO0FBQUEsVUFDQSxRQUFBLEVBQVUsSUFEVjtTQUZGO09BREYsRUFESTtJQUFBLENBbEJOLENBQUE7O0FBQUEscUJBeUJBLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFDSixJQUFDLENBQUEsUUFBRCxDQUFBLEVBREk7SUFBQSxDQXpCTixDQUFBOztBQUFBLHFCQTRCQSxRQUFBLEdBQVUsU0FBQyxRQUFELEdBQUE7YUFDUixHQUFHLENBQUMsR0FBSixDQUFTLFdBQUEsR0FBVSxDQUFBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxDQUFuQixFQURRO0lBQUEsQ0E1QlYsQ0FBQTs7QUFBQSxxQkErQkEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQS9CTixDQUFBOztBQUFBLHFCQWlDQSxTQUFBLEdBQVEsU0FBQSxHQUFBO2FBQUcsS0FBSDtJQUFBLENBakNSLENBQUE7O2tCQUFBOztLQURtQixTQUxyQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/branches/branch.coffee