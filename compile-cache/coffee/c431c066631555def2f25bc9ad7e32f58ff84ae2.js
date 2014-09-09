(function() {
  var Git, Model, gift, git, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  gift = require('gift');

  Model = require('backbone').Model;

  _ = require('underscore');

  Git = (function(_super) {
    __extends(Git, _super);

    function Git() {
      this.clearTaskCounter = __bind(this.clearTaskCounter, this);
      this.decrementTaskCounter = __bind(this.decrementTaskCounter, this);
      this.callbackWithErrorsNoChange = __bind(this.callbackWithErrorsNoChange, this);
      this.callbackWithErrors = __bind(this.callbackWithErrors, this);
      return Git.__super__.constructor.apply(this, arguments);
    }

    Git.prototype.task_counter = 0;

    Git.prototype.initialize = function(options) {
      this.setPath(options != null ? options.path : void 0);
      return this.clearMessage();
    };

    Git.prototype.setPath = function(path) {
      this.path = path || atom.project.getRepo().getWorkingDirectory();
      return this.gift = gift(this.path);
    };

    Git.prototype.getPath = function() {
      return this.path;
    };

    Git.prototype.diff = function(path, callback, options) {
      var flags;
      options || (options = {});
      flags = options.flags || "";
      return this.gift.diff("", flags, [path], this.callbackWithErrorsNoChange(function(diffs) {
        if (callback) {
          return callback(diffs[0]);
        }
      }));
    };

    Git.prototype.add = function(filename, callback) {
      return this.gift.add(filename + " --no-ignore-removal", this.callbackWithErrors(callback));
    };

    Git.prototype.git = function(command, callback) {
      return this.gift.git(command, this.callbackWithErrors(callback));
    };

    Git.prototype.gitNoChange = function(command, callback) {
      return this.gift.git(command, this.callbackWithErrorsNoChange(callback));
    };

    Git.prototype.status = function(callback) {
      return this.gift.status(this.callbackWithErrorsNoChange(function(status) {
        return callback(status != null ? status.files : void 0);
      }));
    };

    Git.prototype.branch = function(callback) {
      return this.gift.branch(this.callbackWithErrorsNoChange(callback));
    };

    Git.prototype.branches = function(callback) {
      return this.gift.branches(this.callbackWithErrorsNoChange(callback));
    };

    Git.prototype.remotes = function(callback) {
      return this.gift.remotes(this.callbackWithErrorsNoChange(callback));
    };

    Git.prototype.commits = function(branch_name, callback) {
      return this.gift.commits(branch_name, this.callbackWithErrorsNoChange(callback));
    };

    Git.prototype.remoteFetch = function(remote, callback) {
      return this.gift.remote_fetch(remote, this.callbackWithErrors(callback));
    };

    Git.prototype.createBranch = function(name, callback) {
      return this.gift.create_branch(name, this.callbackWithErrors(callback));
    };

    Git.prototype.remotePush = function(remote_branch, callback) {
      return this.gift.remote_push(remote_branch + " -u", this.callbackWithErrors(callback));
    };

    Git.prototype.showObject = function(obj, callback) {
      return this.gift.git('show', [], [obj], this.callbackWithErrorsNoChange(callback));
    };

    Git.prototype.callbackWithErrors = function(callback) {
      this.incrementTaskCounter();
      return (function(_this) {
        return function(error, value) {
          _this.decrementTaskCounter();
          if (error) {
            return _this.setMessage("" + error);
          } else {
            if (callback) {
              callback(value);
            }
            return _this.trigger("reload");
          }
        };
      })(this);
    };

    Git.prototype.callbackWithErrorsNoChange = function(callback) {
      this.incrementTaskCounter();
      return (function(_this) {
        return function(error, value) {
          _this.decrementTaskCounter();
          if (error) {
            return _this.setMessage("" + error);
          } else {
            if (callback) {
              return callback(value);
            }
          }
        };
      })(this);
    };

    Git.prototype.incrementTaskCounter = function() {
      this.task_counter += 1;
      if (this.task_counter === 1) {
        return this.trigger("change:task_counter");
      }
    };

    Git.prototype.decrementTaskCounter = function() {
      this.task_counter -= 1;
      if (this.task_counter === 0) {
        return this.trigger("change:task_counter");
      }
    };

    Git.prototype.clearTaskCounter = function() {
      this.task_counter = 0;
      return this.trigger("change:task_counter");
    };

    Git.prototype.workingP = function() {
      return this.task_counter > 0;
    };

    Git.prototype.setMessage = function(message) {
      this.set({
        message: message
      });
      return this.trigger("error");
    };

    Git.prototype.messageMarkup = function() {
      var message;
      message = this.get("message");
      return message.replace(/\n/g, "<br />");
    };

    Git.prototype.clearMessage = function() {
      return this.set({
        message: ""
      });
    };

    return Git;

  })(Model);

  git = {};

  if (atom.project) {
    git = new Git();
  }

  module.exports = {
    Git: Git,
    git: git
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLFVBQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVIsQ0FGSixDQUFBOztBQUFBLEVBS007QUFDSiwwQkFBQSxDQUFBOzs7Ozs7OztLQUFBOztBQUFBLGtCQUFBLFlBQUEsR0FBYyxDQUFkLENBQUE7O0FBQUEsa0JBQ0EsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsT0FBRCxtQkFBUyxPQUFPLENBQUUsYUFBbEIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUZVO0lBQUEsQ0FEWixDQUFBOztBQUFBLGtCQUtBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFBLElBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FBc0IsQ0FBQyxtQkFBdkIsQ0FBQSxDQUFoQixDQUFBO2FBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFBLENBQUssSUFBQyxDQUFBLElBQU4sRUFGRDtJQUFBLENBTFQsQ0FBQTs7QUFBQSxrQkFTQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLEtBRE07SUFBQSxDQVRULENBQUE7O0FBQUEsa0JBWUEsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNKLFVBQUEsS0FBQTtBQUFBLE1BQUEsWUFBQSxVQUFZLEdBQVosQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLE9BQU8sQ0FB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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/git.coffee