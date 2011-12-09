module.exports.testError = function fail(callback){
  callback(new Error('error'));
}

module.exports.testFail = function testFail(){
  throw new Error('fail');
}

