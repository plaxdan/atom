(function() {
  var Commit, ErrorView, ListItem, fs, git, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  fs = require('fs-plus');

  path = require('path');

  git = require('../../git');

  ListItem = require('../list-item');

  ErrorView = require('../../views/error-view');

  Commit = (function(_super) {
    __extends(Commit, _super);

    function Commit() {
      this.showCommit = __bind(this.showCommit, this);
      this.hardReset = __bind(this.hardReset, this);
      this.reset = __bind(this.reset, this);
      this.confirmHardReset = __bind(this.confirmHardReset, this);
      this.confirmReset = __bind(this.confirmReset, this);
      this.open = __bind(this.open, this);
      this.shortMessage = __bind(this.shortMessage, this);
      this.message = __bind(this.message, this);
      this.authorName = __bind(this.authorName, this);
      this.shortID = __bind(this.shortID, this);
      this.commitID = __bind(this.commitID, this);
      return Commit.__super__.constructor.apply(this, arguments);
    }

    Commit.prototype.initialize = function(gitCommit) {
      Commit.__super__.initialize.call(this);
      if (!_.isString(gitCommit) && _.isObject(gitCommit)) {
        this.set('author', gitCommit.author);
        this.set('id', gitCommit.ref);
        return this.set('message', gitCommit.message);
      }
    };

    Commit.prototype.unicodify = function(str) {
      try {
        str = decodeURIComponent(escape(str));
      } catch (_error) {}
      return str;
    };

    Commit.prototype.commitID = function() {
      return this.get('id');
    };

    Commit.prototype.shortID = function() {
      var _ref;
      return (_ref = this.commitID()) != null ? _ref.substr(0, 6) : void 0;
    };

    Commit.prototype.authorName = function() {
      var _ref;
      return this.unicodify((_ref = this.get('author')) != null ? _ref.name : void 0);
    };

    Commit.prototype.message = function() {
      return this.unicodify(this.get('message') || '\n');
    };

    Commit.prototype.shortMessage = function() {
      return this.message().split('\n')[0];
    };

    Commit.prototype.open = function() {
      return this.confirmReset();
    };

    Commit.prototype.confirmReset = function() {
      return atom.confirm({
        message: "Soft-reset head to " + (this.shortID()) + "?",
        detailedMessage: this.message(),
        buttons: {
          'Reset': this.reset,
          'Cancel': null
        }
      });
    };

    Commit.prototype.confirmHardReset = function() {
      return atom.confirm({
        message: "Do you REALLY want to HARD-reset head to " + (this.shortID()) + "?",
        detailedMessage: this.message(),
        buttons: {
          'Cancel': null,
          'Reset': this.hardReset
        }
      });
    };

    Commit.prototype.reset = function() {
      return git.reset(this.commitID()).then((function(_this) {
        return function() {
          return _this.trigger('update');
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    Commit.prototype.hardReset = function() {
      return git.reset(this.commitID(), {
        hard: true
      }).then((function(_this) {
        return function() {
          return _this.trigger('update');
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    Commit.prototype.showCommit = function() {
      var editor, gitPath, _ref, _ref1, _ref2;
      if (this.gitShowMessage == null) {
        return git.show(this.commitID()).then((function(_this) {
          return function(data) {
            _this.gitShowMessage = _this.unicodify(data);
            return _this.showCommit();
          };
        })(this))["catch"](function(error) {
          return new ErrorView(error);
        });
      } else {
        gitPath = ((_ref = atom.project) != null ? (_ref1 = _ref.getRepo()) != null ? _ref1.getPath() : void 0 : void 0) || ((_ref2 = atom.project) != null ? _ref2.getPath() : void 0);
        fs.writeFileSync(path.join(gitPath, ".git/" + (this.commitID())), this.gitShowMessage);
        editor = atom.workspace.open(path.join(gitPath, ".git/" + (this.commitID())));
        return editor.then((function(_this) {
          return function(editor) {
            _this.editor = editor;
            _this.editor.setGrammar(atom.syntax.grammarForScopeName('diff.diff'));
            return _this.editor.buffer.once('destroyed', function() {
              return fs.removeSync(path.join(gitPath, ".git/" + (_this.commitID())));
            });
          };
        })(this));
      }
    };

    return Commit;

  })(ListItem);

  module.exports = Commit;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQURQLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsR0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBSlosQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQUxaLENBQUE7O0FBQUEsRUFNQSxTQUFBLEdBQVksT0FBQSxDQUFRLHdCQUFSLENBTlosQ0FBQTs7QUFBQSxFQVFNO0FBSUosNkJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7O0tBQUE7O0FBQUEscUJBQUEsVUFBQSxHQUFZLFNBQUMsU0FBRCxHQUFBO0FBQ1YsTUFBQSxxQ0FBQSxDQUFBLENBQUE7QUFDQSxNQUFBLElBQUcsQ0FBQSxDQUFLLENBQUMsUUFBRixDQUFXLFNBQVgsQ0FBSixJQUE4QixDQUFDLENBQUMsUUFBRixDQUFXLFNBQVgsQ0FBakM7QUFDRSxRQUFBLElBQUMsQ0FBQSxHQUFELENBQUssUUFBTCxFQUFlLFNBQVMsQ0FBQyxNQUF6QixDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxFQUFXLFNBQVMsQ0FBQyxHQUFyQixDQURBLENBQUE7ZUFFQSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBZ0IsU0FBUyxDQUFDLE9BQTFCLEVBSEY7T0FGVTtJQUFBLENBQVosQ0FBQTs7QUFBQSxxQkFZQSxTQUFBLEdBQVcsU0FBQyxHQUFELEdBQUE7QUFDVDtBQUFJLFFBQUEsR0FBQSxHQUFNLGtCQUFBLENBQW1CLE1B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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/commits/commit.coffee