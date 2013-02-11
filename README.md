HighKick is a small testing framework that I like.

```bash
$ npm install highkick
```

![](http://farm6.staticflickr.com/5302/5625088762_355af8f69a.jpg)

# Overview

It enables [ChaiJS'](http://chaijs.com/) `assert` and `expect` modules by default.

BDD: 
```js
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      expect([1,2,3].indexOf(0).to.be(5));
    })
  })
})
```

CommonJS:
```javascript

exports.init = function init(options, callback){
    startWebServer(callback);
}

exports.testFoo = function testFoo(callback){
    get('http://localhost/api/foo', function(error, response){
        if(error){
            callback(error);
            return;
        }
        
        assert.equal(response.foo, 'foo')
        
        callback();
    });
}

exports.end = function end(callback){
    stopWebServer(callback);
}

```

# First Steps

HighKick takes a module and executes the functions that have a name starting with "test". A simple test module would look like this;

```javascript

var assert = require('assert');

exports.testFoo = function(callback){
    try {
        assert.something();
        callback();
    } catch (error) {
        callback(error);
    }
}

exports.testBar = function(callback){
    setTimeout(callback, 100);
}

```

Below command will run the all tests defined in tests.js;

```bash
$ highkick tests.js
```

To specify the tests that needs to run;

```bash
$ kick=foo highkick tests.js
```

se comma for separating multiple test names, and '*' for running all tests.

## Before

An init function is called before the execution of the tests in a module for once. Init functions take an `options` object from HighKick and are able to
produce the first parameters of test functions as shown in the example below;

CommonJS: 
```javascript
exports.before = function before(options, callback){
    callback( undefined, +(new Date), Math.PI );
}

exports.testFoo = function(timestamp, pi, callback){
    ...
}
```

## beforeEach

Use `beforeEach` to define a function to be called before each test.

```javascript

function beforeEach(callback){
    callback( undefined, +(new Date));
}

exports.testFoo = function(now, callback){
    ...
}

```

Similar to the `init` functions, what a `beforeEach` function produces is passed to test functions. The key difference is, `beforeEach` functions take parameters from `init` functions, too.

```javascript
exports.init = function(options, callback){
    callback(undefined, 'hello');
}

exports.beforeEach = function(hello, callback){
    callback(undefined, 'world';
}

exports.testFoo = function(hello, world, callback){
    ...
}
```

## afterEach

An `afterEach` function is called after each test, regardless of results.

```javascript
exports.beforeEach = function(callback){
    callback(undefined, new ChildProcess);
}

exports.testFoo = function(process, callback){
    ...
}

exports.afterEach = function(process, callback){
    process.terminate();
    callback();
}
```

## after

Unlikely to `afterEach`, an `end` function is called after all tests are done.

```javascript
exports.after = function(callback){
    callback(undefined, new ChildProcess);
}

exports.testFoo = function(process, callback){
    ...
}

exports.end = function(process, callback){
    process.terminate();
    callback();
}
```

## Nested Tests a.k.a Programmatic Way of Running Tests

HighKick provides a very minimalistic concept of nested tests;

```javascript
var highkick = require('highkick');

exports.testFoobar = highkick('./foobar');
```

To see the output of child tests;

```bash
$ VERBOSE=foobar highkick tests.js
```

You can use comma for separating multiple test names and pass '*' for enabling output for child tests.

In the case a custom callback is needed for getting a summary of testsuite:

```
highkick('./tests', function(error, result){
    if(error){
        logging.error('Ran %d tests, %d failed', result.len, result.fail);
        logging.error(error);
    }

    logging.info('Ran %d tests successfully, without any error.', result.len);
});
```
