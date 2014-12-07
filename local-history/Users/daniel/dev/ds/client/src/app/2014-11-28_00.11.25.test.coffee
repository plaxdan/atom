chai = require 'chai'
spies = require 'chai-spies'

chai.use spies
chai.should()

# register expect globally
global.chai = chai
global.expect = chai.expect

# load the composite test suite
# See: http://webpack.github.io/docs/context.html#context-module-api
specRequire = require.context '.', true, /_spec.coffee$/
specRequire spec for spec in specRequire.keys()
