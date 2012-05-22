exports.testError = function testError(callback){
  callback(new Error('error'));
};

exports.testFail = function testFail(){
  throw new Error('fail');
};

