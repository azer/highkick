Asynchronous, no-style, super simple testing tool for NodeJS.

Install
=======
```bash
$ npm install highkick
```

Usage Example
=============
To see HighKick in action, run "make test" command in the source code directory
as below example;

```bash
$ make test
node test/run.js
Running "test_foo" ...
Running "test_bar" ...
> test_bar (1/2 , 0.001s)   OK
* All tests has been fired.
> test_foo (2/2 , 0.01s)   OK
====
Ran 2 tests without any error.
```
Introduction
============
Code your tests in a separated module;

```javascript
function test_foobar(callback){
  setTimeout(function(){
    try {
      do();
      something();
      and();
      callback();
    } catch (error)
      callback(error);
    }
  }, 1000);
}

function test_quux(callback){
  callback();
}
```

Optionally, you may place an "init" function that is called before each test
function is called. Returned values of init functions are passed to the tests
as seen below;

```javascript
// tests.js
function init(){
  return +(new Date);
}

function test_corge(date, callback){
  callback();
}
```

To run the tests, create a new script calling HighKick;

```javascript
// run.js
var highkick = require('highkick');
highkick({ 'module':require('./tests') }, function(error, result){
  console.log('Ran '+result.len+' tests with '+result.fail+' fail(s).');
});
```

"silent" and "name" are the remaining options that can be given optionally.
Time to kick the tests;
```bash
$ node run.js
```

That's all. See test/ dir for a usage example.

Development
==========
todo:

  * make init & reset functions async
  * browser support
