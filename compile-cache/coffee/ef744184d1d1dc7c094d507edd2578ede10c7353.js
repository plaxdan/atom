(function() {
  var ErrorView, FileList, List, StagedFile, UnstagedFile, UntrackedFile, git, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  git = require('../../git');

  List = require('../list');

  StagedFile = require('./staged-file');

  UnstagedFile = require('./unstaged-file');

  UntrackedFile = require('./untracked-file');

  ErrorView = require('../../views/error-view');

  FileList = (function(_super) {
    __extends(FileList, _super);

    function FileList() {
      this.populateList = __bind(this.populateList, this);
      this.untracked = __bind(this.untracked, this);
      this.unstaged = __bind(this.unstaged, this);
      this.staged = __bind(this.staged, this);
      this.populate = __bind(this.populate, this);
      this.reload = __bind(this.reload, this);
      return FileList.__super__.constructor.apply(this, arguments);
    }

    FileList.prototype.reload = function(_arg) {
      var silent;
      silent = (_arg != null ? _arg : {}).silent;
      return git.status().then((function(_this) {
        return function(status) {
          return _this.populate(status, silent);
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    FileList.prototype.populate = function(status, silent) {
      var _ref;
      this.reset();
      this.populateList(status.untracked, UntrackedFile);
      this.populateList(status.unstaged, UnstagedFile);
      this.populateList(status.staged, StagedFile);
      this.select((_ref = this.selectedIndex) != null ? _ref : 0);
      if (!silent) {
        return this.trigger('repaint');
      }
    };

    FileList.prototype.staged = function() {
      return this.filter(function(file) {
        return file.isStaged();
      });
    };

    FileList.prototype.unstaged = function() {
      return this.filter(function(file) {
        return file.isUnstaged();
      });
    };

    FileList.prototype.untracked = function() {
      return this.filter(function(file) {
        return file.isUntracked();
      });
    };

    FileList.prototype.populateList = function(files, Klass) {
      return _.each(files, (function(_this) {
        return function(file) {
          return _this.add(new Klass(file));
        };
      })(this));
    };

    return FileList;

  })(List);

  module.exports = FileList;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBFQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBZ0IsT0FBQSxDQUFRLFdBQVIsQ0FGaEIsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBZ0IsT0FBQSxDQUFRLFNBQVIsQ0FIaEIsQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FKaEIsQ0FBQTs7QUFBQSxFQUtBLFlBQUEsR0FBZ0IsT0FBQSxDQUFRLGlCQUFSLENBTGhCLENBQUE7O0FBQUEsRUFNQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQU5oQixDQUFBOztBQUFBLEVBT0EsU0FBQSxHQUFnQixPQUFBLENBQVEsd0JBQVIsQ0FQaEIsQ0FBQTs7QUFBQSxFQVNNO0FBRUosK0JBQUEsQ0FBQTs7Ozs7Ozs7OztLQUFBOztBQUFBLHVCQUFBLE1BQUEsR0FBUSxTQUFDLElBQUQsR0FBQTtBQUNOLFVBQUEsTUFBQTtBQUFBLE1BRFEseUJBQUQsT0FBUyxJQUFSLE1BQ1IsQ0FBQTthQUFBLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQVksS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLE1BQWxCLEVBQVo7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBRUEsQ0FBQyxPQUFELENBRkEsQ0FFTyxTQUFDLEtBQUQsR0FBQTtlQUFlLElBQUEsU0FBQSxDQUFVLEtBQVYsRUFBZjtNQUFBLENBRlAsRUFETTtJQUFBLENBQVIsQ0FBQTs7QUFBQSx1QkFRQSxRQUFBLEdBQVUsU0FBQyxNQUFELEVBQVMsTUFBVCxHQUFBO0FBQ1IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFNLENBQUMsU0FBckIsRUFBZ0MsYUFBaEMsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQU0sQ0FBQyxRQUFyQixFQUErQixZQUEvQixDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBTSxDQUFDLE1BQXJCLEVBQTZCLFVBQTdCLENBSkEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLE1BQUQsOENBQXlCLENBQXpCLENBTkEsQ0FBQTtBQU9BLE1BQUEsSUFBQSxDQUFBLE1BQUE7ZUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBQTtPQVJRO0lBQUEsQ0FSVixDQUFBOztBQUFBLHVCQW1CQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLE1BQUQsQ0FBUSxTQUFDLElBQUQsR0FBQTtlQUFVLElBQUksQ0FBQyxRQUFMLENBQUEsRUFBVjtNQUFBLENBQVIsRUFETTtJQUFBLENBbkJSLENBQUE7O0FBQUEsdUJBdUJBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsTUFBRCxDQUFRLFNBQUMsSUFBRCxHQUFBO2VBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBQSxFQUFWO01BQUEsQ0FBUixFQURRO0lBQUEsQ0F2QlYsQ0FBQTs7QUFBQSx1QkEyQkEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNULElBQUMsQ0FBQSxNQUFELENBQVEsU0FBQyxJQUFELEdBQUE7ZUFBVSxJQUFJLENBQUMsV0FBTCxDQUFBLEVBQVY7TUFBQSxDQUFSLEVBRFM7SUFBQSxDQTNCWCxDQUFBOztBQUFBLHVCQWtDQSxZQUFBLEdBQWMsU0FBQyxLQUFELEVBQVEsS0FBUixHQUFBO2FBQ1osQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO2lCQUFVLEtBQUMsQ0FBQSxHQUFELENBQVMsSUFBQSxLQUFBLENBQU0sSUFBTixDQUFULEVBQVY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkLEVBRFk7SUFBQSxDQWxDZCxDQUFBOztvQkFBQTs7S0FGcUIsS0FUdkIsQ0FBQTs7QUFBQSxFQWdEQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQWhEakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/files/file-list.coffee