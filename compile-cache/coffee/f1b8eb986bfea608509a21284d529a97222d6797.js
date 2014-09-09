(function() {
  var FileList, List, StagedFile, UnstagedFile, UntrackedFile, git, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  List = require('../list');

  UnstagedFile = require('./unstaged-file');

  StagedFile = require('./staged-file');

  UntrackedFile = require('./untracked-file');

  git = require('../../git').git;

  module.exports = FileList = (function(_super) {
    __extends(FileList, _super);

    function FileList() {
      this.populate = __bind(this.populate, this);
      return FileList.__super__.constructor.apply(this, arguments);
    }

    FileList.prototype.reload = function() {
      return git.status(this.populate);
    };

    FileList.prototype.populate = function(filelist) {
      filelist = this.convertFileList(filelist);
      this.populateList(filelist.untracked, this.untracked(), UntrackedFile);
      this.populateList(filelist.unstaged, this.unstaged(), UnstagedFile);
      this.populateList(filelist.staged, this.staged(), StagedFile);
      this.select(this.selected_index);
      return this.trigger("repopulate");
    };

    FileList.prototype.comparator = function(file) {
      return file.sort_value;
    };

    FileList.prototype.staged = function() {
      return this.filter(function(f) {
        return f.stagedP();
      });
    };

    FileList.prototype.unstaged = function() {
      return this.filter(function(f) {
        return f.unstagedP();
      });
    };

    FileList.prototype.untracked = function() {
      return this.filter(function(f) {
        return f.untrackedP();
      });
    };

    FileList.prototype.newPaths = function(paths, files) {
      return _.filter(paths, function(path) {
        return !_.any(files, function(file) {
          return file.path() === path.path;
        });
      });
    };

    FileList.prototype.missingFiles = function(paths, files) {
      paths = this._filePathsFromPaths(paths);
      return _.filter(files, function(file) {
        return !_.contains(paths, file.path());
      });
    };

    FileList.prototype.stillThereFiles = function(paths, files) {
      paths = this._filePathsFromPaths(paths);
      return _.filter(files, function(file) {
        return _.contains(paths, file.path());
      });
    };

    FileList.prototype._filePathsFromPaths = function(paths) {
      var file, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        file = paths[_i];
        _results.push(file.path);
      }
      return _results;
    };

    FileList.prototype.populateList = function(paths, files, Klass) {
      _.each(this.stillThereFiles(paths, files), function(file) {
        return file.loadDiff();
      });
      _.each(this.newPaths(paths, files), (function(_this) {
        return function(path) {
          return _this.add(new Klass(path));
        };
      })(this));
      return _.each(this.missingFiles(paths, files), (function(_this) {
        return function(file) {
          return _this.remove(file);
        };
      })(this));
    };

    FileList.prototype.convertFileList = function(files) {
      var file, fileData, fileObjClone, filesNotStaged, filesNotTracked, filesStaged, gitStatusType, stateNotStaged, stateStaged, stateUntracked, _i, _len, _ref, _ref1;
      filesStaged = [];
      filesNotStaged = [];
      filesNotTracked = [];
      stateStaged = stateNotStaged = stateUntracked = false;
      for (file in files) {
        if (!__hasProp.call(files, file)) continue;
        fileData = files[file];
        fileData['path'] = file;
        if (fileData.staged) {
          stateStaged = true;
        }
        if (!fileData.staged && fileData.tracked) {
          stateNotStaged = true;
        }
        if (!fileData.tracked) {
          stateUntracked = true;
        }
        if (fileData.staged) {
          filesStaged.push(fileData);
        }
        if (!fileData.staged && fileData.tracked) {
          filesNotStaged.push(fileData);
        }
        if (!fileData.tracked) {
          filesNotTracked.push(fileData);
        }
      }
      for (_i = 0, _len = filesStaged.length; _i < _len; _i++) {
        file = filesStaged[_i];
        gitStatusType = file.type;
        if ((gitStatusType != null ? gitStatusType.length : void 0) > 1) {
          stateNotStaged = true;
          fileObjClone = _.clone(file);
          fileObjClone['type'] = gitStatusType.charAt(1);
          file.type = (_ref = file.type) != null ? _ref.charAt(0) : void 0;
          if (gitStatusType === 'RM') {
            fileObjClone.path = (_ref1 = file.path.match(/(.*) -> (.*)/)) != null ? _ref1[2] : void 0;
          }
          filesNotStaged.push(fileObjClone);
        }
      }
      return {
        'staged': filesStaged,
        'unstaged': filesNotStaged,
        'untracked': filesNotTracked
      };
    };

    return FileList;

  })(List);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBSGYsQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUpiLENBQUE7O0FBQUEsRUFLQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUxoQixDQUFBOztBQUFBLEVBTUMsTUFBTyxPQUFBLENBQVEsV0FBUixFQUFQLEdBTkQsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwrQkFBQSxDQUFBOzs7OztLQUFBOztBQUFBLHVCQUFBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixHQUFHLENBQUMsTUFBSixDQUFXLElBQUMsQ0FBQSxRQUFaLEVBRE07SUFBQSxDQUFSLENBQUE7O0FBQUEsdUJBR0EsUUFBQSxHQUFVLFNBQUMsUUFBRCxHQUFBO0FBQ1IsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsUUFBakIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQVEsQ0FBQyxTQUF2QixFQUFrQyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQWxDLEVBQWdELGFBQWhELENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFRLENBQUMsUUFBdkIsRUFBaUMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFqQyxFQUE4QyxZQUE5QyxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxZQUFELENBQWMsUUFBUSxD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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/files/file-list.coffee