
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Analytics, analyticsWriteKey, beautifyCSS, beautifyCoffeeScript, beautifyHTML, beautifyJS, beautifyLESS, beautifyPHP, beautifyPython, beautifyRuby, beautifySQL, extend, pkg, uncrustifyBeautifier, _;

  _ = require("lodash");

  extend = require("extend");

  beautifyJS = require("js-beautify");

  beautifyHTML = require("js-beautify").html;

  beautifyCSS = require("js-beautify").css;

  beautifySQL = require("./langs/sql-beautify");

  beautifyPHP = require("./langs/php-beautify");

  beautifyPython = require("./langs/python-beautify");

  beautifyRuby = require("./langs/ruby-beautify");

  beautifyLESS = require("./langs/less-beautify");

  beautifyCoffeeScript = require("./langs/coffeescript-beautify");

  uncrustifyBeautifier = require("./langs/uncrustify/");

  Analytics = require("analytics-node");

  pkg = require("../package.json");

  analyticsWriteKey = "u3c26xkae8";

  module.exports = {
    languages: ["js", "html", "css", "sql", "php", "python", "ruby", "coffeescript", "c", "cpp", "cs", "objectivec", "java", "d", "pawn", "vala"],
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
      php_beautifier_path: "",
      python_autopep8_path: "",
      python_max_line_length: 79,
      python_indent_size: 4,
      python_ignore: ["E24"],
      ruby_rbeautify_path: "",
      c_configPath: "",
      cpp_configPath: "",
      objectivec_configPath: "",
      cs_configPath: "",
      d_configPath: "",
      java_configPath: "",
      pawn_configPath: "",
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
          text = beautifyJS(text, self.getOptions("js", allOptions));
          beautifyCompleted(text);
          break;
        case "CoffeeScript":
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
          text = beautifyHTML(text, self.getOptions("html", allOptions));
          beautifyCompleted(text);
          break;
        case "CSS":
          text = beautifyCSS(text, self.getOptions("css", allOptions));
          beautifyCompleted(text);
          break;
        case "Sass":
        case "SCSS":
        case "LESS":
          beautifyLESS(text, self.getOptions("css", allOptions), beautifyCompleted);
          break;
        case "SQL (Rails)":
        case "SQL":
          beautifySQL(text, self.getOptions("sql", allOptions), beautifyCompleted);
          break;
        case "PHP":
          beautifyPHP(text, self.getOptions("php", allOptions), beautifyCompleted);
          break;
        case "Python":
          beautifyPython(text, self.getOptions("python", allOptions), beautifyCompleted);
          break;
        case "Ruby":
          beautifyRuby(text, self.getOptions("ruby", allOptions), beautifyCompleted);
          break;
        case "C":
          options = self.getOptions("c", allOptions);
          options.languageOverride = "C";
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "C++":
          options = self.getOptions("cpp", allOptions);
          options.languageOverride = "CPP";
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "C#":
          options = self.getOptions("cs", allOptions);
          options.languageOverride = "CS";
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Objective-C":
        case "Objective-C++":
          options = self.getOptions("objectivec", allOptions);
          options.languageOverride = "OC+";
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "D":
          options = self.getOptions("d", allOptions);
          options.languageOverride = "D";
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Pawn":
          options = self.getOptions("pawn", allOptions);
          options.languageOverride = "PAWN";
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Vala":
          options = self.getOptions("vala", allOptions);
          options.languageOverride = "VALA";
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Java":
          options = self.getOptions("java", allOptions);
          options.languageOverride = "JAVA";
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
    },
    getOptions: function(selection, allOptions) {
      var options, self;
      self = this;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEscU1BQUE7O0FBQUEsRUFJQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FKSixDQUFBOztBQUFBLEVBS0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBTFQsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUixDQVJiLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQyxJQVR0QyxDQUFBOztBQUFBLEVBVUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUMsR0FWckMsQ0FBQTs7QUFBQSxFQVdBLFdBQUEsR0FBYyxPQUFBLENBQVEsc0JBQVIsQ0FYZCxDQUFBOztBQUFBLEVBWUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxzQkFBUixDQVpkLENBQUE7O0FBQUEsRUFhQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSx5QkFBUixDQWJqQixDQUFBOztBQUFBLEVBY0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQWRmLENBQUE7O0FBQUEsRUFlQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHVCQUFSLENBZmYsQ0FBQTs7QUFBQSxFQWdCQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsK0JBQVIsQ0FoQnZCLENBQUE7O0FBQUEsRUFpQkEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLHFCQUFSLENBakJ2QixDQUFBOztBQUFBLEVBb0JBLFNBQUEsR0FBWSxPQUFBLENBQVEsZ0JBQVIsQ0FwQlosQ0FBQTs7QUFBQSxFQXFCQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGlCQUFSLENBckJOLENBQUE7O0FBQUEsRUF3QkEsaUJBQUEsR0FBb0IsWUF4QnBCLENBQUE7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
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/language-options.coffee