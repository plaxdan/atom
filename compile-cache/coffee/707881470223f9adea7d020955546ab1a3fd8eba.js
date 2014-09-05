(function() {
  module.exports = {
    configDefaults: {
      retainHalfScreen: false
    },
    activate: function() {
      var DisplayBuffer, EditorView;
      DisplayBuffer = require("src/display-buffer");
      DisplayBuffer.prototype.getScrollHeight = function() {
        var height, lineHeight;
        lineHeight = this.getLineHeight ? this.getLineHeight() : this.getLineHeightInPixels();
        if (!lineHeight > 0) {
          throw new Error("You must assign lineHeight before calling ::getScrollHeight()");
        }
        height = this.getLineCount() * lineHeight;
        if (atom.config.get("scroll-past-end").retainHalfScreen) {
          height = height + this.getHeight() / 2;
        } else {
          height = height + this.getHeight() - (lineHeight * 3);
        }
        return height;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsZ0JBQUEsRUFBa0IsS0FBbEI7S0FERjtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUVSLFVBQUEseUJBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG9CQUFSLENBQWhCLENBQUE7QUFBQSxNQUNBLGFBQWEsQ0FBQSxTQUFFLENBQUEsZUFBZixHQUFpQyxTQUFBLEdBQUE7QUFFL0IsWUFBQSxrQkFBQTtBQUFBLFFBQUEsVUFBQSxHQUFnQixJQUFDLENBQUEsYUFBSixHQUF1QixJQUFDLENBQUEsYUFBRCxDQUFBLENBQXZCLEdBQTZDLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQTFELENBQUE7QUFDQSxRQUFBLElBQUcsQ0FBQSxVQUFBLEdBQWlCLENBQXBCO0FBQ0UsZ0JBQVUsSUFBQSxLQUFBLENBQU0sK0RBQU4sQ0FBVixDQURGO1NBREE7QUFBQSxRQUdBLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUEsR0FBa0IsVUFIM0IsQ0FBQTtBQUlBLFFBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCLENBQWtDLENBQUMsZ0JBQXRDO0FBQ0UsVUFBQSxNQUFBLEdBQVMsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLENBQWpDLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxNQUFBLEdBQVMsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBVCxHQUF3QixDQUFDLFVBQUEsR0FBYSxDQUFkLENBQWpDLENBSEY7U0FKQTtlQVFBLE9BVitCO01BQUEsQ0FEakMsQ0FBQTtBQUFBLE1BZUEsVUFB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
//# sourceURL=/Users/daniel/.atom/packages/scroll-past-end/lib/scroll-past-end.coffee