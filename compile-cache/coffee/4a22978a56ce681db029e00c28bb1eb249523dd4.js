
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Analytics, allowUnsafeEval, analyticsWriteKey, beautifyCSS, beautifyCoffeeScript, beautifyHTML, beautifyHTMLERB, beautifyJS, beautifyLESS, beautifyMarkdown, beautifyPHP, beautifyPython, beautifyRuby, beautifySQL, extend, pkg, uncrustifyBeautifier, _;

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

  Analytics = null;

  allowUnsafeEval = require('loophole').allowUnsafeEval;

  allowUnsafeEval(function() {
    return Analytics = require("analytics-node");
  });

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEseVBBQUE7O0FBQUEsRUFLQSxDQUFBLEdBQUksSUFMSixDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBYSxJQVJiLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQWUsSUFUZixDQUFBOztBQUFBLEVBVUEsV0FBQSxHQUFjLElBVmQsQ0FBQTs7QUFBQSxFQVdBLFdBQUEsR0FBYyxJQVhkLENBQUE7O0FBQUEsRUFZQSxXQUFBLEdBQWMsSUFaZCxDQUFBOztBQUFBLEVBYUEsY0FBQSxHQUFpQixJQWJqQixDQUFBOztBQUFBLEVBY0EsWUFBQSxHQUFlLElBZGYsQ0FBQTs7QUFBQSxFQWVBLFlBQUEsR0FBZSxJQWZmLENBQUE7O0FBQUEsRUFnQkEsb0JBQUEsR0FBdUIsSUFoQnZCLENBQUE7O0FBQUEsRUFpQkEsb0JBQUEsR0FBdUIsSUFqQnZCLENBQUE7O0FBQUEsRUFrQkEsZUFBQSxHQUFrQixJQWxCbEIsQ0FBQTs7QUFBQSxFQW1CQSxnQkFBQSxHQUFtQixJQW5CbkIsQ0FBQTs7QUFBQSxFQW9CQSxTQUFBLEdBQVksSUFwQlosQ0FBQTs7QUFBQSxFQXVCQyxrQkFBbUIsT0FBQSxDQUFRLFVBQVIsRUFBbkIsZUF2QkQsQ0FBQTs7QUFBQSxFQXdCQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtXQUNkLFNBQUEsR0FBWSxPQUFBLENBQVEsZ0JBQVIsRUFERTtFQUFBLENBQWhCLENBeEJBLENBQUE7O0FBQUEsRUEwQkEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxpQkFBUixDQTFCTixDQUFBOztBQUFBLEVBNkJBLGlCQUFBLEdBQW9CLFlBN0JwQixDQUFBOztBQUFBLEVBOEJBLE1B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
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/language-options.coffee