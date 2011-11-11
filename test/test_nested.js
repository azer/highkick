var assert = require('assert');

function init(options, callback){
  // what init's callback returns is passed to the tests as seen below example
  callback(null, options);
}

function test_options(options, callback){
  assert.equal(options.silent, false);
  assert.ok(options.foo);
  callback();
}

module.exports = {
  'init':init,
  'test_options':test_options
};
