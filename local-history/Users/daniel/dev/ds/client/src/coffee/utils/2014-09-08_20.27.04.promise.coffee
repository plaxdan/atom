{Promise} = (require 'es6-promise')

# also ensure Promise.done exists - see:
# https://www.promisejs.org/polyfills/promise-done-1.0.0.js
unless Promise::done
  Promise::done = (cb, eb) ->
    @then(cb, eb)
      .then null, (err) ->
        setTimeout ( () -> throw err ), 0

module.exports = Promise