var newTestCaller      = require("./test-caller"),
    ui                 = require('./ui'),
    isEnabled          = require('./is-enabled'),
    newPrintTestResult = ui.newPrintTestResult,
    format             = ui.format,
    logger             = ui.logger;

module.exports = TestSuite;

function TestSuite(options){
  var obj = { options: options };

  obj.callback = null;
  obj.fail = 0;
  obj.initArgs = initArgs(obj);
  obj.log = logger(obj);

  obj.title = options.name ? options.name : '';
  obj.tests = Object.keys(options.module).filter(filterTestFunctions);

  obj.options.main && (obj.tests = obj.tests.filter(function(el){
    return ( ( !process.env.KICK && !process.env.kick ) || isEnabled(el, process.env.KICK || process.env.kick) );
  }));

  obj.len = obj.tests.length;

  /**
   * Tests
   */
  obj.tests = obj.tests.map(function(name){
    var fn = options.module[name];
    fn.testName = fn.prettyName || name;
    fn.line = undefined;
    return fn;
  });

  /**
   * Methods
   */
  obj.printTestResult = newPrintTestResult(obj);
  obj.finish = newFinish(obj);

  /**
   * run
   */
  obj.run = function(callback){

    obj.callback = callback;

    (function iter(i){
      if(i >= obj.len){
        if(obj.tests.length == 0) {
          obj.finish();
        }

        return;
      }

      var next = iter.bind(undefined, i+1),
          test = obj.tests[i],
          call = newTestCaller(obj, test);

      call(next);

    })(0);
  };

  /**
   * endTest
   */
  var resultCounter = 0;
  obj.endTest = function(test){
    if(test.line) {
      ui.multiple(test);
      return;
    }

    test.line = ++resultCounter;
  };

  return obj;
}

function initArgs(testsuite){
  var args = undefined;

  function callInit(callback){
    if(typeof testsuite.options.module.init != 'function' && typeof testsuite.options.module.before != 'function'){
      callback();
      return;
    }

    ( testsuite.options.module.init || testsuite.options.module.before )(testsuite.options, callback);
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

function filterTestFunctions(el){
  return el.substring(0,4) == 'test';
}

function newFinish(testsuite){

  function end(callback){
    if( testsuite.options.module.end == undefined && testsuite.options.module.after == undefined ){
      callback();
      return;
    }

    testsuite.initArgs(function(error, initArgs){
      var args = [].concat(initArgs);
      args.push(callback);

      ( testsuite.options.module.after || testsuite.options.module.end ).apply(undefined, args);
    });
  }

  return function finish(){
    end(function(){
      var fail   = testsuite.fail,
          len    = testsuite.len,
          output = '';

      if(!fail){
        testsuite.log('\n  OK, passed ' + len + ' tests.\n');
      } else {
        testsuite.log('');
      }

      testsuite.callback(undefined, { 'len':len, 'fail':fail });
    });
  };
}
