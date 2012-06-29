var assert = require('assert');

function init(options, callback){
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
