# Responsible for setting up environment shims, hacks, and other nonsense

# ensure 'global' reference to top-level object
# node always defines this, so browsers are the only environment where it
# might not be defined so we can set it to window
unless global?
  window.global = window

# load ES6 Promise polyfill if needed
unless global.Promise
  global.Promise = (require 'es6-promise').Promise

# Promise.cast seems to be preferable to Promise.resolve for performance
# reasons: http://mozilla.6506.n7.nabble.com/Promise-cast-and-Promise-resolve-td305897.html
# however, it's not defined in all environments
unless Promise.cast
  Promise.cast = Promise.resolve

# also ensure Promise.done exists - see:
# https://www.promisejs.org/polyfills/promise-done-1.0.0.js
unless Promise::done
  Promise::done = (cb, eb) ->
    @then(cb, eb)
      .then null, (err) ->
        setTimeout ( () -> throw err ), 0

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
