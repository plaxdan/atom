(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var ko = require('knockout');
var inherits = require('util').inherits;
var components = require('ungit-components');
var RefViewModel = require('./ref.js').RefViewModel;
var graphGraphicsActions = require('./graph-graphics/actions');
var RebaseViewModel = graphGraphicsActions.RebaseViewModel;
var MergeViewModel = graphGraphicsActions.MergeViewModel;
var ResetViewModel = graphGraphicsActions.ResetViewModel;
var PushViewModel = graphGraphicsActions.PushViewModel;
var programEvents = require('ungit-program-events');

var GraphActions = {};
module.exports = GraphActions;

GraphActions.ActionBase = function(graph) {
  var self = this;
  this.graph = graph;
  this.server = graph.server;
  this.performProgressBar = components.create('progressBar', {
    predictionMemoryKey: 'action-' + this.style + '-' + graph.repoPath,
    fallbackPredictedTimeMs: 1000,
    temporary: true
  });

  this.isHighlighted = ko.computed(function() {
    return !graph.hoverGraphAction() || graph.hoverGraphAction() == self;
  });
  this.cssClasses = ko.computed(function() {
    var c = self.style;
    if (!self.isHighlighted()) c += ' dimmed';
    return c;
  })
}
GraphActions.ActionBase.prototype.icon = null;
GraphActions.ActionBase.prototype.doPerform = function() {
  var self = this;
  this.graph.hoverGraphAction(null);
  self.performProgressBar.start();
  this.perform(function() {
    self.performProgressBar.stop();
  });
}
GraphActions.ActionBase.prototype.dragEnter = function() {
  if (!this.visible()) return;
  this.graph.hoverGraphAction(this);
}
GraphActions.ActionBase.prototype.dragLeave = function() {
  if (!this.visible()) return;
  this.graph.hoverGraphAction(null);
}
GraphActions.ActionBase.prototype.mouseover = function() {
  this.graph.hoverGraphAction(this);
}
GraphActions.ActionBase.prototype.mouseout = function() {
  this.graph.hoverGraphAction(null);
}

GraphActions.Move = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    return self.graph.currentActionContext() instanceof RefViewModel &&
      self.graph.currentActionContext().node() != self.node;
  });
}
inherits(GraphActions.Move, GraphActions.ActionBase);
GraphActions.Move.prototype.text = 'Move';
GraphActions.Move.prototype.style = 'move';
GraphActions.Move.prototype.icon = 'glyphicon-move';
GraphActions.Move.prototype.perform = function(callback) {
  this.graph.currentActionContext().moveTo(this.node.sha1, callback);
}


GraphActions.Reset = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.onto = ko.observable(this.node);
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    if (!(self.graph.currentActionContext() instanceof RefViewModel)) return false;
    var context = self.graph.currentActionContext();
    if (context.node() != self.node) return false;
    var remoteRef = context.getRemoteRef(self.graph.currentRemote());
    return remoteRef &&
      remoteRef.node() != context.node() &&
      remoteRef.node().commitTime().unix() < context.node().commitTime().unix();
  });
}
inherits(GraphActions.Reset, GraphActions.ActionBase);
GraphActions.Reset.prototype.text = 'Reset';
GraphActions.Reset.prototype.style = 'reset';
GraphActions.Reset.prototype.icon = 'glyphicon-trash';
GraphActions.Reset.prototype.createHoverGraphic = function() {
  var context = this.graph.currentActionContext();
  if (!context) return null;
  var remoteRef = context.getRemoteRef(this.graph.currentRemote());
  var nodes = context.node().getPathToCommonAncestor(remoteRef.node()).slice(0, -1);
  return new ResetViewModel(nodes);
}
GraphActions.Reset.prototype.perform = function(callback) {
  var server = this.server;
  var context = this.graph.currentActionContext();
  var remote = this.graph.currentRemote();
  var repoPath = this.graph.repoPath;
  var diag = components.create('yesnodialog', { title: 'Are you sure?', details: 'This operation cannot be undone with ungit.'});
  diag.closed.add(function() {
    if (diag.result()) {
		var remoteRef = context.getRemoteRef(remote);
        server.post('/reset', { path: repoPath, to: remoteRef.name, mode: 'hard' }, callback);
	} else {
		callback();
	}
  });
  programEvents.dispatch({ event: 'request-show-dialog', dialog: diag });
}




GraphActions.Rebase = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    return self.graph.currentActionContext() instanceof RefViewModel &&
      (!ungit.config.showRebaseAndMergeOnlyOnRefs || self.node.refs().length > 0) &&
      self.graph.currentActionContext().current() &&
      self.graph.currentActionContext().node() != self.node;
  });
}
inherits(GraphActions.Rebase, GraphActions.ActionBase);
GraphActions.Rebase.prototype.text = 'Rebase';
GraphActions.Rebase.prototype.style = 'rebase';
GraphActions.Rebase.prototype.createHoverGraphic = function() {
  var onto = this.graph.currentActionContext();
  if (!onto) return;
  if (onto instanceof RefViewModel) onto = onto.node();
  var path = onto.getPathToCommonAncestor(this.node);
  return new RebaseViewModel(this.node, path);
}
GraphActions.Rebase.prototype.perform = function(callback) {
  this.server.post('/rebase', { path: this.graph.repoPath, onto: this.node.sha1 }, function(err) {
    callback();
    if (err && err.errorCode == 'merge-failed') return true;
  });
}


GraphActions.Merge = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.mergeWith = ko.observable(this.node);
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    if (!self.graph.checkedOutRef() || !self.graph.checkedOutRef().node()) return false;
    return self.graph.currentActionContext() instanceof RefViewModel &&
      !self.graph.currentActionContext().current() &&
      self.graph.checkedOutRef().node() == self.node;
  });
}
inherits(GraphActions.Merge, GraphActions.ActionBase);
GraphActions.Merge.prototype.text = 'Merge';
GraphActions.Merge.prototype.style = 'merge';
GraphActions.Merge.prototype.createHoverGraphic = function() {
  var node = this.graph.currentActionContext();
  if (!node) return null;
  if (node instanceof RefViewModel) node = node.node();
  return new MergeViewModel(this.graph.graphic, this.node, node);
}
GraphActions.Merge.prototype.perform = function(callback) {
  this.server.post('/merge', { path: this.graph.repoPath, with: this.graph.currentActionContext().localRefName }, function(err) {
    callback();
    if (err && err.errorCode == 'merge-failed') return true;
  });
}

GraphActions.Push = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    return self.graph.currentActionContext() instanceof RefViewModel &&
      self.graph.currentActionContext().node() == self.node &&
      self.graph.currentActionContext().canBePushed(self.graph.currentRemote());
  });
}
inherits(GraphActions.Push, GraphActions.ActionBase);
GraphActions.Push.prototype.text = 'Push';
GraphActions.Push.prototype.style = 'push';
GraphActions.Push.prototype.icon = 'glyphicon-open';
GraphActions.Push.prototype.createHoverGraphic = function() {
  var context = this.graph.currentActionContext();
  if (!context) return null;
  var remoteRef = context.getRemoteRef(this.graph.currentRemote());
  if (!remoteRef) return null;
  return new PushViewModel(remoteRef.node(), context.node());
}
GraphActions.Push.prototype.perform = function( callback) {
  var self = this;
  var programEventListener = function(event) {
    if (event.event == 'request-credentials') self.performProgressBar.pause();
    else if (event.event == 'request-credentials-response') self.performProgressBar.unpause();
  };
  programEvents.add(programEventListener);
  var ref = this.graph.currentActionContext();
  var onDone = function(err) {
    programEvents.remove(programEventListener);
    callback();
    if (!err) {
      self.graph.loadNodesFromApi();
      if (ref.isTag) {
        programEvents.dispatch({ event: 'request-fetch-tags' });
      }
    }
  }
  var remoteRef = ref.getRemoteRef(this.graph.currentRemote());
  if (remoteRef) remoteRef.moveTo(ref.refName, onDone);
  else ref.createRemoteRef(onDone);
}

GraphActions.Checkout = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    if (self.graph.currentActionContext() instanceof RefViewModel)
      return self.graph.currentActionContext().node() == self.node &&
        !self.graph.currentActionContext().current();
    return ungit.config.allowCheckoutNodes &&
      self.graph.currentActionContext() == self.node;
  });
}
inherits(GraphActions.Checkout, GraphActions.ActionBase);
GraphActions.Checkout.prototype.text = 'Checkout';
GraphActions.Checkout.prototype.style = 'checkout';
GraphActions.Checkout.prototype.icon = 'glyphicon-folder-open';
GraphActions.Checkout.prototype.perform = function(callback) {
  var self = this;
  var context = this.graph.currentActionContext();
  var refName;
  if (context instanceof RefViewModel) refName = context.refName;
  else refName = context.sha1;
  this.server.post('/checkout', { path: this.graph.repoPath, name: refName }, function(err) {
    if (err && err.errorCode != 'merge-failed') {
      callback();
      return;
    }
    if (context instanceof RefViewModel && context.isRemoteBranch)
      self.server.post('/reset', { path: self.graph.repoPath, to: context.name, mode: 'hard' }, function(err, res) {
        callback();
        if (err && err.errorCode != 'merge-failed') return;
        return true;
      });
    else
      callback();
    return true;
  });
}

GraphActions.Delete = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    return self.graph.currentActionContext() instanceof RefViewModel &&
      self.graph.currentActionContext().node() == self.node &&
      !self.graph.currentActionContext().current();
  });
}
inherits(GraphActions.Delete, GraphActions.ActionBase);
GraphActions.Delete.prototype.text = 'Delete';
GraphActions.Delete.prototype.style = 'delete';
GraphActions.Delete.prototype.icon = 'glyphicon-remove';
GraphActions.Delete.prototype.perform = function(callback) {
  var context = this.graph.currentActionContext();
  var diag = components.create('yesnodialog', { title: 'Are you sure?', details: 'This operation cannot be undone with ungit.'});
  diag.closed.add(function() {
    if (diag.result()) {
		context.remove(callback);
	} else {
		callback();
	}
  });
  programEvents.dispatch({ event: 'request-show-dialog', dialog: diag });
}


GraphActions.CherryPick = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    return self.graph.currentActionContext() == self.node
  });
}
inherits(GraphActions.CherryPick, GraphActions.ActionBase);
GraphActions.CherryPick.prototype.text = 'Cherry pick';
GraphActions.CherryPick.prototype.style = 'cherry-pick';
GraphActions.CherryPick.prototype.perform = function(callback) {
  var self = this;
  this.server.post('/cherrypick', { path: this.graph.repoPath, name: this.node.sha1 }, function(err) {
    callback();
    if (err && err.errorCode == 'merge-failed') return true;
  });
}

GraphActions.Uncommit = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    return self.graph.currentActionContext() == self.node &&
      self.graph.HEAD() == self.node;
  });
}
inherits(GraphActions.Uncommit, GraphActions.ActionBase);
GraphActions.Uncommit.prototype.text = 'Uncommit';
GraphActions.Uncommit.prototype.style = 'uncommit';
GraphActions.Uncommit.prototype.perform = function(callback) {
  var self = this;
  this.server.post('/reset', { path: this.graph.repoPath, to: 'HEAD^', mode: 'mixed' }, callback);
}

GraphActions.Revert = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    return self.graph.currentActionContext() == self.node;
  });
}
inherits(GraphActions.Revert, GraphActions.ActionBase);
GraphActions.Revert.prototype.text = 'Revert';
GraphActions.Revert.prototype.style = 'revert';
GraphActions.Revert.prototype.perform = function(callback) {
  var self = this;
  this.server.post('/revert', { path: this.graph.repoPath, commit: this.node.sha1 }, callback);
}

},{"./graph-graphics/actions":4,"./ref.js":9,"knockout":"knockout","ungit-components":"ungit-components","ungit-program-events":"ungit-program-events","util":undefined}],2:[function(require,module,exports){

var ko = require('knockout');
var md5 = require('blueimp-md5').md5;
var moment = require('moment');
var inherits = require('util').inherits;
var Selectable = require('./git-selectable').Selectable;
var GraphActions = require('./git-graph-actions');
var NodeViewModel = require('./graph-graphics/node').NodeViewModel;
var components = require('ungit-components');
var Vector2 = require('ungit-vector2');

var GitNodeViewModel = function(graph, sha1) {
  NodeViewModel.call(this);
  Selectable.call(this, graph);
  var self = this;

  this.graph = graph;
  this.server = graph.server;
  this.sha1 = sha1;

  this.isInited = false;

  this.logBoxElement = ko.observable();
  this.boxDisplayX = ko.computed(function() {
    return self.x();
  });
  this.boxDisplayY = ko.computed(function() {
    return self.y();
  });
  this.logBoxX = ko.computed(function() {
    return -self.radius();
  })
  this.refsX = ko.computed(function() {
    return self.radius();
  });
  this.nodeX = ko.computed(function() {
    return -self.radius();
  });
  this.nodeY = ko.computed(function() {
    return -self.radius();
  });
  this.nodeWidth = ko.computed(function() {
    return self.radius()*2;
  });
  this.nodeHeight = ko.computed(function() {
    return self.radius()*2;
  });
  this.aboveNode = null; // The node directly above this, graphically

  this.commitTime = ko.observable();
  this.authorTime = ko.observable();
  this.parents = ko.observable([]);
  this.message = ko.observable();
  this.title = ko.observable();
  this.body = ko.observable();
  this.authorDate = ko.observable(0);
  this.authorDateFromNow = ko.observable();
  this.authorName = ko.observable();
  this.authorEmail = ko.observable();
  this.fileLineDiffs = ko.observable();
  this.numberOfAddedLines = ko.observable();
  this.numberOfRemovedLines = ko.observable();
  this.authorGravatar = ko.computed(function() { return md5(self.authorEmail()); });

  this.index = ko.observable();
  this.ideologicalBranch = ko.observable();
  self.ideologicalBranch.subscribe(function(value) {
    self.color(value ? value.color : '#666');
  });
  this.ancestorOfHEAD = ko.observable(false);
  this.nodeIsMousehover = ko.observable(false);
  this.logBoxVisible = ko.computed(function() {
    return (self.ancestorOfHEAD() && self.isAtFinalXPosition()) || self.nodeIsMousehover() || self.selected();
  });
  this.highlighted = ko.computed(function() {
    return self.nodeIsMousehover() || self.selected();
  });
  this.commitDiff = ko.computed(function() {
    if ((self.selected() || self.highlighted()) && self.fileLineDiffs()) return components.create('commitDiff', {
      fileLineDiffs: self.fileLineDiffs().slice(), sha1: self.sha1, repoPath: self.graph.repoPath, server: self.server });
    else return null;
  });
  this.showCommitDiff = ko.computed(function() {
    return self.fileLineDiffs() && self.fileLineDiffs().length > 0;
  });
  this.screenWidth = ko.observable();
  this.diffStyle = ko.computed(function() {
    if (self.selected()) return { left: -self.boxDisplayX() + 'px', width: (self.screenWidth() - 120) + 'px' };
    else return { left: '0px', width: self.logBoxElement() ? ((self.logBoxElement().clientWidth - 20) + 'px') : 'inherit' };
  });
  // These are split up like this because branches and local tags can be found in the git log,
  // whereas remote tags needs to be fetched with another command (which is much slower)
  this.branchesAndLocalTags = ko.observable([]);
  this.remoteTags = ko.observable([]);
  this.refs = ko.computed(function() {
    var rs = self.branchesAndLocalTags().concat(self.remoteTags());
    rs.sort(function(a, b) {
      if (a.isLocal && !b.isLocal) return -1;
      if (!a.isLocal && b.isLocal) return 1;
      return a.refName < b.refName ? -1 : 1;
    });
    return rs;
  });
  this.branches = ko.computed(function() {
    return self.refs().filter(function(r) { return r.isBranch; });
  });
  this.tags = ko.computed(function() {
    return self.refs().filter(function(r) { return r.isTag; });
  });
  this.showNewRefAction = ko.computed(function() {
    return !graph.currentActionContext();
  })
  this.newBranchName = ko.observable();
  this.newBranchNameHasFocus = ko.observable(true);
  this.newBranchNameHasFocus.subscribe(function(newValue) {
    if (!newValue) {
      // Small timeout because in ff the form is hidden before the submit click event is registered otherwise
      setTimeout(function() {
        self.branchingFormVisible(false);
      }, 200);
    }
  })
  this.branchingFormVisible = ko.observable(false);
  this.canCreateRef = ko.computed(function() {
    return self.newBranchName() && self.newBranchName().trim() && self.newBranchName().indexOf(' ') == -1;
  });

  this.dropareaGraphActions = [
    new GraphActions.Move(this.graph, this),
    new GraphActions.Rebase(this.graph, this),
    new GraphActions.Merge(this.graph, this),
    new GraphActions.Push(this.graph, this),
    new GraphActions.Reset(this.graph, this),
    new GraphActions.Checkout(this.graph, this),
    new GraphActions.Delete(this.graph, this),
    new GraphActions.CherryPick(this.graph, this),
    new GraphActions.Uncommit(this.graph, this),
    new GraphActions.Revert(this.graph, this)
  ];
}
inherits(GitNodeViewModel, NodeViewModel);
exports.GitNodeViewModel = GitNodeViewModel;
GitNodeViewModel.prototype.setData = function(args) {
  this.commitTime(moment(new Date(args.commitDate)));
  this.authorTime(moment(new Date(args.authorDate)));
  this.parents(args.parents || []);
  var message = args.message.split('\n');
  this.message(args.message);
  this.title(message[0]);
  this.body(message.slice(2).join('\n'));
  this.authorDate(moment(new Date(args.authorDate)));
  this.authorDateFromNow(this.authorDate().fromNow());
  this.authorName(args.authorName);
  this.authorEmail(args.authorEmail);
  this.numberOfAddedLines(args.fileLineDiffs.length > 0 ? args.fileLineDiffs[0][0] : 0);
  this.numberOfRemovedLines(args.fileLineDiffs.length > 0 ? args.fileLineDiffs[0][1] : 0);
  this.fileLineDiffs(args.fileLineDiffs);
  this.isInited = true;
}
GitNodeViewModel.prototype.updateLastAuthorDateFromNow = function(deltaT) {
  this.lastUpdatedAuthorDateFromNow = this.lastUpdatedAuthorDateFromNow || 0;
  this.lastUpdatedAuthorDateFromNow += deltaT;
  if(this.lastUpdatedAuthorDateFromNow > 60 * 1000) {
    this.lastUpdatedAuthorDateFromNow = 0;
    this.authorDateFromNow(this.authorDate().fromNow());
  }
}
GitNodeViewModel.prototype.updateAnimationFrame = function(deltaT) {
  this.updateLastAuthorDateFromNow(deltaT);
  GitNodeViewModel.super_.prototype.updateAnimationFrame.call(this, deltaT);

  this.updateGoalPosition();
}
GitNodeViewModel.prototype.updateGoalPosition = function() {
  var goalPosition = new Vector2();
  if (this.ancestorOfHEAD()) {
    if (!this.aboveNode)
      goalPosition.y = 120;
    else if (this.aboveNode.ancestorOfHEAD())
      goalPosition.y = this.aboveNode.goalPosition().y + 120;
    else
      goalPosition.y = this.aboveNode.goalPosition().y + 60;
    goalPosition.x = 30;
    this.setRadius(30);
  } else {
    if (this.aboveNode) {
      goalPosition.y = this.aboveNode.goalPosition().y + 60;
    } else {
      goalPosition.y = 120;
    }
    
    goalPosition.x = 30 + 90 * this.branchOrder;
    this.setRadius(15);
  }
  if (this.aboveNode && this.aboveNode.selected()) {
    goalPosition.y = this.aboveNode.goalPosition().y + this.aboveNode.logBoxElement().offsetHeight + 30;
  }
  var dw = window.innerWidth;
  if (this.screenWidth() != dw) this.screenWidth(dw);
  this.setPosition(goalPosition);
}
GitNodeViewModel.prototype.showBranchingForm = function() {
  this.branchingFormVisible(true);
  this.newBranchNameHasFocus(true);
}
GitNodeViewModel.prototype.createBranch = function() {
  if (!this.canCreateRef()) return;
  this.server.post('/branches', { path: this.graph.repoPath, name: this.newBranchName(), startPoint: this.sha1 });
  this.branchingFormVisible(false);
  this.newBranchName('');
}
GitNodeViewModel.prototype.createTag = function() {
  if (!this.canCreateRef()) return;
  this.server.post('/tags', { path: this.graph.repoPath, name: this.newBranchName(), startPoint: this.sha1 });
  this.branchingFormVisible(false);
  this.newBranchName('');
}
GitNodeViewModel.prototype.isAncestor = function(node) {
  if (this.index() >= this.graph.maxNNodes) return false;
  if (node == this) return true;
  for (var v in this.parents()) {
    var n = this.graph.nodesById[this.parents()[v]];
    if (n && n.isAncestor(node)) return true;
  }
  return false;
}
GitNodeViewModel.prototype.getPathToCommonAncestor = function(node) {
  var path = [];
  var thisNode = this;
  while (thisNode && !node.isAncestor(thisNode)) {
    path.push(thisNode);
    thisNode = this.graph.nodesById[thisNode.parents()[0]];
  }
  if (thisNode)
    path.push(thisNode);
  return path;
}
GitNodeViewModel.prototype.toggleSelected = function() {
  var self = this;
  var beforeThisCR = this.logBoxElement().getBoundingClientRect();
  var beforeBelowCR = null;
  if (this.belowNode)
    beforeBelowCR = this.belowNode.logBoxElement().getBoundingClientRect();
  
  var prevSelected  = this.graph.currentActionContext();
  if (!(prevSelected instanceof GitNodeViewModel)) prevSelected = null;
  var prevSelectedCR = null;
  if (prevSelected) prevSelectedCR = prevSelected.logBoxElement().getBoundingClientRect();
  this.selected(!this.selected());

  setTimeout(function(){
    self.graph.instantUpdatePositions();
    // If we are deselecting
    if (!self.selected()) {
      if (beforeThisCR.top < 0 && beforeBelowCR) {
        var afterBelowCR = self.belowNode.logBoxElement().getBoundingClientRect();
        // If the next node is showing, try to keep it in the screen (no jumping)
        if (beforeBelowCR.top < window.innerHeight) {
          window.scrollBy(0, afterBelowCR.top - beforeBelowCR.top);
        // Otherwise just try to bring them to the middle of the screen
        } else {
          window.scrollBy(0, afterBelowCR.top - window.innerHeight / 2);
        }
      }
    // If we are selecting
    } else {
      var afterThisCR = self.logBoxElement().getBoundingClientRect();
      if ((prevSelectedCR && (prevSelectedCR.top < 0 || prevSelectedCR.top > window.innerHeight)) &&
        afterThisCR.top != beforeThisCR.top) {
        window.scrollBy(0, -(beforeThisCR.top - afterThisCR.top));
        console.log('Fix')
      }
    }
  }, 0);
}
GitNodeViewModel.prototype.nodeMouseover = function() {
  this.nodeIsMousehover(true);
}
GitNodeViewModel.prototype.nodeMouseout = function() {
  this.nodeIsMousehover(false);
}

},{"./git-graph-actions":1,"./git-selectable":3,"./graph-graphics/node":7,"blueimp-md5":"blueimp-md5","knockout":"knockout","moment":"moment","ungit-components":"ungit-components","ungit-vector2":"ungit-vector2","util":undefined}],3:[function(require,module,exports){
var ko = require('knockout');
var _ = require('lodash');

var Selectable = function(graph) {
  this.selected = ko.computed({
    read: function() {
      return graph.currentActionContext() == this;
    },
    write: function(val) {
      // val is this if we're called from a click ko binding
      if (val === this || val === true) {
        graph.currentActionContext(this);
      } else if (graph.currentActionContext() == this) {
        graph.currentActionContext(null);
      }
    },
    owner: this
  });
};
exports.Selectable = Selectable;

},{"knockout":"knockout","lodash":"lodash"}],4:[function(require,module,exports){

var ko = require('knockout');
var Vector2 = require('ungit-vector2');
var NodeViewModel = require('./node').NodeViewModel;
var EdgeViewModel = require('./edge').EdgeViewModel;
var Color = require('color');


function MergeViewModel(graph, headNode, node) {
  var self = this;

  this.graph = graph;

  var newNode = {
    position: new Vector2(
      headNode.x(),
      headNode.y() - 35),
    radius: Math.max(headNode.radius(), node.radius())
  };
  newNode.position.y -= newNode.radius*2;

  this.newNode = new NodeViewModel(newNode.position, newNode.radius);
  this.edges = [
    new EdgeViewModel(headNode, this.newNode),
    new EdgeViewModel(node, this.newNode)
  ];
  graph.dimCommit(true)
}
exports.MergeViewModel = MergeViewModel;
MergeViewModel.prototype.type = 'merge';
MergeViewModel.prototype.destroy = function() {
  this.graph.dimCommit(false)
}


function RebaseViewModel(onto, nodesThatWillMove) {
  var self = this;
  
  var rebaseNodes = {};
  this.path = nodesThatWillMove;
  this.path.slice(0, -1).forEach(function(node) { rebaseNodes[node.sha1] = true; });

  this.arrows = [];
  this.nodes = this.path.slice(0, -1).map(function(node, i) {
    i = (self.path.length - 1 - i);
    var n = new NodeViewModel(
      new Vector2(
        onto.x() + (node.x() - self.path[self.path.length - 1].x()),
        onto.y() - i * (node.radius() * 2 + 20)),
      node.radius());
    var d = n.position().sub(node.position()).normalize();
    var from = node.position().add(d.mul(node.radius() + 3));
    var to = n.position().sub(d.mul(node.radius()));
    var l = to.sub(from).length();
    if (l > 45) to = to.sub(d.mul(45));
    else to = from.add(d);
    self.arrows.push({ from: from, to: to });
    return n;
  });

  this.edges = [];
  var prevNode = onto;
  this.nodes.reverse().forEach(function(node) {
    self.edges.push(new EdgeViewModel(node, prevNode));
    prevNode = node;
  });

  this.path.slice(0, -1).forEach(function(node) {
    node.savedColor = node.color();
    node.color(Color(node.color()).alpha(0.2).rgbaString());
  });
}
exports.RebaseViewModel = RebaseViewModel;
RebaseViewModel.prototype.type = 'rebase';
RebaseViewModel.prototype.destroy = function() {
  this.path.slice(0, -1).forEach(function(node) {
    node.color(node.savedColor);
  });
}
RebaseViewModel.prototype.updateAnimationFrame = function(deltaT) {
  this.nodes.forEach(function(node) {
    node.updateAnimationFrame(deltaT);
  });
}


function ResetViewModel(nodes) {
  this.nodes = nodes;
}
exports.ResetViewModel = ResetViewModel;
ResetViewModel.prototype.type = 'reset';


function PushViewModel(fromNode, toNode) {
  this.fromPosition = fromNode.position().clone();
  this.toPosition = toNode.position().clone();
  this.fromPosition.x += fromNode.radius() + 50;
  this.toPosition.x += toNode.radius() + 50;
  if (this.fromPosition.y > this.toPosition.y) {
    this.fromPosition.y -= 20;
    this.toPosition.y += 20;
  } else {
    this.fromPosition.y += 20;
    this.toPosition.y -= 20;
  }
  // adjust for the arrow
  var d = this.toPosition.sub(this.fromPosition).normalize();
  this.toPosition = this.toPosition.sub(d.mul(45));
}
exports.PushViewModel = PushViewModel;
PushViewModel.prototype.type = 'push';
},{"./edge":5,"./node":7,"color":undefined,"knockout":"knockout","ungit-vector2":"ungit-vector2"}],5:[function(require,module,exports){

var ko = require('knockout');
var Vector2 = require('ungit-vector2');

var EdgeViewModel = function(nodea, nodeb) {
  var self = this;
  this.nodea = ko.observable(nodea);
  this.nodeb = ko.observable(nodeb);
  this.x1 = ko.observable();
  this.x2 = ko.observable();
  this.y1 = ko.observable();
  this.y2 = ko.observable();
  this.updateAnimationFrame();
}
exports.EdgeViewModel = EdgeViewModel;
EdgeViewModel.prototype._getNodePosition = function(node, fallbackNode) {
  if (node && node.position()) {
    return node.position();
  } else {
    if (fallbackNode && fallbackNode.position()) return fallbackNode.position().add(new Vector2(0, 10000));
    else return new Vector2(0, 0);
  }
}
EdgeViewModel.prototype._getNodeRadius = function(node) {
  return (node ? node.outerRadius() : null) || 30;
}
EdgeViewModel.prototype.updateAnimationFrame = function(deltaT) {
  var a = this._getNodePosition(this.nodea(), this.nodeb());
  var b = this._getNodePosition(this.nodeb(), this.nodea());
  var d = b.sub(a);
  if (d.length() == 0) {
    this.x1(a.x);
    this.y1(a.y);
    this.x2(a.x);
    this.y2(a.y);
    return;
  }
  d = d.normalize();
  var p1 = a.add(d.mul(this._getNodeRadius(this.nodea()) + 2));
  var p2 = b.sub(d.mul(this._getNodeRadius(this.nodeb()) + 2));
  this.x1(p1.x);
  this.y1(p1.y);
  this.x2(p2.x);
  this.y2(p2.y);
}
},{"knockout":"knockout","ungit-vector2":"ungit-vector2"}],6:[function(require,module,exports){

var ko = require('knockout');
var Vector2 = require('ungit-vector2');
var EdgeViewModel = require('./edge').EdgeViewModel;

var GraphViewModel = function() {
  var self = this;
  this.nodes = ko.observable([]);
  this.commitNode = new CommitNodeViewModel(this);
  this.commitNodeEdge = new EdgeViewModel(this.commitNode);
  this.offset = ko.observable(new Vector2(0, 0));
  this.edges = ko.observable([]);
  this.showCommitNode = ko.observable();
  this.dimCommit = ko.observable(false);
  this.commitOpacity = ko.computed(function() { return self.dimCommit() ? 0.1 : 1; });
  this.graphWidth = ko.computed(function() {
    var width = 0;
    self.nodes().forEach(function(node) {
      width = Math.max(width, node.x() + node.radius() + self.offset().x + 200);
    });
    return width;
  });
  this.graphHeight = ko.computed(function() {
    var height = 0;
    self.nodes().forEach(function(node) {
      height = Math.max(height, node.y() + node.radius() + self.offset().y + 5);
    });
    return height;
  });

  this.hoverGraphActionGraphic = ko.observable();
  var prevHoverGraphic;
  this.hoverGraphActionGraphic.subscribe(function(value) {
    prevHoverGraphic = value;
  }, null, 'beforeChange');
  this.hoverGraphActionGraphic.subscribe(function(newValue) {
    if (newValue != prevHoverGraphic && prevHoverGraphic && prevHoverGraphic.destroy)
      prevHoverGraphic.destroy();
  });
  this.hoverGraphActionGraphicType = ko.computed(function() {
    return self.hoverGraphActionGraphic() ? self.hoverGraphActionGraphic().type : '';
  })
}
exports.GraphViewModel = GraphViewModel;
GraphViewModel.prototype.updateAnimationFrame = function(deltaT) {
  if (this.hoverGraphActionGraphic() && this.hoverGraphActionGraphic().updateAnimationFrame) {
    this.hoverGraphActionGraphic().updateAnimationFrame(deltaT);
  }
  this.nodes().forEach(function(node) {
    node.updateAnimationFrame(deltaT);
  });
  this.edges().forEach(function(edge) {
    edge.updateAnimationFrame(deltaT);
  });
  this.commitNodeEdge.updateAnimationFrame(deltaT);
}

var CommitNodeViewModel = function(graph) {
  this.position = ko.observable(new Vector2(30, 30));
  this.radius = ko.observable(28);
  this.outerRadius = ko.observable(32);
  //this.color = ko.computed(function() { return graph.HEAD() && graph.HEAD().ideologicalBranch() ? graph.HEAD().ideologicalBranch().color : '#666' });
  this.color = ko.observable('#ff00ff')
}
},{"./edge":5,"knockout":"knockout","ungit-vector2":"ungit-vector2"}],7:[function(require,module,exports){

var ko = require('knockout');
var Vector2 = require('ungit-vector2');

var NodeViewModel = function(position, radius) {
  var self = this;
  this.position = ko.observable(position);
  this.goalPosition = ko.observable(position);
  this.isAtFinalXPosition = ko.computed(function() {
    if (!self.goalPosition() || !self.position()) return true;
    return self.position().x == self.goalPosition().x;
  });
  this.x = ko.computed(function() { return self.position() ? self.position().x : 0; });
  this.y = ko.computed(function() { return self.position() ? self.position().y : 0; });
  this.radius = ko.observable(radius || 30);
  this.outerRadius = this.radius;
  this.goalRadius = ko.observable(radius);
  this.animationSpeed = 0.4;
  this.color = ko.observable('#ff00ff');
  this.selected = ko.observable(false);
}
exports.NodeViewModel = NodeViewModel;
NodeViewModel.prototype.setPosition = function(position) {
  var self = this;
  this.prevPosition = self.position();
  if (!self.goalPosition()) self.position(position);
  self.goalPosition(position);
}
NodeViewModel.prototype.setRadius = function(radius) {
  this.prevRadius = this.radius();
  if (!this.goalRadius()) this.radius(radius);
  this.goalRadius(radius);
  this.setRadiusTimestamp = Date.now();
}
NodeViewModel.prototype.updateAnimationFrame = function(deltaT) {
  var totalTime = 500;

  var d = this.goalPosition().sub(this.position() || new Vector2(0, 0));
  var distanceLeft = d.length();
  if (distanceLeft != 0) {

    d = this.goalPosition().sub(this.prevPosition || new Vector2(0, 0));

    var totalLength = d.length();
    var lengthToMove = deltaT * this.animationSpeed;
    if (distanceLeft < lengthToMove) {
      this.position(this.goalPosition());
    } else {
      d = d.normalize().mul(lengthToMove);

      var pos = (this.position() || new Vector2(0, 0)).add(d);
      this.position(pos);
    }
  }

  var radiusLeft = this.goalRadius() - this.radius();
  if (radiusLeft != 0) {
    var sign = radiusLeft ? radiusLeft < 0 ? -1 : 1 : 0;
    radiusLeft = Math.abs(radiusLeft);
    var totalRadiusDiff = Math.abs(this.goalRadius() - this.prevRadius);
    var radiusToChange = totalRadiusDiff * deltaT / totalTime;
    if (radiusLeft < radiusToChange) {
      this.radius(this.goalRadius());
    } else {
      this.radius(this.radius() + sign * radiusToChange);
    }
  }
}

},{"knockout":"knockout","ungit-vector2":"ungit-vector2"}],8:[function(require,module,exports){


var ko = require('knockout');
var Vector2 = require('ungit-vector2');
var GitNodeViewModel = require('./git-node').GitNodeViewModel;
var RefViewModel = require('./ref.js').RefViewModel;
var components = require('ungit-components');
var moment = require('moment');
var _ = require('lodash');
var GraphViewModel = require('./graph-graphics/graph').GraphViewModel;
var EdgeViewModel = require('./graph-graphics/edge').EdgeViewModel;

components.register('graph', function(args) {
  return new GitGraphViewModel(args.server, args.repoPath);
});

var GitGraphViewModel = function(server, repoPath) {
  var self = this;
  this.server = server;
  this.repoPath = repoPath;
  this.currentRemote = ko.observable();
  this.maxNNodes = 25;
  this.nodes = ko.observable([]);
  this.edgesById = {};
  this.refs = ko.observableArray();
  this.nodesById = {};
  this.refsByRefName = {};
  this.nodesLoader = components.create('progressBar', {
      predictionMemoryKey: 'gitgraph-' + self.repoPath,
      fallbackPredictedTimeMs: 1000,
      temporary: true
    });
  this.checkedOutBranch = ko.observable();
  this.checkedOutRef = ko.computed(function() {
    if (self.checkedOutBranch())
      return self.getRef('refs/heads/' + self.checkedOutBranch());
    else
      return null;
  });
  this.HEAD = ko.observable();
  this.hoverGraphAction = ko.observable();
  this.currentActionContext = ko.observable();
  this.scrolledToEnd = _.debounce(function() {
    self.maxNNodes = self.maxNNodes + 25;
    self.loadNodesFromApi();
  }, 1000, true);
  this.graphic = new GraphViewModel();
  this.graphic.offset(new Vector2(5, 200));
  this.HEAD.subscribe(function(value) {
    self.graphic.commitNodeEdge.nodeb(value);
    self.graphic.showCommitNode(!!value);
    if (value)
      self.graphic.commitNode.color(value.color());
  });

  this.nodes.subscribe(function(nodes) {
    var edges = [];
    nodes.forEach(function(node) {
      node.parents().forEach(function(parentSha1) {
        edges.push(self.getEdge(node.sha1, parentSha1));
      });
    });
    self.graphic.nodes(nodes);
    self.graphic.edges(edges);
  });

  this.hoverGraphAction.subscribe(function(value) {
    if (value) {
      if (value.createHoverGraphic)
        self.graphic.hoverGraphActionGraphic(value.createHoverGraphic());
    } else {
      self.graphic.hoverGraphActionGraphic(null);
    }
  });

  this.loadNodesFromApiThrottled = _.throttle(this.loadNodesFromApi.bind(this), 500);
  this.updateBranchesThrottled = _.throttle(this.updateBranches.bind(this), 500);
  this.loadNodesFromApiThrottled();
  this.updateBranchesThrottled();
}
GitGraphViewModel.prototype.updateNode = function(parentElement) {
  ko.renderTemplate('graph', this, {}, parentElement);
}
exports.GitGraphViewModel = GitGraphViewModel;
GitGraphViewModel.prototype.updateAnimationFrame = function(deltaT) {
  this.graphic.updateAnimationFrame(deltaT);
}
GitGraphViewModel.prototype.onProgramEvent = function(event) {
  if (event.event == 'git-directory-changed') {
    this.loadNodesFromApiThrottled();
    this.updateBranchesThrottled();
  } else if (event.event == 'request-app-content-refresh') {
    this.loadNodesFromApiThrottled();
  } else if (event.event == 'remote-tags-update') {
    this.setRemoteTags(event.tags);
  } else if (event.event == 'current-remote-changed') {
    this.currentRemote(event.newRemote);
  }
}
GitGraphViewModel.prototype.loadNodesFromApi = function(callback) {
  var self = this;
  this.nodesLoader.start();
  this.server.get('/log', { path: this.repoPath, limit: this.maxNNodes }, function(err, logEntries) {
    if (err) {
      self.nodesLoader.stop();
      if (callback) callback();
      return err.errorCode == 'no-such-path';
    }
    self.setNodesFromLog(logEntries);
    self.nodesLoader.stop();
    if (callback) callback();
  });
}
GitGraphViewModel.prototype.updateBranches = function() {
  var self = this;
  this.server.get('/checkout', { path: this.repoPath }, function(err, branch) {
    if (err && err.errorCode == 'not-a-repository') return true;
    if (err) return;
    self.checkedOutBranch(branch);
  });
}

GitGraphViewModel.prototype.setRemoteTags = function(remoteTags) {
  var self = this;
  var nodeIdsToRemoteTags = {};
  remoteTags.forEach(function(ref) {
    if (ref.name.indexOf('^{}') != -1) {
      var tagRef = ref.name.slice(0, ref.name.length - '^{}'.length);
      var name = 'remote-tag: ' + ref.remote + '/' + tagRef.split('/')[2];
      var refViewModel = self.getRef(name);
      var node = self.getNode(ref.sha1);
      refViewModel.node(node);

      nodeIdsToRemoteTags[ref.sha1] = nodeIdsToRemoteTags[ref.sha1] || [];
      nodeIdsToRemoteTags[ref.sha1].push(refViewModel);
    }
  });

  for(var key in this.nodesById)
    this.nodesById[key].remoteTags(nodeIdsToRemoteTags[key] || []);
}

GitGraphViewModel.prototype.setNodesFromLog = function(nodesData) {
  var self = this;
  var nodeVMs = [];
  nodesData.forEach(function(nodeData) {
    var nodeViewModel = self.getNode(nodeData.sha1);
    // Only set the data for the node once (since nodes never change)
    if (!nodeViewModel.isInited) nodeViewModel.setData(nodeData);
    nodeVMs.push(nodeViewModel);
    if (nodeData.refs) {
      var refVMs = nodeData.refs.map(function(ref) {
        var refViewModel = self.getRef(ref);
        refViewModel.node(nodeViewModel);
        return refViewModel;
      });
      nodeViewModel.branchesAndLocalTags(refVMs);
    }
  });
  this.setNodes(nodeVMs);
}
GitGraphViewModel.prototype.getNode = function(sha1) {
  var nodeViewModel = this.nodesById[sha1];
  if (!nodeViewModel) nodeViewModel = this.nodesById[sha1] = new GitNodeViewModel(this, sha1);
  return nodeViewModel;
}
GitGraphViewModel.prototype.getRef = function(fullRefName, constructIfUnavailable) {
  if (constructIfUnavailable === undefined) constructIfUnavailable = true;
  var refViewModel = this.refsByRefName[fullRefName];
  if (!refViewModel && constructIfUnavailable) {
    refViewModel = this.refsByRefName[fullRefName] = new RefViewModel({ name: fullRefName, graph: this });
    this.refs.push(refViewModel);
  }
  return refViewModel;
}
GitGraphViewModel.prototype.getEdge = function(nodeAsha1, nodeBsha1) {
  var id = nodeAsha1 + '-' + nodeBsha1;
  var edge = this.edgesById[id];
  if (!edge) {
    edge = this.edgesById[id] = new EdgeViewModel(this.getNode(nodeAsha1), this.getNode(nodeBsha1));
  }
  return edge;
}

GitGraphViewModel.getHEAD = function(nodes) {
  return _.find(nodes, function(node) { return _.find(node.refs(), 'isLocalHEAD'); });
}

GitGraphViewModel.traverseNodeParents = function(node, nodesById, callback) {
  if (node.index() >= this.maxNNodes) return false;
  if (!callback(node)) return false;
  for (var i=0; i < node.parents().length; i++) {
    var parent = nodesById[node.parents()[i]];
    if (parent)
      GitGraphViewModel.traverseNodeParents(parent, nodesById, callback);
  }
}
GitGraphViewModel.traverseNodeLeftParents = function(node, nodesById, callback) {
  if (node.index() >= this.maxNNodes) return;
  callback(node);
  var parent = nodesById[node.parents()[0]];
  if (parent)
    GitGraphViewModel.traverseNodeLeftParents(parent, nodesById, callback);
}

GitGraphViewModel._markIdeologicalStamp = 0;
GitGraphViewModel.markNodesIdeologicalBranches = function(refs, nodes, nodesById) {
  refs = refs.filter(function(r) { return !!r.node(); });
  refs = refs.sort(function(a, b) {
    if (a.isLocal && !b.isLocal) return -1;
    if (b.isLocal && !a.isLocal) return 1;
    if (a.isBranch && !b.isBranch) return -1;
    if (b.isBranch && !a.isBranch) return 1;
    if (a.isHead && !b.isHead) return 1;
    if (!a.isHead && b.isHead) return -1;
    if (a.isStash && !b.isStash) return 1;
    if (b.isStash && !a.isStash) return -1;
    if (a.node() && a.node().commitTime() && b.node() && b.node().commitTime())
      return a.node().commitTime().unix() - b.node().commitTime().unix();
    return a.refName < b.refName ? -1 : 1;
  });
  var stamp = GitGraphViewModel._markIdeologicalStamp++;
  refs.forEach(function(ref) {
    GitGraphViewModel.traverseNodeParents(ref.node(), nodesById, function(node) {
      if (node.stamp == stamp) return false;
      node.stamp = stamp;
      node.ideologicalBranch(ref);
      return true;
    });
  });
}

GitGraphViewModel.randomColor = function() {
  var randomHex = function() {
    var r = Math.floor(Math.random() * 256).toString(16);
    if (r.length == 1) r = '0' + r;
    return r;
  }
  return '#' + randomHex() + randomHex() + randomHex();
}


GitGraphViewModel.prototype.setNodes = function(nodes) {
  nodes.forEach(function(node, i) { node.index(i); });
  nodes = nodes.slice(0, GitGraphViewModel.maxNNodes);

  GitGraphViewModel.markNodesIdeologicalBranches(this.refs(), nodes, this.nodesById);
  this.HEAD(GitGraphViewModel.getHEAD(nodes));
  var HEAD = this.HEAD();

  var updateTimeStamp = moment().valueOf();

  // Mark timestamps
  if (HEAD) {
    GitGraphViewModel.traverseNodeLeftParents(HEAD, this.nodesById, function(node) {
      node.ancestorOfHEADTimeStamp = updateTimeStamp;
    });
  }

  // Filter out nodes which doesn't have a branch (staging and orphaned nodes)
  nodes = nodes.filter(function(node) { return (node.ideologicalBranch() && !node.ideologicalBranch().isStash) || node.ancestorOfHEADTimeStamp == updateTimeStamp; })

  //var concurrentBranches = { };

  var branchSlots = [];

  // Then iterate from the bottom to fix the orders of the branches
  for (var i = nodes.length - 1; i >= 0; i--) {
    var node = nodes[i];
    if (node.ancestorOfHEADTimeStamp == updateTimeStamp) continue;
    var ideologicalBranch = node.ideologicalBranch();

    // First occurence of the branch, find an empty slot for the branch
    if (ideologicalBranch.lastSlottedTimeStamp != updateTimeStamp) {
      ideologicalBranch.lastSlottedTimeStamp = updateTimeStamp;
      var slot = 0;
      for(;slot < branchSlots.length; slot++)
        if (branchSlots[slot] === undefined) break;
      if (slot == branchSlots.length) {
        branchSlots.push(ideologicalBranch);
        slot = branchSlots.length - 1;
      }
      ideologicalBranch.branchOrder = slot;
      branchSlots[slot] = slot;
    }

    node.branchOrder = ideologicalBranch.branchOrder;

    // Free branch slots when we reach the end of a branch
    /*if (node == ideologicalBranch.node()) {
      branchSlots[ideologicalBranch.branchOrder] = undefined;
    }*/
  }

  var prevNode;
  nodes.forEach(function(node) {
    node.branchOrder = branchSlots.length - node.branchOrder;
    node.ancestorOfHEAD(node.ancestorOfHEADTimeStamp == updateTimeStamp);
    node.aboveNode = prevNode;
    if (prevNode) prevNode.belowNode = node;
    node.updateGoalPosition();
    prevNode = node;
  });

  this.nodes(nodes);
}

GitGraphViewModel.prototype.instantUpdatePositions = function() {
  this.nodes().forEach(function(node) {
    node.updateGoalPosition();
    node.position(node.goalPosition());
  });
}

GitGraphViewModel.prototype.handleBubbledClick = function(elem, event) {
  // If the clicked element is bound to the current action context,
  // then let's not deselect it.
  if (ko.dataFor(event.target) === this.currentActionContext()) return;
  if (this.currentActionContext() && this.currentActionContext() instanceof GitNodeViewModel) {
    this.currentActionContext().toggleSelected();
  } else {
    this.currentActionContext(null);
  }
  // If the click was on an input element, then let's allow the default action to proceed.
  // This is especially needed since for some strange reason any submit (ie. enter in a textbox)
  // will trigger a click event on the submit input of the form, which will end up here,
  // and if we don't return true, then the submit event is never fired, breaking stuff.
  if (event.target.nodeName === 'INPUT') return true;
}

},{"./git-node":2,"./graph-graphics/edge":5,"./graph-graphics/graph":6,"./ref.js":9,"knockout":"knockout","lodash":"lodash","moment":"moment","ungit-components":"ungit-components","ungit-vector2":"ungit-vector2"}],9:[function(require,module,exports){

var ko = require('knockout');
var md5 = require('blueimp-md5').md5;
var Selectable = require('./git-selectable').Selectable;
var programEvents = require('ungit-program-events');
var components = require('ungit-components');

var RefViewModel = function(args) {
  Selectable.call(this, args.graph);
  var self = this;
  this.node = ko.observable();
  this.boxDisplayX = ko.computed(function() {
    if (!self.node()) return 0;
    return self.node().x();
  });
  this.boxDisplayY = ko.computed(function() {
    if (!self.node()) return 0;
    return self.node().y();
  });
  this.name = args.name;
  this.localRefName = this.name; // origin/master or master
  this.refName = this.name; // master
  this.isRemoteTag = this.name.indexOf('remote-tag: ') == 0;
  this.isLocalTag = this.name.indexOf('tag: ') == 0;
  this.isTag = this.isLocalTag || this.isRemoteTag;
  var isRemoteBranchOrHEAD = this.name.indexOf('refs/remotes/') == 0;
  this.isLocalHEAD = this.name == 'HEAD';
  this.isRemoteHEAD = this.name.indexOf('/HEAD') != -1;
  this.isLocalBranch = this.name.indexOf('refs/heads/') == 0;
  this.isRemoteBranch = isRemoteBranchOrHEAD && !this.isRemoteHEAD;
  this.isStash = this.name.indexOf('refs/stash') == 0;
  this.isHEAD = this.isLocalHEAD || this.isRemoteHEAD;
  this.isBranch = this.isLocalBranch || this.isRemoteBranch;
  this.isRemote = isRemoteBranchOrHEAD || this.isRemoteTag;
  this.isLocal = this.isLocalBranch || this.isLocalTag;
  if (this.isLocalBranch) {
    this.localRefName = this.name.slice('refs/heads/'.length);
    this.refName = this.localRefName;
  }
  if (this.isRemoteBranch) {
    this.localRefName = this.name.slice('refs/remotes/'.length);
  }
  if (this.isLocalTag) {
    this.localRefName = this.name.slice('tag: refs/tags/'.length);
    this.refName = this.localRefName;
  }
  if (this.isRemoteTag) {
    this.localRefName = this.name.slice('remote-tag: '.length);
  }
  if (this.isRemote) {
    // get rid of the origin/ part of origin/branchname
    var s = this.localRefName.split('/');
    this.remote = s[0];
    this.refName = s.slice(1).join('/');
  }
  this.show = true;
  this.graph = args.graph;
  this.server = this.graph.server;
  this.localRef = ko.observable();
  this.isDragging = ko.observable(false);
  this.current = ko.computed(function() {
    return self.isLocalBranch && self.graph.checkedOutBranch() == self.refName;
  });
  this.color = args.color || this._colorFromHashOfString(this.name);
}
RefViewModel.prototype._colorFromHashOfString = function(string) {
  return '#' + md5(string).toString().slice(0, 6);
}
exports.RefViewModel = RefViewModel;
RefViewModel.prototype.dragStart = function() {
  this.graph.currentActionContext(this);
  this.isDragging(true);
  if (document.activeElement) document.activeElement.blur();
}
RefViewModel.prototype.dragEnd = function() {
  this.graph.currentActionContext(null);
  this.isDragging(false);
}
RefViewModel.prototype.canBePushed = function(remote) {
  if (!this.isLocal) return false;
  var remoteRef = this.getRemoteRef(remote);
  if (!remoteRef) return true;
  return this.node() != remoteRef.node();
}
RefViewModel.prototype.getRemoteRef = function(remote) {
  return this.graph.getRef(this.getRemoteRefFullName(remote), false);
}
RefViewModel.prototype.getRemoteRefFullName = function(remote) {
  if (this.isLocalBranch) return 'refs/remotes/' + remote + '/' + this.refName;
  if (this.isLocalTag) return 'remote-tag: ' + remote + '/' + this.refName;
  return null;
}
RefViewModel.prototype.remove = function(callback) {
  var self = this;
  var url = this.isTag ? '/tags' : '/branches';
  if (this.isRemote) url = '/remote' + url;
  this.server.del(url, { path: this.graph.repoPath, remote: this.isRemote ? this.remote : null, name: this.refName }, function(err) {
    callback();
    self.graph.loadNodesFromApi();
    if (url == '/remote/tags') {
      programEvents.dispatch({ event: 'request-fetch-tags' });
    }
  });
}
RefViewModel.prototype.moveTo = function(target, callback) {
  var self = this;
  if (this.isLocal) {
    if (this.current())
      this.server.post('/reset', { path: this.graph.repoPath, to: target, mode: 'hard' }, callback);
    else if (this.isTag)
      this.server.post('/tags', { path: this.graph.repoPath, name: this.refName, startPoint: target, force: true }, callback);
    else
      this.server.post('/branches', { path: this.graph.repoPath, name: this.refName, startPoint: target, force: true }, callback);
  } else {
    var pushReq = { path: this.graph.repoPath, remote: this.remote,
      refSpec: target, remoteBranch: this.refName };
    this.server.post('/push', pushReq, function(err, res) {
        if (err) {
          if (err.errorCode == 'non-fast-forward') {
            var forcePushDialog = components.create('yesnodialog', { title: 'Force push?', details: 'The remote branch can\'t be fast-forwarded.' });
            forcePushDialog.closed.add(function() {
              if (!forcePushDialog.result()) return callback();
              pushReq.force = true;
              self.server.post('/push', pushReq, callback);
            });
            programEvents.dispatch({ event: 'request-show-dialog', dialog: forcePushDialog });
            return true;
          } else {
            callback(err, res);
          }
        } else {
          callback();
        }
      });
  }
}
RefViewModel.prototype.createRemoteRef = function(callback) {
  this.server.post('/push', { path: this.graph.repoPath, remote: this.graph.currentRemote(),
      refSpec: this.refName, remoteBranch: this.refName }, callback);
}
},{"./git-selectable":3,"blueimp-md5":"blueimp-md5","knockout":"knockout","ungit-components":"ungit-components","ungit-program-events":"ungit-program-events"}]},{},[8]);
