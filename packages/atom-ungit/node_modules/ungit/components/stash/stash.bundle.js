(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var ko = require('knockout');
var moment = require('moment');
var components = require('ungit-components');

components.register('stash', function(args) {
  return new StashViewModel(args.server, args.repoPath);
});

function StashItemViewModel(stash, data) {
  this.stash = stash;
  this.server = stash.server;
  this.id = data.id;
  this.title = data.name + ' ' + moment(new Date(data.date)).fromNow();
  this.body = data.title;
  this.stashPopProgressBar = components.create('progressBar', { predictionMemoryKey: 'stash-pop', temporary: true });
}
StashItemViewModel.prototype.pop = function() {
  var self = this;
  this.stashPopProgressBar.start();
  this.server.del('/stashes/' + this.id, { path: this.stash.repoPath, pop: true }, function(err, res) {
    self.stashPopProgressBar.stop();
  });
}
StashItemViewModel.prototype.drop = function() {
  var self = this;
  this.stashPopProgressBar.start();
  this.server.del('/stashes/' + this.id, { path: this.stash.repoPath }, function(err, res) {
    self.stashPopProgressBar.stop();
  });
}

function StashViewModel(server, repoPath) {
  var self = this;
  this.server = server;
  this.repoPath = repoPath;
  this.stashedChanges = ko.observable([]);
  this.isShow = ko.observable(localStorage['showStash'] === 'true');
  this.visible = ko.computed(function() { return self.stashedChanges().length > 0 && self.isShow(); });
  this.refresh();
}

StashViewModel.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('stash', this, {}, parentElement);
}
StashViewModel.prototype.onProgramEvent = function(event) {
  if (event.event == 'request-app-content-refresh' ||
    event.event == 'working-tree-changed' ||
    event.event == 'git-directory-changed')
    this.refresh();
}
StashViewModel.prototype.refresh = function() {
  var self = this;
  this.server.get('/stashes', { path: this.repoPath }, function(err, stashes) {
    if (err) {
      if (err.errorCode == 'no-such-path') return true;
      return;
    }
    self.stashedChanges(stashes.map(function(item) { return new StashItemViewModel(self, item); }));
  });
}
StashViewModel.prototype.toggleShowStash = function() {
  var newValue;

  if (this.isShow()) {
    newValue = false;
  } else {
    newValue = true;
  }
  this.isShow(newValue);
  localStorage['showStash'] = newValue;
}

},{"knockout":"knockout","moment":"moment","ungit-components":"ungit-components"}]},{},[1]);
