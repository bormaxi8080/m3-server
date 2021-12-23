var path = require('path');
var sinon = exports.sinon = require('sinon');
var chai = require('chai');
var expect = exports.expect = chai.expect;
var sinonChai = require("sinon-chai");

chai.should();
chai.use(sinonChai);
require('mocha-subject').infect();

var sandbox = exports.sandbox = null;

beforeEach(function() {
    exports.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    exports.sandbox.restore();
});

module.exports.require = function(name) {
    return require(path.join(__dirname, '../../lib', name));
};
