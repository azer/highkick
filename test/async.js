var assert = require('assert'),
    i = 0;

module.exports.testAsync1 = function(callback){
  setTimeout(function(){
    assert.equal( i++, 1);
    callback();
  }, 100);
};

module.exports.testAsync2 = function(callback){
  setTimeout(function(){
    assert.equal( i++, 2);
    callback();
  }, 300);
};

module.exports.testAsync3 = function(callback){
  assert.equal( i++, 0);
  callback();
};
