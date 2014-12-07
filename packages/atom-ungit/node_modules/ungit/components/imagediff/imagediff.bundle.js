(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var ko = require('knockout');
var components = require('ungit-components');

components.register('imagediff', function(args) {
  return new ImageDiffViewModel(args);
});

var ImageDiffViewModel = function(args) {
  var self = this;
  this.filename = args.filename;
  this.repoPath = args.repoPath;
  this.isNew = ko.observable(false);
  this.isRemoved = ko.observable(false);
  this.sha1 = args.sha1;
  this.state = ko.computed(function() {
    if (self.isNew()) return 'new';
    if (self.isRemoved()) return 'removed';
    return 'changed';
  });
  this.oldImageSrc = ko.computed(function() {
    return '/api/diff/image?path=' + encodeURIComponent(self.repoPath) + '&filename=' + self.filename + '&version=' + (self.sha1 ? self.sha1 + '^': 'HEAD');
  });
  this.newImageSrc = ko.computed(function() {
    return '/api/diff/image?path=' + encodeURIComponent(self.repoPath) + '&filename=' + self.filename + '&version=' + (self.sha1 ? self.sha1: 'current');
  });
}
ImageDiffViewModel.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('imagediff', this, {}, parentElement);
}
ImageDiffViewModel.prototype.invalidateDiff = function(callback) {
  callback();
}
ImageDiffViewModel.prototype.newImageError = function(data, event) {
  this.isRemoved(true);
}
ImageDiffViewModel.prototype.oldImageError = function(data, event) {
  this.isNew(true);
}

},{"knockout":"knockout","ungit-components":"ungit-components"}]},{},[1]);
