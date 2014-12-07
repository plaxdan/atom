(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var ko = require('knockout');
var components = require('ungit-components');

components.register('home', function(args) {
  return new HomeViewModel(args.app);
});

function HomeRepositoryViewModel(home, path) {
  this.home = home;
  this.app = home.app;
  this.server = this.app.server;
  this.path = path;
  this.title = path;
  this.link = '/#/repository?path=' + encodeURIComponent(path);
  this.pathRemoved = ko.observable(false);
  this.remote = ko.observable('...');
  this.updateState();
}
HomeRepositoryViewModel.prototype.updateState = function() {
  var self = this;
  this.server.get('/fs/exists?path=' + encodeURIComponent(this.path), undefined, function(err, exists) {
    self.pathRemoved(!exists);
  });
  this.server.get('/remotes/origin?path=' + encodeURIComponent(this.path), undefined, function(err, remote) {
    if (err) {
      self.remote('');
      return true;
    }
    self.remote(remote.address);
  });
}
HomeRepositoryViewModel.prototype.remove = function() {
  var repos = this.app.repoList();
  var i;
  while((i = repos.indexOf(this.path)) != -1)
    repos.splice(i, 1);
  this.app.repoList(repos);
  this.home.update();
}

function HomeViewModel(app) {
  var self = this;
  this.app = app;
  this.repos = ko.observable([]);
  this.showNux = ko.computed(function() {
    return self.repos().length == 0;
  });
}
HomeViewModel.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('home', this, {}, parentElement);
}
HomeViewModel.prototype.template = 'home';
HomeViewModel.prototype.shown = function() {
  this.update();
}
HomeViewModel.prototype.update = function() {
  var self = this;
  var reposByPath = {};
  this.repos().forEach(function(repo) { reposByPath[repo.path] = repo; });
  this.repos(this.app.repoList().sort().map(function(path) {
    if (!reposByPath[path])
      reposByPath[path] = new HomeRepositoryViewModel(self, path);
    return reposByPath[path];
  }));
}

 

},{"knockout":"knockout","ungit-components":"ungit-components"}]},{},[1]);
