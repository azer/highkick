var style     = require('style'),
    path      = require('path'),
    tty       = require('tty'),
    assert    = require('assert'),
    fs        = require('fs'),
    TestSuite = require('./testsuite');

delete require.cache[module.filename];

module.exports = kick;

function childTestModule(options){

  var callback;

  function proxyCallback(error, result){
    if(error){
      callback(error);
      return;
    }

    if( result.fail > 0 ){
      callback(new Error(options.name+' failed.'));
      return;
    }

    callback(undefined, result);
  }

  return function(){
    var params = [ options ];
    params.concat(Array.prototype.slice.call(arguments, arguments.length - 1));

    callback = arguments[ arguments.length -1 ];

    params.push( proxyCallback );

    kick.apply(undefined, params);
  };
}

function kick(/* [path], [options], callback */){

  var filename, options,
      callback = arguments[ arguments.length -1 ];

  if(typeof arguments[0] == 'string'){
    filename = arguments[0];
    options = {
      'path': filename
    };
  } else {
    options = arguments[0];
  }

  if( typeof options.path == 'string' && options.name == undefined){
    options.name = options.path.replace(/.*\//,'').replace(/\.js$/,'');
  }

  if(typeof options.path == 'string' && options.module == undefined){
    options.module = require( /^\//.test(options.path) ? options.path : path.join( path.dirname(module.parent.filename), options.path ) );
  }

  if( options.silent == undefined ){
    options.silent = true;
  }

  if( arguments.length == 1 ){
    return childTestModule(options);
  }

  var testsuite = TestSuite(options);
  testsuite.run(callback);
};
