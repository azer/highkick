var assert = require('assert'),
    highkick = require('../lib/highkick');

var counter = 0;

function init(options, callback){
  callback(null, 3.14);
}

function test_async_1(pi, callback){
  assert.equal(++counter, 1);
  assert.equal(pi, 3.14);
  setTimeout(function(){
    assert.equal(++counter, 7);
    callback();
  }, 300);
}

function test_async_2(pi, callback){
  assert.equal(++counter, 2);
  assert.equal(pi, 3.14);
  setTimeout(function(){
    assert.equal(++counter, 6);
    callback();
  }, 50);
}

function test_sync(pi, callback){
  assert.equal(++counter, 3);
  assert.equal(pi, 3.14);
  callback();
}

function test_nested(test, callback){
  assert.equal(++counter, 4);
  highkick({ module:require('./test_nested'), 'silent':false, 'name':'nested', foo:true },function(error,result){
    !error && result.len == 0 && (error = new Error('Missing test functions.'));
    if(error) return callback(error);
    callback(result.fail ? new Error('Fail') : undefined);
  });  
}

function test_ordered(test, callback){
  assert.equal(++counter, 5);
  highkick({ module:require('./test_ordered'), 'ordered':true, 'name':'ordered' },function(error,result){
    !error && result.len == 0 && (error = new Error('Missing test functions.'));
    if(error) return callback(error);
    callback(result.fail ? new Error('Fail') : undefined);
  });  
}

module.exports = {
  'init':init,
  'test_async_1':test_async_1,
  'test_async_2':test_async_2,
  'test_sync':test_sync,
  'test_nested':test_nested,
  'test_ordered':test_ordered
}
