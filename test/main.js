var assert = require('assert'),
    highkick = require('../lib/highkick');

var counter = 0;

function cleanRequireCache(){
  var filename;
  for(filename in require.cache){
    delete require.cache[filename];
  }
}

function init(options, callback){
  cleanRequireCache();
  callback(null, 3.14);
}

function testSimple(pi, callback){
  callback();
}

function testSimpleAsync(pi, callback){
  setTimeout(function(){
    callback();
  }, 100);
}

function testFail(pi, callback){
  highkick({ module:require('./fail'), 'silent':true, 'name':'fail' }, function(error, result){
    assert.equal(result.fail, 2);
    callback();
  });
}

function testOrderedFail(pi, callback){
  highkick({ module:require('./fail'), 'ordered':true, 'silent':true, 'name':'ordered fail' }, function(error, result){
    assert.equal(result.fail, 2);
    callback();
  });
}

function testAsync1(pi, callback){
  assert.equal(++counter, 1);
  assert.equal(pi, 3.14);
  setTimeout(function(){
    assert.equal(++counter, 7);
    callback();
  }, 300);
}

function testAsync2(pi, callback){
  assert.equal(++counter, 2);
  assert.equal(pi, 3.14);
  setTimeout(function(){
    try {
      assert.equal(++counter, 6);
      callback();
    } catch(err){
      callback(err);
    }
  }, 50);
}

function testSync(pi, callback){
  assert.equal(++counter, 3);
  assert.equal(pi, 3.14);
  callback();
}

function testNested(test, callback){
  assert.equal(++counter, 4);
  highkick({ module:require('./nested'), 'silent':true, 'name':'nested', foo:true },function(error,result){
    !error && result.len == 0 && (error = new Error('Missing test functions.'));
    if(error) return callback(error);
    callback(result.fail ? new Error('Fail') : undefined);
  });  
}

function testOrdered(test, callback){
  assert.equal(++counter, 5);
  highkick({ module:require('./ordered'), 'silent':true, 'ordered':true, 'name':'ordered' },function(error,result){
    !error && result.len == 0 && (error = new Error('Missing test functions.'));
    if(error) return callback(error);
    callback(result.fail ? new Error('Fail') : undefined);
  });  
}

module.exports = {
  'init': init,
  'testSimple': testSimple,
  'testSimpleAsync': testSimpleAsync,
  'testAsync1': testAsync1,
  'testAsync2':testAsync2,
  'testSync': testSync,
  'testFail': testFail,
  'testNested': testNested,
  'testOrdered': testOrdered,
  'testOrderedFail': testOrderedFail
}
