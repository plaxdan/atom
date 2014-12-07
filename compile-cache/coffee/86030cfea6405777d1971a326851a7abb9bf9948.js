(function() {
  var Branch, ErrorView, LocalBranch, git,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  git = require('../../git');

  Branch = require('./branch');

  ErrorView = require('../../views/error-view');

  LocalBranch = (function(_super) {
    __extends(LocalBranch, _super);

    function LocalBranch() {
      this.push = __bind(this.push, this);
      this.checkout = __bind(this.checkout, this);
      this["delete"] = __bind(this["delete"], this);
      this.unpushed = __bind(this.unpushed, this);
      return LocalBranch.__super__.constructor.apply(this, arguments);
    }

    LocalBranch.prototype.remote = false;

    LocalBranch.prototype.local = true;

    LocalBranch.prototype.unpushed = function() {
      return this.get('unpushed');
    };

    LocalBranch.prototype["delete"] = function() {
      return git.cmd('branch', {
        D: true
      }, this.getName()).then((function(_this) {
        return function() {
          return _this.trigger('update');
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    LocalBranch.prototype.remoteName = function() {
      return '';
    };

    LocalBranch.prototype.checkout = function(callback) {
      return git.checkout(this.localName()).then((function(_this) {
        return function() {
          return _this.trigger('update');
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    LocalBranch.prototype.push = function(remote) {
      if (remote == null) {
        remote = 'origin';
      }
      return git.cmd('push', [remote, this.getName()]).then((function(_this) {
        return function() {
          return _this.trigger('update');
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    return LocalBranch;

  })(Branch);

  module.exports = LocalBranch;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBWSxPQUFBLENBQVEsVUFBUixDQURaLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksT0FBQSxDQUFRLHdCQUFSLENBRlosQ0FBQTs7QUFBQSxFQUtNO0FBRUosa0NBQUEsQ0FBQTs7Ozs7Ozs7S0FBQTs7QUFBQSwwQkFBQSxNQUFBLEdBQVEsS0FBUixDQUFBOztBQUFBLDBCQUNBLEtBQUEsR0FBTyxJQURQLENBQUE7O0FBQUEsMEJBTUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQURRO0lBQUEsQ0FOVixDQUFBOztBQUFBLDBCQVVBLFNBQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixHQUFHLENBQUMsR0FBSixDQUFRLFFBQVIsRUFBa0I7QUFBQSxRQUFDLENBQUEsRUFBRyxJQUFKO09BQWxCLEVBQTZCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBN0IsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQUVBLENBQUMsT0FBRCxDQUZBLENBRU8sU0FBQyxLQUFELEdBQUE7ZUFBZSxJQUFBLFNBQUEsQ0FBVSxLQUFWLEVBQWY7TUFBQSxDQUZQLEVBRE07SUFBQSxDQVZSLENBQUE7O0FBQUEsMEJBZ0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxHQUFIO0lBQUEsQ0FoQlosQ0FBQTs7QUFBQSwwQkFxQkEsUUFBQSxHQUFVLFNBQUMsUUFBRCxHQUFBO2FBQ1IsR0FBRyxDQUFDLFFBQUosQ0FBYSxJQUFDLENBQUEsU0FBRCxDQUFBLENBQWIsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQUVBLENBQUMsT0FBRCxDQUZBLENBRU8sU0FBQyxLQUFELEdBQUE7ZUFBZSxJQUFBLFNBQUEsQ0FBVSxLQUFWLEVBQWY7TUFBQSxDQUZQLEVBRFE7SUFBQSxDQXJCVixDQUFBOztBQUFBLDBCQTZCQSxJQUFBLEdBQU0sU0FBQyxNQUFELEdBQUE7O1FBQUMsU0FBTztPQUNaO2FBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxNQUFSLEVBQWdCLENBQUMsTUFBRCxFQUFTLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVCxDQUFoQixDQUNBLENBQUMsSUFERCxDQUNNLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBRUEsQ0FBQyxPQUFELENBRkEsQ0FFTyxTQUFDLEtBQUQsR0FBQTtlQUFlLElBQUEsU0FBQSxDQUFVLEtBQVYsRUFBZjtNQUFBLENBRlAsRUFESTtJQUFBLENBN0JOLENBQUE7O3VCQUFBOztLQUZ3QixPQUwxQixDQUFBOztBQUFBLEVBeUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBekNqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/branches/local-branch.coffee