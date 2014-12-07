(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ko = require('knockout');
var CommitLineDiff = require('./commitlinediff.js').CommitLineDiff;
var components = require('ungit-components');

components.register('commitDiff', function(args) {
  return new CommitDiff(args);
});

var CommitDiff = function(args) {
  this.totalLineDiffs = ko.observable();
  this.commitLineDiffs = ko.observable([]);
  this.showLoadMore = ko.observable();
  this.server = args.server;
  this.sha1 = args.sha1;
  this.repoPath = args.repoPath;
  this.maxNumberOfFilesShown = 50;

  var totalLineDiffs = args.fileLineDiffs.shift();
  if (!totalLineDiffs) {
    this.totalLineDiffs([0, 0, 'total']);
  } else {
    this.totalLineDiffs(totalLineDiffs);
  }

  this.checkShowLoadMore(args.fileLineDiffs.length);
  this.loadFileLineDiffs(args);
};

CommitDiff.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('commitdiff', this, {}, parentElement);
};

CommitDiff.prototype.checkShowLoadMore = function(size) {
  if (size < this.maxNumberOfFilesShown) {
    this.showLoadMore(false);
  } else {
    this.showLoadMore(true);
  }
};

CommitDiff.prototype.loadFileLineDiffs = function(args) {
  var tempCommitLineDiffs = [];
  var lineDiffLength = this.commitLineDiffs().length;

  args.fileLineDiffs.slice(lineDiffLength === 0 ? 0 : lineDiffLength + 1, this.maxNumberOfFilesShown).forEach(function(fileLineDiff) {
    args.fileLineDiff = fileLineDiff;
    tempCommitLineDiffs.push(new CommitLineDiff(args));
  });

  this.commitLineDiffs(this.commitLineDiffs().concat(tempCommitLineDiffs));
}

CommitDiff.prototype.loadMore = function(data, event) {
  this.maxNumberOfFilesShown += 50;
  var self = this;

  this.server.get('/show', { path: this.repoPath, sha1: this.sha1 }, function(err, logEntries) {
    if (err || !logEntries || !logEntries[0]) {
      return;
    }
    self.checkShowLoadMore(logEntries[0].fileLineDiffs.length);
    self.loadFileLineDiffs({
      repoPath: self.repoPath,
      server: self.server,
      sha1: self.sha1,
      fileLineDiffs: logEntries[0].fileLineDiffs
    });
  });
  event.stopImmediatePropagation();
}
},{"./commitlinediff.js":2,"knockout":"knockout","ungit-components":"ungit-components"}],2:[function(require,module,exports){
var ko = require('knockout');
var components = require('ungit-components');
var inherits = require('util').inherits;
var fileType = require('../../source/utils/file-type.js');

var CommitLineDiff = function(args) {
  this.added = ko.observable(args.fileLineDiff[0]);
  this.removed = ko.observable(args.fileLineDiff[1]);
  this.fileName = ko.observable(args.fileLineDiff[2]);
  this.showSpecificDiff = ko.observable(false);
  this.specificDiff = ko.observable(components.create(this.type(), {
      filename: this.fileName(),
      repoPath: args.repoPath,
      server: args.server,
      sha1: args.sha1,
      initialDisplayLineLimit: 50     //Image diff doesn't use this so it doesn't matter.
    }));
};
exports.CommitLineDiff = CommitLineDiff;

CommitLineDiff.prototype.fileNameClick = function(data, event) {
  if (this.showSpecificDiff()) {
    this.showSpecificDiff(false);
  } else {
    var self = this;
    this.specificDiff().invalidateDiff(function() {
      self.showSpecificDiff(true);
    });
  }
  event.stopImmediatePropagation();
};

CommitLineDiff.prototype.type = function() {
  if (!this.fileName()) {
    return 'textdiff';
  }
  return fileType(this.fileName()) + 'diff';
};

},{"../../source/utils/file-type.js":3,"knockout":"knockout","ungit-components":"ungit-components","util":undefined}],3:[function(require,module,exports){
var path = require('path');
var imageFileExtensions = ['.PNG', '.JPG', '.BMP', '.GIF', '.JPEG'];

module.exports = function(fileName) {
  return imageFileExtensions.indexOf(path.extname(fileName).toUpperCase()) > -1 ? 'image' : 'text';
}

},{"path":undefined}]},{},[1]);
