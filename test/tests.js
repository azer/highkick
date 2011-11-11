var assert = require('assert'),
    highkick = require('../lib/highkick');

function init(options, callback){
  setTimeout(function(){ 
    callback(null, 3.14);
  }, 100);
}

function test_async(pi, callback){
  assert.equal(pi, 3.14);
  setTimeout(function(){
    callback();
  }, 10);
}

function test_sync(pi, callback){
  assert.equal(pi, 3.14);
  callback();
}

function test_nested(test, callback){
  highkick({ module:require('./test_nested'), 'silent':false, 'name':'  nested', foo:true },function(error,result){
    !error && result.len == 0 && (error = new Error('Missing test functions.'));
    if(error) return callback(error);
    callback(result.fail ? new Error('Fail') : undefined);
  });  
}

module.exports = {
  'init':init,
  'test_async':test_async,
  'test_sync':test_sync,
  'test_nested':test_nested
}
