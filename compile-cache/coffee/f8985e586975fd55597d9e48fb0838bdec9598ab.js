(function() {
  module.exports = {
    configDefaults: {
      retainHalfScreen: false
    },
    activate: function() {
      var DisplayBuffer, EditorView;
      DisplayBuffer = require("src/display-buffer");
      DisplayBuffer.prototype.getScrollHeight = function() {
        var lineHeight, scrollHeight;
        lineHeight = this.getLineHeight ? this.getLineHeight() : this.getLineHeightInPixels();
        if (!(lineHeight > 0)) {
          return 0;
        }
        scrollHeight = this.getLineCount() * lineHeight;
        if (this.height != null) {
          if (atom.config.get("scroll-past-end").retainHalfScreen) {
            scrollHeight = scrollHeight + this.height / 2;
          } else {
            scrollHeight = scrollHeight + this.height - (lineHeight * 3);
          }
        }
        return scrollHeight;
      };
      EditorView = require("src/editor-view");
      return EditorView.prototype.updateLayerDimensions = function() {
        var height, minWidth;
        height = this.lineHeight * this.editor.getScreenLineCount();
        if (this.closest(".pane").length > 0 && atom.workspaceView.getActiveView() instanceof EditorView) {
          if (atom.config.get("scroll-past-end").retainHalfScreen) {
            height = height + this.height() / 2;
          } else {
            height = height + this.height() - (this.lineHeight * 3);
          }
        }
        if (this.layerHeight !== height) {
          this.layerHeight = height;
          this.underlayer.height(this.layerHeight);
          this.renderedLines.height(this.layerHeight);
          this.overlayer.height(this.layerHeight);
          this.verticalScrollbarContent.height(this.layerHeight);
          if (this.scrollBottom() > height) {
            this.scrollBottom(height);
          }
        }
        minWidth = Math.max(this.charWidth * this.editor.getMaxScreenLineLength() + 20, this.scrollView.width());
        if (this.layerMinWidth !== minWidth) {
          this.renderedLines.css('min-width', minWidth);
          this.underlayer.css('min-width', minWidth);
          this.overlayer.css('min-width', minWidth);
          this.layerMinWidth = minWidth;
          return this.trigger('editor:min-width-changed');
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsZ0JBQUEsRUFBa0IsS0FBbEI7S0FERjtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUVSLFVBQUEseUJBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG9CQUFSLENBQWhCLENBQUE7QUFBQSxNQUNBLGFBQWEsQ0FBQSxTQUFFLENBQUEsZUFBZixHQUFpQyxTQUFBLEdBQUE7QUFFL0IsWUFBQSx3QkFBQTtBQUFBLFFBQUEsVUFBQSxHQUFnQixJQUFDLENBQUEsYUFBSixHQUF1QixJQUFDLENBQUEsYUFBRCxDQUFBLENBQXZCLEdBQTZDLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQTFELENBQUE7QUFDQSxRQUFBLElBQUEsQ0FBQSxDQUFnQixVQUFBLEdBQWEsQ0FBN0IsQ0FBQTtBQUFBLGlCQUFPLENBQVAsQ0FBQTtTQURBO0FBQUEsUUFFQSxZQUFBLEdBQWUsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFBLEdBQWtCLFVBRmpDLENBQUE7QUFHQSxRQUFBLElBQUcsbUJBQUg7QUFDRSxVQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixDQUFrQyxDQUFDLGdCQUF0QztBQUNFLFlBQUEsWUFBQSxHQUFlLFlBQUEsR0FBZSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQXhDLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxZQUFBLEdBQWUsWUFBQSxHQUFlLElBQUMsQ0FBQSxNQUFoQixHQUF5QixDQUFDLFVBQUEsR0FBYSxDQUFkLENBQXhDLENBSEY7V0FERjtTQUhBO2VBUUEsYUFWK0I7TUFBQSxDQURqQyxDQUFBO0FBQUEsTUFlQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGlCQUFSLENBZmIsQ0FBQTthQWdCQSxVQUFVLENBQUEsU0FBRSxDQUFBLHFCQUFaLEdBQW9DLFNBQUEsR0FBQTtBQUNsQyxZQUFBLGdCQUFBO0FBQUEsUUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUEsQ0FBdkIsQ0FBQTtBQUVBLFFBQUEsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQsQ0FBaUIsQ0FBQyxNQUFsQixHQUEyQixDQUEzQixJQUFnQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQW5CLENBQUEsQ0FBQSxZQUE4QyxVQUFqRjtBQUNFLFVBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCLENBQWtDLENBQUMsZ0JBQXRDO0FBQ0UsWUFBQSxNQUFBLEdBQVMsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxHQUFZLENBQTlCLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxNQUFBLEdBQVMsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBVCxHQUFxQixDQUFDLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBZixDQUE5QixDQUhGO1dBREY7U0FGQTtBQVFBLFFBQUEsSUFBRyxJQUFDLENBQUEsV0FBRCxLQUFnQixNQUFuQjtBQUNFLFVBQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxNQUFmLENBQUE7QUFBQSxVQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixJQUFDLENBQUEsV0FBcEIsQ0FEQSxDQUFBO0FBQUEsVUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsSUFBQyxDQUFBLFdBQXZCLENBRkEsQ0FBQTtBQUFBLFVBR0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLElBQUMsQ0FBQSxXQUFuQixDQUhBLENBQUE7QUFBQSxVQUlBLElBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxNQUExQixDQUFpQyxJQUFDLENBQUEsV0FBbEMsQ0FKQSxDQUFBO0FBS0EsVUFBQSxJQUFHLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxHQUFrQixNQUFyQjtBQUNFLFlBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLENBQUEsQ0FERjtXQU5GO1NBUkE7QUFBQSxRQWdCQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsc0JBQVIsQ0FBQSxDQUFiLEdBQWdELEVBQXpELEVBQTZELElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFBLENBQTdELENBaEJYLENBQUE7QUFpQkEsUUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFELEtBQWtCLFFBQXJCO0FBQ0UsVUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsV0FBbkIsRUFBZ0MsUUFBaEMsQ0FBQSxDQUFBO0FBQUEsVUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsV0FBaEIsRUFBNkIsUUFBN0IsQ0FEQSxDQUFBO0FBQUEsVUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxXQUFmLEVBQTRCLFFBQTVCLENBRkEsQ0FBQTtBQUFBLFVBR0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsUUFIakIsQ0FBQTtpQkFJQSxJQUFDLENBQUEsT0FBRCxDQUFTLDBCQUFULEVBTEY7U0FsQmtDO01BQUEsRUFsQjVCO0lBQUEsQ0FIVjtHQURGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/scroll-past-end/lib/scroll-past-end.coffee