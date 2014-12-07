(function() {
  var FileListView, FileView, View, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  View = require('atom').View;

  FileView = require('./file-view');

  FileListView = (function(_super) {
    __extends(FileListView, _super);

    function FileListView() {
      this.repaint = __bind(this.repaint, this);
      this.repopulateStaged = __bind(this.repopulateStaged, this);
      this.repopulateUnstaged = __bind(this.repopulateUnstaged, this);
      this.repopulateUntracked = __bind(this.repopulateUntracked, this);
      this.beforeRemove = __bind(this.beforeRemove, this);
      return FileListView.__super__.constructor.apply(this, arguments);
    }

    FileListView.content = function() {
      return this.div({
        "class": 'file-list-view list-view',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.h2({
            outlet: 'untrackedHeader'
          }, 'untracked:');
          _this.div({
            "class": 'untracked',
            outlet: 'untracked'
          });
          _this.h2({
            outlet: 'unstagedHeader'
          }, 'unstaged:');
          _this.div({
            "class": 'unstaged',
            outlet: 'unstaged'
          });
          _this.h2({
            outlet: 'stagedHeader'
          }, 'staged:');
          return _this.div({
            "class": 'staged',
            outlet: 'staged'
          });
        };
      })(this));
    };

    FileListView.prototype.initialize = function(model) {
      this.model = model;
      return this.model.on('repaint', this.repaint);
    };

    FileListView.prototype.beforeRemove = function() {
      return this.model.off('repaint', this.repaint);
    };

    FileListView.prototype.repopulateUntracked = function() {
      this.untracked.empty();
      return _.each(this.model.untracked(), (function(_this) {
        return function(file) {
          return _this.untracked.append(new FileView(file));
        };
      })(this));
    };

    FileListView.prototype.repopulateUnstaged = function() {
      this.unstaged.empty();
      return _.each(this.model.unstaged(), (function(_this) {
        return function(file) {
          return _this.unstaged.append(new FileView(file));
        };
      })(this));
    };

    FileListView.prototype.repopulateStaged = function() {
      this.staged.empty();
      return _.each(this.model.staged(), (function(_this) {
        return function(file) {
          return _this.staged.append(new FileView(file));
        };
      })(this));
    };

    FileListView.prototype.repaint = function() {
      this.repopulateUntracked();
      this.repopulateUnstaged();
      return this.repopulateStaged();
    };

    return FileListView;

  })(View);

  module.exports = FileListView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLE1BQVIsRUFBUixJQURELENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FIWCxDQUFBOztBQUFBLEVBT007QUFDSixtQ0FBQSxDQUFBOzs7Ozs7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDBCQUFQO0FBQUEsUUFBbUMsUUFBQSxFQUFVLENBQUEsQ0FBN0M7T0FBTCxFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BELFVBQUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLGlCQUFSO1dBQUosRUFBK0IsWUFBL0IsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sV0FBUDtBQUFBLFlBQW9CLE1BQUEsRUFBUSxXQUE1QjtXQUFMLENBREEsQ0FBQTtBQUFBLFVBRUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLGdCQUFSO1dBQUosRUFBOEIsV0FBOUIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sVUFBUDtBQUFBLFlBQW1CLE1BQUEsRUFBUSxVQUEzQjtXQUFMLENBSEEsQ0FBQTtBQUFBLFVBSUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLGNBQVI7V0FBSixFQUE0QixTQUE1QixDQUpBLENBQUE7aUJBS0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFFBQVA7QUFBQSxZQUFpQixNQUFBLEVBQVEsUUFBekI7V0FBTCxFQU5vRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsMkJBVUEsVUFBQSxHQUFZLFNBQUUsS0FBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsUUFBQSxLQUNaLENBQUE7YUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLElBQUMsQ0FBQSxPQUF0QixFQURVO0lBQUEsQ0FWWixDQUFBOztBQUFBLDJCQWNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QixFQURZO0lBQUEsQ0FkZCxDQUFBOztBQUFBLDJCQWtCQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFDbkIsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFBLENBQUE7YUFDQSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQVAsRUFBMkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO2lCQUFVLEtBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFzQixJQUFBLFFBQUEsQ0FBUyxJQUFULENBQXRCLEVBQVY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQixFQUZtQjtJQUFBLENBbEJyQixDQUFBOztBQUFBLDJCQXVCQSxrQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDbEIsTUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBQSxDQUFBLENBQUE7YUFDQSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFBLENBQVAsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO2lCQUFVLEtBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFxQixJQUFBLFFBQUEsQ0FBUyxJQUFULENBQXJCLEVBQVY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixFQUZrQjtJQUFBLENBdkJwQixDQUFBOztBQUFBLDJCQTRCQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBQSxDQUFBLENBQUE7YUFDQSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQVAsRUFBd0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO2lCQUFVLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFtQixJQUFBLFFBQUEsQ0FBUyxJQUFULENBQW5CLEVBQVY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixFQUZnQjtJQUFBLENBNUJsQixDQUFBOztBQUFBLDJCQWlDQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBSE87SUFBQSxDQWpDVCxDQUFBOzt3QkFBQTs7S0FEeUIsS0FQM0IsQ0FBQTs7QUFBQSxFQThDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixZQTlDakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/files/file-list-view.coffee