var assert = require('assert'),
    highkick = require('../lib');

var testNested = highkick('./nested'),
    testParams = highkick('./params'),
    testAsync  = highkick({ 'path': './async', 'async': true });

var i = 0;

function testInitFail(callback){
  highkick('./init_fail', function(error, result){
    assert.equal(i++, 0);
    assert.ok(error);
    callback();
  });
}

function testSimpleAsync(callback){
  setTimeout(function(){
    assert.equal(i++, 1);
    callback();
  }, 100);
}

function testFail(callback){
  highkick('./fail', function(error, result){
    assert.equal(i++, 2);
    assert.equal(result.fail, 2);
    callback();
  });
}

function testIsEnabled(callback){
  var isEnabled = require('../lib/is-enabled');

  assert.ok(!isEnabled('foo'));

  assert.ok(isEnabled('foo', '*'));

  assert.ok(isEnabled('foo', 'foo'));

  assert.ok(isEnabled('testFoo', 'foo'));

  assert.ok(isEnabled('test_foo', 'foo'));

  assert.ok(!isEnabled('bar', 'foo'));

  assert.ok(isEnabled('bar', 'foo,bar'));

  assert.equal(i++, 3);
  callback();
}

module.exports = {
  'testInitFail': testInitFail,
  'testSimpleAsync': testSimpleAsync,
  'testFail': testFail,
  'testNested': testNested,
  'testParams': testParams,
  'testIsEnabled': testIsEnabled,
  'testAsync': testAsync
}
