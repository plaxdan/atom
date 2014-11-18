(function() {
  var AnsiToHtml, AtomRunnerView, ScrollView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScrollView = require('atom').ScrollView;

  AnsiToHtml = require('ansi-to-html');

  module.exports = AtomRunnerView = (function(_super) {
    __extends(AtomRunnerView, _super);

    atom.deserializers.add(AtomRunnerView);

    AtomRunnerView.deserialize = function(_arg) {
      var footer, output, title, view;
      title = _arg.title, output = _arg.output, footer = _arg.footer;
      view = new AtomRunnerView(title);
      view._output.html(output);
      view._footer.html(footer);
      return view;
    };

    AtomRunnerView.content = function() {
      return this.div({
        "class": 'atom-runner'
      }, (function(_this) {
        return function() {
          _this.h1('Atom Runner');
          _this.pre({
            "class": 'output'
          });
          return _this.div({
            "class": 'footer'
          });
        };
      })(this));
    };

    function AtomRunnerView(title) {
      AtomRunnerView.__super__.constructor.apply(this, arguments);
      this._output = this.find('.output');
      this._footer = this.find('.footer');
      this.setTitle(title);
    }

    AtomRunnerView.prototype.serialize = function() {
      return {
        deserializer: 'AtomRunnerView',
        title: this.title,
        output: this._output.html(),
        footer: this._footer.html()
      };
    };

    AtomRunnerView.prototype.getTitle = function() {
      return "Atom Runner: " + this.title;
    };

    AtomRunnerView.prototype.setTitle = function(title) {
      this.title = title;
      return this.find('h1').html(this.getTitle());
    };

    AtomRunnerView.prototype.clear = function() {
      this._output.html('');
      return this._footer.html('');
    };

    AtomRunnerView.prototype.append = function(text, className) {
      var node, span;
      span = document.createElement('span');
      node = document.createTextNode(text);
      span.appendChild(node);
      span.innerHTML = new AnsiToHtml().toHtml(span.innerHTML);
      span.className = className || 'stdout';
      return this._output.append(span);
    };

    AtomRunnerView.prototype.footer = function(text) {
      return this._footer.html(text);
    };

    return AtomRunnerView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixxQ0FBQSxDQUFBOztBQUFBLElBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QixjQUF2QixDQUFBLENBQUE7O0FBQUEsSUFFQSxjQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsSUFBRCxHQUFBO0FBQ1osVUFBQSwyQkFBQTtBQUFBLE1BRGMsYUFBQSxPQUFPLGNBQUEsUUFBUSxjQUFBLE1BQzdCLENBQUE7QUFBQSxNQUFBLElBQUEsR0FBVyxJQUFBLGNBQUEsQ0FBZSxLQUFmLENBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFiLENBQWtCLE1BQWxCLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFiLENBQWtCLE1BQWxCLENBRkEsQ0FBQTthQUdBLEtBSlk7SUFBQSxDQUZkLENBQUE7O0FBQUEsSUFRQSxjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxhQUFQO09BQUwsRUFBMkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN6QixVQUFBLEtBQUMsQ0FBQSxFQUFELENBQUksYUFBSixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxRQUFQO1dBQUwsQ0FEQSxDQUFBO2lCQUVBLEtBQUMs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
//# sourceURL=/Users/daniel/.atom/packages/atom-runner/lib/atom-runner-view.coffee