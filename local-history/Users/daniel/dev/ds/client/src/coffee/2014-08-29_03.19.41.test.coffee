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
require 'script!./js/phantomjs-shim.js'
require './test-suite'
