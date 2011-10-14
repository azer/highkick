var _puts = require('sys').puts,
    colors = require('colors');

function kick(options,callback){
  var module = options.module,
      title = options.name ? (options.name).bold+' | '.grey : '';
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

    if(!options.silent){
      process.stdout.write(title);
      process.stdout.write(error ? 'FAIL  '.bold.red : 'OK  '.green.bold);
      _puts(test.name.bold.yellow + ' ('.grey+(ctr+'/'+len).bold+', '.grey + (( (new Date).getTime() - startTS )/1000+'s').white.bold+') '.grey)
      if(error){
        _puts('ERROR: '.bold.red+error.message.bold+'\n'+error.stack+')');
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

  (function(i){

    if(i>=tests.length){
      puts('* All tests has been fired.'.grey);
      if(tests.length==0) callback();
      return;
    }

    test = tests[i];
    next = arguments.callee.bind(undefined, i+1);

    puts('Running '+test.name+' ...');

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
