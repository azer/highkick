Asynchronous, no-style, super simple testing tool for NodeJS.

![Screenshot](https://github.com/downloads/azer/highkick/highkick.png)

Motivation
==========
* **No sphagetti:** The tests coded for HighKick seem very simple, apparent and familiar.
* **Continuations:** HighKick provides an asynchronous API that uses the NodeJS' continuation passing style.
* **Nested Tests:** Before I started coding HighKick, I had needed to test some JavaScript code that is generated by OneJS dynamically. Now, OneJS' main test module has some test functions that create temporary JS modules and execute HighKick to run some other test modules against dynamically generated NodeJS modules. Highkick simplifies this progress by letting us code nested tests... 

Installation
============

```bash
$ git clone git@github.com:azer/highkick.git
$ cd highkick
$ npm install
$ make test
```

Introduction
============
Code your tests in a separated module;

```javascript

// tests.js

var assert = require('assert'); // highkick doesn't provide a new assertion library. NodeJS has a good one already.

exports.test_foo = function(callback){
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

exports.test_bar = function(callback){
  callback();
}

```


You can optionally add an *init function* that will be called before each test. 

*An init function* takes two arguments, first one is the options of the test, and second one is the callback that will fire the pending test.

Init functions may pass any number of parameters to the test functions. See the below example;

```javascript

exports.init = function init(options, callback){
  callback(null, +(new Date), Math.random());
}

exports.test_corge = function test_corge(date, randomNumber, callback){
  callback();
}

```


You may be curious about the ```options``` variable passed to the init function (if you've defined one). 
You pass the ```options``` object to the highkick function itself, to run the tests.

In the below example, I create a new module and call HighKick, passing the tests module I've coded above.

```javascript

// run.js

var highkick = require('highkick');

highkick({ 'module':require('./tests'), 'name':'main tests', 'silent':false }, function(error, result){
  if(error) throw error;
  
  console.log('Ran '+result.len+' tests with '+result.fail+' fail(s).');
});

```

Only required option field is ```module```, see the *Available Options* section for details. feel free to skip ```name``` and ```silent`` fields if you dont need.

Let's call the module above;

```bash
$ node run.js
```

That's all. See test/ dir for a basic usage example.

Available Options
=================

**module** Passes the module that contains the tests. Required. 

**name** A name that'll be seen as a prefix of the messages produced by the related tests.

**silent** Keeps the tests silent. 

**ordered** Each test waits its previous sibling to produce a result by running its callback.

More Examples
=============
I use HighKick in my OneJS project heavily. You may take a look at its tests;

https://github.com/azer/onejs/tree/master/test
