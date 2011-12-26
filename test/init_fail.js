var assert = require('assert');

var initCalled = false;

function init(options, callback){
  assert.ok(!initCalled);

  initCalled = true;

  callback(new Error('init fn fails'));
}

function testCall(callback){
  callback(new Error('test function has been called regardless of init error.'));
}

module.exports = {
  'init': init,
  'testCall': testCall
}
