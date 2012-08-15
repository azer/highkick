HighKick is a no-style, light-weight and powerful testing tool for NodeJS.

**Screenshots:**

![Screenshot 1](https://dl.dropbox.com/s/xzuwm660jqzd1vw/highkick_1.png)
![Screenshot 2](https://dl.dropbox.com/s/wjsxpt57gcwlbqb/highkick_2.png)

# Installation

```bash
$ npm install highkick
```

# Overview

CoffeeScript:
```coffeescript
init = (options, callback) ->
    startWebServer callback
  
testFoo = (callback) ->
    get "http://localhost/api/foo", (error, response) ->
        if error
            callback error
            return
        
        assert.equal response.foo 'foo'
        callback()
        
end = (callback) ->
    stopWebServer callback

module.exports = 
    init: init
    testFoo: testFoo
    end: end
```

JavaScript:

```javascript

function init(options, callback){
    startWebServer(callback);
}

function testFoo(callback){
    get('http://localhost/api/foo', function(error, response){
        if(error){
            callback(error);
            return;
        }
        
        assert.equal(response.foo, 'foo')
        
        callback();
    });
}

function end(callback){
    stopWebServer(callback);
}

module.exports = {
    'init': init,
    'testFoo': testFoo,
    'end': end
};

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
$ KICK=foo highkick tests.js
```

se comma for separating multiple test names, and '*' for running all tests.

## Init

An init function is called before the execution of the tests in a module for once. Init functions take an `options` object from HighKick and are able to
produce the first parameters of test functions as shown in the example below;

```javascript
function init(options, callback){
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

## end

Unlikely to `afterEach`, an `end` function is called after all tests are done.

```javascript
exports.init = function(callback){
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

## Async Running

Pass `--async` option to run the tests asynchronously;

```bash
$ highkick tests.js --async
```

In the case you need the programmatic way;

```
var highkick = require('highkick');

highkick({ 'path': './tests', 'async': true }, function(error, result){
    ...
});
```

# Projects Using HighKick

  * [OneJS](http://github.com/azer/onejs)
  * [LowKick](http://github.com/azer/lowkick)
  * [boxcars](http://github.com/azer/boxcars)
  * [stonetunnel](http://github.com/azer/stonetunnel)
