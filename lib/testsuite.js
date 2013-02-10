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

  obj.title = options.name ? format(options.name, 'bold') + format(' | ', 'grey') : '';
  obj.tests = Object.keys(options.module).filter(filterTestFunctions);

  obj.options.main && ( obj.tests = obj.tests.filter(function(el){
    return ( !process.env.KICK || isEnabled(el, process.env.KICK) );
  }) );

  obj.len = obj.tests.length;

  /**
   * Tests
   */
  obj.tests = obj.tests.map(function(name){
    var fn = options.module[name];
    fn.testName = name;
    fn.line = undefined;
    return fn;
  });

  /**
   * Methods
   */
  obj.printTestResult = newPrintTestResult(obj);
  obj.finish = newFinish(obj);

  obj.run = function(callback){

    obj.callback = callback;

    (function iter(i){
      if(i >= obj.len){
        obj.options.async && obj.log(format('* All tests has been fired.', 'grey'));

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

  return obj;
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

function filterTestFunctions(el){
  return el.substring(0,4) == 'test';
}

function newFinish(testsuite){

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
