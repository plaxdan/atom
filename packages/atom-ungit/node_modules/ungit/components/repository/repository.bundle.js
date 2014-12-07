(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var ko = require('knockout');
var components = require('ungit-components');
var async = require('async');
var _ = require('lodash');

components.register('repository', function(args) {
  return new RepositoryViewModel(args.server, args.repoPath);
});

var RepositoryViewModel = function(server, repoPath) {
  var self = this;

  this.server = server;
  this.repoPath = repoPath;
  this.gitErrors = components.create('gitErrors', { server: server, repoPath: repoPath });
  this.graph = components.create('graph', { server: server, repoPath: repoPath });
  this.remotes = components.create('remotes', { server: server, repoPath: repoPath });
  this.stash = components.create('stash', { server: server, repoPath: repoPath });
  this.staging = components.create('staging', { server: server, repoPath: repoPath });
  this.showLog = ko.computed(function() {
    return !self.staging.inRebase() && !self.staging.inMerge();
  });
  this.server.watchRepository(repoPath);
}
RepositoryViewModel.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('repository', this, {}, parentElement);
}
RepositoryViewModel.prototype.onProgramEvent = function(event) {
  if (this.gitErrors.onProgramEvent) this.gitErrors.onProgramEvent(event);
  if (this.graph.onProgramEvent) this.graph.onProgramEvent(event);
  if (this.staging.onProgramEvent) this.staging.onProgramEvent(event);
  if (this.stash.onProgramEvent) this.stash.onProgramEvent(event);
  if (this.remotes.onProgramEvent) this.remotes.onProgramEvent(event);

  // If we get a reconnect event it's usually because the server crashed and then restarted
  // or something like that, so we need to tell it to start watching the path again
  if (event.event == 'connected') {
    this.server.watchRepository(this.repoPath);
  }
}
RepositoryViewModel.prototype.updateAnimationFrame = function(deltaT) {
  if (this.graph.updateAnimationFrame) this.graph.updateAnimationFrame(deltaT);
}


 

},{"async":"async","knockout":"knockout","lodash":"lodash","ungit-components":"ungit-components"}]},{},[1]);
