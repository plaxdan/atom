require './environment'

# required for react with phantomjs
# see: https://github.com/facebook/react/pull/347
require 'es5-shim'

chai = require 'chai'
spies = require 'chai-spies'

chai.use spies
chai.should()

# register expect globally
global.chai = chai
global.expect = chai.expect

# bing - would be nice to not have this duplicated from what is in index.coffee
# load the composite test suite
# require './test-suite'
# load the composite test suite
# See: http://webpack.github.io/docs/context.html#context-module-api
specRequire = require.context '.', true, /_spec.coffee$/
specRequire spec for spec in specRequire.keys()
