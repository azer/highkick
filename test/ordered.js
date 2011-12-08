var assert = require('assert');

var counter = 0;

function init(options, callback){
  assert.ok(options.ordered);
  callback(null, options);
}

function test_1(options, callback){
  setTimeout(function(){
    assert.equal(++counter, 1);
    callback();
  }, 250);
}

function test_2(options, callback){
  setTimeout(function(){
    assert.equal(++counter, 2);
    callback();
  }, 500);
}

function test_3(options, callback){
  setTimeout(function(){
    assert.equal(++counter, 3);
    callback();
  }, 100);
}

module.exports = {
  'init':init,
  'test_1':test_1,
  'test_2':test_2,
  'test_3':test_3
};
