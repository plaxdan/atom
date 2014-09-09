(function() {
  var Commit, ListItem, fs, git, path,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs-plus');

  path = require('path');

  ListItem = require('../list-item');

  git = require('../../git').git;

  module.exports = Commit = (function(_super) {
    __extends(Commit, _super);

    function Commit() {
      this.hardReset = __bind(this.hardReset, this);
      this.showCommitWrite = __bind(this.showCommitWrite, this);
      this.showCommit = __bind(this.showCommit, this);
      this.reset = __bind(this.reset, this);
      return Commit.__super__.constructor.apply(this, arguments);
    }

    Commit.prototype.unicodify = function(s) {
      return decodeURIComponent(escape(s));
    };

    Commit.prototype.commitID = function() {
      return this.get("id");
    };

    Commit.prototype.shortID = function() {
      var _ref;
      return (_ref = this.commitID()) != null ? _ref.substr(0, 6) : void 0;
    };

    Commit.prototype.authorName = function() {
      return this.unicodify(this.get("author").name);
    };

    Commit.prototype.message = function() {
      return this.unicodify(this.get("message") || "");
    };

    Commit.prototype.shortMessage = function() {
      return this.message().split("\n")[0];
    };

    Commit.prototype.open = function() {
      return this.confirmReset();
    };

    Commit.prototype.confirmReset = function() {
      return atom.confirm({
        message: "Soft-reset head to " + (this.shortID()) + "?",
        detailedMessage: this.message(),
        buttons: {
          "Reset": this.reset,
          "Cancel": null
        }
      });
    };

    Commit.prototype.reset = function() {
      return git.git("reset " + (this.commitID()));
    };

    Commit.prototype.confirmHardReset = function() {
      return atom.confirm({
        message: "Do you REALLY want to HARD-reset head to " + (this.shortID()) + "?",
        detailedMessage: this.message(),
        buttons: {
          "Cancel": null,
          "Reset": this.hardReset
        }
      });
    };

    Commit.prototype.showCommit = function() {
      var editor;
      if (this.gitShowMessage == null) {
        return git.showObject(this.commitID(), (function(_this) {
          return function(data) {
            _this.gitShowMessage = decodeURIComponent(escape(data));
            return _this.showCommit();
          };
        })(this));
      } else {
        fs.writeFileSync(path.join(git.getPath(), ".git/" + (this.commitID())), this.gitShowMessage);
        editor = atom.workspace.open(".git/" + (this.commitID()));
        return editor.then((function(_this) {
          return function(e) {
            _this.editor = e;
            _this.editor.setGrammar(atom.syntax.grammarForScopeName('diff.diff'));
            _this.editor.buffer.once('changed', function() {
              return _this.showCommitWrite();
            });
            return _this.editor.buffer.once('destroyed', function() {
              return fs.removeSync(path.join(git.getPath(), ".git/" + (_this.commitID())));
            });
          };
        })(this));
      }
    };

    Commit.prototype.showCommitWrite = function() {
      if (!((this.editor != null) && (this.gitShowMessage != null))) {
        return;
      }
      this.editor.setText(this.gitShowMessage);
      return this.editor.buffer.once('changed', (function(_this) {
        return function() {
          return _this.showCommitWrite();
        };
      })(this));
    };

    Commit.prototype.hardReset = function() {
      return git.git("reset --hard " + (this.commitID()));
    };

    return Commit;

  })(ListItem);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGNBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUMsTUFBTyxPQUFBLENBQVEsV0FBUixFQUFQLEdBSkQsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2QkFBQSxDQUFBOzs7Ozs7OztLQUFBOztBQUFBLHFCQUFBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTthQUNULGtCQUFBLENBQW1CLE1BQUEsQ0FBTyxDQUFQLENBQW5CLEVBRFM7SUFBQSxDQUFYLENBQUE7O0FBQUEscUJBR0EsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxFQURRO0lBQUEsQ0FIVixDQUFBOztBQUFBLHFCQU1BLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7b0RBQVcsQ0FBRSxNQUFiLENBQW9CLENBQXBCLEVBQXVCLENBQXZCLFdBRE87SUFBQSxDQU5ULENBQUE7O0FBQUEscUJBU0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMLENBQWMsQ0FBQyxJQUExQixFQURVO0lBQUEsQ0FUWixDQUFBOztBQUFBLHFCQVlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsU0FBRCxDQUFZLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxDQUFBLElBQW1CLEVBQS9CLEVBRE87SUFBQSxDQVpU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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/commits/commit.coffee