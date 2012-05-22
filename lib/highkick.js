var colors = require('colors'),
    path   = require('path'),
    tty    = require('tty');

delete require.cache[module.filename];

function format(text/*, styles */){
  if( !tty.isatty(2) ) {
    return text;
  }

  var out = String(text),
      i = 0;

  while( ++i < arguments.length ){

    out = out[ arguments[i] ];
  }

  return out;
};

function logger(testsuite){

  return function log(msg){
    if(testsuite.options.silent && !isEnabled(testsuite.options.name, process.env.VERBOSE)) {
      return;
    };

    process.stdout.write(testsuite.title);
    process.stdout.write(msg);
    process.stdout.write('\n');
  };
}

function ok(test, testsuite){
  testsuite.printTestResult(test, format('OK', 'green'));
}

function fail(test, testsuite, error){
  testsuite.fail++;
  testsuite.printTestResult(test, format('FAIL', 'red'));
  testsuite.log( format('ERROR: ','bold', 'red') + (error.message ? format(error.message, 'bold') : '') + '\n' + error.stack + ')' );
}

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

function filterTestFunctions(el){
  return el.substring(0,4) == 'test';
}

function genFinish(testsuite){

  function end(callback){
    if( testsuite.options.module.end == undefined ){
      callback();
      return;
    }

    testsuite.initArgs(function(error, initArgs){

      var args = [].concat(initArgs);
      args.push(callback);

      testsuite.options.module.end.apply(undefined, args);
    });
  }

  return function finish(){
    end(function(){
      var fail = testsuite.fail,
          len = testsuite.len;

      testsuite.log(format('* Done.', 'grey'));
      testsuite.log('Ran ' + format(len, 'bold') + ' tests '  + ( fail ? 'with ' + format(fail,'bold', 'red') + ' fail.' : 'without any error.') );
      testsuite.callback(undefined, { 'len':len, 'fail':fail });
    });
  };
}

function genTestCallback(testsuite, test, callback){
  return function testCallback(error){
    callback();
    (error ? fail : ok)(test, testsuite, error);
  };
}

function genTestCaller(testsuite, test){

  function run(args){
    testsuite.async && testsuite.log('Running '+test.name+' ...');

    var cb = args[ args.length - 1 ];

    test.startTS = +(new Date);

    try {
      test.apply(undefined, args);
    } catch(error) {
      cb(error);
    }
  };

  function callBeforeEach(initArgs, callback){
    if(typeof testsuite.options.module.beforeEach != 'function'){
      callback();
      return;
    }

    var args = [].concat(initArgs);
    args.push(callback);

    testsuite.options.module.beforeEach.apply(undefined, args);
  }

  function callAfterEach(args, callback){
    if(typeof testsuite.options.module.afterEach != 'function'){
      callback();
      return;
    }

    args.push(callback);

    testsuite.options.module.afterEach.apply(undefined, args);
  }


  return function callTest(callback){

    var args = [];
    var cb   = genTestCallback(testsuite, test, function(error){
      if(error){
        callback(error);
        return;
      }

      testsuite.initArgs(function(error, initArgs){

        callAfterEach.call(undefined, args, function(error){
          !testsuite.options.async && callback(error);
        });

      });

    });

    testsuite.initArgs(function(error, initArgs){

      if(error){
        testsuite.callback(error);
        return;
      }

      callBeforeEach(initArgs, function(error/*, beforeEachArgs*/){

        if(error){
          testsuite.callback(error);
          return;
        }

        var beforeEachArgs = Array.prototype.slice.call(arguments, 1);

        initArgs && initArgs.length && ( args = args.concat(initArgs) );
        beforeEachArgs && beforeEachArgs.length && ( args = args.concat(beforeEachArgs) );

        run(args.concat([cb]));
        testsuite.options.async && callback();

      });

    });

  };
}


function initArgs(testsuite){
  var args = undefined;

  function callInit(callback){
    if(typeof testsuite.options.module.init != 'function'){
      callback();
      return;
    }

    testsuite.options.module.init(testsuite.options, callback);
  };

  return function(callback){

    if( args != undefined ){
      callback(undefined, args);
      return;
    }

    callInit(function(error/*, params */){

      if(error){
        callback(error);
        return;
      }

      args = Array.prototype.slice.call(arguments, 1);
      callback(undefined, args);
    });

  };
};

function genPrintTestResult(testsuite){
  var line = 0;

  return function printTestResult(test, caption){
    if(test.line) {
      testsuite.log(format('WARN ', 'red', 'bold') + format(test.testName, 'bold', 'yellow') + '  has run callback more than once.' );
      return;
    }

    var duration = (+(new Date) - test.startTS)/1000;

    test.line = ++line;

    testsuite.log(format(caption, 'bold')
                + '  '
                + format(test.testName, 'bold', 'yellow')
                + format(' (', 'grey')
                + format(test.line + '/' + testsuite.len, 'bold')
                + format(', ', 'grey')
                + format(( duration + 's'), 'white', 'bold')
                + format(') ', 'grey'));

    if(test.line == testsuite.len){
      testsuite.finish();
    }
  };
};

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

  var testsuite = {
    'options': options
  };

  testsuite.log = logger(testsuite);

  testsuite.title = options.name ? format(options.name, 'bold') + format(' | ', 'grey') : '';

  testsuite.printTestResult = genPrintTestResult(testsuite);

  testsuite.finish = genFinish(testsuite);

  testsuite.initArgs = initArgs(testsuite);

  testsuite.callback = callback;

  testsuite.tests = Object.keys(options.module).filter(filterTestFunctions);

  testsuite.options.main && ( testsuite.tests = testsuite.tests.filter(function(el){
    return ( !process.env.KICK || isEnabled(el, process.env.KICK) );
  }) );

  testsuite.tests = testsuite.tests.map(function(name){
    var fn = options.module[name];
    fn.testName = name;
    return fn;
  });

  testsuite.len = testsuite.tests.length;

  testsuite.fail = 0;

  (function iter(i){

    if(i >= testsuite.len){
      testsuite.options.async && testsuite.log(format('* All tests has been fired.', 'grey'));

      if(testsuite.tests.length == 0) {
        testsuite.finish();
      }

      return;
    }

    var next = iter.bind(undefined, i+1),
        test = testsuite.tests[i],
        call = genTestCaller(testsuite, test);

    call(next);

  })(0);

};

function isEnabled(testName, field){
  var name;

  if(!field){
    return false;
  }

  if(field == '*'){
    return true;
  }

  field = field.toLowerCase();
  testName = testName.toLowerCase();
  name  = testName.replace(/^test_?/,'');

  if( field == name || field == testName ){
    return true;
  }

  field = field.split(',');

  return field.indexOf( name ) > -1 || field.indexOf( testName ) > -1;
};

module.exports = kick;
module.exports.isEnabled = isEnabled;
