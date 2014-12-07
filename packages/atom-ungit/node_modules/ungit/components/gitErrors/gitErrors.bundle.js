(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var ko = require('knockout');
var components = require('ungit-components');
var programEvents = require('ungit-program-events');
var navigation = require('ungit-navigation');

components.register('gitErrors', function(args) {
  return new GitErrorsViewModel(args.server, args.repoPath);
});

var GitErrorsViewModel = function(server, repoPath) {
  var self = this;
  this.server = server;
  this.repoPath = repoPath;
  this.gitErrors = ko.observable([]);
}
GitErrorsViewModel.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('gitErrors', this, {}, parentElement);
}
GitErrorsViewModel.prototype.onProgramEvent = function(event) {
  if (event.event == 'git-error') this._handleGitError(event);
}
GitErrorsViewModel.prototype._handleGitError = function(event) {
  if (event.data.repoPath != this.repoPath) return;
  var gitErrors = this.gitErrors();
  gitErrors.push(new GitErrorViewModel(this, this.server, event.data));
  this.gitErrors(gitErrors);
}

function GitErrorViewModel(gitErrors, server, data) {
  var self = this;
  this.gitErrors = gitErrors;
  this.server = server;
  this.tip = data.tip;
  this.command = data.command;
  this.error = data.error;
  this.stdout = data.stdout;
  this.stderr = data.stderr;
  this.showEnableBugtracking = ko.observable(false);
  this.bugReportWasSent = ungit.config.bugtracking;

  if (!data.shouldSkipReport && !ungit.config.bugtracking) {
    this.server.get('/userconfig', undefined, function(err, userConfig) {
      if (err) return;
      self.showEnableBugtracking(!userConfig.bugtracking);
    });
  }
}
GitErrorViewModel.prototype.dismiss = function() {
  var self = this;
  var gitErrors = this.gitErrors.gitErrors();
  gitErrors = gitErrors.filter(function(e) { return e != self; });
  this.gitErrors.gitErrors(gitErrors);
}
GitErrorViewModel.prototype.enableBugtrackingAndStatistics = function() {
  var self = this;
  this.server.get('/userconfig', undefined, function(err, userConfig) {
    if (err) return;
    userConfig.bugtracking = true;
    userConfig.sendUsageStatistics = true;
    self.server.post('/userconfig', userConfig, function(err) {
      if (err) return;
      self.showEnableBugtracking(false);
    });
  });
}


},{"knockout":"knockout","ungit-components":"ungit-components","ungit-navigation":"ungit-navigation","ungit-program-events":"ungit-program-events"}]},{},[1]);
