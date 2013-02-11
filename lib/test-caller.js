var ui   = require('./ui'),
    fail = ui.fail,
    ok   = ui.ok;

module.exports = newTestCaller;

function newTestCallback(testsuite, test, callback){
  return function testCallback(error){
    (error ? fail : ok)(test, testsuite, error || callback, callback);
  };
}

function newTestCaller(testsuite, test){

  function run(args){
    var cb = args[ args.length - 1 ];

    test.startTS = +(new Date);

    try {
      test.apply(undefined, args);
      if(test.length == 0) {
        cb();
      }
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
    var cb = newTestCallback(testsuite, test, function(error){

      if(error){
        callback(error);
        return;
      }

      testsuite.initArgs(function(error, initArgs){

        callAfterEach.call(undefined, args, function(error){
          if(test.line == testsuite.len){
            testsuite.finish();
          }

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

        var ret = false, err;

        var timeout = setTimeout(function(){
          ret = true;
          err = new Error('timeout of ' + testsuite.options.timeout + 'ms exceeded.');
          err.skipErrorStack = true;
          cb(err);
        }, testsuite.options.timeout);

        run(args.concat([function(){
          clearTimeout(timeout);
          cb.apply(null, arguments);
        }]));

      });

    });

  };
}
