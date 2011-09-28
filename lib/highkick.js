var _puts = require('sys').puts;

function kick(options,callback){
  var module = options.module,
      title = options.name ? options.name+' | ' : '';
  var tests = Object.keys(module)
              .filter(function(el){ return el.substring(0,5)=='test_' })
              .map(function(el){ return module[el] });

  var test, next, startTS;
  
  var ctr = 0,
      len = tests.length,
      fail = 0;

  function mark(test,error){
    ctr++;
    error && fail++;

    !options.silent && process.stdout.write(title + '> '+test.name + ' ('+ctr+'/'+len+' , ' + ( (new Date).getTime() - startTS )/1000+'s) ');
    !options.silent && _puts(error ? 'FAIL ('+error.message+', '+error.stack+')' : '  OK');

    if(ctr>=len){
      callback(undefined, { 'len':len, 'fail':fail });
    }
  }

  function puts(){
    if(options.silent) return;
    _puts(title + Array.prototype.join.call(arguments, ', '));
  }

  (function(i){

    if(i>=tests.length){
      puts('* All tests has been fired.');
      if(tests.length==0) callback();
      return;
    }

    test = tests[i];
    next = arguments.callee.bind(undefined, i+1);

    puts('Running "'+test.name+'" ...');

    startTS = (new Date).getTime();

    var args = [mark.bind(undefined,test)];

    if(module.init){
      args.splice(0,0,module.init());
    }

    try {
      tests[i].apply(undefined,args);
    } catch(error){
      mark(test,error)
    }

    next();

  })(0);
}

module.exports = kick;
