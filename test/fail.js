module.exports.testError = function testError(callback){
  callback(new Error('error'));
}

module.exports.testFail = function testFail(){
  throw new Error('fail');
}

