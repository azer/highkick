var assert = require('assert');

function init(options, callback){
  // what init's callback returns is passed to the tests as seen below example
  callback(null, options);
}

function testOptions(options, callback){
  assert.equal(options.name, 'nested');
  callback();
}

module.exports = {
  'init':init,
  'testOptions':testOptions
};
