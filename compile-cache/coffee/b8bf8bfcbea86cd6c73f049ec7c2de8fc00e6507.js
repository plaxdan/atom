
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Analytics, allowUnsafeEval, analyticsWriteKey, beautifyCSS, beautifyCoffeeScript, beautifyHTML, beautifyHTMLERB, beautifyJS, beautifyLESS, beautifyMarkdown, beautifyPHP, beautifyPerl, beautifyPython, beautifyRuby, beautifySQL, beautifyTypeScript, extend, pkg, uncrustifyBeautifier, _;

  _ = null;

  extend = null;

  beautifyJS = null;

  beautifyHTML = null;

  beautifyCSS = null;

  beautifySQL = null;

  beautifyPerl = null;

  beautifyPHP = null;

  beautifyPython = null;

  beautifyRuby = null;

  beautifyLESS = null;

  beautifyCoffeeScript = null;

  uncrustifyBeautifier = null;

  beautifyHTMLERB = null;

  beautifyMarkdown = null;

  beautifyTypeScript = null;

  Analytics = null;

  allowUnsafeEval = require('loophole').allowUnsafeEval;

  allowUnsafeEval(function() {
    return Analytics = require("analytics-node");
  });

  pkg = require("../package.json");

  analyticsWriteKey = "u3c26xkae8";

  module.exports = {
    languages: ["js", "html", "css", "sql", "perl", "php", "python", "ruby", "coffeescript", "c", "cpp", "cs", "markdown", "objectivec", "java", "d", "pawn", "vala", "typescript"],
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
      perl_perltidy_path: "perltidy",
      perl_perltidy_profile: "",
      php_beautifier_path: "",
      php_filters: "",
      php_directory_filters: "",
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
      if (atom.config.get("atom-beautify.disabledLanguages").indexOf(grammar) > -1) {
        return beautifyCompleted(null);
      }
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
        case "HTML (Mustache)":
          allOptions.push({
            indent_handlebars: true
          });
          if (beautifyHTML == null) {
            beautifyHTML = require("js-beautify").html;
          }
          text = beautifyHTML(text, self.getOptions("html", allOptions));
          beautifyCompleted(text);
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
        case "HTML (Rails)":
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
        case "Perl":
          if (beautifyPerl == null) {
            beautifyPerl = require("./langs/perl-beautify");
          }
          beautifyPerl(text, self.getOptions("perl", allOptions), beautifyCompleted);
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
        case "Ruby on Rails":
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
        case "TypeScript":
          if (beautifyTypeScript == null) {
            beautifyTypeScript = require("./langs/typescript-beautify");
          }
          beautifyTypeScript(text, self.getOptions("js", allOptions), beautifyCompleted);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEsMlJBQUE7O0FBQUEsRUFLQSxDQUFBLEdBQUksSUFMSixDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBYSxJQVJiLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQWUsSUFUZixDQUFBOztBQUFBLEVBVUEsV0FBQSxHQUFjLElBVmQsQ0FBQTs7QUFBQSxFQVdBLFdBQUEsR0FBYyxJQVhkLENBQUE7O0FBQUEsRUFZQSxZQUFBLEdBQWUsSUFaZixDQUFBOztBQUFBLEVBYUEsV0FBQSxHQUFjLElBYmQsQ0FBQTs7QUFBQSxFQWNBLGNBQUEsR0FBaUIsSUFkakIsQ0FBQTs7QUFBQSxFQWVBLFlBQUEsR0FBZSxJQWZmLENBQUE7O0FBQUEsRUFnQkEsWUFBQSxHQUFlLElBaEJmLENBQUE7O0FBQUEsRUFpQkEsb0JBQUEsR0FBdUIsSUFqQnZCLENBQUE7O0FBQUEsRUFrQkEsb0JBQUEsR0FBdUIsSUFsQnZCLENBQUE7O0FBQUEsRUFtQkEsZUFBQSxHQUFrQixJQW5CbEIsQ0FBQTs7QUFBQSxFQW9CQSxnQkFBQSxHQUFtQixJQXBCbkIsQ0FBQTs7QUFBQSxFQXFCQSxrQkFBQSxHQUFxQixJQXJCckIsQ0FBQTs7QUFBQSxFQXNCQSxTQUFBLEdBQVksSUF0QlosQ0FBQTs7QUFBQSxFQXlCQyxrQkFBbUIsT0FBQSxDQUFRLFVBQVIsRUFBbkIsZUF6QkQsQ0FBQTs7QUFBQSxFQTBCQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtXQUNkLFNBQUEsR0FBWSxPQUFBLENBQVEsZ0JBQVIsRUFERTtFQUFBLENBQWhCLENBMUJBLENBQUE7O0FBQUEsRUE0QkEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxpQkFBUixDQTVCTixDQUFBOztBQUFBLEVBK0JBLGlCQUFBLEdBQW9CLFlBL0JwQixDQUFBOztBQUFBLEVBZ0NBLE1BQU0sQ0FBQyxPQUFQLEdBSUU7QUFBQSxJQUFBLFNBQUEsRUFBVyxDQUNULElBRFMsRUFFVCxNQUZTLEVBR1QsS0FIUyxFQUlULEtBSlMsRUFLVCxNQUxTLEVBTVQsS0FOUyxFQU9ULFFBUFMsRUFRVCxNQVJTLEVBU1QsY0FUUyxFQVVULEdBVlMsRUFXVCxLQVhTLEVBWVQsSUFaUyxFQWFULFVBYlMsRUFjVCxZQWRTLEVBZVQsTUFmUyxFQWdCVCxHQWhCUyxFQWlCVCxNQWpCUyxFQWtCVCxNQWxCUyxFQW1CVCxZQW5CUyxDQUFYO0FBQUEsSUF1QkEsc0JBQUEsRUFLRTtBQUFBLE1BQUEsY0FBQSxFQUFnQixDQUFoQjtBQUFBLE1BQ0EsY0FBQSxFQUFnQixHQURoQjtBQUFBLE1BRUEsZUFBQSxFQUFpQixDQUZqQjtBQUFBLE1BR0EsbUJBQUEsRUFBcUIsS0FIckI7QUFBQSxNQUlBLG9CQUFBLEVBQXNCLElBSnRCO0FBQUEsTUFLQSx3QkFBQSxFQUEwQixFQUwxQjtBQUFBLE1BTUEsZUFBQSxFQUFpQixLQU5qQjtBQUFBLE1BT0EsY0FBQSxFQUFnQixVQVBoQjtBQUFBLE1BUUEseUJBQUEsRUFBMkIsS0FSM0I7QUFBQSxNQVNBLDRCQUFBLEVBQThCLEtBVDlCO0FBQUEsTUFVQSwyQkFBQSxFQUE2QixJQVY3QjtBQUFBLE1BV0Esd0JBQUEsRUFBMEIsS0FYMUI7QUFBQSxNQVlBLFlBQUEsRUFBYyxLQVpkO0FBQUEsTUFhQSxtQkFBQSxFQUFxQixLQWJyQjtBQUFBLE1BY0EsbUJBQUEsRUFBcUIsQ0FkckI7QUFBQSxNQWlCQSxlQUFBLEVBQWlCLENBakJqQjtBQUFBLE1Ba0JBLGVBQUEsRUFBaUIsR0FsQmpCO0FBQUEsTUFxQkEsc0JBQUEsRUFBd0IsS0FyQnhCO0FBQUEsTUFzQkEsZ0JBQUEsRUFBa0IsQ0F0QmxCO0FBQUEsTUF1QkEsZ0JBQUEsRUFBa0IsR0F2QmxCO0FBQUEsTUF3QkEsZ0JBQUEsRUFBa0IsVUF4QmxCO0FBQUEsTUF5QkEsbUJBQUEsRUFBcUIsUUF6QnJCO0FBQUEsTUEwQkEscUJBQUEsRUFBdUIsR0ExQnZCO0FBQUEsTUE2QkEsZUFBQSxFQUFpQixDQTdCakI7QUFBQSxNQThCQSxZQUFBLEVBQWMsT0E5QmQ7QUFBQSxNQStCQSxlQUFBLEVBQWlCLE9BL0JqQjtBQUFBLE1BZ0NBLGtCQUFBLEVBQW9CLEVBaENwQjtBQUFBLE1BbUNBLG9CQUFBLEVBQXNCLEVBbkN0QjtBQUFBLE1Bc0NBLGtCQUFBLEVBQW9CLFVBdENwQjtBQUFBLE1BdUNBLHFCQUFBLEVBQXVCLEVBdkN2QjtBQUFBLE1BMENBLG1CQUFBLEVBQXFCLEVBMUNyQjtBQUFBLE1BMkNBLFdBQUEsRUFBYSxFQTNDYjtBQUFBLE1BNENBLHFCQUFBLEVBQXVCLEVBNUN2QjtBQUFBLE1BK0NBLG9CQUFBLEVBQXNCLEVBL0N0QjtBQUFBLE1BZ0RBLHNCQUFBLEVBQXdCLEVBaER4QjtBQUFBLE1BaURBLGtCQUFBLEVBQW9CLENBakRwQjtBQUFBLE1Ba0RBLGFBQUEsRUFBZSxDQUFDLEtBQUQsQ0FsRGY7QUFBQSxNQXFEQSxtQkFBQSxFQUFxQixFQXJEckI7QUFBQSxNQXdEQSxnQkFBQSxFQUFrQixFQXhEbEI7QUFBQSxNQXlEQSxZQUFBLEVBQWMsRUF6RGQ7QUFBQSxNQTREQSxrQkFBQSxFQUFvQixFQTVEcEI7QUFBQSxNQTZEQSxjQUFBLEVBQWdCLEVBN0RoQjtBQUFBLE1BZ0VBLHlCQUFBLEVBQTJCLEVBaEUzQjtBQUFBLE1BaUVBLHFCQUFBLEVBQXVCLEVBakV2QjtBQUFBLE1Bb0VBLGlCQUFBLEVBQW1CLEVBcEVuQjtBQUFBLE1BcUVBLGFBQUEsRUFBZSxFQXJFZjtBQUFBLE1Bd0VBLGdCQUFBLEVBQWtCLEVBeEVsQjtBQUFBLE1BeUVBLFlBQUEsRUFBYyxFQXpFZDtBQUFBLE1BNEVBLG1CQUFBLEVBQXFCLEVBNUVyQjtBQUFBLE1BNkVBLGVBQUEsRUFBaUIsRUE3RWpCO0FBQUEsTUFnRkEsbUJBQUEsRUFBcUIsRUFoRnJCO0FBQUEsTUFpRkEsZUFBQSxFQUFpQixFQWpGakI7QUFBQSxNQW9GQSxtQkFBQSxFQUFxQixFQXBGckI7QUFBQSxNQXFGQSxlQUFBLEVBQWlCLEVBckZqQjtLQTVCRjtBQUFBLElBc0hBLFFBQUEsRUFBVSxTQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLFVBQWhCLEVBQTRCLGlCQUE1QixHQUFBO0FBQ1IsVUFBQSxtRUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtBQUFBLE1BRUEsa0JBQUEsR0FBcUIsS0FGckIsQ0FBQTtBQUFBLE1BR0EsT0FBQSxHQUFVLE1BSFYsQ0FBQTtBQUlBLE1BQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLENBQWtELENBQUMsT0FBbkQsQ0FBMkQsT0FBM0QsQ0FBQSxHQUFzRSxDQUFBLENBQXpFO0FBQ0UsZUFBTyxpQkFBQSxDQUFrQixJQUFsQixDQUFQLENBREY7T0FKQTtBQU1BLGNBQU8sT0FBUDtBQUFBLGFBR08sTUFIUDtBQUFBLGFBR2UsWUFIZjs7WUFJSSxhQUFjLE9BQUEsQ0FBUSxhQUFSO1dBQWQ7QUFBQSxVQUNBLElBQUEsR0FBTyxVQUFBLENBQVcsSUFBWCxFQUFpQixJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixFQUFzQixVQUF0QixDQUFqQixDQURQLENBQUE7QUFBQSxVQUVBLGlCQUFBLENBQWtCLElBQWxCLENBRkEsQ0FKSjtBQUdlO0FBSGYsYUFPTyxjQVBQOztZQVFJLHVCQUF3QixPQUFBLENBQVEsK0JBQVI7V0FBeEI7QUFBQSxVQUNBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLEVBQXNCLFVBQXRCLENBQTNCLEVBQThELGlCQUE5RCxDQURBLENBUko7QUFPTztBQVBQLGFBVU8sWUFWUDtBQUFBLGFBVXFCLGlCQVZyQjtBQVlJLFVBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0I7QUFBQSxZQUFBLGlCQUFBLEVBQW1CLElBQW5CO1dBQWhCLENBQUEsQ0FBQTs7WUFFQSxlQUFnQixPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDO1dBRnZDO0FBQUEsVUFHQSxJQUFBLEdBQU8sWUFBQSxDQUFhLElBQWIsRUFBbUIsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBeEIsQ0FBbkIsQ0FIUCxDQUFBO0FBQUEsVUFJQSxpQkFBQSxDQUFrQixJQUFsQixDQUpBLENBWko7QUFVcUI7QUFWckIsYUFpQk8sZUFqQlA7QUFBQSxhQWlCd0IsTUFqQnhCO0FBQUEsYUFpQmdDLEtBakJoQzs7WUFrQkksZUFBZ0IsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztXQUF2QztBQUFBLFVBQ0EsSUFBQSxHQUFPLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQWhCLEVBQXdCLFVBQXhCLENBQW5CLENBRFAsQ0FBQTtBQUFBLFVBRUEsaUJBQUEsQ0FBa0IsSUFBbEIsQ0FGQSxDQWxCSjtBQWlCZ0M7QUFqQmhDLGFBcUJPLG1CQXJCUDtBQUFBLGFBcUI0QixjQXJCNUI7O1lBc0JJLGtCQUFtQixPQUFBLENBQVEsMkJBQVI7V0FBbkI7QUFBQSxVQUNBLGVBQUEsQ0FBZ0IsSUFBaEIsRUFBc0IsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBeEIsQ0FBdEIsRUFBMkQsaUJBQTNELENBREEsQ0F0Qko7QUFxQjRCO0FBckI1QixhQXdCTyxLQXhCUDs7WUF5QkksY0FBZSxPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDO1dBQXRDO0FBQUEsVUFDQSxJQUFBLEdBQU8sV0FBQSxDQUFZLElBQVosRUFBa0IsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsRUFBdUIsVUFBdkIsQ0FBbEIsQ0FEUCxDQUFBO0FBQUEsVUFFQSxpQkFBQSxDQUFrQixJQUFsQixDQUZBLENBekJKO0FBd0JPO0FBeEJQLGFBNEJPLE1BNUJQO0FBQUEsYUE0QmUsTUE1QmY7QUFBQSxhQTRCdUIsTUE1QnZCOztZQTZCSSxlQUFnQixPQUFBLENBQVEsdUJBQVI7V0FBaEI7QUFBQSxVQUNBLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLEVBQXVCLFVBQXZCLENBQW5CLEVBQXVELGlCQUF2RCxDQURBLENBN0JKO0FBNEJ1QjtBQTVCdkIsYUErQk8sYUEvQlA7QUFBQSxhQStCc0IsS0EvQnRCOztZQWdDSSxjQUFlLE9BQUEsQ0FBUSxzQkFBUjtXQUFmO0FBQUEsVUFDQSxXQUFBLENBQVksSUFBWixFQUFrQixJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixFQUF1QixVQUF2QixDQUFsQixFQUFzRCxpQkFBdEQsQ0FEQSxDQWhDSjtBQStCc0I7QUEvQnRCLGFBa0NPLE1BbENQOztZQW1DSSxlQUFnQixPQUFBLENBQVEsdUJBQVI7V0FBaEI7QUFBQSxVQUNBLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQWhCLEVBQXdCLFVBQXhCLENBQW5CLEVBQXdELGlCQUF4RCxDQURBLENBbkNKO0FBa0NPO0FBbENQLGFBcUNPLEtBckNQOztZQXNDSSxjQUFlLE9BQUEsQ0FBUSxzQkFBUjtXQUFmO0FBQUEsVUFDQSxXQUFBLENBQVksSUFBWixFQUFrQixJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixFQUF1QixVQUF2QixDQUFsQixFQUFzRCxpQkFBdEQsQ0FEQSxDQXRDSjtBQXFDTztBQXJDUCxhQXdDTyxRQXhDUDs7WUF5Q0ksaUJBQWtCLE9BQUEsQ0FBUSx5QkFBUjtXQUFsQjtBQUFBLFVBQ0EsY0FBQSxDQUFlLElBQWYsRUFBcUIsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsUUFBaEIsRUFBMEIsVUFBMUIsQ0FBckIsRUFBNEQsaUJBQTVELENBREEsQ0F6Q0o7QUF3Q087QUF4Q1AsYUEyQ08sTUEzQ1A7QUFBQSxhQTJDZSxlQTNDZjs7WUE0Q0ksZUFBZ0IsT0FBQSxDQUFRLHVCQUFSO1dBQWhCO0FBQUEsVUFDQSxZQUFBLENBQWEsSUFBYixFQUFtQixJQUFJLENBQUMsVUFBTCxDQUFnQixNQUFoQixFQUF3QixVQUF4QixDQUFuQixFQUF3RCxpQkFBeEQsQ0FEQSxDQTVDSjtBQTJDZTtBQTNDZixhQThDTyxpQkE5Q1A7O1lBK0NJLG1CQUFvQixPQUFBLENBQVEsMkJBQVI7V0FBcEI7QUFBQSxVQUNBLGdCQUFBLENBQWlCLElBQWpCLEVBQXVCLElBQUksQ0FBQyxVQUFMLENBQWdCLFVBQWhCLEVBQTRCLFVBQTVCLENBQXZCLEVBQWdFLGlCQUFoRSxDQURBLENBL0NKO0FBOENPO0FBOUNQLGFBaURPLEdBakRQO0FBa0RJLFVBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLEVBQXFCLFVBQXJCLENBQVYsQ0FBQTtBQUFBLFVBQ0EsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLEdBRDNCLENBQUE7O1lBRUEsdUJBQXdCLE9BQUEsQ0FBUSxxQkFBUjtXQUZ4QjtBQUFBLFVBR0Esb0JBQUEsQ0FBcUIsSUFBckIsRUFBMkIsT0FBM0IsRUFBb0MsaUJBQXBDLENBSEEsQ0FsREo7QUFpRE87QUFqRFAsYUFzRE8sS0F0RFA7QUF1REksVUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsRUFBdUIsVUFBdkIsQ0FBVixDQUFBO0FBQUEsVUFDQSxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsS0FEM0IsQ0FBQTs7WUFFQSx1QkFBd0IsT0FBQSxDQUFRLHFCQUFSO1dBRnhCO0FBQUEsVUFHQSxvQkFBQSxDQUFxQixJQUFyQixFQUEyQixPQUEzQixFQUFvQyxpQkFBcEMsQ0FIQSxDQXZESjtBQXNETztBQXREUCxhQTJETyxJQTNEUDtBQTRESSxVQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixFQUFzQixVQUF0QixDQUFWLENBQUE7QUFBQSxVQUNBLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixJQUQzQixDQUFBOztZQUVBLHVCQUF3QixPQUFBLENBQVEscUJBQVI7V0FGeEI7QUFBQSxVQUdBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCLEVBQW9DLGlCQUFwQyxDQUhBLENBNURKO0FBMkRPO0FBM0RQLGFBZ0VPLGFBaEVQO0FBQUEsYUFnRXNCLGVBaEV0QjtBQWlFSSxVQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFnQixZQUFoQixFQUE4QixVQUE5QixDQUFWLENBQUE7QUFBQSxVQUNBLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixLQUQzQixDQUFBOztZQUVBLHVCQUF3QixPQUFBLENBQVEscUJBQVI7V0FGeEI7QUFBQSxVQUdBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCLEVBQW9DLGlCQUFwQyxDQUhBLENBakVKO0FBZ0VzQjtBQWhFdEIsYUFxRU8sR0FyRVA7QUFzRUksVUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsRUFBcUIsVUFBckIsQ0FBVixDQUFBO0FBQUEsVUFDQSxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsR0FEM0IsQ0FBQTs7WUFFQSx1QkFBd0IsT0FBQSxDQUFRLHFCQUFSO1dBRnhCO0FBQUEsVUFHQSxvQkFBQSxDQUFxQixJQUFyQixFQUEyQixPQUEzQixFQUFvQyxpQkFBcEMsQ0FIQSxDQXRFSjtBQXFFTztBQXJFUCxhQTBFTyxNQTFFUDtBQTJFSSxVQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFnQixNQUFoQixFQUF3QixVQUF4QixDQUFWLENBQUE7QUFBQSxVQUNBLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixNQUQzQixDQUFBOztZQUVBLHVCQUF3QixPQUFBLENBQVEscUJBQVI7V0FGeEI7QUFBQSxVQUdBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCLEVBQW9DLGlCQUFwQyxDQUhBLENBM0VKO0FBMEVPO0FBMUVQLGFBK0VPLE1BL0VQO0FBZ0ZJLFVBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQWhCLEVBQXdCLFVBQXhCLENBQVYsQ0FBQTtBQUFBLFVBQ0EsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLE1BRDNCLENBQUE7O1lBRUEsdUJBQXdCLE9BQUEsQ0FBUSxxQkFBUjtXQUZ4QjtBQUFBLFVBR0Esb0JBQUEsQ0FBcUIsSUFBckIsRUFBMkIsT0FBM0IsRUFBb0MsaUJBQXBDLENBSEEsQ0FoRko7QUErRU87QUEvRVAsYUFvRk8sTUFwRlA7QUFxRkksVUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBeEIsQ0FBVixDQUFBO0FBQUEsVUFDQSxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsTUFEM0IsQ0FBQTs7WUFFQSx1QkFBd0IsT0FBQSxDQUFRLHFCQUFSO1dBRnhCO0FBQUEsVUFHQSxvQkFBQSxDQUFxQixJQUFyQixFQUEyQixPQUEzQixFQUFvQyxpQkFBcEMsQ0FIQSxDQXJGSjtBQW9GTztBQXBGUCxhQXlGTyxZQXpGUDs7WUEwRkkscUJBQXNCLE9BQUEsQ0FBUSw2QkFBUjtXQUF0QjtBQUFBLFVBQ0Esa0JBQUEsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsRUFBc0IsVUFBdEIsQ0FBekIsRUFBNEQsaUJBQTVELENBREEsQ0ExRko7QUF5Rk87QUF6RlA7QUE2RkksVUFBQSxrQkFBQSxHQUFxQixJQUFyQixDQTdGSjtBQUFBLE9BTkE7QUFzR0EsTUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBSDtBQUVFLFFBQUEsU0FBQSxHQUFnQixJQUFBLFNBQUEsQ0FBVSxpQkFBVixDQUFoQixDQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsSUFBVyxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQUFQO0FBQ0UsVUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVIsQ0FBUCxDQUFBO0FBQUEsVUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLEVBQWtELElBQUksQ0FBQyxFQUFMLENBQUEsQ0FBbEQsQ0FEQSxDQURGO1NBREE7QUFBQSxRQUtBLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBTFQsQ0FBQTtBQUFBLFFBTUEsU0FBUyxDQUFDLFFBQVYsQ0FBbUI7QUFBQSxVQUFBLE1BQUEsRUFBUSxNQUFSO1NBQW5CLENBTkEsQ0FBQTtBQUFBLFFBT0EsT0FBQSxHQUFVLEdBQUcsQ0FBQyxPQVBkLENBQUE7QUFBQSxRQVFBLFNBQVMsQ0FBQyxLQUFWLENBQ0U7QUFBQSxVQUFBLE1BQUEsRUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBQVI7QUFBQSxVQUNBLEtBQUEsRUFBTyxVQURQO0FBQUEsVUFFQSxVQUFBLEVBQ0U7QUFBQSxZQUFBLE9BQUEsRUFBUyxPQUFUO0FBQUEsWUFDQSxPQUFBLEVBQVMsT0FEVDtBQUFBLFlBRUEsT0FBQSxFQUFTLFVBRlQ7QUFBQSxZQUdBLEtBQUEsRUFBTyxPQUhQO0FBQUEsWUFJQSxRQUFBLEVBQVUsT0FKVjtXQUhGO1NBREYsQ0FSQSxDQUZGO09BdEdBO0FBMEhBLE1BQUEsSUFBRyxrQkFBSDtBQUNFLFFBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkNBQWhCLENBQUg7QUFDRSxpQkFBTyxpQkFBQSxDQUFrQixJQUFsQixDQUFQLENBREY7U0FBQSxNQUFBO0FBR0UsZ0JBQVUsSUFBQSxLQUFBLENBQU8sb0NBQUEsR0FBbUMsT0FBbkMsR0FBNEMsSUFBbkQsQ0FBVixDQUhGO1NBREY7T0EzSFE7SUFBQSxDQXRIVjtBQUFBLElBd1BBLFVBQUEsRUFBWSxTQUFDLFNBQUQsRUFBWSxVQUFaLEdBQUE7QUFDVixVQUFBLGFBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7O1FBQ0EsSUFBSyxPQUFBLENBQVEsUUFBUjtPQURMOztRQUVBLFNBQVUsT0FBQSxDQUFRLFFBQVI7T0FGVjtBQUFBLE1BS0EsT0FBQSxHQUFVLENBQUMsQ0FBQyxNQUFGLENBQVMsVUFBVCxFQUFxQixTQUFDLE1BQUQsRUFBUyxXQUFULEdBQUE7QUFDN0IsWUFBQSxvQ0FBQTtBQUFBLFFBQUEsY0FBQSxHQUFpQixLQUFqQixDQUFBO0FBQUEsUUFDQSxlQUFBLEdBQWtCLEVBRGxCLENBQUE7QUFBQSxRQUVBLEdBQUEsR0FBTSxNQUZOLENBQUE7QUFJQSxhQUFBLGtCQUFBLEdBQUE7QUFFRSxVQUFBLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFJLENBQUMsU0FBZixFQUEwQixHQUExQixDQUFBLElBQWtDLENBQWxDLElBQXdDLE1BQUEsQ0FBQSxXQUFtQixDQUFBLEdBQUEsQ0FBbkIsS0FBMkIsUUFBdEU7QUFDRSxZQUFBLGNBQUEsR0FBaUIsSUFBakIsQ0FBQTtBQUNBLGtCQUZGO1dBRkY7QUFBQSxTQUpBO0FBV0EsUUFBQSxJQUFBLENBQUEsY0FBQTtBQUNFLFVBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxlQUFSLEVBQXlCLFdBQXpCLENBQUEsQ0FERjtTQUFBLE1BQUE7QUFNRSxVQUFBLENBQUMsQ0FBQyxLQUFGLENBQVEsZUFBUixFQUF5QixXQUFZLENBQUEsU0FBQSxDQUFyQyxDQUFBLENBTkY7U0FYQTtlQWtCQSxNQUFBLENBQU8sTUFBUCxFQUFlLGVBQWYsRUFuQjZCO01BQUEsQ0FBckIsRUFvQlIsRUFwQlEsQ0FMVixDQUFBO2FBZ0NBLFFBakNVO0lBQUEsQ0F4UFo7R0FwQ0YsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/language-options.coffee