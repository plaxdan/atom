
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Analytics, analyticsWriteKey, beautifyCSS, beautifyCoffeeScript, beautifyHTML, beautifyHTMLERB, beautifyJS, beautifyLESS, beautifyMarkdown, beautifyPHP, beautifyPython, beautifyRuby, beautifySQL, extend, pkg, uncrustifyBeautifier, _;

  _ = null;

  extend = null;

  beautifyJS = null;

  beautifyHTML = null;

  beautifyCSS = null;

  beautifySQL = null;

  beautifyPHP = null;

  beautifyPython = null;

  beautifyRuby = null;

  beautifyLESS = null;

  beautifyCoffeeScript = null;

  uncrustifyBeautifier = null;

  beautifyHTMLERB = null;

  beautifyMarkdown = null;

  Analytics = require("analytics-node");

  pkg = require("../package.json");

  analyticsWriteKey = "u3c26xkae8";

  module.exports = {
    languages: ["js", "html", "css", "sql", "php", "python", "ruby", "coffeescript", "c", "cpp", "cs", "markdown", "objectivec", "java", "d", "pawn", "vala"],
    defaultLanguageOptions: {
      js_indent_size: 2,
      js_indent_char: " ",
      js_indent_level: 0,
      js_indent_with_tabs: false,
      js_preserve_newlines: true,
      js_max_preserve_newlines: 10,
      js_jslint_happy: false,
      js_brace_style: "collapse",
      js_keep_array_indentation: false,
      js_keep_function_indentation: false,
      js_space_before_conditional: true,
      js_break_chained_methods: false,
      js_eval_code: false,
      js_unescape_strings: false,
      js_wrap_line_length: 0,
      css_indent_size: 2,
      css_indent_Char: " ",
      html_indent_inner_html: false,
      html_indent_size: 2,
      html_indent_char: " ",
      html_brace_style: "collapse",
      html_indent_scripts: "normal",
      html_wrap_line_length: 250,
      sql_indent_size: 2,
      sql_keywords: "upper",
      sql_identifiers: "lower",
      sql_sqlformat_path: "",
      markdown_pandoc_path: "",
      php_beautifier_path: "",
      python_autopep8_path: "",
      python_max_line_length: 79,
      python_indent_size: 4,
      python_ignore: ["E24"],
      ruby_rbeautify_path: "",
      c_uncrustifyPath: "",
      c_configPath: "",
      cpp_uncrustifyPath: "",
      cpp_configPath: "",
      objectivec_uncrustifyPath: "",
      objectivec_configPath: "",
      cs_uncrustifyPath: "",
      cs_configPath: "",
      d_uncrustifyPath: "",
      d_configPath: "",
      java_uncrustifyPath: "",
      java_configPath: "",
      pawn_uncrustifyPath: "",
      pawn_configPath: "",
      vala_uncrustifyPath: "",
      vala_configPath: ""
    },
    beautify: function(text, grammar, allOptions, beautifyCompleted) {
      var analytics, options, self, unsupportedGrammar, userId, uuid, version;
      self = this;
      unsupportedGrammar = false;
      options = void 0;
      switch (grammar) {
        case "JSON":
        case "JavaScript":
          if (beautifyJS == null) {
            beautifyJS = require("js-beautify");
          }
          text = beautifyJS(text, self.getOptions("js", allOptions));
          beautifyCompleted(text);
          break;
        case "CoffeeScript":
          if (beautifyCoffeeScript == null) {
            beautifyCoffeeScript = require("./langs/coffeescript-beautify");
          }
          beautifyCoffeeScript(text, self.getOptions("js", allOptions), beautifyCompleted);
          break;
        case "Handlebars":
          allOptions.push({
            indent_handlebars: true
          });
          break;
        case "HTML (Liquid)":
        case "HTML":
        case "XML":
          if (beautifyHTML == null) {
            beautifyHTML = require("js-beautify").html;
          }
          text = beautifyHTML(text, self.getOptions("html", allOptions));
          beautifyCompleted(text);
          break;
        case "HTML (Ruby - ERB)":
          if (beautifyHTMLERB == null) {
            beautifyHTMLERB = require("./langs/html-erb-beautify");
          }
          beautifyHTMLERB(text, self.getOptions("html", allOptions), beautifyCompleted);
          break;
        case "CSS":
          if (beautifyCSS == null) {
            beautifyCSS = require("js-beautify").css;
          }
          text = beautifyCSS(text, self.getOptions("css", allOptions));
          beautifyCompleted(text);
          break;
        case "Sass":
        case "SCSS":
        case "LESS":
          if (beautifyLESS == null) {
            beautifyLESS = require("./langs/less-beautify");
          }
          beautifyLESS(text, self.getOptions("css", allOptions), beautifyCompleted);
          break;
        case "SQL (Rails)":
        case "SQL":
          if (beautifySQL == null) {
            beautifySQL = require("./langs/sql-beautify");
          }
          beautifySQL(text, self.getOptions("sql", allOptions), beautifyCompleted);
          break;
        case "PHP":
          if (beautifyPHP == null) {
            beautifyPHP = require("./langs/php-beautify");
          }
          beautifyPHP(text, self.getOptions("php", allOptions), beautifyCompleted);
          break;
        case "Python":
          if (beautifyPython == null) {
            beautifyPython = require("./langs/python-beautify");
          }
          beautifyPython(text, self.getOptions("python", allOptions), beautifyCompleted);
          break;
        case "Ruby":
          if (beautifyRuby == null) {
            beautifyRuby = require("./langs/ruby-beautify");
          }
          beautifyRuby(text, self.getOptions("ruby", allOptions), beautifyCompleted);
          break;
        case "GitHub Markdown":
          if (beautifyMarkdown == null) {
            beautifyMarkdown = require("./langs/markdown-beautify");
          }
          beautifyMarkdown(text, self.getOptions("markdown", allOptions), beautifyCompleted);
          break;
        case "C":
          options = self.getOptions("c", allOptions);
          options.languageOverride = "C";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "C++":
          options = self.getOptions("cpp", allOptions);
          options.languageOverride = "CPP";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "C#":
          options = self.getOptions("cs", allOptions);
          options.languageOverride = "CS";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Objective-C":
        case "Objective-C++":
          options = self.getOptions("objectivec", allOptions);
          options.languageOverride = "OC+";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "D":
          options = self.getOptions("d", allOptions);
          options.languageOverride = "D";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Pawn":
          options = self.getOptions("pawn", allOptions);
          options.languageOverride = "PAWN";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Vala":
          options = self.getOptions("vala", allOptions);
          options.languageOverride = "VALA";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Java":
          options = self.getOptions("java", allOptions);
          options.languageOverride = "JAVA";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        default:
          unsupportedGrammar = true;
      }
      if (atom.config.get("atom-beautify.analytics")) {
        analytics = new Analytics(analyticsWriteKey);
        if (!atom.config.get("atom-beautify._analyticsUserId")) {
          uuid = require("node-uuid");
          atom.config.set("atom-beautify._analyticsUserId", uuid.v4());
        }
        userId = atom.config.get("atom-beautify._analyticsUserId");
        analytics.identify({
          userId: userId
        });
        version = pkg.version;
        analytics.track({
          userId: atom.config.get("atom-beautify._analyticsUserId"),
          event: "Beautify",
          properties: {
            grammar: grammar,
            version: version,
            options: allOptions,
            label: grammar,
            category: version
          }
        });
      }
      if (unsupportedGrammar) {
        if (atom.config.get("atom-beautify.muteUnsupportedLanguageErrors")) {
          return beautifyCompleted(null);
        } else {
          throw new Error("Unsupported language for grammar '" + grammar + "'.");
        }
      }
    },
    getOptions: function(selection, allOptions) {
      var options, self;
      self = this;
      if (_ == null) {
        _ = require("lodash");
      }
      if (extend == null) {
        extend = require("extend");
      }
      options = _.reduce(allOptions, function(result, currOptions) {
        var collectedConfig, containsNested, key;
        containsNested = false;
        collectedConfig = {};
        key = void 0;
        for (key in currOptions) {
          if (_.indexOf(self.languages, key) >= 0 && typeof currOptions[key] === "object") {
            containsNested = true;
            break;
          }
        }
        if (!containsNested) {
          _.merge(collectedConfig, currOptions);
        } else {
          _.merge(collectedConfig, currOptions[selection]);
        }
        return extend(result, collectedConfig);
      }, {});
      return options;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEsd09BQUE7O0FBQUEsRUFLQSxDQUFBLEdBQUksSUFMSixDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBYSxJQVJiLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQWUsSUFUZixDQUFBOztBQUFBLEVBVUEsV0FBQSxHQUFjLElBVmQsQ0FBQTs7QUFBQSxFQVdBLFdBQUEsR0FBYyxJQVhkLENBQUE7O0FBQUEsRUFZQSxXQUFBLEdBQWMsSUFaZCxDQUFBOztBQUFBLEVBYUEsY0FBQSxHQUFpQixJQWJqQixDQUFBOztBQUFBLEVBY0EsWUFBQSxHQUFlLElBZGYsQ0FBQTs7QUFBQSxFQWVBLFlBQUEsR0FBZSxJQWZmLENBQUE7O0FBQUEsRUFnQkEsb0JBQUEsR0FBdUIsSUFoQnZCLENBQUE7O0FBQUEsRUFpQkEsb0JBQUEsR0FBdUIsSUFqQnZCLENBQUE7O0FBQUEsRUFrQkEsZUFBQSxHQUFrQixJQWxCbEIsQ0FBQTs7QUFBQSxFQW1CQSxnQkFBQSxHQUFtQixJQW5CbkIsQ0FBQTs7QUFBQSxFQXNCQSxTQUFBLEdBQVksT0FBQSxDQUFRLGdCQUFSLENBdEJaLENBQUE7O0FBQUEsRUF1QkEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxpQkFBUixDQXZCTixDQUFBOztBQUFBLEVBMEJBLGlCQUFBLEdBQW9CLFlBMUJwQixDQUFBOztBQUFBLEVBMkJBLE1BQU0sQ0FBQyxPQUFQLEdBSUU7QUFBQSxJQUFBLFNBQUEsRUFBVyxDQUNULElBRFMsRUFFVCxNQUZTLEVBR1QsS0FIUyxFQUlULEtBSlMsRUFLVCxLQUxTLEVBTVQsUUFOUyxFQU9ULE1BUFMsRUFRVCxjQVJTLEVBU1QsR0FUUyxFQVVULEtBVlMsRUFXVCxJQVhTLEVBWVQsVUFaUyxFQWFULFlBYlMsRUFjVCxNQWRTLEVBZVQsR0FmUyxFQWdCVCxNQWhCUyxFQWlCVCxNQWpCUyxDQUFYO0FBQUEsSUFxQkEsc0JBQUEsRUFLRTtBQUFBLE1BQUEsY0FBQSxFQUFnQixDQUFoQjtBQUFBLE1BQ0EsY0FBQSxFQUFnQixHQURoQjtBQUFBLE1BRUEsZUFBQSxFQUFpQixDQUZqQjtBQUFBLE1BR0EsbUJBQUEsRUFBcUIsS0FIckI7QUFBQSxNQUlBLG9CQUFBLEVBQXNCLElBSnRCO0FBQUEsTUFLQSx3QkFBQSxFQUEwQixFQUwxQjtBQUFBLE1BTUEsZUFBQSxFQUFpQixLQU5qQjtBQUFBLE1BT0EsY0FBQSxFQUFnQixVQVBoQjtBQUFBLE1BUUEseUJBQUEsRUFBMkIsS0FSM0I7QUFBQSxNQVNBLDRCQUFBLEVBQThCLEtBVDlCO0FBQUEsTUFVQSwyQkFBQSxFQUE2QixJQVY3QjtBQUFBLE1BV0Esd0JBQUEsRUFBMEIsS0FYMUI7QUFBQSxNQVlBLFlBQUEsRUFBYyxLQVpkO0FBQUEsTUFhQSxtQkFBQSxFQUFxQixLQWJyQjtBQUFBLE1BY0EsbUJBQUEsRUFBcUIsQ0FkckI7QUFBQSxNQWlCQSxlQUFBLEVBQWlCLENBakJqQjtBQUFBLE1Ba0JBLGVBQUEsRUFBaUIsR0FsQmpCO0FBQUEsTUFxQkEsc0JBQUEsRUFBd0IsS0FyQnhCO0FBQUEsTUFzQkEsZ0JBQUEsRUFBa0IsQ0F0QmxCO0FBQUEsTUF1QkEsZ0JBQUEsRUFBa0IsR0F2QmxCO0FBQUEsTUF3QkEsZ0JBQUEsRUFBa0IsVUF4QmxCO0FBQUEsTUF5QkEsbUJBQUEsRUFBcUIsUUF6QnJCO0FBQUEsTUEwQkEscUJBQUEsRUFBdUIsR0ExQnZCO0FBQUEsTUE2QkEsZUFBQSxFQUFpQixDQTdCakI7QUFBQSxNQThCQSxZQUFBLEVBQWMsT0E5QmQ7QUFBQSxNQStCQSxlQUFBLEVBQWlCLE9BL0JqQjtBQUFBLE1BZ0NBLGtCQUFBLEVBQW9CLEVBaENwQjtBQUFBLE1BbUNBLG9CQUFBLEVBQXNCLEVBbkN0QjtBQUFBLE1Bc0NBLG1CQUFBLEVBQXFCLEVBdENyQjtBQUFBLE1BeUNBLG9CQUFBLEVBQXNCLEVBekN0QjtBQUFBLE1BMENBLHNCQUFBLEVBQXdCLEVBMUN4QjtBQUFBLE1BMkNBLGtCQUFBLEVBQW9CLENBM0NwQjtBQUFBLE1BNENBLGFBQUEsRUFBZSxDQUFDLEtBQUQsQ0E1Q2Y7QUFBQSxNQStDQSxtQkFBQSxFQUFxQixFQS9DckI7QUFBQSxNQWtEQSxnQkFBQSxFQUFrQixFQWxEbEI7QUFBQSxNQW1EQSxZQUFBLEVBQWMsRUFuRGQ7QUFBQSxNQXNEQSxrQkFBQSxFQUFvQixFQXREcEI7QUFBQSxNQXVEQSxjQUFBLEVBQWdCLEVBdkRoQjtBQUFBLE1BMERBLHlCQUFBLEVBQTJCLEVBMUQzQjtBQUFBLE1BMkRBLHFCQUFBLEVBQXVCLEVBM0R2QjtBQUFBLE1BOERBLGlCQUFBLEVBQW1CLEVBOURuQjtBQUFBLE1BK0RBLGFBQUEsRUFBZSxFQS9EZjtBQUFBLE1Ba0VBLGdCQUFBLEVBQWtCLEVBbEVsQjtBQUFBLE1BbUVBLFlBQUEsRUFBYyxFQW5FZDtBQUFBLE1Bc0VBLG1CQUFBLEVBQXFCLEVBdEVyQjtBQUFBLE1BdUVBLGVBQUEsRUFBaUIsRUF2RWpCO0FBQUEsTUEwRUEsbUJBQUEsRUFBcUIsRUExRXJCO0FBQUEsTUEyRUEsZUFBQSxFQUFpQixFQTNFakI7QUFBQSxNQThFQSxtQkFBQSxFQUFxQixFQTlFckI7QUFBQSxNQStFQSxlQUFBLEVBQWlCLEVBL0VqQjtLQTFCRjtBQUFBLElBOEdBLFFBQUEsRUFBVSxTQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLFVBQWhCLEVBQTRCLGlCQUE1QixHQUFBO0FBQ1IsVUFBQSxtRUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtBQUFBLE1BRUEsa0JBQUEsR0FBcUIsS0FGckIsQ0FBQTtBQUFBLE1BR0EsT0FBQSxHQUFVLE1BSFYsQ0FBQTtBQUlBLGNBQU8sT0FBUDtBQUFBLGFBR08sTUFIUDtBQUFBLGFBR2UsWUFIZjs7WUFJSSxhQUFjLE9BQUEsQ0FBUSxhQUFSO1dBQWQ7QUFBQSxVQUNBLElBQUEsR0FBTyxVQUFBLENBQVcsSUFBWCxFQUFpQixJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixFQUFzQixVQUF0QixDQUFqQixDQURQLENBQUE7QUFBQSxVQUVBLGlCQUFBLENBQWtCLElBQWxCLENBRkEsQ0FKSjtBQUdlO0FBSGYsYUFPTyxjQVBQOztZQVFJLHVCQUF3QixPQUFBLENBQVEsK0JBQVI7V0FBeEI7QUFBQSxVQUNBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLEVBQXNCLFVBQXRCLENBQTNCLEVBQThELGlCQUE5RCxDQURBLENBUko7QUFPTztBQVBQLGFBVU8sWUFWUDtBQVlJLFVBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0I7QUFBQSxZQUFBLGlCQUFBLEVBQW1CLElBQW5CO1dBQWhCLENBQUEsQ0FaSjtBQVVPO0FBVlAsYUFjTyxlQWRQO0FBQUEsYUFjd0IsTUFkeEI7QUFBQSxhQWNnQyxLQWRoQzs7WUFlSSxlQUFnQixPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDO1dBQXZDO0FBQUEsVUFDQSxJQUFBLEdBQU8sWUFBQSxDQUFhLElBQWIsRUFBbUIsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBeEIsQ0FBbkIsQ0FEUCxDQUFBO0FBQUEsVUFFQSxpQkFBQSxDQUFrQixJQUFsQixDQUZBLENBZko7QUFjZ0M7QUFkaEMsYUFrQk8sbUJBbEJQOztZQW1CSSxrQkFBbUIsT0FBQSxDQUFRLDJCQUFSO1dBQW5CO0FBQUEsVUFDQSxlQUFBLENBQWdCLElBQWhCLEVBQXNCLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQWhCLEVBQXdCLFVBQXhCLENBQXRCLEVBQTJELGlCQUEzRCxDQURBLENBbkJKO0FBa0JPO0FBbEJQLGFBcUJPLEtBckJQOztZQXNCSSxjQUFlLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUM7V0FBdEM7QUFBQSxVQUNBLElBQUEsR0FBTyxXQUFBLENBQVksSUFBWixFQUFrQixJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixFQUF1QixVQUF2QixDQUFsQixDQURQLENBQUE7QUFBQSxVQUVBLGlCQUFBLENBQWtCLElBQWxCLENBRkEsQ0F0Qko7QUFxQk87QUFyQlAsYUF5Qk8sTUF6QlA7QUFBQSxhQXlCZSxNQXpCZjtBQUFBLGFBeUJ1QixNQXpCdkI7O1lBMEJJLGVBQWdCLE9BQUEsQ0FBUSx1QkFBUjtXQUFoQjtBQUFBLFVBQ0EsWUFBQSxDQUFhLElBQWIsRUFBbUIsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsRUFBdUIsVUFBdkIsQ0FBbkIsRUFBdUQsaUJBQXZELENBREEsQ0ExQko7QUF5QnVCO0FBekJ2QixhQTRCTyxhQTVCUDtBQUFBLGFBNEJzQixLQTVCdEI7O1lBNkJJLGNBQWUsT0FBQSxDQUFRLHNCQUFSO1dBQWY7QUFBQSxVQUNBLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLEVBQXVCLFVBQXZCLENBQWxCLEVBQXNELGlCQUF0RCxDQURBLENBN0JKO0FBNEJzQjtBQTVCdEIsYUErQk8sS0EvQlA7O1lBZ0NJLGNBQWUsT0FBQSxDQUFRLHNCQUFSO1dBQWY7QUFBQSxVQUNBLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLEVBQXVCLFVBQXZCLENBQWxCLEVBQXNELGlCQUF0RCxDQURBLENBaENKO0FBK0JPO0FBL0JQLGFBa0NPLFFBbENQOztZQW1DSSxpQkFBa0IsT0FBQSxDQUFRLHlCQUFSO1dBQWxCO0FBQUEsVUFDQSxjQUFBLENBQWUsSUFBZixFQUFxQixJQUFJLENBQUMsVUFBTCxDQUFnQixRQUFoQixFQUEwQixVQUExQixDQUFyQixFQUE0RCxpQkFBNUQsQ0FEQSxDQW5DSjtBQWtDTztBQWxDUCxhQXFDTyxNQXJDUDs7WUFzQ0ksZUFBZ0IsT0FBQSxDQUFRLHVCQUFSO1dBQWhCO0FBQUEsVUFDQSxZQUFBLENBQWEsSUFBYixFQUFtQixJQUFJLENBQUMsVUFBTCxDQUFnQixNQUFoQixFQUF3QixVQUF4QixDQUFuQixFQUF3RCxpQkFBeEQsQ0FEQSxDQXRDSjtBQXFDTztBQXJDUCxhQXdDTyxpQkF4Q1A7O1lBeUNJLG1CQUFvQixPQUFBLENBQVEsMkJBQVI7V0FBcEI7QUFBQSxVQUNBLGdCQUFBLENBQWlCLElBQWpCLEVBQXVCLElBQUksQ0FBQyxVQUFMLENBQWdCLFVBQWhCLEVBQTRCLFVBQTVCLENBQXZCLEVBQWdFLGlCQUFoRSxDQURBLENBekNKO0FBd0NPO0FBeENQLGFBMkNPLEdBM0NQO0FBNENJLFVBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLEVBQXFCLFVBQXJCLENBQVYsQ0FBQTtBQUFBLFVBQ0EsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLEdBRDNCLENBQUE7O1lBRUEsdUJBQXdCLE9BQUEsQ0FBUSxxQkFBUjtXQUZ4QjtBQUFBLFVBR0Esb0JBQUEsQ0FBcUIsSUFBckIsRUFBMkIsT0FBM0IsRUFBb0MsaUJBQXBDLENBSEEsQ0E1Q0o7QUEyQ087QUEzQ1AsYUFnRE8sS0FoRFA7QUFpREksVUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsRUFBdUIsVUFBdkIsQ0FBVixDQUFBO0FBQUEsVUFDQSxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsS0FEM0IsQ0FBQTs7WUFFQSx1QkFBd0IsT0FBQSxDQUFRLHFCQUFSO1dBRnhCO0FBQUEsVUFHQSxvQkFBQSxDQUFxQixJQUFyQixFQUEyQixPQUEzQixFQUFvQyxpQkFBcEMsQ0FIQSxDQWpESjtBQWdETztBQWhEUCxhQXFETyxJQXJEUDtBQXNESSxVQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixFQUFzQixVQUF0QixDQUFWLENBQUE7QUFBQSxVQUNBLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixJQUQzQixDQUFBOztZQUVBLHVCQUF3QixPQUFBLENBQVEscUJBQVI7V0FGeEI7QUFBQSxVQUdBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCLEVBQW9DLGlCQUFwQyxDQUhBLENBdERKO0FBcURPO0FBckRQLGFBMERPLGFBMURQO0FBQUEsYUEwRHNCLGVBMUR0QjtBQTJESSxVQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFnQixZQUFoQixFQUE4QixVQUE5QixDQUFWLENBQUE7QUFBQSxVQUNBLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixLQUQzQixDQUFBOztZQUVBLHVCQUF3QixPQUFBLENBQVEscUJBQVI7V0FGeEI7QUFBQSxVQUdBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCLEVBQW9DLGlCQUFwQyxDQUhBLENBM0RKO0FBMERzQjtBQTFEdEIsYUErRE8sR0EvRFA7QUFnRUksVUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsRUFBcUIsVUFBckIsQ0FBVixDQUFBO0FBQUEsVUFDQSxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsR0FEM0IsQ0FBQTs7WUFFQSx1QkFBd0IsT0FBQSxDQUFRLHFCQUFSO1dBRnhCO0FBQUEsVUFHQSxvQkFBQSxDQUFxQixJQUFyQixFQUEyQixPQUEzQixFQUFvQyxpQkFBcEMsQ0FIQSxDQWhFSjtBQStETztBQS9EUCxhQW9FTyxNQXBFUDtBQXFFSSxVQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFnQixNQUFoQixFQUF3QixVQUF4QixDQUFWLENBQUE7QUFBQSxVQUNBLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixNQUQzQixDQUFBOztZQUVBLHVCQUF3QixPQUFBLENBQVEscUJBQVI7V0FGeEI7QUFBQSxVQUdBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCLEVBQW9DLGlCQUFwQyxDQUhBLENBckVKO0FBb0VPO0FBcEVQLGFBeUVPLE1BekVQO0FBMEVJLFVBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQWhCLEVBQXdCLFVBQXhCLENBQVYsQ0FBQTtBQUFBLFVBQ0EsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLE1BRDNCLENBQUE7O1lBRUEsdUJBQXdCLE9BQUEsQ0FBUSxxQkFBUjtXQUZ4QjtBQUFBLFVBR0Esb0JBQUEsQ0FBcUIsSUFBckIsRUFBMkIsT0FBM0IsRUFBb0MsaUJBQXBDLENBSEEsQ0ExRUo7QUF5RU87QUF6RVAsYUE4RU8sTUE5RVA7QUErRUksVUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBeEIsQ0FBVixDQUFBO0FBQUEsVUFDQSxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsTUFEM0IsQ0FBQTs7WUFFQSx1QkFBd0IsT0FBQSxDQUFRLHFCQUFSO1dBRnhCO0FBQUEsVUFHQSxvQkFBQSxDQUFxQixJQUFyQixFQUEyQixPQUEzQixFQUFvQyxpQkFBcEMsQ0FIQSxDQS9FSjtBQThFTztBQTlFUDtBQW9GSSxVQUFBLGtCQUFBLEdBQXFCLElBQXJCLENBcEZKO0FBQUEsT0FKQTtBQTJGQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixDQUFIO0FBRUUsUUFBQSxTQUFBLEdBQWdCLElBQUEsU0FBQSxDQUFVLGlCQUFWLENBQWhCLENBQUE7QUFDQSxRQUFBLElBQUEsQ0FBQSxJQUFXLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBQVA7QUFDRSxVQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsV0FBUixDQUFQLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsRUFBa0QsSUFBSSxDQUFDLEVBQUwsQ0FBQSxDQUFsRCxDQURBLENBREY7U0FEQTtBQUFBLFFBS0EsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsQ0FMVCxDQUFBO0FBQUEsUUFNQSxTQUFTLENBQUMsUUFBVixDQUFtQjtBQUFBLFVBQUEsTUFBQSxFQUFRLE1BQVI7U0FBbkIsQ0FOQSxDQUFBO0FBQUEsUUFPQSxPQUFBLEdBQVUsR0FBRyxDQUFDLE9BUGQsQ0FBQTtBQUFBLFFBUUEsU0FBUyxDQUFDLEtBQVYsQ0FDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsQ0FBUjtBQUFBLFVBQ0EsS0FBQSxFQUFPLFVBRFA7QUFBQSxVQUVBLFVBQUEsRUFDRTtBQUFBLFlBQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxZQUNBLE9BQUEsRUFBUyxPQURUO0FBQUEsWUFFQSxPQUFBLEVBQVMsVUFGVDtBQUFBLFlBR0EsS0FBQSxFQUFPLE9BSFA7QUFBQSxZQUlBLFFBQUEsRUFBVSxPQUpWO1dBSEY7U0FERixDQVJBLENBRkY7T0EzRkE7QUErR0EsTUFBQSxJQUFHLGtCQUFIO0FBQ0UsUUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2Q0FBaEIsQ0FBSDtBQUNFLGlCQUFPLGlCQUFBLENBQWtCLElBQWxCLENBQVAsQ0FERjtTQUFBLE1BQUE7QUFHRSxnQkFBVSxJQUFBLEtBQUEsQ0FBTyxvQ0FBQSxHQUFtQyxPQUFuQyxHQUE0QyxJQUFuRCxDQUFWLENBSEY7U0FERjtPQWhIUTtJQUFBLENBOUdWO0FBQUEsSUFxT0EsVUFBQSxFQUFZLFNBQUMsU0FBRCxFQUFZLFVBQVosR0FBQTtBQUNWLFVBQUEsYUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTs7UUFDQSxJQUFLLE9BQUEsQ0FBUSxRQUFSO09BREw7O1FBRUEsU0FBVSxPQUFBLENBQVEsUUFBUjtPQUZWO0FBQUEsTUFLQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxVQUFULEVBQXFCLFNBQUMsTUFBRCxFQUFTLFdBQVQsR0FBQTtBQUM3QixZQUFBLG9DQUFBO0FBQUEsUUFBQSxjQUFBLEdBQWlCLEtBQWpCLENBQUE7QUFBQSxRQUNBLGVBQUEsR0FBa0IsRUFEbEIsQ0FBQTtBQUFBLFFBRUEsR0FBQSxHQUFNLE1BRk4sQ0FBQTtBQUlBLGFBQUEsa0JBQUEsR0FBQTtBQUVFLFVBQUEsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLElBQUksQ0FBQyxTQUFmLEVBQTBCLEdBQTFCLENBQUEsSUFBa0MsQ0FBbEMsSUFBd0MsTUFBQSxDQUFBLFdBQW1CLENBQUEsR0FBQSxDQUFuQixLQUEyQixRQUF0RTtBQUNFLFlBQUEsY0FBQSxHQUFpQixJQUFqQixDQUFBO0FBQ0Esa0JBRkY7V0FGRjtBQUFBLFNBSkE7QUFXQSxRQUFBLElBQUEsQ0FBQSxjQUFBO0FBQ0UsVUFBQSxDQUFDLENBQUMsS0FBRixDQUFRLGVBQVIsRUFBeUIsV0FBekIsQ0FBQSxDQURGO1NBQUEsTUFBQTtBQU1FLFVBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxlQUFSLEVBQXlCLFdBQVksQ0FBQSxTQUFBLENBQXJDLENBQUEsQ0FORjtTQVhBO2VBa0JBLE1BQUEsQ0FBTyxNQUFQLEVBQWUsZUFBZixFQW5CNkI7TUFBQSxDQUFyQixFQW9CUixFQXBCUSxDQUxWLENBQUE7YUFnQ0EsUUFqQ1U7SUFBQSxDQXJPWjtHQS9CRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/language-options.coffee