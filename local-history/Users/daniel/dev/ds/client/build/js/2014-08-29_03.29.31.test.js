var chai, spies;

require('./environment');

require('es5-shim');

chai = require('chai');

spies = require('chai-spies');

chai.use(spies);

chai.should();

global.chai = chai;

global.expect = chai.expect;

require('script!./phantomjs-shim');

require('./test-suite');
