(function() {
  var $, $$$, AtomUngitView, ScrollView, config, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, $$$ = _ref.$$$, ScrollView = _ref.ScrollView;

  config = require('./atom-ungit-config');

  module.exports = AtomUngitView = (function(_super) {
    __extends(AtomUngitView, _super);

    function AtomUngitView() {
      return AtomUngitView.__super__.constructor.apply(this, arguments);
    }

    atom.deserializers.add(AtomUngitView);

    AtomUngitView.content = function() {
      return this.div({
        "class": 'atom-ungit native-key-bindings',
        tabindex: -1
      });
    };

    AtomUngitView.prototype.destroy = function() {
      return this.unsubscribe();
    };

    AtomUngitView.prototype.loadUngit = function() {
      this.showLoading();
      return this.createIframe();
    };

    AtomUngitView.prototype.createIframe = function() {
      var iframe;
      iframe = document.createElement("iframe");
      iframe.sandbox = "allow-same-origin allow-scripts";
      iframe.src = this.getRepoUri();
      return this.html($(iframe));
    };

    AtomUngitView.prototype.getRepoUri = function() {
      var uri;
      uri = config.getUngitHomeUri();
      if (atom.project.getRootDirectory()) {
        uri += "/?noheader=true#/repository?path=" + atom.project.getRootDirectory().path;
      }
      return uri;
    };

    AtomUngitView.prototype.getTitle = function() {
      return "Ungit";
    };

    AtomUngitView.prototype.getIconName = function() {
      return "ungit";
    };

    AtomUngitView.prototype.getUri = function() {
      return config.uri;
    };

    AtomUngitView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.html($$$(function() {
        this.h2('Loading Ungit Failed!');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      }));
    };

    AtomUngitView.prototype.showLoading = function() {
      return this.html($$$(function() {
        return this.div({
          "class": 'atom-html-spinner'
        }, 'Loading Ungit\u2026');
      }));
    };

    return AtomUngitView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF1QixPQUFBLENBQVEsTUFBUixDQUF2QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFdBQUEsR0FBSixFQUFTLGtCQUFBLFVBQVQsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEscUJBQVIsQ0FEVCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUIsYUFBdkIsQ0FBQSxDQUFBOztBQUFBLElBRUEsYUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sZ0NBQVA7QUFBQSxRQUF5QyxRQUFBLEVBQVUsQ0FBQSxDQUFuRDtPQUFMLEVBRFE7SUFBQSxDQUZWLENBQUE7O0FBQUEsNEJBS0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxXQUFELENBQUEsRUFETztJQUFBLENBTFQsQ0FBQTs7QUFBQSw0QkFRQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFGUztJQUFBLENBUlgsQ0FBQTs7QUFBQSw0QkFZQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBVCxDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixpQ0FEakIsQ0FBQTtBQUFBLE1BRUEsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFDLENBQUEsVUFBRCxDQUFBLENBRmIsQ0FBQTthQUlBLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQSxDQUFFLE1BQUYsQ0FBTixFQUxZO0lBQUEsQ0FaZCxDQUFBOztBQUFBLDRCQW1CQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxHQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLGVBQVAsQ0FBQSxDQUFOLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUFBLENBQUg7QUFDRSxRQUFBLEdBQUEsSUFBTyxtQ0FBQSxHQUFzQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFiLENBQUEsQ0FBK0IsQ0FBQyxJQUE3RSxDQURGO09BREE7YUFHQSxJQUpVO0lBQUEsQ0FuQlosQ0FBQTs7QUFBQSw0QkF5QkEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUNSLFFBRFE7SUFBQSxDQXpCVixDQUFBOztBQUFBLDRCQTRCQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQ1gsUUFEVztJQUFBLENBNUJiLENBQUE7O0FBQUEsNEJBK0JBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixNQUFNLENBQUMsSUFERDtJQUFBLENBL0JSLENBQUE7O0FBQUEsNEJBa0NBLFNBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTtBQUNULFVBQUEsY0FBQTtBQUFBLE1BQUEsY0FBQSxvQkFBaUIsTUFBTSxDQUFFLGdCQUF6QixDQUFBO2FBRUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxHQUFBLENBQUksU0FBQSxHQUFBO0FBQ1IsUUFBQSxJQUFDLENBQUEsRUFBRCxDQUFJLHVCQUFKLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBc0Isc0JBQXRCO2lCQUFBLElBQUMsQ0FBQSxFQUFELENBQUksY0FBSixFQUFBO1NBRlE7TUFBQSxDQUFKLENBQU4sRUFIUztJQUFBLENBbENYLENBQUE7O0FBQUEsNEJBeUNBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFDWCxJQUFDLENBQUEsSUFBRCxDQUFNLEdBQUEsQ0FBSSxTQUFBLEdBQUE7ZUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsVUFBQSxPQUFBLEVBQU8sbUJBQVA7U0FBTCxFQUFpQyxxQkFBakMsRUFEUTtNQUFBLENBQUosQ0FBTixFQURXO0lBQUEsQ0F6Q2IsQ0FBQTs7eUJBQUE7O0tBRDBCLFdBSjVCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atom-ungit/lib/atom-ungit-view.coffee