(function() {
  var Repository, deletedStatusFlags, fs, isRootPath, modifiedStatusFlags, newStatusFlags, openRepository, openSubmodules, path, realpath, statusIgnored, statusIndexDeleted, statusIndexModified, statusIndexNew, statusIndexRenamed, statusIndexTypeChange, statusWorkingDirDelete, statusWorkingDirModified, statusWorkingDirNew, statusWorkingDirTypeChange;

  path = require('path');

  fs = require('fs-plus');

  Repository = require('bindings')('git.node').Repository;

  statusIndexNew = 1 << 0;

  statusIndexModified = 1 << 1;

  statusIndexDeleted = 1 << 2;

  statusIndexRenamed = 1 << 3;

  statusIndexTypeChange = 1 << 4;

  statusWorkingDirNew = 1 << 7;

  statusWorkingDirModified = 1 << 8;

  statusWorkingDirDelete = 1 << 9;

  statusWorkingDirTypeChange = 1 << 10;

  statusIgnored = 1 << 14;

  modifiedStatusFlags = statusWorkingDirModified | statusIndexModified | statusWorkingDirDelete | statusIndexDeleted | statusWorkingDirTypeChange | statusIndexTypeChange;

  newStatusFlags = statusWorkingDirNew | statusIndexNew;

  deletedStatusFlags = statusWorkingDirDelete | statusIndexDeleted;

  Repository.prototype.release = function() {
    var submodulePath, submoduleRepo, _ref;
    _ref = this.submodules;
    for (submodulePath in _ref) {
      submoduleRepo = _ref[submodulePath];
      if (submoduleRepo != null) {
        submoduleRepo.release();
      }
    }
    return this._release();
  };

  Repository.prototype.getWorkingDirectory = function() {
    var _ref;
    return this.workingDirectory != null ? this.workingDirectory : this.workingDirectory = (_ref = this._getWorkingDirectory()) != null ? _ref.replace(/\/$/, '') : void 0;
  };

  Repository.prototype.getShortHead = function() {
    var head;
    head = this.getHead();
    if (head == null) {
      return head;
    }
    if (head.indexOf('refs/heads/') === 0) {
      return head.substring(11);
    }
    if (head.indexOf('refs/tags/') === 0) {
      return head.substring(10);
    }
    if (head.indexOf('refs/remotes/') === 0) {
      return head.substring(13);
    }
    if (head.match(/[a-fA-F0-9]{40}/)) {
      return head.substring(0, 7);
    }
    return head;
  };

  Repository.prototype.isStatusModified = function(status) {
    if (status == null) {
      status = 0;
    }
    return (status & modifiedStatusFlags) > 0;
  };

  Repository.prototype.isPathModified = function(path) {
    return this.isStatusModified(this.getStatus(path));
  };

  Repository.prototype.isStatusNew = function(status) {
    if (status == null) {
      status = 0;
    }
    return (status & newStatusFlags) > 0;
  };

  Repository.prototype.isPathNew = function(path) {
    return this.isStatusNew(this.getStatus(path));
  };

  Repository.prototype.isStatusDeleted = function(status) {
    if (status == null) {
      status = 0;
    }
    return (status & deletedStatusFlags) > 0;
  };

  Repository.prototype.isPathDeleted = function(path) {
    return this.isStatusDeleted(this.getStatus(path));
  };

  Repository.prototype.isStatusIgnored = function(status) {
    if (status == null) {
      status = 0;
    }
    return (status & statusIgnored) > 0;
  };

  Repository.prototype.getUpstreamBranch = function(branch) {
    var branchMerge, branchRemote, shortBranch;
    if (branch == null) {
      branch = this.getHead();
    }
    if (!((branch != null ? branch.length : void 0) > 11)) {
      return null;
    }
    if (branch.indexOf('refs/heads/') !== 0) {
      return null;
    }
    shortBranch = branch.substring(11);
    branchMerge = this.getConfigValue("branch." + shortBranch + ".merge");
    if (!((branchMerge != null ? branchMerge.length : void 0) > 11)) {
      return null;
    }
    if (branchMerge.indexOf('refs/heads/') !== 0) {
      return null;
    }
    branchRemote = this.getConfigValue("branch." + shortBranch + ".remote");
    if (!((branchRemote != null ? branchRemote.length : void 0) > 0)) {
      return null;
    }
    return "refs/remotes/" + branchRemote + "/" + (branchMerge.substring(11));
  };

  Repository.prototype.getAheadBehindCount = function(branch) {
    var counts, headCommit, mergeBase, upstream, upstreamCommit;
    if (branch == null) {
      branch = 'HEAD';
    }
    if (branch !== 'HEAD' && branch.indexOf('refs/heads/') !== 0) {
      branch = "refs/heads/" + branch;
    }
    counts = {
      ahead: 0,
      behind: 0
    };
    headCommit = this.getReferenceTarget(branch);
    if (!((headCommit != null ? headCommit.length : void 0) > 0)) {
      return counts;
    }
    upstream = this.getUpstreamBranch();
    if (!((upstream != null ? upstream.length : void 0) > 0)) {
      return counts;
    }
    upstreamCommit = this.getReferenceTarget(upstream);
    if (!((upstreamCommit != null ? upstreamCommit.length : void 0) > 0)) {
      return counts;
    }
    mergeBase = this.getMergeBase(headCommit, upstreamCommit);
    if (!((mergeBase != null ? mergeBase.length : void 0) > 0)) {
      return counts;
    }
    counts.ahead = this.getCommitCount(headCommit, mergeBase);
    counts.behind = this.getCommitCount(upstreamCommit, mergeBase);
    return counts;
  };

  Repository.prototype.checkoutReference = function(branch, create) {
    if (branch.indexOf('refs/heads/') !== 0) {
      branch = "refs/heads/" + branch;
    }
    return this.checkoutRef(branch, create);
  };

  Repository.prototype.relativize = function(path) {
    var lowerCasePath, workingDirectory;
    if (!path) {
      return path;
    }
    if (process.platform === 'win32') {
      path = path.replace(/\\/g, '/');
    } else {
      if (path[0] !== '/') {
        return path;
      }
    }
    if (this.caseInsensitiveFs) {
      lowerCasePath = path.toLowerCase();
      workingDirectory = this.getWorkingDirectory();
      if (workingDirectory) {
        workingDirectory = workingDirectory.toLowerCase();
        if (lowerCasePath.indexOf("" + workingDirectory + "/") === 0) {
          return path.substring(workingDirectory.length + 1);
        }
      }
      if (this.openedWorkingDirectory) {
        workingDirectory = this.openedWorkingDirectory.toLowerCase();
        if (lowerCasePath.indexOf("" + workingDirectory + "/") === 0) {
          return path.substring(workingDirectory.length + 1);
        }
      }
    } else {
      workingDirectory = this.getWorkingDirectory();
      if (workingDirectory && path.indexOf("" + workingDirectory + "/") === 0) {
        return path.substring(workingDirectory.length + 1);
      }
      if (this.openedWorkingDirectory && path.indexOf("" + this.openedWorkingDirectory + "/") === 0) {
        return path.substring(this.openedWorkingDirectory.length + 1);
      }
    }
    return path;
  };

  Repository.prototype.submoduleForPath = function(path) {
    var submodulePath, submoduleRepo, _ref, _ref1;
    path = this.relativize(path);
    if (!path) {
      return null;
    }
    _ref = this.submodules;
    for (submodulePath in _ref) {
      submoduleRepo = _ref[submodulePath];
      if (path === submodulePath) {
        return submoduleRepo;
      } else if (path.indexOf("" + submodulePath + "/") === 0) {
        path = path.substring(submodulePath.length + 1);
        return (_ref1 = submoduleRepo.submoduleForPath(path)) != null ? _ref1 : submoduleRepo;
      }
    }
    return null;
  };

  realpath = function(unrealPath) {
    var e;
    try {
      return fs.realpathSync(unrealPath);
    } catch (_error) {
      e = _error;
      return unrealPath;
    }
  };

  isRootPath = function(repositoryPath) {
    if (process.platform === 'win32') {
      return /^[a-zA-Z]+:[\\\/]$/.test(repositoryPath);
    } else {
      return repositoryPath === path.sep;
    }
  };

  openRepository = function(repositoryPath) {
    var repository, symlink, workingDirectory;
    symlink = realpath(repositoryPath) !== repositoryPath;
    if (process.platform === 'win32') {
      repositoryPath = repositoryPath.replace(/\\/g, '/');
    }
    repository = new Repository(repositoryPath);
    if (repository.exists()) {
      repository.caseInsensitiveFs = fs.isCaseInsensitive();
      if (symlink) {
        workingDirectory = repository.getWorkingDirectory();
        while (!isRootPath(repositoryPath)) {
          if (realpath(repositoryPath) === workingDirectory) {
            repository.openedWorkingDirectory = repositoryPath;
            break;
          }
          repositoryPath = path.resolve(repositoryPath, '..');
        }
      }
      return repository;
    } else {
      return null;
    }
  };

  openSubmodules = function(repository) {
    var relativePath, submodulePath, submoduleRepo, _i, _len, _ref, _results;
    repository.submodules = {};
    _ref = repository.getSubmodulePaths();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      relativePath = _ref[_i];
      if (!(relativePath)) {
        continue;
      }
      submodulePath = path.join(repository.getWorkingDirectory(), relativePath);
      if (submoduleRepo = openRepository(submodulePath)) {
        if (submoduleRepo.getPath() === repository.getPath()) {
          _results.push(submoduleRepo.release());
        } else {
          openSubmodules(submoduleRepo);
          _results.push(repository.submodules[relativePath] = submoduleRepo);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  exports.open = function(repositoryPath) {
    var repository;
    repository = openRepository(repositoryPath);
    if (repository != null) {
      openSubmodules(repository);
    }
    return repository;
  };

}).call(this);
