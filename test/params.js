var i = 0;

function init(options, callback){
  assert.equal(i++, 0);
  assert.equal(options.name, 'params');
  callback(undefined, 'init1', 'init2');
}

function beforeEach(init1, init2, callback){
  assert.equal(i++, 1);
  assert.equal(init1, 'init1');
  assert.equal(init2, 'init2');
  callback(undefined, 'beforeEach1', 'beforeEach2');
}

function testParams(init1, init2, beforeEach1, beforeEach2, callback){
  assert.equal(i++, 2);
  assert.equal(init1, 'init1');
  assert.equal(init2, 'init2');
  assert.equal(beforeEach1, 'beforeEach1');
  assert.equal(beforeEach2, 'beforeEach2');
  callback();
}

function afterEach(init1, init2, beforeEach1, beforeEach2, callback){
  assert.equal(i++, 3);
  assert.equal(init1, 'init1');
  assert.equal(init2, 'init2');
  assert.equal(beforeEach1, 'beforeEach1');
  assert.equal(beforeEach2, 'beforeEach2');
  callback();
}

function end(init1, init2, callback){
  assert.equal(i++, 4);
  assert.equal(init1, 'init1');
  assert.equal(init2, 'init2');
  callback();
}

module.exports = {
  'init': init,
  'beforeEach': beforeEach,
  'afterEach': afterEach,
  'end': end,
  'testParams': testParams
};
