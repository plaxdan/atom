(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var ko = require('knockout');
var components = require('ungit-components');
var navigation = require('ungit-navigation');
var programEvents = require('ungit-program-events');

components.register('header', function(args) {
  return new HeaderViewModel(args.app);
});

function HeaderViewModel(app) {
  var self = this;
  this.app = app;
  this.showBackButton = ko.observable(false);
  this.path = ko.observable();
  this.currentVersion = ungit.version;
  this.showAddToRepoListButton = ko.computed(function() {
    return self.path() && self.app.repoList().indexOf(self.path()) == -1;
  });
  this.refreshingProgressBar = components.create('progressBar', { predictionMemoryKey: 'refreshing-content', temporary: true });
}
HeaderViewModel.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('header', this, {}, parentElement);
}
HeaderViewModel.prototype.submitPath = function() {
  navigation.browseTo('repository?path=' + encodeURIComponent(this.path()));
}
HeaderViewModel.prototype.onProgramEvent = function(event) {
  if (event.event == 'navigation-changed') {
    this.showBackButton(event.path != '');
    if (event.path == '') this.path('');
  } else if (event.event == 'navigated-to-path') {
    this.path(event.path);
  }
}
HeaderViewModel.prototype.addCurrentPathToRepoList = function() {
  programEvents.dispatch({ event: 'request-remember-repo', repoPath: this.path() });
  return true;
}
HeaderViewModel.prototype.refresh = function() {
  var self = this;
  programEvents.dispatch({ event: 'request-app-content-refresh' });
  this.refreshingProgressBar.start();
  setTimeout(function() { // Fake the progress bar, for now (since we don't really know who and when this message will be handled)
    self.refreshingProgressBar.stop();
  }, 100);
  return true;
}

},{"knockout":"knockout","ungit-components":"ungit-components","ungit-navigation":"ungit-navigation","ungit-program-events":"ungit-program-events"}]},{},[1]);
