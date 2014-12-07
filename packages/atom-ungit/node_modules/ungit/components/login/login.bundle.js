(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var ko = require('knockout');
var components = require('ungit-components');
var signals = require('signals');

components.register('login', function(args) {
  return new LoginViewModel(args.server);
});

var LoginViewModel = function(server) {
  var self = this;
  this.server = server;
  this.loggedIn = new signals.Signal();
  this.status = ko.observable('loading');
  this.username = ko.observable();
  this.password = ko.observable();
  this.loginError = ko.observable();
  this.server.get('/loggedin', undefined, function(err, status) {
    if (status.loggedIn) {
      self.loggedIn.dispatch();
      self.status('loggedIn');
    }
    else self.status('login');
  });
}
LoginViewModel.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('login', this, {}, parentElement);
}
LoginViewModel.prototype.login = function() {
  var self = this;
  this.server.post('/login', { username: this.username(), password: this.password() }, function(err, res) {
    if (err) {
      if (err.res.body.error) {
        self.loginError(err.res.body.error);
        return true;
      }
    } else {
      self.loggedIn.dispatch();
      self.status('loggedIn');
    }
  });
}


},{"knockout":"knockout","signals":undefined,"ungit-components":"ungit-components"}]},{},[1]);
