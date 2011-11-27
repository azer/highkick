var _puts = require('sys').puts,
    colors = require('colors');

function kick(options,callback){
  var module = options.module,
      title = options.name ? (options.name).bold+' | '.grey : '';

  var tests = Object.keys(module)
              .filter(function(el){ return el.substring(0,4)=='test' })
              .map(function(el){ return module[el] });

  var ctr = 0,
      len = tests.length,
      fail = 0;

  function mark(test,error){
    ctr++;
    error && fail++;

    if(!options.silent){
      process.stdout.write(title);
      process.stdout.write(error ? 'FAIL  '.bold.red : 'OK  '.green.bold);
      _puts(test.name.bold.yellow + ' ('.grey+(ctr+'/'+len).bold+', '.grey + (( (new Date).getTime() - test.startTS)/1000+'s').white.bold+') '.grey);
      if(error){
        _puts('ERROR: '.bold.red+(error.message ? error.message.bold : '')+'\n'+error.stack+')');
      }
    }

    if(ctr>=len){
      puts('* All tests have called back.'.grey);
      puts('Ran '+String(len).bold+' tests '  + ( fail ? 'with ' + String(fail).bold.red + ' fail.' : 'without any error.') );
      callback(undefined, { 'len':len, 'fail':fail });
    }
  }

  function puts(){
    if(options.silent) return;
    _puts(title + Array.prototype.join.call(arguments, ', '));
  }

  function callTestFn(test, args, callback){
    puts('Running '+test.name+' ...');

    test.startTS = (new Date).getTime();

    try {
      test.apply(undefined,args);
      callback && callback();
    } catch(error){
      callback && callback(error);
    }
  }

  (function(i, error){

    if(error){
      return mark(tests[i-1], error);
    }

    if(i>=len){
      puts('* All tests has been fired.'.grey);
      if(tests.length==0) callback(undefined, { 'len':0, 'fail':0 });
      return;
    }

    var test = tests[i],
        next = arguments.callee.bind(undefined, i+1),
        marker = mark.bind(undefined,test),
        callback;

    if(options.ordered){
      callback = function(){
        marker.apply(null, arguments);
        next();
      }
    } else {
      callback = marker;
    }

    var args = [callback];

    try {

      typeof module.init != 'function' ? callTestFn(test, args, !options.ordered && next) : module.init(options, function(error/* args to pass test functions */){
        if(error) {
          return callback(error);
        }

        var mergeArgs = [0, 0];
        Array.prototype.push.apply(mergeArgs, Array.prototype.slice.call(arguments, 1));
        
        args.splice.apply(args, mergeArgs);

        callTestFn(test, args, !options.ordered && next);
      });

    } catch(error) {
      callback(error);
    }

  })(0);
}

module.exports = kick;
