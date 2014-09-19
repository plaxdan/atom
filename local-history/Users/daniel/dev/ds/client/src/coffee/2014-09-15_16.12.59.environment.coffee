# Responsible for setting up environment shims, hacks, and other nonsense

# ensure 'global' reference to top-level object
# node always defines this, so browsers are the only environment where it
# might not be defined so we can set it to window
unless global?
  window.global = window

# load ES6 Promise polyfill if needed
(require 'es6-promise').polyfill()
# unless global.Promise
#   global.Promise = (require 'es6-promise').Promise

# also ensure Promise.done exists - see:
# https://www.promisejs.org/polyfills/promise-done-1.0.0.js
unless Promise::done
  Promise::done = (cb, eb) ->
    @then(cb, eb)
      .then null, (err) ->
        setTimeout ( () -> throw err ), 0

# https://github.com/facebook/react/blob/master/src/test/phantomjs-shims.js
`
(function() {

var Ap = Array.prototype;
var slice = Ap.slice;
var Fp = Function.prototype;

if (!Fp.bind) {
  // PhantomJS doesn't support Function.prototype.bind natively, so
  // polyfill it whenever this module is required.
  Fp.bind = function(context) {
    var func = this;
    var args = slice.call(arguments, 1);

    function bound() {
      var invokedAsConstructor = func.prototype && (this instanceof func);
      return func.apply(
        // Ignore the context parameter when invoking the bound function
        // as a constructor. Note that this includes not only constructor
        // invocations using the new keyword but also calls to base class
        // constructors such as BaseClass.call(this, ...) or super(...).
        !invokedAsConstructor && context || this,
        args.concat(slice.call(arguments))
      );
    }

    // The bound function must share the .prototype of the unbound
    // function so that any object created by one constructor will count
    // as an instance of both constructors.
    bound.prototype = func.prototype;

    return bound;
  };
}
})();
`

# fixup broken console in various environments (IE, mobile, etc)
unless global.console
  global.console =
    log: ->
    warn: ->
    debug: ->
    info: ->
    error: ->

unless console.debug?
  console.debug = console.log

# Add React to window when in DEBUG mode so React Dev Tools will work.
#   https://github.com/facebook/react/issues/2096
if DEBUG
  window.React = require 'react/addons'

if navigator?.userAgent.match /i(Pod|Phone|Pad)/i
  # this is a hack/workaround to deal with the poor behavior of fixed
  # position elements in ios. without this, the navbar gets stuck in the
  # middle of the page occasionally when the keyboard is hidden
  ($ document)
    .on 'focus', 'input, textarea', ->
      ($ '.navbar-fixed-top').addClass 'fix-webkit-scroll'
    .on 'blur', 'input, textarea', ->
      ($ '.navbar-fixed-top').removeClass 'fix-webkit-scroll'
      _.defer ->
        window.scrollTo document.body.scrollLeft, document.body.scrollTop
