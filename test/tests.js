var assert = require('assert');

function init(){
  return 3.14;
}

function test_foo(pi, callback){
  assert.equal(pi, 3.14);
  setTimeout(function(){
    callback();     
  }, 10);
}

function test_bar(pi, callback){
  assert.equal(pi, 3.14);
  callback();
}

module.exports = {
  'init':init,
  'test_foo':test_foo,
  'test_bar':test_bar
}
