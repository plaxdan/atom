(function() {
  var AtomColorHighlightEditor, AtomColorHighlightModel, AtomColorHighlightView, CompositeDisposable, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  AtomColorHighlightModel = require('./atom-color-highlight-model');

  AtomColorHighlightView = require('./atom-color-highlight-view');

  module.exports = AtomColorHighlightEditor = (function() {
    Subscriber.includeInto(AtomColorHighlightEditor);

    function AtomColorHighlightEditor(editorView) {
      this.editorView = editorView;
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      this.destroy = __bind(this.destroy, this);
      this.editor = this.editorView.editor;
      this.subscriptions = new CompositeDisposable;
      this.model = null;
      this.view = null;
      this.subscriptions.add(this.editorView.getModel().onDidChangePath(this.subscribeToBuffer));
      this.subscriptions.add(this.editorView.getModel().getBuffer().onDidDestroy(this.destroy));
      this.subscribeToBuffer();
    }

    AtomColorHighlightEditor.prototype.getActiveModel = function() {
      return this.model;
    };

    AtomColorHighlightEditor.prototype.getActiveView = function() {
      return this.view;
    };

    AtomColorHighlightEditor.prototype.destroy = function() {
      this.unsubscribe();
      return this.unsubscribeFromBuffer();
    };

    AtomColorHighlightEditor.prototype.subscribeToBuffer = function() {
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        this.model = new AtomColorHighlightModel(this.editor, this.buffer);
        this.view = new AtomColorHighlightView(this.model, this.editorView);
        if (atom.config.get('core.useReactEditor')) {
          this.editorView.find('.lines').append(this.view);
        } else {
          this.editorView.overlayer.append(this.view);
        }
        return this.model.init();
      }
    };

    AtomColorHighlightEditor.prototype.unsubscribeFromBuffer = function() {
      if (this.buffer != null) {
        this.removeModel();
        this.removeView();
        return this.buffer = null;
      }
    };

    AtomColorHighlightEditor.prototype.removeView = function() {
      var _ref;
      return (_ref = this.view) != null ? _ref.destroy() : void 0;
    };

    AtomColorHighlightEditor.prototype.removeModel = function() {
      var _ref;
      return (_ref = this.model) != null ? _ref.dispose() : void 0;
    };

    return AtomColorHighlightEditor;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBHQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSx1QkFBQSxHQUEwQixPQUFBLENBQVEsOEJBQVIsQ0FIMUIsQ0FBQTs7QUFBQSxFQUlBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw2QkFBUixDQUp6QixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsd0JBQXZCLENBQUEsQ0FBQTs7QUFFYSxJQUFBLGtDQUFFLFVBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLGFBQUEsVUFDYixDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxNQUFDLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxXQUFYLE1BQUYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBSlQsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUxSLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLGVBQXZCLENBQXVDLElBQUMsQ0FBQSxpQkFBeEMsQ0FBbkIsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxTQUF2QixDQUFBLENBQWtDLENBQUMsWUFBbkMsQ0FBZ0QsSUFBQyxDQUFBLE9BQWpELENBQW5CLENBUkEsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FWQSxDQURXO0lBQUEsQ0FGYjs7QUFBQSx1Q0FlQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxNQUFKO0lBQUEsQ0FmaEIsQ0FBQTs7QUFBQSx1Q0FpQkEsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxLQUFKO0lBQUEsQ0FqQmYsQ0FBQTs7QUFBQSx1Q0FtQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxFQUZPO0lBQUEsQ0FuQlQsQ0FBQTs7QUFBQSx1Q0F1QkEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FBYjtBQUNFLFFBQUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLHVCQUFBLENBQXdCLElBQUMsQ0FBQSxNQUF6QixFQUFpQyxJQUFDLENBQUEsTUFBbEMsQ0FBYixDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsc0JBQUEsQ0FBdUIsSUFBQyxDQUFBLEtBQXhCLEVBQStCLElBQUMsQ0FBQSxVQUFoQyxDQURaLENBQUE7QUFHQSxRQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFCQUFoQixDQUFIO0FBQ0UsVUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsUUFBakIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxJQUFDLENBQUEsSUFBbkMsQ0FBQSxDQURGO1NBQUEsTUFBQTtBQUdFLFVBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBdEIsQ0FBNkIsSUFBQyxDQUFBLElBQTlCLENBQUEsQ0FIRjtTQUhBO2VBUUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsRUFURjtPQUhpQjtJQUFBLENBdkJuQixDQUFBOztBQUFBLHVDQXFDQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFDckIsTUFBQSxJQUFHLG1CQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQURBLENBQUE7ZUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBSFo7T0FEcUI7SUFBQSxDQXJDdkIsQ0FBQTs7QUFBQSx1Q0EyQ0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUFHLFVBQUEsSUFBQTs4Q0FBSyxDQUFFLE9BQVAsQ0FBQSxXQUFIO0lBQUEsQ0EzQ1osQ0FBQTs7QUFBQSx1Q0E2Q0EsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUFHLFVBQUEsSUFBQTsrQ0FBTSxDQUFFLE9BQVIsQ0FBQSxXQUFIO0lBQUEsQ0E3Q2IsQ0FBQTs7b0NBQUE7O01BUkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atom-color-highlight/lib/atom-color-highlight-editor.coffee