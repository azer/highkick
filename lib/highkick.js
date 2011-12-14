var _puts = require('sys').puts,
    colors = require('colors');

function logger(testsuite){
  return function log(msg){
    if(testsuite.options.silent) return;

    process.stdout.write(testsuite.title);
    process.stdout.write(msg);
    process.stdout.write('\n');
  };
}

function ok(test, testsuite){
  testsuite.printTestResult(test, 'OK'.green);
}

function fail(test, testsuite, error){
  testsuite.fail++;
  testsuite.printTestResult(test, 'FAIL'.red);
  testsuite.log('ERROR: '.bold.red+(error.message ? error.message.bold : '')+'\n'+error.stack+')');
}

function filterTestFunctions(el){
  return el.substring(0,4) == 'test';
}

function genFinish(testsuite){
  return function finish(){
    var fail = testsuite.fail,
        len = testsuite.len;

    testsuite.log('* Done.'.grey);
    testsuite.log('Ran '+String(len).bold+' tests '  + ( fail ? 'with ' + String(fail).bold.red + ' fail.' : 'without any error.') );
    testsuite.callback(undefined, { 'len':len, 'fail':fail });
  };
}

function genTestCallback(testsuite, test, callback){
  return function testCallback(error){
    (error ? fail : ok)(test, testsuite, error);
    callback();
  };
}

function genTestCaller(testsuite, test){

  function run(args){
    testsuite.log('Running '+test.name+' ...');

    var cb = args[ args.length - 1 ];

    test.startTS = +(new Date);

    try {
      test.apply(undefined, args);
    } catch(error) {
      cb(error);
    }
  }

  function callInit(callback){
    if(typeof testsuite.options.module.init != 'function'){
      callback();
      return;
    }

    testsuite.options.module.init(testsuite.options, callback);
  }

  return function callTest(callback){

    var cb = genTestCallback(testsuite, test, function(error){
      callback && callback(error);
    });

    var args = [cb];

    callInit(function(error/* parameters to pass tests */){
      if (error) {
        return callback(error);
      }

      var mergeArgs = [0, 0];
      Array.prototype.push.apply(mergeArgs, Array.prototype.slice.call(arguments, 1));

      args.splice.apply(args, mergeArgs);
      
      run(args);
      
    });
  }
}

function genPrintTestResult(testsuite){
  var line = 0;

  return function printTestResult(test, caption){
    if(test.line) {
      testsuite.log('WARN '.red.bold + test.name.bold.yellow + '  has run callback more than once.' );
      return;
    }

    var duration = (+(new Date) - test.startTS)/1000;

    test.line = ++line;

    testsuite.log(caption.bold 
                + '  '
                + test.name.bold.yellow 
                + ' ('.grey 
                + (test.line + '/' + testsuite.len).bold 
                + ', '.grey 
                + ( duration + 's').white.bold 
                + ') '.grey);

    if(test.line == testsuite.len){
      testsuite.finish();
    }
  };
};

function kick(options, callback){

  var testsuite = {
    'options': options
  };

  testsuite.log = logger(testsuite);

  testsuite.title =  options.name ? (options.name).bold+' | '.grey : '';

  testsuite.printTestResult = genPrintTestResult(testsuite);

  testsuite.finish = genFinish(testsuite);

  testsuite.callback = callback;
  
  testsuite.tests = Object.keys(options.module).filter(filterTestFunctions).map(function(el){ return options.module[el]; });

  testsuite.len = testsuite.tests.length;
  
  testsuite.fail = 0;

  (function iter(i){

    if(i >= testsuite.len){
      testsuite.log('* All tests has been fired.'.grey);

      if(testsuite.tests.length == 0) {
        testsuite.finish();
      }

      return;
    }

    var next = iter.bind(undefined, i+1),
        test = testsuite.tests[i],
        call = genTestCaller(testsuite, test);

    if(options.ordered){
      call(next);
    } else {
      call();
      next();
    }

  })(0);

}

module.exports = kick;
