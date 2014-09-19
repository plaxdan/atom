(function() {
  module.exports = {
    "=": {
      alignment: "left",
      leftSpace: true,
      rightSpace: true,
      prefixes: ["+", "-", "&", "|", "<", ">", "!", "~", "%", "/", "*", "."],
      scope: "operator|assignment"
    },
    ":": {
      alignment: "right",
      leftSpace: false,
      rightSpace: true,
      prefixes: [],
      scope: "operator|assignment"
    },
    ",": {
      leftSpace: true,
      rightSpace: false,
      prefixes: [],
      scope: "delimiter",
      multiple: {
        "number": {
          alignment: "left"
        },
        "string": {
          alignment: "right"
        }
      }
    },
    "=>": {
      alignment: "left",
      leftSpace: true,
      rightSpace: true,
      scope: "key-value"
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZixHQUFBLEVBQUs7QUFBQSxNQUNILFNBQUEsRUFBWSxNQURUO0FBQUEsTUFFSCxTQUFBLEVBQVksSUFGVDtBQUFBLE1BR0gsVUFBQSxFQUFZLElBSFQ7QUFBQSxNQUlILFFBQUEsRUFBWSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxHQUFuRCxFQUF3RCxHQUF4RCxDQUpUO0FBQUEsTUFLSCxLQUFBLEVBQVkscUJBTFQ7S0FEVTtBQUFBLElBUWYsR0FBQSxFQUFLO0FBQUEsTUFDSCxTQUFBLEVBQVksT0FEVDtBQUFBLE1BRUgsU0FBQSxFQUFZLEtBRlQ7QUFBQSxNQUdILFVBQUEsRUFBWSxJQUhUO0FBQUEsTUFJSCxRQUFBLEVBQVksRUFKVDtBQUFBLE1BS0gsS0FBQSxFQUFZLHFCQUxUO0tBUlU7QUFBQSxJQWVmLEdBQUEsRUFBSztBQUFBLE1BQ0gsU0FBQSxFQUFZLElBRFQ7QUFBQSxNQUVILFVBQUEsRUFBWSxLQUZUO0FBQUEsTUFHSCxRQUFBLEVBQVksRUFIVDtBQUFBLE1BSUgsS0FBQSxFQUFZLFdBSlQ7QUFBQSxNQUtILFFBQUEsRUFBWTtBQUFBLFFBQ1YsUUFBQSxFQUNFO0FBQUEsVUFBQSxTQUFBLEVBQVcsTUFBWDtTQUZRO0FBQUEsUUFHVixRQUFBLEVBQ0U7QUFBQSxVQUFBLFNBQUEsRUFBVyxPQUFYO1NBSlE7T0FMVDtLQWZVO0FBQUEsSUEyQmYsSUFBQSxFQUFNO0FBQUEsTUFDSixTQUFBLEVBQVksTUFEUjtBQUFBLE1BRUosU0FBQSxFQUFZLElBRlI7QUFBQSxNQUdKLFVBQUEsRUFBWSxJQUhSO0FBQUEsTUFJSixLQUFBLEVBQVksV0FKUjtLQTNCUztHQUFqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/vertical-align/lib/operator-config.coffee