(function() {
  var $, BlameLineComponent, BlameListLinesComponent, BlameListView, RP, React, Reactionary, div, renderLoading, _, _ref, _ref1;

  _ref = require('atom'), React = _ref.React, Reactionary = _ref.Reactionary, $ = _ref.$;

  div = Reactionary.div;

  RP = React.PropTypes;

  _ = require('underscore');

  _ref1 = require('./blame-line-view'), BlameLineComponent = _ref1.BlameLineComponent, renderLoading = _ref1.renderLoading;

  BlameListLinesComponent = React.createClass({
    propTypes: {
      annotations: RP.arrayOf(RP.object),
      loading: RP.bool.isRequired,
      dirty: RP.bool.isRequired,
      initialLineCount: RP.number.isRequired,
      remoteRevision: RP.object.isRequired
    },
    renderLoading: function() {
      var lines, _i, _ref2, _results;
      lines = (function() {
        _results = [];
        for (var _i = 0, _ref2 = this.props.initialLineCount; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; 0 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(renderLoading);
      return div(null, lines);
    },
    _addAlternatingBackgroundColor: function(lines) {
      var bgClass, lastHash, line, _i, _len;
      bgClass = null;
      lastHash = null;
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        bgClass = line.noCommit ? '' : line.hash === lastHash ? bgClass : bgClass === 'line-bg-lighter' ? 'line-bg-darker' : 'line-bg-lighter';
        line['backgroundClass'] = bgClass;
        lastHash = line.hash;
      }
      return lines;
    },
    renderLoaded: function() {
      var l, lines, _i, _len;
      lines = _.clone(this.props.annotations);
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        l = lines[_i];
        l.remoteRevision = this.props.remoteRevision;
      }
      this._addAlternatingBackgroundColor(lines);
      return div(null, lines.map(BlameLineComponent));
    },
    render: function() {
      if (this.props.loading) {
        return this.renderLoading();
      } else {
        return this.renderLoaded();
      }
    },
    shouldComponentUpdate: function(_arg) {
      var dirty, finishedEdit, finishedInitialLoad, loading;
      loading = _arg.loading, dirty = _arg.dirty;
      finishedInitialLoad = this.props.loading && !loading && !this.props.dirty;
      finishedEdit = this.props.dirty && !dirty;
      return finishedInitialLoad || finishedEdit;
    }
  });

  BlameListView = React.createClass({
    propTypes: {
      projectBlamer: RP.object.isRequired,
      remoteRevision: RP.object.isRequired,
      editorView: RP.object.isRequired
    },
    getInitialState: function() {
      return {
        scrollTop: this.scrollbar().scrollTop(),
        width: 210,
        loading: true,
        visible: true,
        dirty: false
      };
    },
    scrollbar: function() {
      return this._scrollbar != null ? this._scrollbar : this._scrollbar = this.props.editorView.find('.vertical-scrollbar');
    },
    editor: function() {
      return this._editor != null ? this._editor : this._editor = this.props.editorView.getModel();
    },
    render: function() {
      var body, display;
      display = this.state.visible ? 'inline-block' : 'none';
      body = this.state.error ? div("Sorry, an error occurred.") : div({
        className: 'git-blame-scroller'
      }, div({
        className: 'blame-lines',
        style: {
          WebkitTransform: this.getTransform()
        }
      }, BlameListLinesComponent({
        annotations: this.state.annotations,
        loading: this.state.loading,
        dirty: this.state.dirty,
        initialLineCount: this.editor().getLineCount(),
        remoteRevision: this.props.remoteRevision
      })));
      return div({
        className: 'git-blame',
        style: {
          width: this.state.width,
          display: display
        }
      }, div({
        className: 'git-blame-resize-handle',
        onMouseDown: this.resizeStarted
      }), body);
    },
    getTransform: function() {
      var scrollTop, useHardwareAcceleration;
      scrollTop = this.state.scrollTop;
      useHardwareAcceleration = false;
      if (useHardwareAcceleration) {
        return "translate3d(0px, " + (-scrollTop) + "px, 0px)";
      } else {
        return "translate(0px, " + (-scrollTop) + "px)";
      }
    },
    componentWillMount: function() {
      this.loadBlame();
      this.editor().on('contents-modified', this.contentsModified);
      return this.editor().buffer.on('saved', this.saved);
    },
    loadBlame: function() {
      this.setState({
        loading: true
      });
      return this.props.projectBlamer.blame(this.editor().getPath(), (function(_this) {
        return function(err, data) {
          if (err) {
            return _this.setState({
              loading: false,
              error: true,
              dirty: false
            });
          } else {
            return _this.setState({
              loading: false,
              error: false,
              dirty: false,
              annotations: data
            });
          }
        };
      })(this));
    },
    contentsModified: function() {
      if (!this.isMounted()) {
        return;
      }
      if (!this.state.dirty) {
        return this.setState({
          dirty: true
        });
      }
    },
    saved: function() {
      if (!this.isMounted()) {
        return;
      }
      if (this.state.visible && this.state.dirty) {
        return this.loadBlame();
      }
    },
    toggle: function() {
      if (this.state.visible) {
        return this.setState({
          visible: false
        });
      } else {
        if (this.state.dirty) {
          this.loadBlame();
        }
        return this.setState({
          visible: true
        });
      }
    },
    componentDidMount: function() {
      return this.scrollbar().on('scroll', this.matchScrollPosition);
    },
    componentWillUnmount: function() {
      this.scrollbar().off('scroll', this.matchScrollPosition);
      this.editor().off('contents-modified', this.contentsModified);
      return this.editor().buffer.off('saved', this.saved);
    },
    matchScrollPosition: function() {
      return this.setState({
        scrollTop: this.scrollbar().scrollTop()
      });
    },
    resizeStarted: function(_arg) {
      var pageX;
      pageX = _arg.pageX;
      this.setState({
        dragging: true,
        initialPageX: pageX,
        initialWidth: this.state.width
      });
      $(document).on('mousemove', this.onResizeMouseMove);
      return $(document).on('mouseup', this.resizeStopped);
    },
    resizeStopped: function(e) {
      $(document).off('mousemove', this.onResizeMouseMove);
      $(document).off('mouseup', this.resizeStopped);
      this.setState({
        dragging: false
      });
      e.stopPropagation();
      return e.preventDefault();
    },
    onResizeMouseMove: function(e) {
      if (!(this.state.dragging && e.which === 1)) {
        return this.resizeStopped();
      }
      this.setState({
        width: this.state.initialWidth + e.pageX - this.state.initialPageX
      });
      e.stopPropagation();
      return e.preventDefault();
    }
  });

  module.exports = BlameListView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlIQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLE1BQVIsQ0FBMUIsRUFBQyxhQUFBLEtBQUQsRUFBUSxtQkFBQSxXQUFSLEVBQXFCLFNBQUEsQ0FBckIsQ0FBQTs7QUFBQSxFQUNDLE1BQU8sWUFBUCxHQURELENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssS0FBSyxDQUFDLFNBRlgsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQUhKLENBQUE7O0FBQUEsRUFJQSxRQUFzQyxPQUFBLENBQVEsbUJBQVIsQ0FBdEMsRUFBQywyQkFBQSxrQkFBRCxFQUFxQixzQkFBQSxhQUpyQixDQUFBOztBQUFBLEVBT0EsdUJBQUEsR0FBMEIsS0FBSyxDQUFDLFdBQU4sQ0FDeEI7QUFBQSxJQUFBLFNBQUEsRUFDRTtBQUFBLE1BQUEsV0FBQSxFQUFhLEVBQUUsQ0FBQyxPQUFILENBQVcsRUFBRSxDQUFDLE1BQWQsQ0FBYjtBQUFBLE1BQ0EsT0FBQSxFQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFEakI7QUFBQSxNQUVBLEtBQUEsRUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBRmY7QUFBQSxNQUdBLGdCQUFBLEVBQWtCLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFINUI7QUFBQSxNQUlBLGNBQUEsRUFBZ0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUoxQjtLQURGO0FBQUEsSUFPQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSwwQkFBQTtBQUFBLE1BQUEsS0FBQSxHQUFROzs7O29CQUE2QixDQUFDLEdBQTlCLENBQWtDLGFBQWxDLENBQVIsQ0FBQTthQUNBLEdBQUEsQ0FBSSxJQUFKLEVBQVUsS0FBVixFQUZhO0lBQUEsQ0FQZjtBQUFBLElBWUEsOEJB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
//# sourceURL=/Users/daniel/.atom/packages/git-blame/lib/views/blame-list-view.coffee